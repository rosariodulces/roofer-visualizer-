import React from 'react';
import { AnalysisResult, Language } from '../types';
import { Info, Cpu, Activity } from 'lucide-react';
import { UI_TEXT } from '../constants';

interface AnalysisPanelProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  language: Language;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading, language }) => {
  const t = UI_TEXT[language];

  if (isLoading) {
    return (
      <div className="glass-panel border-l-2 border-l-orange-500 rounded-none p-6 animate-pulse flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-orange-500 animate-spin" />
          <span className="text-xs font-mono text-orange-400">{t.scanning}</span>
        </div>
        <div className="space-y-4 opacity-50 flex-1">
          <div className="h-2 bg-slate-700 w-full"></div>
          <div className="h-2 bg-slate-700 w-2/3"></div>
          <div className="h-2 bg-slate-700 w-4/5"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="glass-panel rounded-none p-0 overflow-hidden flex flex-col flex-1 min-h-0 border-t-0 border-r-0 border-b-0 border-l-2 border-l-orange-500">
      <div className="bg-slate-900/80 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t.analysisLog}</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-500">COMPLETE</span>
      </div>
      
      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
        <div className="relative">
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-slate-800"></div>
          <span className="text-slate-500 text-[10px] uppercase tracking-widest font-mono block mb-2">{t.archStyle}</span>
          <div className="text-xl font-bold text-white pl-4 border-l-2 border-cyan-500">{analysis.style}</div>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] uppercase tracking-widest font-mono block mb-3">{t.matMatrix}</span>
          <ul className="space-y-3">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-center gap-3 text-slate-300 text-sm bg-slate-900/40 p-2 border border-slate-800/50">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1">
             <Info className="w-3 h-3 text-slate-600" />
          </div>
          <span className="text-slate-500 text-[10px] uppercase tracking-widest font-mono block mb-2">{t.aiReasoning}</span>
          <p className="text-slate-400 text-xs leading-relaxed font-mono">
            {">"} {analysis.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
};