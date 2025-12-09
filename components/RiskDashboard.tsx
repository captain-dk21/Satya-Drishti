import React from 'react';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ShieldAlert, Info, AlertTriangle, AlertOctagon, CheckCircle, ScanFace, FileText, Zap } from 'lucide-react';

interface RiskDashboardProps {
  result: AnalysisResult;
}

const COLORS = {
  SAFE: '#10b981',      // Green
  CAUTION: '#f59e0b',   // Amber
  SUSPICIOUS: '#f97316',// Orange
  DANGEROUS: '#ef4444', // Red
  CRITICAL: '#7f1d1d',  // Dark Red
};

const SEVERITY_COLOR = {
  LOW: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  MEDIUM: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  HIGH: 'bg-red-500/20 text-red-500 border-red-500/30',
  CRITICAL: 'bg-red-900/40 text-red-200 border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]',
};

const getGaugeColor = (score: number) => {
  if (score < 20) return COLORS.SAFE;
  if (score < 50) return COLORS.CAUTION;
  if (score < 80) return COLORS.SUSPICIOUS;
  return COLORS.DANGEROUS;
};

// For Visual Integrity, higher is better
const getIntegrityColor = (score: number) => {
  if (score >= 90) return COLORS.SAFE;
  if (score >= 70) return COLORS.CAUTION;
  return COLORS.DANGEROUS;
};

export const RiskDashboard: React.FC<RiskDashboardProps> = ({ result }) => {
  const gaugeData = [
    { name: 'Risk', value: result.fusionScore },
    { name: 'Safe', value: 100 - result.fusionScore },
  ];

  const gaugeColor = getGaugeColor(result.fusionScore);
  const isCritical = result.riskLevel === 'CRITICAL';

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      
      {/* --- FUSION SCORE HEADER --- */}
      <div className={`rounded-2xl p-1 relative overflow-hidden transition-all duration-500 ${isCritical ? 'bg-gradient-to-br from-red-600 via-red-900 to-zinc-900 shadow-[0_0_40px_rgba(220,38,38,0.3)]' : 'bg-gradient-to-br from-zinc-700 to-zinc-900'}`}>
        <div className="bg-background rounded-xl p-6 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={120} />
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Gauge Section */}
                <div className="flex flex-col items-center justify-center min-w-[200px]">
                    <h3 className="text-zinc-400 text-xs font-mono uppercase tracking-[0.2em] mb-4">Fusion Risk Score</h3>
                    <div className="relative w-48 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie
                                data={gaugeData}
                                cx="50%"
                                cy="100%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill={isCritical ? COLORS.DANGEROUS : gaugeColor} />
                                <Cell fill="#27272a" />
                            </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-end -mb-3">
                            <span className={`text-5xl font-black ${isCritical ? 'text-red-500 drop-shadow-lg' : 'text-white'}`}>
                                {result.fusionScore}
                            </span>
                            <span className="text-xs text-zinc-500 font-mono">/100</span>
                        </div>
                    </div>
                    <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold border tracking-wider ${SEVERITY_COLOR[result.riskLevel === 'SAFE' ? 'LOW' : result.riskLevel === 'CAUTION' ? 'MEDIUM' : result.riskLevel === 'SUSPICIOUS' ? 'HIGH' : 'CRITICAL']}`}>
                        {result.riskLevel} ALERT
                    </div>
                </div>

                {/* Breakdown Section */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    
                    {/* Contextual Score Breakdown */}
                    <div className="bg-surface/50 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between">
                         <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2 text-zinc-400">
                                 <FileText size={16} />
                                 <span className="text-xs font-mono uppercase">Contextual Risk</span>
                             </div>
                             <span className={`text-lg font-bold ${getGaugeColor(result.riskScore)}`}>
                                 {result.riskScore}
                             </span>
                         </div>
                         <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                             <div className="h-full transition-all duration-1000" style={{ width: `${result.riskScore}%`, backgroundColor: getGaugeColor(result.riskScore) }} />
                         </div>
                    </div>

                    {/* Visual Integrity Breakdown */}
                    {result.visualIntegrityScore !== undefined ? (
                         <div className="bg-surface/50 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between">
                             <div className="flex justify-between items-start mb-2">
                                 <div className="flex items-center gap-2 text-zinc-400">
                                     <ScanFace size={16} />
                                     <span className="text-xs font-mono uppercase">Visual Integrity</span>
                                 </div>
                                 <span className={`text-lg font-bold ${getIntegrityColor(result.visualIntegrityScore)}`}>
                                     {result.visualIntegrityScore}%
                                 </span>
                             </div>
                             <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                                 <div className="h-full transition-all duration-1000" style={{ width: `${result.visualIntegrityScore}%`, backgroundColor: getIntegrityColor(result.visualIntegrityScore) }} />
                             </div>
                             {result.visualIntegrityWarning && (
                                <span className="text-[10px] text-danger mt-1 block font-medium animate-pulse">{result.visualIntegrityWarning}</span>
                             )}
                        </div>
                    ) : (
                        <div className="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-lg p-4 flex items-center justify-center text-zinc-600 text-xs">
                            No visual media analyzed
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- CRITICAL REBUTTAL CARD --- */}
      {isCritical && result.rebuttal && (
          <div className="bg-red-950/20 border-l-4 border-red-500 rounded-r-lg p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-red-400 font-bold text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
                  <ShieldAlert size={18} />
                  Reality Check / Rebuttal
              </h3>
              <p className="text-zinc-200 text-sm leading-relaxed font-medium border-l-2 border-red-500/30 pl-4 py-1">
                  "{result.rebuttal}"
              </p>
          </div>
      )}

      {/* --- NARRATIVE SUMMARY --- */}
      <div className="bg-surface border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
          <div>
            <h3 className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
              <Info size={14} /> Intelligence Summary
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {result.summary}
            </p>
          </div>
          {result.narrativeStrategy && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
               <h4 className="text-xs text-zinc-500 font-mono uppercase mb-1">Strategic Goal</h4>
               <p className="text-sm text-zinc-200 italic">"{result.narrativeStrategy}"</p>
            </div>
          )}
      </div>

      {/* --- TRIGGERS --- */}
      {result.emotionalTriggers && result.emotionalTriggers.length > 0 && (
        <div className="bg-surface border border-zinc-800 rounded-xl p-4">
            <h3 className="text-zinc-500 text-xs font-mono uppercase mb-3">Emotional Triggers Detected</h3>
            <div className="flex flex-wrap gap-2">
                {result.emotionalTriggers.map((trigger, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs rounded-full font-medium">
                        {trigger}
                    </span>
                ))}
            </div>
        </div>
      )}

      {/* --- FLAGGED TECHNIQUES --- */}
      <div className="bg-surface border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <h3 className="text-zinc-200 font-mono text-sm font-semibold flex items-center gap-2">
                <AlertOctagon size={16} className="text-tech" />
                Flagged Techniques
            </h3>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {result.flags.length} Detected
            </span>
        </div>
        
        <div className="divide-y divide-zinc-800">
            {result.flags.map((flag, idx) => (
                <div key={idx} className="p-4 hover:bg-zinc-800/30 transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-zinc-200 text-sm">{flag.technique}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold border ${SEVERITY_COLOR[flag.severity].replace('animate-pulse', '')}`}>
                            {flag.severity}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">{flag.description}</p>
                    {flag.location && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                            <Info size={10} />
                            <span>Loc: {flag.location}</span>
                        </div>
                    )}
                </div>
            ))}
            {result.flags.length === 0 && (
                <div className="p-8 text-center text-zinc-500">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                    <p className="text-sm">No specific propaganda techniques flagged.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};