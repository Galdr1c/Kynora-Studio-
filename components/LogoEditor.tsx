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
  Clapperboard, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignHorizontalJustifyCenter, Hash, Ruler, Copy
} from 'lucide-react';
import { GeneratedLogo, BrandTheme, ColorBlindnessType, LogoLayer, Collaborator, ChatMessage, DesignSuggestion, LayerAnimation, AnimationTrack, AnimationKeyframe, EditorSettings, CustomGuide } from '../types';
import { recomposeLogo, analyzeDesignAndSuggest, differentiateFromCompetitor, generateBrandReveal } from '../services/gemini';
import { collabService } from '../services/collaboration';
import AIAssistantPanel from './AIAssistantPanel';
import AnimationTimeline from './AnimationTimeline';
import { useToast } from './Toast';

interface LogoEditorProps {
  logo: GeneratedLogo;
  onClose: () => void;
  onSave: (updatedLogo: GeneratedLogo) => void;
}

interface HistoryState {
  layers: LogoLayer[];
  timestamp: number;
}

const PRESET_CATEGORIES: { id: BrandTheme, label: string, icon: React.ReactNode }[] = [
  { id: 'minimalist', label: 'Minimalist', icon: <Zap size={14} /> },
  { id: 'tech', label: 'Tech', icon: <Activity size={14} /> },
  { id: 'vintage', label: 'Vintage', icon: <Flower2 size={14} /> },
  { id: 'luxury', label: 'Luxury', icon: <Maximize size={14} /> },
];

const FONTS = ['Outfit', 'Quicksand', 'Inter', 'Playfair Display', 'Space Mono'];

const ShortcutItem: React.FC<{ keys: string[], description: string }> = ({ keys, description }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-xs text-gray-400 font-medium">{description}</span>
    <div className="flex items-center space-x-1">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono font-bold text-gray-300 shadow-inner min-w-[24px] text-center">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-gray-600 text-[10px]">+</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const ContextMenuItem: React.FC<{
  icon: React.ReactNode,
  label: string,
  shortcut?: string,
  danger?: boolean,
  onClick: () => void
}> = ({ icon, label, shortcut, danger, onClick }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors font-bold uppercase tracking-widest ${
      danger 
        ? 'text-rose-400 hover:bg-rose-500/10' 
        : 'text-gray-300 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span>{label}</span>
    </div>
    {shortcut && (
      <kbd className="text-[9px] text-gray-600 font-mono tracking-normal">{shortcut}</kbd>
    )}
  </button>
);

const LogoEditor: React.FC<LogoEditorProps> = ({ logo, onClose, onSave }) => {
  const { showToast, ToastContainer } = useToast();
  const [brandName, setBrandName] = useState(logo.brandName);
  const [slogan, setSlogan] = useState(logo.slogan || '');
  const [layers, setLayers] = useState<LogoLayer[]>(logo.layers || []);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(layers[0]?.id || null);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>(layers[0] ? [layers[0].id] : []);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, layerId: string | null } | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryState[]>([{ layers: logo.layers || [], timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Editor Settings State
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    showGrid: false,
    gridSize: 16,
    snapToGrid: true,
    showSmartGuides: true,
    showGoldenRatio: false,
    showRulers: true,
    customGuides: []
  });

  // UI States
  const [smartGuides, setSmartGuides] = useState<{ x?: number, y?: number }[]>([]);
  
  // Animation State
  const [isAnimationMode, setIsAnimationMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animations, setAnimations] = useState<LayerAnimation[]>(logo.animations || []);
  const animationFrameRef = useRef<number | null>(null);

  // Assistant States
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);

  // Collaboration States
  const [collaborators, setCollaborators] = useState<Record<string, Collaborator>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [style, setStyle] = useState<BrandTheme>(logo.prompt.toLowerCase().includes('tech') ? 'tech' : 'modern' as BrandTheme);
  const [primaryColor, setPrimaryColor] = useState(logo.palette?.colors.find(c => c.type === 'primary')?.hex || '#8B5CF6');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [tempLogo, setTempLogo] = useState<GeneratedLogo>(logo);

  const canvasRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeLayer = useMemo(() => layers.find(l => l.id === activeLayerId), [layers, activeLayerId]);

  const updateLayer = useCallback((id: string, updates: Partial<LogoLayer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    collabService.broadcastLayerUpdate(id, updates);
  }, []);

  // History tracking with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const lastState = history[historyIndex];
      // Only add to history if layers actually changed and it's not the same as the current history index
      if (JSON.stringify(lastState?.layers) !== JSON.stringify(layers)) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ layers: [...layers], timestamp: Date.now() });
        
        // Limit history to last 50 states
        if (newHistory.length > 50) newHistory.shift();
        
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [layers]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLayers([...history[newIndex].layers]);
      showToast('Undo performed', 'info');
    }
  }, [historyIndex, history, showToast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLayers([...history[newIndex].layers]);
      showToast('Redo performed', 'info');
    }
  }, [historyIndex, history, showToast]);

  const handleContextMenu = (e: React.MouseEvent, layerId?: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, layerId: layerId || null });
    if (layerId) {
      setActiveLayerId(layerId);
      setSelectedLayerIds([layerId]);
    }
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
      
      // Undo/Redo Shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Show shortcuts modal
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      
      // Hide shortcuts modal
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
        } else if (contextMenu) {
          setContextMenu(null);
        } else {
          onClose();
        }
      }
      
      // Quick actions (only when not typing)
      if (!showShortcuts && !isInput) {
        // Delete layer
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (activeLayerId) {
            setLayers(prev => prev.filter(l => l.id !== activeLayerId));
            setActiveLayerId(null);
            setSelectedLayerIds([]);
            showToast('Layer deleted', 'info');
          }
        }
        
        // Duplicate layer
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault();
          if (activeLayer) {
            const duplicate = { ...activeLayer, id: crypto.randomUUID(), x: activeLayer.x + 5, y: activeLayer.y + 5 };
            setLayers(prev => [...prev, duplicate]);
            setActiveLayerId(duplicate.id);
            setSelectedLayerIds([duplicate.id]);
            showToast('Layer duplicated', 'success');
          }
        }
        
        // Toggle visibility
        if (e.key === 'h' && activeLayerId) {
          updateLayer(activeLayerId, { isVisible: !activeLayer?.isVisible });
        }
        
        // Lock/Unlock layer
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
          e.preventDefault();
          if (activeLayerId) {
            const newLocked = !activeLayer?.isLocked;
            updateLayer(activeLayerId, { isLocked: newLocked });
            showToast(newLocked ? 'Layer locked' : 'Layer unlocked', 'info');
          }
        }

        // Toggle Grid
        if (e.key === 'g') {
          setEditorSettings(prev => ({ ...prev, showGrid: !prev.showGrid }));
        }

        // Zoom controls
        if (e.key === '+') setPreviewZoom(prev => Math.min(prev + 10, 200));
        if (e.key === '-') setPreviewZoom(prev => Math.max(prev - 10, 25));
        if (e.key === '0') setPreviewZoom(100);
        
        // Nudge with arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && activeLayerId && !activeLayer?.isLocked) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const updates: Partial<LogoLayer> = {};
          
          if (e.key === 'ArrowUp') updates.y = (activeLayer?.y || 0) - step;
          if (e.key === 'ArrowDown') updates.y = (activeLayer?.y || 0) + step;
          if (e.key === 'ArrowLeft') updates.x = (activeLayer?.x || 0) - step;
          if (e.key === 'ArrowRight') updates.x = (activeLayer?.x || 0) + step;
          
          updateLayer(activeLayerId, updates);
        }
        
        // Rotate with bracket keys
        if (e.key === '[' && activeLayerId) {
          updateLayer(activeLayerId, { rotation: ((activeLayer?.rotation || 0) - 15 + 360) % 360 });
        }
        if (e.key === ']' && activeLayerId) {
          updateLayer(activeLayerId, { rotation: ((activeLayer?.rotation || 0) + 15) % 360 });
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showShortcuts, contextMenu, activeLayerId, activeLayer, updateLayer, onClose, handleUndo, handleRedo, showToast]);

  // Interpolation Logic for Preview
  const interpolate = (keyframes: AnimationKeyframe[], time: number): number => {
    if (keyframes.length === 0) return 0;
    if (keyframes.length === 1) return keyframes[0].value;
    
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    if (time <= sorted[0].time) return sorted[0].value;
    if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

    for (let i = 0; i < sorted.length - 1; i++) {
      const start = sorted[i];
      const end = sorted[i+1];
      if (time >= start.time && time <= end.time) {
        const t = (time - start.time) / (end.time - start.time);
        return start.value + (end.value - start.value) * t;
      }
    }
    return keyframes[0].value;
  };

  const getAnimatedLayerProps = useCallback((layer: LogoLayer, time: number) => {
    if (!isAnimationMode) return layer;
    const anim = animations.find(a => a.layerId === layer.id);
    if (!anim) return layer;

    const props: any = { ...layer };
    anim.tracks.forEach(track => {
      props[track.property] = interpolate(track.keyframes, time);
    });
    return props;
  }, [animations, isAnimationMode]);

  // Animation Playback Effect
  useEffect(() => {
    if (isPlaying) {
      const start = performance.now() - (currentTime * 1000);
      const step = (now: number) => {
        const t = (now - start) / 1000;
        if (t >= duration) {
          setCurrentTime(0);
          setIsPlaying(false);
          return;
        }
        setCurrentTime(t);
        animationFrameRef.current = requestAnimationFrame(step);
      };
      animationFrameRef.current = requestAnimationFrame(step);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [isPlaying, duration]);

  // AI Assistant Functions
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const results = await analyzeDesignAndSuggest(brandName, slogan, layers, logo.palette!, style);
      setSuggestions(results);
      showToast('Neural analysis complete', 'success');
    } catch (err) {
      console.error("Analysis error", err);
      showToast('Neural link failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = (suggestion: DesignSuggestion) => {
    setLayers(prev => prev.map(l => {
      if (suggestion.layerUpdates[l.id]) {
        return { ...l, ...suggestion.layerUpdates[l.id] };
      }
      return l;
    }));
    if (suggestion.globalUpdates) {
      if (suggestion.globalUpdates.primaryColor) setPrimaryColor(suggestion.globalUpdates.primaryColor);
      if (suggestion.globalUpdates.style) setStyle(suggestion.globalUpdates.style as BrandTheme);
    }
    collabService.sendChatMessage(`Applied AI suggestion: ${suggestion.title}`);
    showToast(`Applied: ${suggestion.title}`, 'success');
  };

  const handleCompetitorCompare = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const compBase64 = reader.result as string;
        const result = await differentiateFromCompetitor(tempLogo.url, compBase64);
        collabService.sendChatMessage(`Neural Competitive Analysis Result: ${result}`);
        showToast('Strategic differentiation calculated', 'success');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Comparison error", err);
      showToast('Competitive scan failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export cinematic video using Veo models
  const handleExportReveal = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }

    setIsProcessing(true);
    showToast('Initializing Veo motion synthesis...', 'info');
    try {
      const videoUrl = await generateBrandReveal(brandName, style, tempLogo.url);
      window.open(videoUrl, '_blank');
      showToast('Motion reveal complete', 'success');
    } catch (err: any) {
      console.error("Reveal export failed", err);
      if (err?.message?.includes("Requested entity was not found.")) {
        if (typeof window !== 'undefined' && (window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
        }
      }
      showToast('Motion synthesis disrupted', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Collaboration Effect
  useEffect(() => {
    collabService.join();
    const unsub = collabService.onEvent((event) => {
      switch (event.type) {
        case 'JOIN':
          setCollaborators(prev => ({ ...prev, [event.collaborator.id]: event.collaborator }));
          collabService.join();
          break;
        case 'CURSOR':
          setCollaborators(prev => ({
            ...prev,
            [event.id]: { ...(prev[event.id] || {}), id: event.id, x: event.x, y: event.y } as Collaborator
          }));
          break;
        case 'CHAT':
          setMessages(prev => [...prev, event.message]);
          break;
        case 'LAYER_UPDATE':
          setLayers(prev => prev.map(l => l.id === event.layerId ? { ...l, ...event.updates, lockedBy: event.userId } : l));
          setTimeout(() => {
            setLayers(prev => prev.map(l => (l.id === event.layerId && l.lockedBy === event.userId) ? { ...l, lockedBy: undefined } : l));
          }, 1500);
          break;
        case 'LEAVE':
          setCollaborators(prev => {
            const next = { ...prev };
            delete next[event.id];
            return next;
          });
          break;
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  const syncWorkspace = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const [lightUrl, darkUrl] = await Promise.all([
        recomposeLogo(logo.url, brandName, logo.layout, layers, style, primaryColor, false, { slogan: slogan }),
        recomposeLogo(logo.url, brandName, logo.layout, layers, style, primaryColor, true, { slogan: slogan })
      ]);
      setTempLogo(prev => ({ ...prev, url: lightUrl, darkUrl, brandName, layers, animations }));
    } catch (err) {
      console.error("Adaptive sync error", err);
      showToast('Workspace sync lag detected', 'info');
    } finally {
      setIsProcessing(false);
    }
  }, [brandName, slogan, layers, style, primaryColor, logo.layout, logo.url, animations, showToast]);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => syncWorkspace(), 3000);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [brandName, slogan, layers, style, primaryColor]);

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    collabService.updateCursor(x, y);
  };

  const handleCanvasDrag = (e: React.MouseEvent, id: string) => {
    if (!canvasRef.current || activeLayer?.isLocked || isAnimationMode) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      let x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      let y = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      const guides: { x?: number, y?: number }[] = [];

      if (editorSettings.snapToGrid) {
        const gridStep = 100 / editorSettings.gridSize;
        const snappedX = Math.round(x / gridStep) * gridStep;
        const snappedY = Math.round(y / gridStep) * gridStep;
        if (Math.abs(x - snappedX) < 2) x = snappedX;
        if (Math.abs(y - snappedY) < 2) y = snappedY;
      }

      if (editorSettings.showSmartGuides) {
        layers.forEach(l => {
          if (l.id === id) return;
          if (Math.abs(x - l.x) < 1.5) { x = l.x; guides.push({ x: l.x }); }
          if (Math.abs(y - l.y) < 1.5) { y = l.y; guides.push({ y: l.y }); }
          if (Math.abs(x - 50) < 1.5) { x = 50; guides.push({ x: 50 }); }
          if (Math.abs(y - 50) < 1.5) { y = 50; guides.push({ y: 50 }); }
        });
      }

      setSmartGuides(guides);
      updateLayer(id, { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setSmartGuides([]);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    if (!selectedLayerIds.includes(id)) {
      if (e.shiftKey) setSelectedLayerIds(prev => [...prev, id]);
      else setSelectedLayerIds([id]);
    }
    setActiveLayerId(id);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(layers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLayers(items);
    showToast('Layer hierarchy updated', 'info');
  };

  const alignSelected = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedLayerIds.length < 1) return;
    const selectedLayers = layers.filter(l => selectedLayerIds.includes(l.id));
    
    let targetValue: number;
    switch (type) {
      case 'left': targetValue = Math.min(...selectedLayers.map(l => l.x)); break;
      case 'center': targetValue = 50; break;
      case 'right': targetValue = Math.max(...selectedLayers.map(l => l.x)); break;
      case 'top': targetValue = Math.min(...selectedLayers.map(l => l.y)); break;
      case 'middle': targetValue = 50; break;
      case 'bottom': targetValue = Math.max(...selectedLayers.map(l => l.y)); break;
    }

    setLayers(prev => prev.map(l => {
      if (!selectedLayerIds.includes(l.id)) return l;
      if (['left', 'center', 'right'].includes(type)) return { ...l, x: targetValue };
      return { ...l, y: targetValue };
    }));
    showToast(`Aligned to ${type}`, 'info');
  };

  const handleAddKeyframe = (layerId: string, property: string, time: number, value: number) => {
    setAnimations(prev => {
      const existingAnim = prev.find(a => a.layerId === layerId);
      const newKeyframe: AnimationKeyframe = { id: crypto.randomUUID(), time, value, easing: 'ease-in-out' };
      
      if (existingAnim) {
        const existingTrack = existingAnim.tracks.find(t => t.property === property);
        if (existingTrack) {
          return prev.map(a => a.layerId === layerId ? {
            ...a,
            tracks: a.tracks.map(t => t.property === property ? {
              ...t,
              keyframes: [...t.keyframes.filter(k => Math.abs(k.time - time) > 0.01), newKeyframe]
            } : t)
          } : a);
        } else {
          return prev.map(a => a.layerId === layerId ? {
            ...a,
            tracks: [...a.tracks, { property: property as any, keyframes: [newKeyframe] }]
          } : a);
        }
      } else {
        return [...prev, {
          layerId,
          tracks: [{ property: property as any, keyframes: [newKeyframe] }]
        }];
      }
    });
    showToast('Keyframe added', 'success');
  };

  const handleRemoveKeyframe = (layerId: string, property: string, kfId: string) => {
    setAnimations(prev => prev.map(a => a.layerId === layerId ? {
      ...a,
      tracks: a.tracks.map(t => t.property === property ? {
        ...t,
        keyframes: t.keyframes.filter(k => k.id !== kfId)
      } : t)
    } : a));
    showToast('Keyframe removed', 'info');
  };

  const handleShare = () => {
    const url = window.location.href + '#collab-session=' + collabService.currentUser.id;
    navigator.clipboard.writeText(url);
    setShowShareModal(true);
    showToast('Collaboration link copied to clipboard', 'success');
    setTimeout(() => setShowShareModal(false), 3000);
  };

  const handleCommit = () => {
    onSave(tempLogo);
    showToast('Identity architecture committed', 'success');
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0C0C0E] flex flex-col text-[#E2E2E6] font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Workspace Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0C0C0E]/80 backdrop-blur-md z-[60] shrink-0">
        <div className="flex items-center space-x-6">
           <div className="flex bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setIsAnimationMode(false)}
                className={`px-4 py-1 text-xs font-bold rounded-lg transition-all ${!isAnimationMode ? 'text-blue-400 bg-white/10' : 'text-gray-500 hover:text-white'}`}
              >
                Design
              </button>
              <button 
                onClick={() => setIsAnimationMode(true)}
                className={`px-4 py-1 text-xs font-bold rounded-lg transition-all ${isAnimationMode ? 'text-purple-400 bg-white/10' : 'text-gray-500 hover:text-white'}`}
              >
                Animate
              </button>
           </div>
           <div className="h-5 w-px bg-white/10" />
           <div className="flex items-center space-x-1">
             <button className="p-2 text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-lg" onClick={() => setEditorSettings(s => ({ ...s, showGrid: !s.showGrid }))}><GridIcon size={16} className={editorSettings.showGrid ? 'text-blue-400' : ''}/></button>
             <button className="p-2 text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-lg" onClick={() => setEditorSettings(s => ({ ...s, showRulers: !s.showRulers }))}><Ruler size={16} className={editorSettings.showRulers ? 'text-blue-400' : ''}/></button>
             <button className="p-2 text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-lg" onClick={() => setEditorSettings(s => ({ ...s, showGoldenRatio: !s.showGoldenRatio }))}><Hash size={16} className={editorSettings.showGoldenRatio ? 'text-blue-400' : ''}/></button>
           </div>

           <div className="h-5 w-px bg-white/10" />
           
           <div className="flex items-center space-x-1 bg-white/5 rounded-xl p-1 border border-white/5">
             <button 
               onClick={handleUndo}
               disabled={historyIndex <= 0}
               className="p-2 rounded-lg hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
               title="Undo (Ctrl+Z)"
             >
               <Undo size={16} className={historyIndex <= 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white'} />
             </button>
             <button 
               onClick={handleRedo}
               disabled={historyIndex >= history.length - 1}
               className="p-2 rounded-lg hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
               title="Redo (Ctrl+Shift+Z)"
             >
               <Redo size={16} className={historyIndex >= history.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white'} />
             </button>
             <div className="px-3 py-1 text-[10px] font-mono text-gray-500">
               {historyIndex + 1}/{history.length}
             </div>
           </div>
           
           {!isAnimationMode && selectedLayerIds.length > 0 && (
              <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => alignSelected('left')} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" title="Align Left"><AlignLeft size={14}/></button>
                <button onClick={() => alignSelected('center')} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" title="Align Center"><AlignHorizontalJustifyCenter size={14}/></button>
                <button onClick={() => alignSelected('right')} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" title="Align Right"><AlignRight size={14}/></button>
                <div className="w-px h-3 bg-white/10 mx-1" />
                <button onClick={() => alignSelected('top')} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" title="Align Top"><AlignVerticalJustifyStart size={14}/></button>
                <button onClick={() => alignSelected('middle')} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" title="Align Middle"><AlignVerticalJustifyCenter size={14}/></button>
                <button onClick={() => alignSelected('bottom')} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" title="Align Bottom"><AlignVerticalJustifyEnd size={14}/></button>
              </div>
           )}
        </div>

        <div className="flex items-center space-x-6">
           <div className="flex -space-x-2 mr-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#0C0C0E] bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white relative group cursor-default" style={{ backgroundColor: collabService.currentUser.color }}>
                {collabService.currentUser.name[0]}
              </div>
              {(Object.values(collaborators) as Collaborator[]).map(c => (
                <div key={c.id} className="w-8 h-8 rounded-full border-2 border-[#0C0C0E] flex items-center justify-center text-[10px] font-bold text-white relative group cursor-default" style={{ backgroundColor: c.color }}>
                  {c.name[0]}
                </div>
              ))}
           </div>

           <button onClick={handleShare} className="flex items-center space-x-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-xl text-xs font-bold border border-blue-500/20 transition-all">
              <Users size={14}/>
              <span>{showShareModal ? 'Link Copied!' : 'Collaborate'}</span>
           </button>

           <div className="h-5 w-px bg-white/10" />
           <button onClick={handleCommit} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95">Publish Kit</button>
           <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Left: Brand Presets & Template Search */}
        <aside className="w-64 border-r border-white/5 bg-[#0C0C0E] flex flex-col shrink-0 z-50">
          <div className="p-4 space-y-8 mt-4">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Style Categories</label>
              <div className="space-y-1">
                {PRESET_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setStyle(cat.id)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all ${style === cat.id ? 'bg-blue-500/10 text-blue-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Central Workspace Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0C0C0E] relative overflow-hidden" onMouseMove={handleCanvasMouseMove}>
          <div className="flex-1 overflow-auto flex items-center justify-center p-20 gap-16 relative">
            {editorSettings.showGrid && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                <div className="w-full h-full opacity-10" style={{
                  backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                  backgroundSize: `${100 / editorSettings.gridSize}% ${100 / editorSettings.gridSize}%`
                }} />
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
              {smartGuides.map((g, i) => (
                <div key={i} className={`absolute border-dashed border-pink-500 ${g.x !== undefined ? 'h-full border-l' : 'w-full border-t'}`} style={{
                  left: g.x !== undefined ? `${g.x}%` : 0,
                  top: g.y !== undefined ? `${g.y}%` : 0
                }} />
              ))}
            </div>

            <div className="flex flex-col items-center space-y-6 z-20">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">UI Light Target</span>
              <div 
                ref={canvasRef}
                onContextMenu={(e) => handleContextMenu(e, activeLayerId || undefined)}
                className="w-[450px] h-[450px] bg-white rounded-[2.5rem] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.3)] border border-gray-200 relative overflow-hidden flex items-center justify-center group"
                style={{ transform: `scale(${previewZoom/100})` }}
              >
                {editorSettings.showGoldenRatio && (
                   <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full stroke-blue-600 fill-none stroke-[0.5]">
                        <path d="M 0,0 L 61.8,0 L 61.8,100 M 61.8,38.2 L 100,38.2 M 85.4,38.2 L 85.4,100" />
                        <rect x="0" y="0" width="61.8" height="100" />
                        <rect x="61.8" y="0" width="38.2" height="38.2" />
                      </svg>
                   </div>
                )}

                {!isAnimationMode ? (
                  <img src={tempLogo.url} className={`max-w-[85%] max-h-[85%] object-contain transition-all duration-1000 ${isProcessing ? 'opacity-30 blur-2xl scale-90' : 'opacity-100 scale-100'}`} />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {layers.map(layer => {
                      const animProps = getAnimatedLayerProps(layer, currentTime);
                      if (!layer.isVisible) return null;
                      return (
                        <div key={layer.id} className="absolute pointer-events-none" style={{ left: `${animProps.x}%`, top: `${animProps.y}%`, transform: `translate(-50%, -50%) scale(${animProps.scale}) rotate(${animProps.rotation}deg)`, opacity: animProps.opacity / 100, transition: isPlaying ? 'none' : 'all 0.1s linear' }}>
                           {layer.type === 'icon' ? <div className="w-16 h-16 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 border border-blue-600/20"><Sparkles size={32}/></div> : <span style={{ fontFamily: layer.fontFamily, fontSize: layer.fontSize, color: '#1D2B3A', fontWeight: 'bold' }}>{layer.type === 'text' ? brandName : slogan}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isAnimationMode && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {layers.map(l => l.isVisible && (
                      <div 
                        key={l.id} 
                        onMouseDown={(e) => handleCanvasDrag(e, l.id)}
                        onContextMenu={(e) => handleContextMenu(e, l.id)}
                        className={`absolute pointer-events-auto transition-all duration-300 ${activeLayerId === l.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                        style={{ left: `${l.x}%`, top: `${l.y}%`, transform: `translate(-50%, -50%) rotate(${l.rotation}deg) scale(${l.scale})`, opacity: l.opacity / 100 }}
                      >
                        {activeLayerId === l.id && (
                          <>
                            {/* Pulsing outer ring */}
                            <div className="absolute inset-0 -m-8 border-2 border-blue-500/30 rounded-2xl animate-ping pointer-events-none" />
                            
                            {/* Solid selection border */}
                            <div className="absolute inset-0 -m-6 border-2 border-blue-500 rounded-2xl pointer-events-none shadow-lg shadow-blue-500/50">
                              {/* Corner handles */}
                              <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-xl" />
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-xl" />
                              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-xl" />
                              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-xl" />
                              
                              {/* Rotation handle */}
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-6 h-6 bg-purple-500 border-2 border-white rounded-full shadow-xl cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-auto">
                                <RotateCw size={12} className="text-white" />
                              </div>
                            </div>
                            
                            {/* Layer label */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xl whitespace-nowrap">
                              {l.type} • {Math.round(l.x)}, {Math.round(l.y)}
                            </div>
                          </>
                        )}
                        
                        <div className={`p-2 transition-all`}>
                          <div className={`px-4 py-1.5 border border-blue-500/40 rounded-lg bg-blue-500/10 backdrop-blur-md flex items-center space-x-2`}>
                              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{l.type}</span>
                          </div>
                        </div>

                        {activeLayerId !== l.id && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 px-2 py-1 bg-gray-800/90 text-gray-300 text-[9px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {l.type}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {!isAnimationMode && (
              <div className="flex flex-col items-center space-y-6 z-20">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">UI Dark Target</span>
                <div 
                  className="w-[450px] h-[450px] bg-[#0F172A] rounded-[2.5rem] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.6)] border border-white/5 relative overflow-hidden flex items-center justify-center" 
                  style={{ transform: `scale(${previewZoom/100})` }}
                  onContextMenu={(e) => handleContextMenu(e, activeLayerId || undefined)}
                >
                  <img src={tempLogo.darkUrl} className={`max-w-[85%] max-h-[85%] object-contain transition-all duration-1000 ${isProcessing ? 'opacity-30 blur-2xl scale-90' : 'opacity-100 scale-100'}`} />
                </div>
              </div>
            )}
          </div>

          <AIAssistantPanel suggestions={suggestions} isAnalyzing={isAnalyzing} onAnalyze={handleAnalyze} onApplySuggestion={handleApplySuggestion} onCompetitorCompare={handleCompetitorCompare} isOpen={isAssistantOpen} onToggle={() => setIsAssistantOpen(!isAssistantOpen)} />
          
          <button onClick={() => setIsChatOpen(!isChatOpen)} className={`absolute bottom-8 left-8 p-4 rounded-2xl shadow-2xl transition-all z-[60] ${isChatOpen ? 'bg-blue-600 text-white' : 'bg-[#1A1A1E] text-gray-400 hover:text-white border border-white/10'}`}>
            <MessageSquare size={24}/>
            {messages.length > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0C0C0E] text-[8px] flex items-center justify-center text-white font-black">{messages.length}</div>}
          </button>
        </main>

        {/* Sidebar Right: Professional Properties & Color Wheel */}
        <aside className="w-[380px] border-l border-white/5 bg-[#0C0C0E] flex flex-col shrink-0 z-50">
          <div className="h-14 border-b border-white/5 flex items-center px-8 shrink-0">
            <div className="flex items-center space-x-3 text-gray-400">
               <Layers size={16} />
               <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Composition Layers</span>
            </div>
          </div>
          
          {/* Draggable Layers Panel */}
          <div className="border-b border-white/5 bg-black/20">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="layers">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="p-3 max-h-64 overflow-y-auto space-y-1.5 scrollbar-hide">
                    {layers.map((layer, index) => (
                      <Draggable key={layer.id} draggableId={layer.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-grab active:cursor-grabbing transition-all border ${
                              snapshot.isDragging ? 'shadow-2xl scale-105 rotate-2 bg-blue-600/20 border-blue-500 z-[100]' : 
                              activeLayerId === layer.id ? 'bg-blue-600/10 border-blue-600/20 text-blue-400' : 
                              'bg-transparent border-transparent text-gray-400 hover:bg-white/5'
                            }`}
                            onClick={() => { setActiveLayerId(layer.id); setSelectedLayerIds([layer.id]); }}
                            onContextMenu={(e) => handleContextMenu(e, layer.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                {layer.type === 'icon' ? <Box size={14}/> : <Type size={14}/>}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-black uppercase tracking-widest">{layer.type}</span>
                                 <span className="text-[8px] font-bold text-gray-500">Z-Index: {layers.length - index}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { isVisible: !layer.isVisible }); }} className="p-1.5 hover:text-white transition-colors">
                                 {layer.isVisible ? <Eye size={12}/> : <EyeOff size={12}/>}
                              </button>
                              <GripVertical size={12} className="text-gray-600"/>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-hide">
            {activeLayer ? (
              <div className="space-y-10">
                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] block">Spatial Alignment</label>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                     <div className="space-y-2">
                       <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Offset X</span>
                       <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-4 py-2 focus-within:border-blue-500/50 transition-colors">
                          <span className="text-[10px] text-gray-600 mr-3 font-mono">P_X</span>
                          <input type="number" value={Math.round(activeLayer.x)} onChange={(e) => updateLayer(activeLayer.id, { x: parseInt(e.target.value) })} className="bg-transparent text-xs w-full outline-none font-mono font-bold" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Offset Y</span>
                       <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-4 py-2 focus-within:border-blue-500/50 transition-colors">
                          <span className="text-[10px] text-gray-600 mr-3 font-mono">P_Y</span>
                          <input type="number" value={Math.round(activeLayer.y)} onChange={(e) => updateLayer(activeLayer.id, { y: parseInt(e.target.value) })} className="bg-transparent text-xs w-full outline-none font-mono font-bold" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Scale</span>
                       <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-4 py-2 focus-within:border-blue-500/50 transition-colors">
                          <span className="text-[10px] text-gray-600 mr-3 font-mono">S_C</span>
                          <input type="number" step="0.1" value={activeLayer.scale} onChange={(e) => updateLayer(activeLayer.id, { scale: parseFloat(e.target.value) })} className="bg-transparent text-xs w-full outline-none font-mono font-bold" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Rotation</span>
                       <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-4 py-2 focus-within:border-blue-500/50 transition-colors">
                          <span className="text-[10px] text-gray-600 mr-3 font-mono">R_O</span>
                          <input type="number" value={activeLayer.rotation} onChange={(e) => updateLayer(activeLayer.id, { rotation: parseInt(e.target.value) })} className="bg-transparent text-xs w-full outline-none font-mono font-bold" />
                       </div>
                     </div>
                  </div>
                </div>

                {activeLayer.type !== 'icon' && (
                  <div className="space-y-6">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] block">Typography</label>
                    <div className="space-y-4">
                      <select 
                        value={activeLayer.fontFamily} 
                        onChange={(e) => updateLayer(activeLayer.id, { fontFamily: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500/50"
                      >
                        {FONTS.map(f => <option key={f} value={f} className="bg-[#161618]">{f}</option>)}
                      </select>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Size</span>
                          <input type="number" value={activeLayer.fontSize} onChange={(e) => updateLayer(activeLayer.id, { fontSize: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono" />
                        </div>
                        <div className="space-y-2">
                           <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Weight</span>
                           <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs">
                             <option className="bg-[#161618]">Bold</option>
                             <option className="bg-[#161618]">Medium</option>
                             <option className="bg-[#161618]">Regular</option>
                           </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-30">
                 <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center"><MousePointer2 size={32}/></div>
                 <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Select a layer to adjust<br/>Identity Properties</p>
              </div>
            )}
          </div>
          <div className="h-20 border-t border-white/5 px-8 flex items-center space-x-4 bg-[#0C0C0E] shrink-0">
             <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white border border-white/5 transition-all">Discard Changes</button>
             <button onClick={handleCommit} className="flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-white text-black hover:bg-gray-200 transition-all shadow-2xl active:scale-95">Commit Identity</button>
          </div>
        </aside>
      </div>

      {isAnimationMode && (
        <AnimationTimeline 
          layers={layers}
          animations={animations}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onTimeChange={setCurrentTime}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onDurationChange={setDuration}
          onAddKeyframe={handleAddKeyframe}
          onRemoveKeyframe={handleRemoveKeyframe}
          onExportVideo={handleExportReveal}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8" onClick={() => setShowShortcuts(false)}>
          <div className="bg-[#1A1A1E] rounded-[3rem] border border-white/10 max-w-2xl w-full p-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/10 rounded-xl text-purple-400"><Command size={20}/></div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Keyboard Workspace</h2>
              </div>
              <button onClick={() => setShowShortcuts(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 border-b border-purple-500/20 pb-2">General</h3>
                  <ShortcutItem keys={['?']} description="Toggle Shortcuts" />
                  <ShortcutItem keys={['Esc']} description="Close / Discard" />
                  <ShortcutItem keys={['Ctrl', 'S']} description="Commit Changes" />
                  <ShortcutItem keys={['Ctrl', 'Z']} description="Undo" />
                  <ShortcutItem keys={['Ctrl', 'Shift', 'Z']} description="Redo" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 border-b border-blue-500/20 pb-2">View Controls</h3>
                  <ShortcutItem keys={['G']} description="Toggle Grid" />
                  <ShortcutItem keys={['+']} description="Zoom In" />
                  <ShortcutItem keys={['-']} description="Zoom Out" />
                  <ShortcutItem keys={['0']} description="Reset View" />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 border-b border-emerald-500/20 pb-2">Layer Ops</h3>
                  <ShortcutItem keys={['Ctrl', 'D']} description="Duplicate" />
                  <ShortcutItem keys={['Del']} description="Delete Selected" />
                  <ShortcutItem keys={['H']} description="Toggle Hidden" />
                  <ShortcutItem keys={['Ctrl', 'L']} description="Lock/Unlock" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 border-b border-amber-500/20 pb-2">Transform</h3>
                  <ShortcutItem keys={['↑', '↓', '←', '→']} description="Nudge 1px" />
                  <ShortcutItem keys={['Shift', 'Arw']} description="Nudge 10px" />
                  <ShortcutItem keys={['[']} description="Rotate -15°" />
                  <ShortcutItem keys={[']']} description="Rotate +15°" />
                </div>
              </div>
            </div>
            
            <p className="text-center text-[10px] text-gray-500 mt-10 font-bold uppercase tracking-widest">
              Neural Studio v12.0 • Identity Reconfiguration Active
            </p>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[600] bg-[#1A1A1E]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] py-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-200"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuItem 
            icon={<Copy size={14} />} 
            label="Duplicate" 
            shortcut="Ctrl+D"
            onClick={() => {
              if (activeLayer) {
                const dup = { ...activeLayer, id: crypto.randomUUID(), x: activeLayer.x + 5, y: activeLayer.y + 5 };
                setLayers(prev => [...prev, dup]);
                setActiveLayerId(dup.id);
                setSelectedLayerIds([dup.id]);
                showToast('Layer duplicated', 'success');
              }
              setContextMenu(null);
            }}
          />
          <ContextMenuItem 
            icon={activeLayer?.isVisible ? <EyeOff size={14} /> : <Eye size={14} />} 
            label={activeLayer?.isVisible ? "Hide Layer" : "Show Layer"} 
            shortcut="H"
            onClick={() => {
              if (activeLayerId) {
                updateLayer(activeLayerId, { isVisible: !activeLayer?.isVisible });
              }
              setContextMenu(null);
            }}
          />
          <ContextMenuItem 
            icon={activeLayer?.isLocked ? <Unlock size={14} /> : <Lock size={14} />} 
            label={activeLayer?.isLocked ? "Unlock Layer" : "Lock Layer"} 
            shortcut="Ctrl+L"
            onClick={() => {
              if (activeLayerId) {
                const newLocked = !activeLayer?.isLocked;
                updateLayer(activeLayerId, { isLocked: newLocked });
                showToast(newLocked ? 'Layer locked' : 'Layer unlocked', 'info');
              }
              setContextMenu(null);
            }}
          />
          <div className="h-px bg-white/5 my-2 mx-4" />
          <ContextMenuItem 
            icon={<Trash2 size={14} />} 
            label="Delete" 
            shortcut="Del"
            danger
            onClick={() => {
              if (activeLayerId) {
                setLayers(prev => prev.filter(l => l.id !== activeLayerId));
                setActiveLayerId(null);
                setSelectedLayerIds([]);
                showToast('Layer deleted', 'info');
              }
              setContextMenu(null);
            }}
          />
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

const Command: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
  </svg>
);

export default LogoEditor;