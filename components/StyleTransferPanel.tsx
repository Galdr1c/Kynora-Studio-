import React, { useState } from 'react';
import { Sparkles, Palette, Zap, Box, Layers, Brush, Sliders, Loader2, Download, Info } from 'lucide-react';
import { LogoStyle } from '../types';

interface StyleTransferPanelProps {
  currentStyles: LogoStyle[];
  isProcessing: boolean;
  onApplyStyle: (styleId: string, intensity: number) => void;
  onDownloadStyle: (url: string, label: string) => void;
  isDarkMode?: boolean;
}

const STYLE_LIBRARY = [
  { id: 'bauhaus', label: 'Bauhaus', category: 'Art Movement', hint: 'Geometric shapes, primary colors, functional minimalism.' },
  { id: 'artdeco', label: 'Art Deco', category: 'Art Movement', hint: 'Luxurious symmetry, gold accents, vintage elegance.' },
  { id: 'swiss', label: 'Swiss Design', category: 'Art Movement', hint: 'Grid-based objectivity, clean typography, high clarity.' },
  { id: 'memphis', label: 'Memphis', category: 'Art Movement', hint: '80s energy, vibrant patterns, playful geometry.' },
  { id: 'brutalism', label: 'Brutalism', category: 'Art Movement', hint: 'Raw industrial power, stark contrast, bold forms.' },
  { id: 'glass', label: 'Glassmorphism', category: 'Visual Effect', hint: 'Frosted glass translucency with glossy reflections.' },
  { id: 'neon', label: 'Neon Glow', category: 'Visual Effect', hint: '80s electric neon signs with vibrant bloom.' },
  { id: '3d', label: '3D Extrusion', category: 'Visual Effect', hint: 'Physical dimensional depth with studio lighting.' },
  { id: 'mesh', label: 'Gradient Mesh', category: 'Visual Effect', hint: 'Fluid organic color transitions and smooth blending.' },
  { id: 'riso', label: 'Risograph', category: 'Visual Effect', hint: 'Vintage ink textures and authentic print grain.' },
  { id: 'embossed', label: 'Embossed', category: 'Visual Effect', hint: 'Logo physically pressed into matte premium paper.' },
  { id: 'metallic', label: 'Metallic', category: 'Material', hint: 'Polished gold and chrome with realistic highlights.' },
  { id: 'wooden', label: 'Wooden', category: 'Material', hint: 'Organic wood grain carving and natural textures.' },
  { id: 'fabric', label: 'Fabric', category: 'Material', hint: 'Embroidered stitching and realistic textile fibers.' },
  { id: 'watercolor', label: 'Watercolor', category: 'Material', hint: 'Artistic pigment bleeds and hand-painted transparency.' },
  { id: 'sketch', label: 'Hand Sketch', category: 'Material', hint: 'Professional charcoal drawing and rough artistic lines.' },
];

const StyleTransferPanel: React.FC<StyleTransferPanelProps> = ({ currentStyles, isProcessing, onApplyStyle, onDownloadStyle, isDarkMode = true }) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(75);

  const handleApply = () => {
    if (selectedStyleId) {
      onApplyStyle(selectedStyleId, intensity);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className={`text-2xl font-bold tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Artistic Neural Styles</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Generative Aesthetic Overlays • Imagen Pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Style Selection Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {STYLE_LIBRARY.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyleId(style.id)}
              className={`group relative p-6 rounded-[2rem] border transition-all text-left flex flex-col justify-between aspect-square ${selectedStyleId === style.id ? 'bg-purple-600 border-transparent shadow-2xl shadow-purple-600/30' : (isDarkMode ? 'bg-white/5 border-white/5 hover:border-purple-600/20' : 'bg-white border-gray-100 hover:border-purple-600/40 shadow-sm')}`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-xl ${selectedStyleId === style.id ? 'bg-white/20' : (isDarkMode ? 'bg-purple-600/10' : 'bg-purple-50')}`}>
                  <Brush size={16} className={selectedStyleId === style.id ? 'text-white' : 'text-purple-600 dark:text-purple-400'} />
                </div>
                <div className="group/hint relative">
                  <Info size={14} className={selectedStyleId === style.id ? 'text-white/50' : (isDarkMode ? 'text-gray-300' : 'text-gray-400')} />
                  <div className="absolute bottom-full right-0 mb-3 w-40 bg-black/90 backdrop-blur-xl p-3 rounded-xl text-[8px] font-bold text-gray-300 leading-relaxed opacity-0 group-hover/hint:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10">
                    {style.hint}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className={`text-[8px] font-black uppercase tracking-widest ${selectedStyleId === style.id ? 'text-white/60' : 'text-gray-400'}`}>{style.category}</p>
                <h3 className={`text-xs font-black uppercase tracking-tighter ${selectedStyleId === style.id ? 'text-white' : (isDarkMode ? 'text-gray-200' : 'text-gray-800')}`}>{style.label}</h3>
              </div>
            </button>
          ))}
        </div>

        {/* Configuration Panel */}
        <aside className="lg:col-span-4 space-y-8">
           <div className={`rounded-[2.5rem] border p-8 shadow-xl space-y-10 ${isDarkMode ? 'bg-[#161618] border-white/5' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-600"><Sliders size={24}/></div>
                 <div>
                    <h3 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Neural Config</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Aesthetic Intensity</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Style Strength</label>
                    <span className="text-[10px] font-mono text-purple-500 font-bold">{intensity}%</span>
                 </div>
                 <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={intensity} 
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-600"
                 />
                 <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Subtle</span>
                    <span>Literal</span>
                 </div>
              </div>

              <button 
                onClick={handleApply}
                disabled={!selectedStyleId || isProcessing}
                className={`w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center space-x-4 shadow-2xl ${!selectedStyleId || isProcessing ? (isDarkMode ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5' : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200') : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'}`}
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span>{isProcessing ? 'Synthesizing...' : 'Apply Neural Style'}</span>
              </button>
           </div>

           {/* Style History / Applied versions */}
           {currentStyles.length > 0 && (
             <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Neural Generations</h4>
                <div className="space-y-4">
                   {currentStyles.map((style) => (
                     <div key={style.id} className={`group relative rounded-3xl border p-4 flex items-center space-x-4 shadow-lg transition-all ${isDarkMode ? 'bg-[#161618] border-white/5 hover:border-purple-600/30' : 'bg-white border-gray-100 hover:border-purple-600/20'}`}>
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/20 shrink-0">
                           <img src={style.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h5 className={`text-[10px] font-black uppercase truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{style.label}</h5>
                           <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{style.intensity}% Intensity</p>
                        </div>
                        <button 
                          onClick={() => onDownloadStyle(style.imageUrl, style.label)}
                          className={`p-3 rounded-xl transition-all active:scale-90 opacity-0 group-hover:opacity-100 ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-purple-600' : 'bg-black/5 text-gray-400 hover:text-purple-600'}`}
                        >
                          <Download size={14}/>
                        </button>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </aside>
      </div>
    </div>
  );
};

export default StyleTransferPanel;