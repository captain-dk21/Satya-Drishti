export interface PropagandaFlag {
  technique: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location?: string; // e.g., timestamp in video or region in image
}

export interface AnalysisResult {
  riskScore: number; // 0-100 (Contextual Propaganda Score)
  fusionScore: number; // 0-100 (Combined Risk Score)
  riskLevel: 'SAFE' | 'CAUTION' | 'SUSPICIOUS' | 'DANGEROUS' | 'CRITICAL';
  summary: string;
  flags: PropagandaFlag[];
  narrativeStrategy?: string; // The overarching goal of the propaganda
  emotionalTriggers?: string[];
  visualIntegrityScore?: number; // 0-100, where 100 is pure/authentic
  visualIntegrityWarning?: string; // Warning message if score < 70
  rebuttal?: string; // Generated rebuttal for Critical threats
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}