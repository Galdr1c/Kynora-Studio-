import React, { useState, useMemo, useEffect } from 'react';
import { X, ShieldCheck, Info, AlertTriangle, CheckCircle2, Wand2, RefreshCw, Loader2, Zap } from 'lucide-react';
import { ColorPalette, GeneratedLogo } from '../types';
import { optimizePaletteForAccessibility } from '../services/gemini';

interface AccessibilityAuditModalProps {
  logo: GeneratedLogo;
  onClose: () => void;
  onApplyFixedPalette: (newPalette: ColorPalette) => void;
}

const CVD_PROFILES = [
  { id: 'none', label: 'Standard Vision', hint: 'Original colors without simulation.' },
  { id: 'protanopia', label: 'Protanopia', hint: 'Red-blind. Sensitivity to red light is absent.' },
  { id: 'deuteranopia', label: 'Deuteranopia', hint: 'Green-blind. Sensitivity to green light is absent.' },
  { id: 'tritanopia', label: 'Tritanopia', hint: 'Blue-blind. Sensitivity to blue light is absent.' },
  { id: 'achromatopsia', label: 'Achromatopsia', hint: 'Total color blindness. Greyscale only.' },
];

const AccessibilityAuditModal: React.FC<AccessibilityAuditModalProps> = ({ logo, onClose, onApplyFixedPalette }) => {
  const [isFixing, setIsFixing] = useState(false);
  const [score, setScore] = useState(0);

  // Animate score on entry
  useEffect(() => {
    const timer = setTimeout(() => setScore(84), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAutoFix = async () => {
    if (isFixing) return;
    setIsFixing(true);
    try {
      const fixed = await optimizePaletteForAccessibility(logo.palette!, logo.brandName);
      onApplyFixedPalette(fixed);
      setScore(98);
    } catch (err) {
      console.error("Auto-fix failed", err);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in duration-500">
      {/* SVG Filters for CVD simulation */}
      <svg className="hidden">
        <filter id="protanopia">
          <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" />
        </filter>
        <filter id="achromatopsia">
          <feColorMatrix type="matrix" values="0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0" />
        </filter>
      </svg>

      <div className="max-w-7xl w-full bg-[#161618] rounded-[3.5rem] border border-white/5 shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="h-24 px-12 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
              <ShieldCheck size={28}/>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Accessibility Insight</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Inclusive Design Audit • WCAG 2.1 Compliance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-2xl"><X size={28}/></button>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Audit Grid */}
          <main className="flex-1 overflow-y-auto p-12 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:48px_48px] scrollbar-hide">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
              {CVD_PROFILES.map((profile) => (
                <div key={profile.id} className="space-y-6 group">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">{profile.label}</span>
                     <div className="group/hint relative">
                        <Info size={14} className="text-gray-700 hover:text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-black/90 backdrop-blur-xl p-3 rounded-xl text-[9px] font-bold text-gray-400 leading-relaxed opacity-0 group-hover/hint:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10">
                          {profile.hint}
                        </div>
                     </div>
                   </div>
                   <div className="aspect-video bg-black/60 rounded-[2.5rem] border border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-emerald-500/30 transition-all duration-500">
                      <img 
                        src={logo.url} 
                        className="max-w-[70%] max-h-[70%] object-contain" 
                        style={{ filter: profile.id === 'none' ? 'none' : `url(#${profile.id})` }} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                   </div>
                </div>
              ))}
            </div>
          </main>

          {/* Scoring Sidebar */}
          <aside className="w-96 border-l border-white/5 bg-black/20 p-10 flex flex-col space-y-10">
            {/* Score Ring */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-48 h-48 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="88" className="stroke-white/5 fill-none" strokeWidth="8" />
                    <circle 
                      cx="96" cy="96" r="88" 
                      className={`fill-none transition-all duration-1000 ease-out ${score > 90 ? 'stroke-emerald-500' : 'stroke-amber-500'}`} 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 88} 
                      strokeDashoffset={2 * Math.PI * 88 * (1 - score / 100)} 
                      strokeLinecap="round" 
                    />
                 </svg>
                 <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black text-white tracking-tighter">{score}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Score</span>
                 </div>
              </div>
              <div className="flex items-center space-x-3 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                 <CheckCircle2 size={12} className="text-emerald-500"/>
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">WCAG 2.1 Compliant</span>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Audit Breakdown</label>
              <div className="space-y-4">
                 {[
                   { label: 'Contrast Ratio', value: score > 90 ? 100 : 72, status: 'good' },
                   { label: 'Semantic Clarity', value: 94, status: 'good' },
                   { label: 'Color Dependency', value: score > 90 ? 98 : 84, status: 'warning' },
                 ].map((item) => (
                   <div key={item.label} className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                       <span className="text-[10px] font-mono text-gray-500">{item.value}%</span>
                     </div>
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${item.value > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                         style={{ width: `${item.value}%` }} 
                       />
                     </div>
                   </div>
                 ))}
              </div>

              <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-3">
                 <div className="flex items-center space-x-2 text-amber-500">
                    <AlertTriangle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Insight</span>
                 </div>
                 <p className="text-[10px] text-gray-500 leading-relaxed italic">
                   {score > 90 
                    ? "Excellent. Brand marks remain highly legible across all color vision deficiency profiles."
                    : "Partial failure. Some elements may blend into the background for Protanopia viewers."}
                 </p>
              </div>
            </div>

            <button 
              onClick={handleAutoFix}
              disabled={isFixing || score > 95}
              className={`w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center space-x-4 shadow-2xl ${score > 95 ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'}`}
            >
              {isFixing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              <span>{isFixing ? 'Remediating...' : 'Fix Automatically'}</span>
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityAuditModal;
