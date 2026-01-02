import React, { useEffect, useState } from 'react';
import { X, Download, FileText, BarChart3, Target, Zap, ShieldAlert, Globe, Star, Info, TrendingUp, Activity } from 'lucide-react';
import { LogoEffectivenessReport, GeneratedLogo } from '../types';

interface EffectivenessReportModalProps {
  logo: GeneratedLogo;
  report: LogoEffectivenessReport;
  onClose: () => void;
  isDarkMode?: boolean;
}

interface ScoreBarProps {
  label: string;
  score: number; // 0-100
  color: 'purple' | 'blue' | 'emerald' | 'amber' | 'red';
  isDarkMode: boolean;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, color, isDarkMode }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const colorClasses = {
    purple: isDarkMode ? 'from-purple-600 to-purple-400' : 'from-purple-500 to-purple-400',
    blue: isDarkMode ? 'from-blue-600 to-blue-400' : 'from-blue-500 to-blue-400',
    emerald: isDarkMode ? 'from-emerald-600 to-emerald-400' : 'from-emerald-500 to-emerald-400',
    amber: isDarkMode ? 'from-amber-600 to-amber-400' : 'from-amber-500 to-amber-400',
    red: isDarkMode ? 'from-red-600 to-red-400' : 'from-red-500 to-red-400',
  };
  
  const textColorClasses = {
    purple: isDarkMode ? 'text-purple-400' : 'text-purple-600',
    blue: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    emerald: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
    amber: isDarkMode ? 'text-amber-400' : 'text-amber-600',
    red: isDarkMode ? 'text-red-400' : 'text-red-600',
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </span>
        <span className={`text-2xl font-black ${textColorClasses[color]}`}>
          {score}
        </span>
      </div>
      
      <div className={`relative h-3 rounded-full overflow-hidden ${
        isDarkMode ? 'bg-white/5' : 'bg-gray-200'
      }`}>
        <div 
          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${animatedScore}%` }}
        />
        
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          style={{ 
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </div>
  );
};

const EffectivenessReportModal: React.FC<EffectivenessReportModalProps> = ({ logo, report, onClose, isDarkMode = true }) => {
  // ESC key handler for Problem 6
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleExportPDF = () => {
    alert("Compiling Neural Audit Report into high-fidelity PDF...");
  };

  return (
    <div 
      className={`fixed inset-0 z-[600] backdrop-blur-xl flex items-center justify-center p-8 ${
        isDarkMode ? 'bg-black/80' : 'bg-gray-900/60'
      }`}
      onClick={onClose} // Problem 6: Close on backdrop click
    >
      <div 
        className={`w-full max-w-4xl backdrop-blur-3xl border rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
          isDarkMode 
            ? 'bg-[#1A1A1E]/98 border-white/10' 
            : 'bg-white/98 border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()} // Problem 6: Don't close when clicking inside
      >
        {/* Header with Close Button (Problem 6 Fix) */}
        <div className={`px-8 py-6 border-b flex items-center justify-between ${
          isDarkMode ? 'border-white/5' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl border ${
              isDarkMode 
                ? 'bg-blue-600/10 border-blue-500/20' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <Activity size={24} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <div>
              <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Neural Brand Audit
              </h2>
              <p className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-500' : 'text-gray-600'
              }`}>
                AI-Powered Analysis • {logo.brandName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={handleExportPDF} className="hidden sm:flex items-center space-x-2 bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-lg border border-gray-100">
              <Download size={14}/>
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className={`p-3 rounded-2xl transition-all group ${
                isDarkMode 
                  ? 'hover:bg-white/5 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="space-y-16">
            {/* Summary View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-64 h-64 flex items-center justify-center">
                   <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full animate-pulse" />
                   <svg className="w-full h-full -rotate-90 relative z-10">
                      <circle cx="128" cy="128" r="110" className="stroke-white/5 fill-none" strokeWidth="12" />
                      <circle 
                        cx="128" cy="128" r="110" 
                        className="stroke-blue-500 fill-none transition-all duration-1000 ease-out" 
                        strokeWidth="12" 
                        strokeDasharray={2 * Math.PI * 110} 
                        strokeDashoffset={2 * Math.PI * 110 * (1 - report.overall_score / 100)} 
                        strokeLinecap="round" 
                      />
                   </svg>
                   <div className="absolute flex flex-col items-center z-20 text-center">
                      <span className={`text-7xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{report.overall_score}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Impact</span>
                   </div>
                </div>
              </div>
              
              {/* Problem 7: High-fidelity Score Bars Grid */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                <ScoreBar label="Visual Complexity" score={report.complexity.score} color="purple" isDarkMode={isDarkMode} />
                <ScoreBar label="Memorability" score={report.memorability.score} color="blue" isDarkMode={isDarkMode} />
                <ScoreBar label="Versatility" score={report.versatility.score} color="emerald" isDarkMode={isDarkMode} />
                <ScoreBar label="Uniqueness" score={report.uniqueness.score} color="amber" isDarkMode={isDarkMode} />
              </div>
            </div>

            {/* Qualitative Feedback Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/5">
               <div className="space-y-8">
                  <div className="flex items-center space-x-3">
                     <Info size={16} className="text-blue-400" />
                     <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analysis Nodes</h3>
                  </div>
                  <div className="space-y-6">
                     {[
                       { label: 'Market Context', feedback: report.industry_fit.feedback, icon: Target },
                       { label: 'Psychology Vector', feedback: report.memorability.feedback, icon: Star },
                       { label: 'Trend Alignment', feedback: report.trend_alignment.feedback, icon: TrendingUp },
                     ].map(item => (
                       <div key={item.label} className={`group p-6 rounded-3xl space-y-3 transition-all ${isDarkMode ? 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]' : 'bg-gray-50 border border-gray-100 hover:bg-gray-100/50'}`}>
                          <div className="flex items-center space-x-3">
                             <item.icon size={14} className="text-gray-500" />
                             <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{item.label}</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.feedback}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="flex items-center space-x-3">
                     <Zap size={16} className="text-amber-400" />
                     <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Identity Optimization</h3>
                  </div>
                  <div className={`p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden border ${isDarkMode ? 'bg-gradient-to-br from-purple-600/10 to-blue-600/10 border-white/10' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100'}`}>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-10 -mt-10" />
                     <p className={`text-xs font-bold leading-relaxed relative z-10 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Generative recommendations for performance uplift:</p>
                     <ul className="space-y-5 relative z-10">
                        {report.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start space-x-4 group">
                             <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-white/5 border border-white/10 text-purple-400' : 'bg-white border border-purple-200 text-purple-600 shadow-sm'}`}>{i+1}</div>
                             <p className={`text-[11px] leading-relaxed font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{s}</p>
                          </li>
                        ))}
                     </ul>
                     <div className="pt-6 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center space-x-2">
                           <ShieldAlert size={12} className="text-emerald-500" />
                           <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Cultural Verification Clean</span>
                        </div>
                        <Globe size={14} className="text-gray-600" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default EffectivenessReportModal;