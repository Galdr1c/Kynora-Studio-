import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  X, Layout as LayoutIcon, AlignLeft, AlignCenter, AlignRight,
  Eye, EyeOff, Palette, Sparkles, Loader2, Box, Zap, Flower2, 
  Coffee, Check, Smartphone, Monitor, Type, MousePointer2, 
  Layers, Maximize, Frame, Image as ImageIcon, Wand2,
  ChevronRight, RefreshCcw, Download, Grid as GridIcon, Move, Square,
  Unlock, Lock, Sliders, Pipette, Scissors, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Menu, Info, Save, Undo, Redo, ZoomIn, ZoomOut, ShoppingBag, CreditCard,
  CloudUpload, Gauge, Search, ExternalLink, Activity, FileText, Share2, CornerUpRight,
  Minus, Plus, Circle, GripVertical, Shirt, Laptop, RotateCcw, ShieldCheck, AlertTriangle,
  RotateCw, FlipHorizontal, FlipVertical, Palette as ColorWheel, AlignJustify, Users, Send, MessageSquare,
  Clapperboard, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignHorizontalJustifyCenter, Hash, Ruler, Copy, CheckCircle2, Play
} from 'lucide-react';
import { GeneratedLogo, BrandTheme, ColorBlindnessType, LogoLayer, Collaborator, ChatMessage, DesignSuggestion, LayerAnimation, AnimationTrack, AnimationKeyframe, EditorSettings, CustomGuide } from '../types';
import { recomposeLogo, analyzeDesignAndSuggest, differentiateFromCompetitor, generateBrandReveal } from '../services/gemini';
import { collabService } from '../services/collaboration';
import AIAssistantPanel from './AIAssistantPanel';
import { useToast } from './Toast';

interface LogoEditorProps {
  logo: GeneratedLogo;
  isDarkMode: boolean;
  onClose: () => void;
  onSave: (updatedLogo: GeneratedLogo) => void;
}

interface HistoryState {
  layers: LogoLayer[];
  timestamp: number;
}

interface Keyframe {
  time: number; // 0-100 percentage
  value: number;
  property: 'x' | 'y' | 'scale' | 'rotation' | 'opacity';
}

const PRESET_CATEGORIES: { id: BrandTheme, label: string, icon: React.ReactNode }[] = [
  { id: 'minimalist', label: 'Minimalist', icon: <Zap size={14} /> },
  { id: 'tech', label: 'Tech', icon: <Activity size={14} /> },
  { id: 'vintage', label: 'Vintage', icon: <Flower2 size={14} /> },
  { id: 'luxury', label: 'Luxury', icon: <Maximize size={14} /> },
];

const FONTS = ['Outfit', 'Quicksand', 'Inter', 'Playfair Display', 'Space Mono'];

const Tooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isDarkMode: boolean;
}> = ({ children, content, position = 'top', isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute ${positionClasses[position]} z-[1000] animate-in fade-in zoom-in-95 duration-200`}>
          <div className="relative">
            <div className={`px-4 py-2.5 backdrop-blur-xl border rounded-xl shadow-2xl whitespace-nowrap ${
              isDarkMode 
                ? 'bg-black/95 border-white/20 shadow-2xl' 
                : 'bg-white/95 border-gray-300 shadow-lg'
            }`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{content}</p>
            </div>
            <div className={`absolute w-2 h-2 rotate-45 border ${
              isDarkMode ? 'bg-black border-white/20' : 'bg-white border-gray-300'
            } ${
              position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-b border-r' :
              position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-t border-l' :
              position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-t border-r' :
              'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-b border-l'
            }`} />
          </div>
        </div>
      )}
    </div>
  );
};

const LogoEditor: React.FC<LogoEditorProps> = ({ logo, isDarkMode, onClose, onSave }) => {
  const { showToast, ToastContainer } = useToast();
  const [brandName, setBrandName] = useState(logo.brandName);
  const [slogan, setSlogan] = useState(logo.slogan || '');
  const [layers, setLayers] = useState<LogoLayer[]>(logo.layers || []);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(layers[0]?.id || null);
  
  // Animation State (Problem 5)
  const [keyframes, setKeyframes] = useState<Record<string, Keyframe[]>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0); // 0-100 percentage
  const [duration, setDuration] = useState(3);
  const animationFrameRef = useRef<number | null>(null);

  const [history, setHistory] = useState<HistoryState[]>([{ layers: logo.layers || [], timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isAnimationMode, setIsAnimationMode] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [style, setStyle] = useState<BrandTheme>(logo.prompt.toLowerCase().includes('tech') ? 'tech' : 'modern' as BrandTheme);
  const [primaryColor, setPrimaryColor] = useState(logo.palette?.colors.find(c => c.type === 'primary')?.hex || '#8B5CF6');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [tempLogo, setTempLogo] = useState<GeneratedLogo>(logo);

  const canvasRef = useRef<HTMLDivElement>(null);
  const syncTimerRef = useRef<number | null>(null);

  const activeLayer = useMemo(() => layers.find(l => l.id === activeLayerId), [layers, activeLayerId]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const syncWorkspace = useCallback(async () => {
    if (isProcessing || isPlayingRef.current) return;
    setIsProcessing(true);
    try {
      const [lightUrl, darkUrl] = await Promise.all([
        recomposeLogo(logo.url, brandName, logo.layout, layers, style, primaryColor, false, { slogan: slogan }),
        recomposeLogo(logo.url, brandName, logo.layout, layers, style, primaryColor, true, { slogan: slogan })
      ]);
      setTempLogo(prev => ({ ...prev, url: lightUrl, darkUrl, brandName, layers }));
    } catch (err) {
      console.error("Adaptive sync error", err);
    } finally {
      setIsProcessing(false);
    }
  }, [brandName, slogan, layers, style, primaryColor, logo.layout, logo.url]);

  const updateLayer = useCallback((id: string, updates: Partial<LogoLayer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    collabService.broadcastLayerUpdate(id, updates);

    if (!isPlayingRef.current && (updates.fontFamily || updates.fontSize || updates.fontWeight)) {
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = window.setTimeout(() => {
        syncWorkspace();
      }, 1500);
    }
  }, [syncWorkspace]);

  const alignLayer = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!activeLayer) return;
    const updates: Partial<LogoLayer> = {};
    switch (alignment) {
      case 'left': updates.x = 25; break;
      case 'center': updates.x = 50; break;
      case 'right': updates.x = 75; break;
      case 'top': updates.y = 25; break;
      case 'middle': updates.y = 50; break;
      case 'bottom': updates.y = 75; break;
    }
    updateLayer(activeLayer.id, updates);
    showToast(`Aligned to ${alignment}`, 'info');
  };

  // Functional Animation Studio (Problem 5)
  const playAnimation = () => {
    setIsPlaying(true);
    setCurrentTime(0);
    
    const startTime = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      setCurrentTime(progress);
      
      layers.forEach(layer => {
        const layerKeyframes = keyframes[layer.id] || [];
        const props: (keyof LogoLayer & ('x' | 'y' | 'scale' | 'rotation' | 'opacity'))[] = ['x', 'y', 'scale', 'rotation', 'opacity'];
        
        props.forEach(prop => {
          const propKfs = layerKeyframes.filter(k => k.property === prop);
          if (propKfs.length === 0) return;

          const sorted = [...propKfs].sort((a, b) => a.time - b.time);
          const currentKf = [...sorted].reverse().find(k => k.time <= progress);
          const nextKf = sorted.find(k => k.time > progress);

          if (currentKf && nextKf) {
            const t = (progress - currentKf.time) / (nextKf.time - currentKf.time);
            const interpolated = currentKf.value + (nextKf.value - currentKf.value) * t;
            updateLayer(layer.id, { [prop]: interpolated });
          } else if (currentKf) {
            updateLayer(layer.id, { [prop]: currentKf.value });
          }
        });
      });
      
      if (progress < 100 && isPlayingRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCurrentTime(0);
  };

  const addKeyframe = (layerId: string, property: keyof LogoLayer, time: number) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const newKf: Keyframe = {
      time,
      value: layer[property] as number,
      property: property as any,
    };
    
    setKeyframes(prev => ({
      ...prev,
      [layerId]: [...(prev[layerId] || []).filter(k => k.time !== time || k.property !== property), newKf].sort((a, b) => a.time - b.time),
    }));
    showToast('Keyframe added', 'success');
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLayers([...history[newIndex].layers]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLayers([...history[newIndex].layers]);
    }
  };

  const handleCommit = () => { onSave(tempLogo); showToast('Identity architecture committed', 'success'); };

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col font-sans overflow-hidden ${isDarkMode ? 'bg-[#0C0C0E] text-[#E2E2E6]' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`h-14 border-b flex items-center justify-between px-6 shrink-0 ${isDarkMode ? 'bg-[#0C0C0E]/80 border-white/5' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
        <div className="flex items-center space-x-6">
           <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <button onClick={() => setIsAnimationMode(false)} className={`px-4 py-1 text-xs font-bold rounded-lg transition-all ${!isAnimationMode ? (isDarkMode ? 'text-blue-400 bg-white/10' : 'text-blue-600 bg-white shadow-sm') : 'text-gray-500 hover:text-white'}`}>Design</button>
              <button onClick={() => setIsAnimationMode(true)} className={`px-4 py-1 text-xs font-bold rounded-lg transition-all ${isAnimationMode ? (isDarkMode ? 'text-purple-400 bg-white/10' : 'text-purple-600 bg-white shadow-sm') : 'text-gray-500 hover:text-white'}`}>Animate</button>
           </div>
           
           {!isAnimationMode && activeLayer && (
             <div className={`flex items-center space-x-1 rounded-xl p-1 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
               <Tooltip content="Align Left" position="bottom" isDarkMode={isDarkMode}>
                 <button onClick={() => alignLayer('left')} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'}`}><AlignLeft size={16}/></button>
               </Tooltip>
               <Tooltip content="Align Center" position="bottom" isDarkMode={isDarkMode}>
                 <button onClick={() => alignLayer('center')} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'}`}><AlignCenter size={16}/></button>
               </Tooltip>
               <Tooltip content="Align Right" position="bottom" isDarkMode={isDarkMode}>
                 <button onClick={() => alignLayer('right')} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'}`}><AlignRight size={16}/></button>
               </Tooltip>
               <div className={`h-4 w-px mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
               <Tooltip content="Align Top" position="bottom" isDarkMode={isDarkMode}>
                 <button onClick={() => alignLayer('top')} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'}`}><AlignVerticalJustifyStart size={16}/></button>
               </Tooltip>
               <Tooltip content="Align Middle" position="bottom" isDarkMode={isDarkMode}>
                 <button onClick={() => alignLayer('middle')} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'}`}><AlignVerticalJustifyCenter size={16}/></button>
               </Tooltip>
               <Tooltip content="Align Bottom" position="bottom" isDarkMode={isDarkMode}>
                 <button onClick={() => alignLayer('bottom')} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'}`}><AlignVerticalJustifyEnd size={16}/></button>
               </Tooltip>
             </div>
           )}
        </div>
        <div className="flex items-center space-x-4">
           <button onClick={handleCommit} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-xl active:scale-95">Commit Identity</button>
           <button onClick={onClose} className="p-2 text-gray-500 hover:text-white"><X size={20}/></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`w-64 border-r p-6 space-y-8 ${isDarkMode ? 'bg-[#0C0C0E] border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="space-y-4">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Style Library</label>
            <div className="space-y-1">
              {PRESET_CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => { setStyle(cat.id); setTimeout(syncWorkspace, 1000); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all ${style === cat.id ? 'bg-blue-600/10 text-blue-400 font-bold' : (isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-black/5 hover:text-gray-900')}`}
                >
                  {cat.icon}<span>{cat.label}</span>
                  {style === cat.id && <CheckCircle2 size={14} className="ml-auto text-blue-400" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className={`flex-1 flex flex-col min-w-0 relative ${isDarkMode ? 'bg-[#0C0C0E]' : 'bg-gray-100'}`}>
          <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-12 space-y-10">
            <div className={`w-[450px] h-[450px] bg-white rounded-[2.5rem] shadow-2xl border relative overflow-hidden flex items-center justify-center ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
              <img src={tempLogo.url} className={`max-w-[85%] max-h-[85%] object-contain transition-opacity duration-1000 ${isProcessing ? 'opacity-30 blur-2xl' : 'opacity-100'}`} />
            </div>

            {isAnimationMode && (
              <div className={`w-full max-w-4xl border rounded-[2rem] overflow-hidden ${isDarkMode ? 'border-white/5 bg-[#0C0C0E]' : 'border-gray-200 bg-white'}`}>
                {/* Playback Controls */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={isPlaying ? stopAnimation : playAnimation}
                      className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                    >
                      {isPlaying ? <Square size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        {(currentTime / 100 * duration).toFixed(2)}s
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>/</span>
                      <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        {duration.toFixed(2)}s
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Duration:</label>
                    <input
                      type="number" min="0.5" max="10" step="0.5"
                      value={duration}
                      onChange={(e) => setDuration(parseFloat(e.target.value))}
                      className={`w-20 px-3 py-1.5 rounded-lg text-xs font-mono ${isDarkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                    />
                    <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>seconds</span>
                  </div>
                </div>
                
                {/* Timeline Scrubber */}
                <div className="px-6 py-4">
                  <div className={`relative h-2 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${currentTime}%` }}
                    />
                    <input
                      type="range" min="0" max="100" step="0.1"
                      value={currentTime}
                      onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                      disabled={isPlaying}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                
                {/* Timeline Tracks */}
                <div className="px-6 pb-6 space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                  {layers.map(layer => (
                    <div key={layer.id} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{layer.type} Identity Node</span>
                        <div className="flex gap-2">
                           <button onClick={() => addKeyframe(layer.id, 'opacity', currentTime)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isDarkMode ? 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>+ Opacity</button>
                           <button onClick={() => addKeyframe(layer.id, 'scale', currentTime)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isDarkMode ? 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>+ Scale</button>
                        </div>
                      </div>
                      <div className={`relative h-8 rounded-lg ${isDarkMode ? 'bg-black/40' : 'bg-gray-100'}`}>
                        {(keyframes[layer.id] || []).map((kf, idx) => (
                          <div
                            key={idx}
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-pointer hover:scale-125 transition-transform border border-black shadow-lg"
                            style={{ left: `${kf.time}%` }}
                            title={`${kf.property}: ${kf.value} at ${(kf.time / 100 * duration).toFixed(2)}s`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className={`w-[380px] border-l p-10 space-y-12 shrink-0 overflow-y-auto ${isDarkMode ? 'bg-[#0C0C0E] border-white/5' : 'bg-white border-gray-200'}`}>
          {activeLayer ? (
            <div className="space-y-10">
              <div className="space-y-6">
                <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Geometry</label>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-gray-600 uppercase">Position X</span>
                    <input type="number" value={Math.round(activeLayer.x)} onChange={(e) => updateLayer(activeLayer.id, { x: parseInt(e.target.value) })} className={`w-full p-3 rounded-xl border text-xs font-mono font-bold outline-none ${isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-gray-600 uppercase">Position Y</span>
                    <input type="number" value={Math.round(activeLayer.y)} onChange={(e) => updateLayer(activeLayer.id, { y: parseInt(e.target.value) })} className={`w-full p-3 rounded-xl border text-xs font-mono font-bold outline-none ${isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                  </div>
                </div>
              </div>

              {activeLayer.type !== 'icon' && (
                <div className="space-y-8">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Typography Engine</label>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-gray-600 uppercase">Typeface Family</span>
                      <select 
                        value={activeLayer.fontFamily || 'Outfit'}
                        onChange={(e) => updateLayer(activeLayer.id, { fontFamily: e.target.value })}
                        className={`w-full border-2 rounded-xl py-3 px-4 text-xs font-bold outline-none transition-all cursor-pointer ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      >
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-gray-600 uppercase">Weight</span>
                      <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                        {['light', 'regular', 'medium', 'bold'].map(w => (
                          <button key={w} onClick={() => updateLayer(activeLayer.id, { fontWeight: w as any })} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeLayer.fontWeight === w ? (isDarkMode ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-white shadow-sm') : 'text-gray-500 hover:text-gray-300'}`}>{w}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-gray-600 uppercase">Glyph Size</span>
                        <span className="text-[10px] font-mono text-blue-500 font-bold">{activeLayer.fontSize || 48}px</span>
                      </div>
                      <input type="range" min="8" max="120" value={activeLayer.fontSize || 48} onChange={(e) => updateLayer(activeLayer.id, { fontSize: parseInt(e.target.value) })} className="w-full accent-blue-500 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
               <div className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center ${isDarkMode ? 'border-gray-500' : 'border-gray-300'}`}><MousePointer2 size={32}/></div>
               <p className={`text-xs font-black uppercase tracking-widest leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select a layer to<br/>forge properties</p>
            </div>
          )}
        </aside>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LogoEditor;