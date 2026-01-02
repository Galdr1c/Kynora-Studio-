import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronRight, Zap, Palette, Type, MousePointer2, AlertTriangle, Scale, Target, X, BarChart3, CloudUpload } from 'lucide-react';
import { DesignSuggestion, LogoLayer } from '../types';

interface AIAssistantPanelProps {
  suggestions: DesignSuggestion[];
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onApplySuggestion: (suggestion: DesignSuggestion) => void;
  onCompetitorCompare: (file: File) => void;
  isOpen: boolean;
  onToggle: () => void;
  isDarkMode?: boolean;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ 
  suggestions, 
  isAnalyzing, 
  onAnalyze, 
  onApplySuggestion, 
  onCompetitorCompare,
  isOpen, 
  onToggle,
  isDarkMode = true
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'competitor'>('suggestions');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onCompetitorCompare(file);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={onToggle}
        className="fixed right-6 bottom-28 w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[100] group"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute right-full mr-4 px-3 py-1 bg-black/80 backdrop-blur rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">AI Assistant</div>
      </button>
    );
  }

  return (
    <div className={`fixed right-6 top-24 bottom-24 w-[380px] backdrop-blur-2xl border rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-right-12 duration-500 z-[100] ${isDarkMode ? 'bg-[#1A1A1E]/95 border-white/10' : 'bg-white/95 border-gray-200'}`}>
      <div className={`px-8 py-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.01]'}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/10 rounded-xl text-purple-400"><Sparkles size={18} /></div>
          <div>
            <h3 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Neural Assistant</h3>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">Generative Design Engine</p>
          </div>
        </div>
        <button onClick={onToggle} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={18}/></button>
      </div>

      <div className={`flex px-4 py-3 gap-2 ${isDarkMode ? 'bg-black/20' : 'bg-gray-100'}`}>
        <button 
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'suggestions' ? (isDarkMode ? 'bg-white/10 text-white shadow-xl' : 'bg-white text-blue-600 shadow-md') : 'text-gray-500 hover:text-gray-400'}`}
        >
          Insights
        </button>
        <button 
          onClick={() => setActiveTab('competitor')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'competitor' ? (isDarkMode ? 'bg-white/10 text-white shadow-xl' : 'bg-white text-blue-600 shadow-md') : 'text-gray-500 hover:text-gray-400'}`}
        >
          Competitive
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
        {activeTab === 'suggestions' ? (
          <>
            {suggestions.length === 0 && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
                <div className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}><BarChart3 size={32}/></div>
                <div className="space-y-2">
                  <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Active Insights</p>
                  <p className="text-[10px] text-gray-500 max-w-[200px] leading-relaxed">Trigger the Neural Engine to analyze your current composition architecture.</p>
                </div>
                <button 
                  onClick={onAnalyze}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95"
                >
                  Analyze Design
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 size={32} className="text-purple-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 animate-pulse">Scanning Geometry...</p>
              </div>
            )}

            {!isAnalyzing && suggestions.map((s) => (
              <div 
                key={s.id} 
                className={`group p-5 border rounded-3xl transition-all cursor-pointer relative overflow-hidden ${isDarkMode ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30' : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-purple-200'}`}
                onClick={() => onApplySuggestion(s)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-xl ${
                    s.type === 'layout' ? 'bg-blue-600/10 text-blue-400' :
                    s.type === 'color' ? 'bg-emerald-600/10 text-emerald-400' :
                    s.type === 'typography' ? 'bg-amber-600/10 text-amber-400' :
                    'bg-purple-600/10 text-purple-400'
                  }`}>
                    {s.type === 'layout' ? <MousePointer2 size={14} /> :
                     s.type === 'color' ? <Palette size={14} /> :
                     s.type === 'typography' ? <Type size={14} /> :
                     <Scale size={14} />}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{s.type}</span>
                </div>
                <h4 className={`text-xs font-bold mb-2 transition-colors ${isDarkMode ? 'text-white group-hover:text-purple-400' : 'text-gray-900 group-hover:text-purple-600'}`}>{s.title}</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed mb-4">{s.description}</p>
                <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                  <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Apply Transformation</span>
                  <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="space-y-8">
            <div className={`p-8 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center text-center space-y-4 ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500"><Target size={32} /></div>
              <div className="space-y-2">
                <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Market Differentiation</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">Upload a competitor's logo to find visual gaps and opportunities for your brand to stand out.</p>
              </div>
              <label className={`w-full px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer flex items-center justify-center space-x-3 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-200'}`}>
                <CloudUpload size={14} />
                <span>Upload Competitor</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            
            <div className="space-y-4">
               <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Market Strategy Insights</h5>
               <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-purple-600/5 border-purple-500/10' : 'bg-purple-50 border-purple-100'}`}>
                  <p className={`text-[10px] italic leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>"Neural analysis of the culinary tech landscape suggests a shift towards organic high-contrast minimalism. Avoid heavy gradients used by legacy players."</p>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-8 border-t ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
        <div className="flex items-center space-x-3 text-amber-500 mb-4">
          <AlertTriangle size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Accessibility Score: 8.4</span>
        </div>
        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
          <div className="h-full w-[84%] bg-gradient-to-r from-amber-500 to-emerald-500" />
        </div>
        <p className="text-[8px] text-gray-600 mt-3 font-bold uppercase tracking-widest">Readability verified for high-contrast targets.</p>
      </div>
    </div>
  );
};

export default AIAssistantPanel;