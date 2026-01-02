import React from 'react';
import { Download, Info, CheckCircle, Smartphone, Monitor, Layout, Type, Square, Layers, Ghost } from 'lucide-react';
import { LogoVariant } from '../types';

interface LogoVariantsGridProps {
  variants: LogoVariant[];
  onDownloadAll: () => void;
}

const LogoVariantsGrid: React.FC<LogoVariantsGridProps> = ({ variants, onDownloadAll }) => {
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const getIcon = (type: LogoVariant['type']) => {
    switch (type) {
      case 'icon': return <Square size={16}/>;
      case 'text': return <Type size={16}/>;
      case 'monochrome': return <CheckCircle size={16}/>;
      case 'stacked': return <Layout size={16} className="rotate-90"/>;
      case 'horizontal': return <Layout size={16}/>;
      case 'compact': return <Smartphone size={16}/>;
      case 'watermark': return <Ghost size={16}/>;
      default: return <Layers size={16}/>;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#1D2B3A] dark:text-white uppercase">Official Brand Variations</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Atomic System • Optimized for High-Density Displays</p>
        </div>
        <button 
          onClick={onDownloadAll}
          className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-purple-600/20 transition-all active:scale-95 flex items-center space-x-3"
        >
          <Download size={16}/>
          <span>Compile Master ZIP</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {variants.map((variant) => (
          <div key={variant.id} className="group relative bg-white dark:bg-[#161618] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all flex flex-col overflow-hidden hover:border-purple-600/20">
            {/* Header */}
            <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/10 rounded-xl text-purple-600 dark:text-purple-400">{getIcon(variant.type)}</div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">{variant.label}</h3>
              </div>
              <div className="group/hint relative">
                <Info size={14} className="text-gray-300 dark:text-gray-600 cursor-help hover:text-purple-500 transition-colors" />
                <div className="absolute bottom-full right-0 mb-3 w-48 bg-black/90 backdrop-blur-xl p-3 rounded-xl text-[9px] font-bold text-gray-300 leading-relaxed opacity-0 group-hover/hint:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10 shadow-2xl">
                  {variant.usageHint}
                </div>
              </div>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-2 h-48 border-b border-gray-100 dark:border-white/5">
              <div className="bg-white flex items-center justify-center p-6 relative group/light">
                 <img src={variant.lightUrl} alt="Light" className="max-w-full max-h-full object-contain drop-shadow-md group-hover/light:scale-110 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-black/0 group-hover/light:bg-black/5 transition-colors" />
                 <button 
                  onClick={() => handleDownload(variant.lightUrl, `${variant.label.toLowerCase().replace(/\s+/g, '-')}-light.png`)}
                  className="absolute bottom-3 right-3 p-2 bg-white/80 backdrop-blur rounded-lg text-gray-400 hover:text-purple-600 opacity-0 group-hover/light:opacity-100 transition-all shadow-lg"
                 >
                   <Download size={12}/>
                 </button>
              </div>
              <div className="bg-[#0F172A] flex items-center justify-center p-6 relative group/dark">
                 <img src={variant.darkUrl} alt="Dark" className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover/dark:scale-110 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-white/0 group-hover/dark:bg-white/5 transition-colors" />
                 <button 
                  onClick={() => handleDownload(variant.darkUrl, `${variant.label.toLowerCase().replace(/\s+/g, '-')}-dark.png`)}
                  className="absolute bottom-3 right-3 p-2 bg-black/50 backdrop-blur rounded-lg text-white hover:text-purple-400 opacity-0 group-hover/dark:opacity-100 transition-all shadow-lg"
                 >
                   <Download size={12}/>
                 </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex space-x-2">
                 {['PNG', 'SVG', 'PDF'].map(ext => (
                   <span key={ext} className="text-[8px] font-black px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 uppercase tracking-widest">{ext}</span>
                 ))}
              </div>
              <div className="flex items-center space-x-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-widest">Optimized 4K</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoVariantsGrid;