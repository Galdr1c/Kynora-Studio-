
import React, { useRef, useState } from 'react';
import { ColorPalette, BrandColor } from '../types';
import { Copy, Check, Pipette, Sun, Moon, RefreshCw } from 'lucide-react';

interface ColorPaletteDisplayProps {
  palette: ColorPalette;
  onUpdatePalette: (updatedPalette: ColorPalette) => void;
}

const ColorPaletteDisplay: React.FC<ColorPaletteDisplayProps> = ({ palette, onUpdatePalette }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');
  const lightInputs = useRef<(HTMLInputElement | null)[]>([]);
  const darkInputs = useRef<(HTMLInputElement | null)[]>([]);

  const copyToClipboard = (hex: string, id: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleColorChange = (index: number, field: 'hex' | 'darkHex', newHex: string) => {
    const newColors = [...palette.colors];
    newColors[index] = { ...newColors[index], [field]: newHex };
    onUpdatePalette({ colors: newColors });
  };

  return (
    <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Atmospheric Palette</h3>
          <p className="text-[8px] font-bold text-[#E2725B] uppercase tracking-widest mt-0.5">Optically Balanced Pairs</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-transparent dark:border-white/10">
          <button 
            onClick={() => setActiveTheme('light')}
            className={`p-1.5 rounded-lg transition-all ${activeTheme === 'light' ? 'bg-white dark:bg-white/20 shadow-sm text-amber-500' : 'text-gray-400 opacity-50'}`}
          >
            <Sun size={12} />
          </button>
          <button 
            onClick={() => setActiveTheme('dark')}
            className={`p-1.5 rounded-lg transition-all ${activeTheme === 'dark' ? 'bg-white dark:bg-white/20 shadow-sm text-indigo-400' : 'text-gray-400 opacity-50'}`}
          >
            <Moon size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {palette.colors.map((color, idx) => (
          <div key={idx} className="group relative bg-gray-50/50 dark:bg-white/5 p-3 rounded-2xl border border-transparent hover:border-[#E2725B]/20 transition-all">
            <div className="flex items-center space-x-3">
              {/* Dual-State Orb */}
              <div className="relative w-10 h-10 shrink-0">
                <div 
                  className="absolute inset-0 rounded-full border border-black/5 dark:border-white/10 shadow-inner overflow-hidden flex transition-transform group-hover:scale-105"
                  onClick={() => {
                    activeTheme === 'light' ? lightInputs.current[idx]?.click() : darkInputs.current[idx]?.click();
                  }}
                >
                  <div 
                    className="flex-1 transition-colors duration-500" 
                    style={{ backgroundColor: activeTheme === 'light' ? color.hex : color.darkHex }} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 pointer-events-none">
                    <Pipette size={14} className="text-white drop-shadow-md" />
                  </div>
                </div>
                
                {/* Hidden Inputs */}
                <input 
                  type="color" 
                  ref={el => { lightInputs.current[idx] = el; }}
                  value={color.hex}
                  onChange={(e) => handleColorChange(idx, 'hex', e.target.value)}
                  className="absolute inset-0 opacity-0 w-0 h-0"
                />
                <input 
                  type="color" 
                  ref={el => { darkInputs.current[idx] = el; }}
                  value={color.darkHex}
                  onChange={(e) => handleColorChange(idx, 'darkHex', e.target.value)}
                  className="absolute inset-0 opacity-0 w-0 h-0"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-gray-800 dark:text-gray-200 truncate uppercase tracking-tighter" title={color.name}>
                  {color.name}
                </p>
                <button 
                  onClick={() => copyToClipboard(activeTheme === 'light' ? color.hex : color.darkHex, `${idx}-${activeTheme}`)}
                  className="flex items-center space-x-1 text-[8px] font-mono text-gray-400 hover:text-[#E2725B] transition-colors"
                >
                  <span>{copiedIndex === `${idx}-${activeTheme}` ? 'COPIED' : (activeTheme === 'light' ? color.hex : color.darkHex)}</span>
                </button>
              </div>
            </div>

            {/* Split Visualization Bar */}
            <div className="mt-3 flex h-1.5 rounded-full overflow-hidden border border-black/5 dark:border-white/10">
              <div className="flex-1" style={{ backgroundColor: color.hex }} title="Light Variant" />
              <div className="flex-1" style={{ backgroundColor: color.darkHex }} title="Dark Variant" />
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-[8px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest text-center flex items-center justify-center space-x-2">
        <RefreshCw size={8} className="animate-spin-slow" />
        <span>Chroma-pairs synced via Gemini 3</span>
      </p>

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ColorPaletteDisplay;
