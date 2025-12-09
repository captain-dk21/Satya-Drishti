import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { RiskDashboard } from './components/RiskDashboard';
import { analyzeContent } from './services/geminiService';
import { AnalysisResult, AnalysisState } from './types';
import { BrainCircuit, Loader2, Send, Terminal, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    result: null,
  });

  const handleAnalyze = async () => {
    if (!file && !caption.trim()) return;

    setAnalysis({ isLoading: true, error: null, result: null });

    try {
      const result = await analyzeContent(file, caption);
      setAnalysis({ isLoading: false, error: null, result });
    } catch (err: any) {
      setAnalysis({
        isLoading: false,
        error: err.message || "An unexpected error occurred during analysis.",
        result: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans selection:bg-tech/30 selection:text-tech">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-tech/10 p-2 rounded-lg border border-tech/20">
              <BrainCircuit className="w-6 h-6 text-tech" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Satya Drishti 🕉️ सत्य दृष्टि <span className="text-zinc-600 font-light">|</span> <span className="text-zinc-400 font-mono text-sm">Propaganda Flagging Agent by <i>Captain_DK21</i></span>
              </h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-mono text-zinc-500">SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface rounded-xl border border-zinc-800 p-6 shadow-xl">
              <div className="mb-6 border-b border-zinc-800 pb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Terminal size={16} /> Data Input
                </h2>
              </div>

              {/* Upload Section */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase">Target Media</label>
                <FileUpload selectedFile={file} onFileSelect={setFile} />
              </div>

              {/* Text Input Section */}
              <div className="mb-8">
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase">Caption / Context</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Paste social media caption or context text here..."
                  className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-tech/50 focus:border-tech transition-all resize-none font-mono"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleAnalyze}
                disabled={analysis.isLoading || (!file && !caption.trim())}
                className={`w-full py-4 rounded-lg font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg
                  ${analysis.isLoading || (!file && !caption.trim())
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-500/50 hover:shadow-blue-500/20'
                  }`}
              >
                {analysis.isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    ANALYZING VECTORS...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    INITIATE SCAN
                  </>
                )}
              </button>
            </div>

            {/* Hint / Instructions */}
            <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 flex gap-3">
              <div className="shrink-0 text-blue-400 mt-1">
                <InfoIcon />
              </div>
              <p className="text-xs text-blue-200/70 leading-relaxed">
               PFA analyzes visual and textual components to identify logical fallacies, emotional manipulation, and credibility gaps. Results are generated by Jit's AI models.
              </p>
            </div>
          </div>

          {/* Right Column: Output Dashboard */}
          <div className="lg:col-span-7">
            {analysis.isLoading ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-surface/30 rounded-xl border border-dashed border-zinc-800 animate-pulse">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-tech animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <BrainCircuit className="w-6 h-6 text-zinc-700" />
                  </div>
                </div>
                <p className="mt-6 text-zinc-500 font-mono text-sm">PROCESSING NEURAL PATHWAYS...</p>
                <p className="text-zinc-700 text-xs mt-2">Identifying logical anomalies</p>
              </div>
            ) : analysis.error ? (
              <div className="h-full flex flex-col items-center justify-center bg-red-900/5 rounded-xl border border-red-900/20 p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-red-400 mb-2">Analysis Terminated</h3>
                <p className="text-zinc-400 text-sm max-w-md">{analysis.error}</p>
                <button 
                  onClick={() => setAnalysis(prev => ({ ...prev, error: null }))}
                  className="mt-6 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-xs text-zinc-300"
                >
                  Dismiss
                </button>
              </div>
            ) : analysis.result ? (
              <RiskDashboard result={analysis.result} />
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-surface/30 rounded-xl border border-dashed border-zinc-800 text-center p-8">
                <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 opacity-50">
                  <BrainCircuit className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-zinc-400">Ready for Intelligence</h3>
                <p className="text-zinc-600 text-sm mt-2 max-w-sm">
                  Upload media and text to generate a propaganda risk assessment.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export default App;
