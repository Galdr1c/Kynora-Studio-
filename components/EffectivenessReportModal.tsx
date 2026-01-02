import React from 'react';
import { X, Download, FileText, BarChart3, Target, Zap, ShieldAlert, Globe, Star, Info, TrendingUp } from 'lucide-react';
import { LogoEffectivenessReport, GeneratedLogo } from '../types';

interface EffectivenessReportModalProps {
  logo: GeneratedLogo;
  report: LogoEffectivenessReport;
  onClose: () => void;
}

const EffectivenessReportModal: React.FC<EffectivenessReportModalProps> = ({ logo, report, onClose }) => {
  const handleExportPDF = () => {
    // Simulated PDF export
    alert("Compiling Neural Audit Report into high-fidelity PDF...");
  };

  const getMetricColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 75) return 'text-blue-500 stroke-blue-500';
    if (score >= 60) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const MetricGauge = ({ label, score, icon: Icon }: { label: string, score: number, icon: any }) => (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="48" cy="48" r="40" className="stroke-white/5 fill-none" strokeWidth="6" />
          <circle 
            cx="48" cy="48" r="40" 
            className={`fill-none transition-all duration-1000 ease-out ${getMetricColor(score)}`}
            strokeWidth="6" 
            strokeDasharray={2 * Math.PI * 40} 
            strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)} 
            strokeLinecap="round" 
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <Icon size={20} className="mb-1 opacity-50" />
          <span className="text-xl font-black text-white">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="max-w-6xl w-full bg-[#111113] rounded-[3.5rem] border border-white/10 shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <header className="h-24 px-12 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
              <BarChart3 size={28}/>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Neural Brand Audit</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">AI-Powered Effectiveness Analysis • {logo.brandName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleExportPDF} className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-lg">
              <Download size={14}/>
              <span>Export Analysis</span>
            </button>
            <button onClick={onClose} className="p-4 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-2xl"><X size={28}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
          {/* Top Level Score */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-56 h-56 flex items-center justify-center">
                 <div className="absolute inset-0 bg-purple-600/20 blur-[80px] rounded-full animate-pulse" />
                 <svg className="w-full h-full -rotate-90 relative z-10">
                    <circle cx="112" cy="112" r="100" className="stroke-white/5 fill-none" strokeWidth="12" />
                    <circle 
                      cx="112" cy="112" r="100" 
                      className="stroke-purple-500 fill-none transition-all duration-1000 ease-out" 
                      strokeWidth="12" 
                      strokeDasharray={2 * Math.PI * 100} 
                      strokeDashoffset={2 * Math.PI * 100 * (1 - report.overall_score / 100)} 
                      strokeLinecap="round" 
                    />
                 </svg>
                 <div className="absolute flex flex-col items-center z-20">
                    <span className="text-6xl font-black text-white tracking-tighter">{report.overall_score}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Impact Factor</span>
                 </div>
              </div>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6">
              <MetricGauge label="Complexity" score={report.complexity.score} icon={Zap} />
              <MetricGauge label="Memorability" score={report.memorability.score} icon={Star} />
              <MetricGauge label="Versatility" score={report.versatility.score} icon={Target} />
              <MetricGauge label="Uniqueness" score={report.uniqueness.score} icon={Globe} />
              <MetricGauge label="Industry Fit" score={report.industry_fit.score} icon={TrendingUp} />
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-2">
                 <ShieldAlert size={24} className="text-emerald-500" />
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Safe Passage</span>
                 <p className="text-[8px] text-emerald-500/70 font-bold">No negative cultural markers detected</p>
              </div>
            </div>
          </div>

          {/* Scalability Stress-test */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Scalability Stress-Test</h3>
               <span className="text-[10px] font-bold text-gray-600">Optic legibility verified</span>
            </div>
            <div className="bg-black/40 rounded-[2.5rem] p-10 flex items-end justify-between gap-8 border border-white/5">
               <div className="flex flex-col items-center space-y-4">
                  <div className="w-4 h-4 overflow-hidden flex items-center justify-center bg-white"><img src={logo.url} className="w-full h-full object-contain" /></div>
                  <span className="text-[9px] font-mono text-gray-600 uppercase">16px</span>
               </div>
               <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 overflow-hidden flex items-center justify-center bg-white"><img src={logo.url} className="w-full h-full object-contain" /></div>
                  <span className="text-[9px] font-mono text-gray-600 uppercase">32px</span>
               </div>
               <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 overflow-hidden flex items-center justify-center bg-white"><img src={logo.url} className="w-full h-full object-contain" /></div>
                  <span className="text-[9px] font-mono text-gray-600 uppercase">64px</span>
               </div>
               <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 overflow-hidden flex items-center justify-center bg-white rounded-xl"><img src={logo.url} className="w-full h-full object-contain" /></div>
                  <span className="text-[9px] font-mono text-gray-600 uppercase">128px</span>
               </div>
               <div className="flex flex-col items-center space-y-4 flex-1">
                  <div className="w-full aspect-video overflow-hidden flex items-center justify-center bg-white rounded-[2rem]"><img src={logo.url} className="w-48 h-48 object-contain" /></div>
                  <span className="text-[9px] font-mono text-gray-600 uppercase">512px HD</span>
               </div>
            </div>
          </div>

          {/* Qualitative Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center space-x-2">
                   <Star size={12}/> <span>Neural Feedback Archive</span>
                </h4>
                <div className="space-y-4">
                   {[
                     { label: 'Market Context', feedback: report.industry_fit.feedback },
                     { label: 'Memorability Vector', feedback: report.memorability.feedback },
                     { label: 'Trend Alignment', feedback: report.trend_alignment.feedback },
                   ].map(item => (
                     <div key={item.label} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
                        <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{item.label}</span>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{item.feedback}</p>
                     </div>
                   ))}
                </div>
             </div>
             <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center space-x-2">
                   <Zap size={12}/> <span>Optimization Pathways</span>
                </h4>
                <div className="p-8 bg-purple-600/10 border border-purple-500/20 rounded-[2.5rem] space-y-6">
                   <p className="text-xs font-bold text-white leading-relaxed">Neural Engine recommendations for performance uplift:</p>
                   <ul className="space-y-4">
                      {report.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start space-x-4">
                           <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">{i+1}</div>
                           <p className="text-[11px] text-gray-300 leading-relaxed font-medium">{s}</p>
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EffectivenessReportModal;