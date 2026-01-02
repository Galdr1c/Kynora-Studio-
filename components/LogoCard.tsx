
import React, { useState } from 'react';
import { Download, Share2, Layers, Zap } from 'lucide-react';
import { GeneratedLogo } from '../types';

interface LogoCardProps {
  logo: GeneratedLogo;
  isSelected: boolean;
  onSelect: () => void;
}

const LogoCard: React.FC<LogoCardProps> = ({ logo, isSelected, onSelect }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleDownloadQuick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = logo.url;
    link.download = `kynora-forge-${logo.id.slice(0, 5)}.png`;
    link.click();
  };

  return (
    <div 
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-3xl border-2 transition-all cursor-pointer bg-white dark:bg-[#111827] shadow-sm ${
        isSelected ? 'border-[#E2725B] shadow-2xl ring-4 ring-[#E2725B]/10 scale-[1.02] -translate-y-1' : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-xl'
      }`}
    >
      <div className="aspect-square flex relative overflow-hidden bg-gray-50 dark:bg-black/20">
        {/* Enhanced Skeleton Loader */}
        {!isLoaded && (
          <div className="absolute inset-0 z-10 overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 animate-pulse" />
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
                 style={{ 
                   backgroundSize: '200% 100%',
                 }} 
            />
            
            {/* Floating Geometric Shapes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-2xl animate-spin-slow" />
                <div className="absolute inset-2 border-4 border-blue-500/20 rounded-xl animate-spin-reverse" />
                <div className="absolute inset-4 bg-white/5 rounded-lg animate-pulse" />
              </div>
            </div>
            
            {/* Loading Text */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 animate-pulse">
                Synthesizing...
              </p>
            </div>
          </div>
        )}
        
        {/* Theme Split View */}
        <div className="w-1/2 h-full bg-white p-3 flex items-center justify-center border-r border-black/5 relative overflow-hidden">
          <img 
            src={logo.url} 
            alt="Light Master" 
            onLoad={() => setIsLoaded(true)}
            className={`max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
        <div className="w-1/2 h-full bg-[#0F172A] p-3 flex items-center justify-center relative overflow-hidden">
          <img 
            src={logo.darkUrl} 
            alt="Dark Master" 
            className={`max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        {/* Floating Metadata */}
        <div className="absolute top-2 right-2 flex space-x-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="bg-emerald-500 text-white p-1 rounded-lg shadow-lg"><Zap size={10}/></div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-50 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tighter">Iteration {logo.id.slice(0, 4)}</span>
            <span className="text-[8px] font-bold text-gray-300 dark:text-slate-600">
              {new Date(logo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={handleDownloadQuick}
              className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-[#E2725B]/10 hover:text-[#E2725B] text-gray-400 transition-all active:scale-90"
              title="Quick Export"
            >
              <Download size={12} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); }}
              className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-[#E2725B]/10 hover:text-[#E2725B] text-gray-400 transition-all active:scale-90"
              title="Identity Hub"
            >
              <Share2 size={12} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LogoCard;
