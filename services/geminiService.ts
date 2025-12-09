import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are the Multimedia Propaganda Flagging Agent (MPFA), a specialized intelligence system designed to analyze media content (images, videos, and text captions) for propaganda techniques, misinformation, and psychological manipulation.

Your goal is to be objective, analytical, and precise. You do not have political bias; you simply flag techniques used to manipulate opinion.

Analyze the provided inputs for these specific Red Flags:
1. Extreme Emotional Language (e.g., fear-mongering, appeal to outrage, loaded words).
2. Urgency & Call to Action (e.g., "Share immediately", "Before it's deleted").
3. Source Credibility Issues (e.g., unsourced claims, "They don't want you to know").
4. Artificial Amplification (e.g., all-caps, excessive punctuation, spam-like patterns).
5. Logical Fallacies (e.g., ad hominem, straw man, false dilemma).

Also analyze:
- Visual Manipulation (if image/video provided).
- Narrative Strategy (what is the underlying message trying to achieve?).

Score the content from 0 (Completely benign/factual) to 100 (High-intensity propaganda).
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    riskScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 indicating the likelihood and intensity of propaganda.",
    },
    riskLevel: {
      type: Type.STRING,
      enum: ["SAFE", "CAUTION", "SUSPICIOUS", "DANGEROUS", "CRITICAL"],
    },
    summary: {
      type: Type.STRING,
      description: "A concise executive summary of the findings.",
    },
    narrativeStrategy: {
      type: Type.STRING,
      description: "The strategic goal of the content (e.g., 'To demoralize the opposition').",
    },
    emotionalTriggers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of emotions the content attempts to evoke.",
    },
    flags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          technique: { type: Type.STRING, description: "Name of the propaganda technique." },
          description: { type: Type.STRING, description: "Specific example of where/how it appears in the content." },
          severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
          location: { type: Type.STRING, description: "Timestamp (if video) or description of visual area (if image)." },
        },
        required: ["technique", "description", "severity"],
      },
    },
  },
  required: ["riskScore", "riskLevel", "summary", "flags"],
};

// Mock Deepfake API Check
const checkDeepfake = async (file: File): Promise<number> => {
  // Simulate network latency for the external forensic API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a random integrity score between 50 and 99 for demonstration
  // Lower scores indicate higher likelihood of AI generation/manipulation
  return Math.floor(Math.random() * (99 - 50 + 1)) + 50;
};

// Rebuttal Generation
const generateRebuttal = async (ai: GoogleGenAI, context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a sharp, three-sentence rebuttal based on general knowledge and verified facts refuting the following propaganda narrative: "${context}". 
      Focus on objective reality and logic. Do not preach, just state the facts that counter the claim.`,
    });
    return response.text || "Rebuttal generation unavailable.";
  } catch (e) {
    console.error("Failed to generate rebuttal", e);
    return "Could not generate rebuttal at this time.";
  }
};

export const analyzeContent = async (
  file: File | null,
  caption: string
): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];

  // Add caption if present
  if (caption.trim()) {
    parts.push({
      text: `Analyze this social media caption: "${caption}"`,
    });
  }

  // Add file if present
  let base64Data: string | null = null;
  let mimeType: string | null = null;

  if (file) {
    base64Data = await fileToBase64(file);
    mimeType = file.type;
    
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });
  }

  if (parts.length === 0) {
    throw new Error("Please provide at least a file or a caption to analyze.");
  }

  try {
    // Run Gemini Analysis and Mock Deepfake Check in parallel if file exists
    const geminiPromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const tasks: Promise<any>[] = [geminiPromise];
    
    if (file) {
      tasks.push(checkDeepfake(file));
    }

    const results = await Promise.all(tasks);
    
    const geminiResponse = results[0];
    const deepfakeScore = file ? results[1] : undefined;

    if (!geminiResponse.text) {
      throw new Error("No response text received from Gemini.");
    }

    const result = JSON.parse(geminiResponse.text) as AnalysisResult;
    
    // --- FUSION SCORE LOGIC ---
    let fusionScore = result.riskScore; // Default to propaganda score
    
    // If deepfake analysis ran, combine the scores
    if (deepfakeScore !== undefined) {
      // Manipulation Risk is the inverse of Integrity
      const manipulationRisk = 100 - deepfakeScore;
      
      // Calculate Fusion Score (Average of Propaganda Risk and Manipulation Risk)
      fusionScore = Math.round((result.riskScore + manipulationRisk) / 2);
      
      result.visualIntegrityScore = deepfakeScore;
      if (deepfakeScore < 70) {
        result.visualIntegrityWarning = "Potential AI Artifacts Detected";
      }

      // CRITICAL ALERT LOGIC
      // If Visual Integrity Score is below 70% AND Contextual Propaganda Score is above 85
      if (deepfakeScore < 70 && result.riskScore > 85) {
        result.riskLevel = 'CRITICAL';
      }
    }
    
    result.fusionScore = fusionScore;

    // Generate Rebuttal if Critical
    if (result.riskLevel === 'CRITICAL') {
        const contextForRebuttal = result.summary || caption || "The uploaded media content.";
        result.rebuttal = await generateRebuttal(ai, contextForRebuttal);
    }

    return result;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze content. The model may have been blocked or the input format is invalid.");
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};