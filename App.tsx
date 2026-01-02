import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, History, ArrowRight, Sparkles, Moon, Sun, Loader2, Box, Zap, Download, Maximize2, Terminal, Edit3, Grid3X3, CheckCircle2, Edit, ShieldCheck, BarChart3, Brush, Smartphone, Package, LayoutGrid, Globe, CloudUpload, Palette, X, Upload, Sliders, Search, Type, Activity, Video } from 'lucide-react';
import { generateKitchaLogo, analyzeLogoPalette, generateBrandStrategy, recomposeLogo, extractBrandInfoFromImage, generateBrandKitAsset, generateLogoVariant, analyzeLogoEffectiveness, applyArtisticStyle } from './services/gemini';
import { GeneratedLogo, ColorPalette, BrandTheme, BrandTone, TargetAudience, LogoLayer, BrandKit, BrandKitAsset, LogoVariant, LogoStyle } from './types';
import LogoCard from './components/LogoCard';
import BrandPreview from './components/BrandPreview';
import ColorPaletteDisplay from './components/ColorPaletteDisplay';
import LogoEditor from './components/LogoEditor';
import BrandKitGallery from './components/BrandKitGallery';
import LogoVariantsGrid from './components/LogoVariantsGrid';
import AccessibilityAuditModal from './components/AccessibilityAuditModal';
import EffectivenessReportModal from './components/EffectivenessReportModal';
import StyleTransferPanel from './components/StyleTransferPanel';
import ThreeViewer from './components/ThreeViewer';
import VeoMotionModal from './components/VeoMotionModal';

const STYLE_PRESETS: { id: BrandTheme, label: string, icon: React.ReactNode }[] = [
  { id: 'modern', label: 'Geometric', icon: <Box size={14} /> },
  { id: 'minimalist', label: 'Pure', icon: <Zap size={14} /> },
  { id: 'tech', label: 'Advanced', icon: <Terminal size={14} /> },
  { id: 'luxury', label: 'Premium', icon: <Maximize2 size={14} /> },
];

const INITIAL_LAYERS: LogoLayer[] = [
  { id: 'l1', type: 'icon', x: 50, y: 40, scale: 1.0, rotation: 0, flipX: false, flipY: false, opacity: 100, isVisible: true, isLocked: false },
  { id: 'l2', type: 'text', x: 50, y: 65, scale: 1.0, rotation: 0, flipX: false, flipY: false, opacity: 100, isVisible: true, isLocked: false, fontFamily: 'Outfit', fontSize: 48 },
  { id: 'l3', type: 'slogan', x: 50, y: 75, scale: 0.8, rotation: 0, flipX: false, flipY: false, opacity: 80, isVisible: true, isLocked: false, fontFamily: 'Outfit', fontSize: 24 },
];

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

const FabAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: string;
  delay: string;
  onClick: () => void;
  isDarkMode: boolean;
}> = ({ icon, label, color, delay, onClick, isDarkMode }) => (
  <div className={`flex items-center space-x-3 animate-in slide-in-from-right-8 fade-in ${delay}`}>
    <div className={`px-4 py-2 backdrop-blur-xl border rounded-xl shadow-xl ${
      isDarkMode 
        ? 'bg-black/90 border-white/10' 
        : 'bg-white/95 border-gray-200 shadow-lg'
    }`}>
      <span className={`text-xs font-bold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</span>
    </div>
    <button
      onClick={onClick}
      className="relative group/action"
    >
      <div className={`absolute inset-0 bg-gradient-to-tr ${color} rounded-full blur-xl opacity-60 group-hover/action:opacity-100 transition-opacity`} />
      <div className={`relative w-14 h-14 bg-gradient-to-tr ${color} rounded-full shadow-xl flex items-center justify-center group-hover/action:scale-110 transition-all duration-300 text-white`}>
        {icon}
      </div>
    </button>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preview' | 'variants' | 'styles' | '3d'>('preview');
  const [brandName, setBrandName] = useState('Kynora');
  const [layout, setLayout] = useState<'horizontal' | 'vertical' | 'avatar' | 'header'>('vertical');
  const [prompt, setPrompt] = useState('A minimalist professional icon of a terracotta orange cooking pot.');
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6'); 
  const [style, setStyle] = useState<BrandTheme>('modern');
  const [logos, setLogos] = useState<GeneratedLogo[]>([]);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Synthesizing identity...');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');

  const [isGeneratingKit, setIsGeneratingKit] = useState(false);
  const [isKitOpen, setIsKitOpen] = useState(false);
  const [kitProgress, setKitProgress] = useState(0);

  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [isProcessingStyle, setIsProcessingStyle] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isVeoModalOpen, setIsVeoModalOpen] = useState(false);

  // Problem 8: Fixed Notifications state management
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }>>([]);

  const [showNotifications, setShowNotifications] = useState(false);
  
  const addNotification = useCallback((title: string, message: string) => {
    const newNotif = {
      id: crypto.randomUUID(),
      title,
      message,
      time: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Keep max 10
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const selectedLogo = logos.find(l => l.id === selectedLogoId) || logos[0];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
        setCommandSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleApplyArtisticStyle = async (styleId: string, intensity: number) => {
    if (!selectedLogo || isProcessingStyle) return;
    setIsProcessingStyle(true);
    setProcessingMessage(`Applying Neural ${styleId.toUpperCase()}...`);
    try {
      const styledUrl = await applyArtisticStyle(selectedLogo.url, styleId, intensity, brandName);
      const newStyle: LogoStyle = {
        id: crypto.randomUUID(),
        styleId,
        label: styleId.charAt(0).toUpperCase() + styleId.slice(1),
        imageUrl: styledUrl,
        intensity
      };
      setLogos(prev => prev.map(l => l.id === selectedLogo.id ? { 
        ...l, 
        styledVersions: [newStyle, ...(l.styledVersions || [])] 
      } : l));
      addNotification('Style Applied', `${styleId.charAt(0).toUpperCase() + styleId.slice(1)} look integrated.`);
    } catch (err) {
      console.error("Style application failed", err);
    } finally {
      setIsProcessingStyle(false);
    }
  };

  const handleNeuralAudit = async () => {
    if (!selectedLogo || isAuditing) return;
    setIsAuditing(true);
    setProcessingMessage('Neural Brand Audit in progress...');
    try {
      const report = await analyzeLogoEffectiveness(selectedLogo.url, brandName);
      setLogos(prev => prev.map(l => l.id === selectedLogo.id ? { ...l, effectivenessReport: report } : l));
      setIsReportOpen(true);
      addNotification('Neural Audit Complete', `Design score: ${report.overall_score}/100.`);
    } catch (err) {
      console.error("Audit failed", err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyFixedPalette = async (newPalette: ColorPalette) => {
    if (!selectedLogo) return;
    setProcessingMessage('Synchronizing accessible color spaces...');
    setIsGenerating(true);
    try {
      const pColor = newPalette.colors.find(c => c.type === 'primary')?.hex || primaryColor;
      setPrimaryColor(pColor);
      const [newLightUrl, newDarkUrl] = await Promise.all([
        recomposeLogo(selectedLogo.url, brandName, selectedLogo.layout, selectedLogo.layers, style, pColor, false, { slogan: selectedLogo.slogan }),
        recomposeLogo(selectedLogo.url, brandName, selectedLogo.layout, selectedLogo.layers, style, pColor, true, { slogan: selectedLogo.slogan })
      ]);
      setLogos(prev => prev.map(l => l.id === selectedLogo.id ? { 
        ...l, 
        url: newLightUrl, 
        darkUrl: newDarkUrl, 
        palette: newPalette 
      } : l));
      addNotification('Colors Remediated', 'Palette updated for WCAG compliance.');
    } catch (err) {
      console.error("Failed to sync accessible palette", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVariants = async () => {
    if (!selectedLogo || isGeneratingVariants) return;
    setIsGeneratingVariants(true);
    setKitProgress(0);
    setProcessingMessage('Generating Master Variations...');
    const variantTypes: { type: LogoVariant['type'], label: string, hint: string }[] = [
      { type: 'icon', label: 'Icon Only', hint: 'Best for app icons and social avatars.' },
      { type: 'text', label: 'Wordmark Only', hint: 'Optimized for high-end stationery.' },
      { type: 'monochrome', label: 'Monochrome', hint: 'Required for single-color printing.' },
      { type: 'inverted', label: 'High Contrast', hint: 'Ideal for dark photography overlays.' },
      { type: 'stacked', label: 'Vertical Stack', hint: 'Best for narrow packaging.' },
      { type: 'horizontal', label: 'Wide Landscape', hint: 'The standard choice for headers.' },
      { type: 'compact', label: 'Favicon Compact', hint: 'Ultra-simplified for browser tabs.' },
      { type: 'watermark', label: 'Translucent Ghost', hint: 'Used for intellectual property.' },
    ];
    const variants: LogoVariant[] = [];
    try {
      for (let i = 0; i < variantTypes.length; i++) {
        const v = variantTypes[i];
        setProcessingMessage(`Synthesizing: ${v.label}...`);
        setKitProgress((i / variantTypes.length) * 100);
        const [lightUrl, darkUrl] = await Promise.all([
          generateLogoVariant(selectedLogo.url, v.type, brandName, style, primaryColor, false),
          generateLogoVariant(selectedLogo.url, v.type, brandName, style, primaryColor, true)
        ]);
        variants.push({
          id: crypto.randomUUID(),
          type: v.type,
          label: v.label,
          usageHint: v.hint,
          lightUrl,
          darkUrl
        });
      }
      setLogos(prev => prev.map(l => l.id === selectedLogo.id ? { ...l, variants } : l));
      setActiveTab('variants');
      addNotification('Variants Ready', `Synthesized ${variants.length} master variations.`);
    } catch (err) {
      console.error("Variants synthesis failed", err);
    } finally {
      setIsGeneratingVariants(false);
      setKitProgress(100);
    }
  };

  const handleGenerateBrandKit = async () => {
    if (!selectedLogo || isGeneratingKit) return;
    setIsGeneratingKit(true);
    setKitProgress(0);
    const assets: BrandKitAsset[] = [];
    const tasks: { type: BrandKitAsset['type'], label: string }[] = [
      { type: 'business-card', label: 'Executive Business Card' },
      { type: 'stationery', label: 'Premium Letterhead' },
      { type: 'social', label: 'Instagram Profile Kit' },
      { type: 'product', label: 'Matte Ceramic Mug' },
      { type: 'print', label: 'Marketing Flyer' },
      { type: 'presentation', label: 'Pitch Deck Template' },
      { type: 'guidelines', label: 'Core Brand Manual' }
    ];
    try {
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        setProcessingMessage(`Synthesizing: ${task.label}...`);
        setKitProgress((i / tasks.length) * 100);
        const imageUrl = await generateBrandKitAsset(selectedLogo.url, brandName, task.type, task.label, primaryColor);
        assets.push({
          id: crypto.randomUUID(),
          type: task.type,
          label: task.label,
          imageUrl,
          description: `High-fidelity professional ${task.label} mockup.`
        });
      }
      const brandKit: BrandKit = { logoId: selectedLogo.id, assets };
      setLogos(prev => prev.map(l => l.id === selectedLogo.id ? { ...l, brandKit } : l));
      setIsKitOpen(true);
      addNotification('Brand Kit Generated', 'All physical artifacts synthesized.');
    } catch (err) {
      console.error("Brand Kit synthesis failed", err);
    } finally {
      setIsGeneratingKit(false);
      setKitProgress(100);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingMessage('Analyzing your logo with AI...');
    setIsGenerating(true);
    try {
      const base64 = await fileToBase64(file);
      const analysis = await extractBrandInfoFromImage(base64);
      const { name, style: detectedStyle, slogan, layers: detectedLayersData } = analysis;
      setBrandName(name);
      setStyle(detectedStyle as BrandTheme);
      const detectedLayers: LogoLayer[] = detectedLayersData.map((l, idx) => ({
        id: `detected-${idx}-${Date.now()}`,
        type: l.type,
        x: l.x,
        y: l.y,
        scale: l.scale,
        rotation: 0,
        flipX: false,
        flipY: false,
        opacity: 100,
        isVisible: true,
        isLocked: false,
        fontFamily: l.type === 'text' || l.type === 'slogan' ? 'Outfit' : undefined,
        fontSize: l.type === 'text' ? 48 : l.type === 'slogan' ? 24 : undefined,
      }));
      const palette = await analyzeLogoPalette(base64);
      const newLogo: GeneratedLogo = {
        id: crypto.randomUUID(),
        url: base64,
        darkUrl: base64,
        prompt: `Imported logo: ${name}`,
        brandName: name,
        slogan,
        layout: 'vertical',
        layers: detectedLayers,
        timestamp: Date.now(),
        palette,
      };
      const darkUrl = await recomposeLogo(base64, name, 'vertical', detectedLayers, detectedStyle, palette.colors[0]?.hex || '#8B5CF6', true, { slogan });
      newLogo.darkUrl = darkUrl;
      setLogos(prev => [newLogo, ...prev]);
      setSelectedLogoId(newLogo.id);
      addNotification('Logo Imported', `Successfully analyzed ${name}'s DNA.`);
    } catch (error) {
      console.error('❌ Logo upload failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !brandName.trim() || isGenerating) return;
    setIsGenerating(true);
    setProcessingMessage('Forging new brand assets...');
    try {
      const lightUrl = await generateKitchaLogo(prompt, brandName, true, layout, primaryColor, style);
      const darkUrl = await generateKitchaLogo(prompt, brandName, true, layout, primaryColor, style, 'sophisticated', 'luxury', true, lightUrl);
      const strategy = await generateBrandStrategy(brandName, prompt, style);
      const palette = await analyzeLogoPalette(lightUrl);
      const newLogo: GeneratedLogo = {
        id: crypto.randomUUID(), 
        url: lightUrl, 
        darkUrl, 
        prompt, 
        brandName, 
        layout, 
        timestamp: Date.now(), 
        palette, 
        guidelines: strategy.guidelines, 
        mission: strategy.mission,
        layers: INITIAL_LAYERS
      };
      setLogos(prev => [newLogo, ...prev]);
      setSelectedLogoId(newLogo.id);
      addNotification('Identity Forged', `Symbolic vision for ${brandName} synthesized.`);
    } catch (err: any) { 
      console.error(err);
    } finally { 
      setIsGenerating(false); 
    }
  };

  const commands = [
    { icon: <Sparkles size={16} />, label: 'Generate New Logo', shortcut: 'G', action: () => handleGenerate(), category: 'Actions' },
    { icon: <Upload size={16} />, label: 'Upload Logo', shortcut: 'U', action: () => document.getElementById('logo-upload')?.click(), category: 'Actions' },
    { icon: <Download size={16} />, label: 'Download Current Logo', shortcut: 'D', action: () => {
      if (selectedLogo) {
        const link = document.createElement('a');
        link.href = selectedLogo.url;
        link.download = `kynora-${selectedLogo.id.slice(0,5)}.png`;
        link.click();
      }
    }, category: 'Actions' },
    { icon: <Edit size={16} />, label: 'Open Editor', shortcut: 'E', action: () => setIsEditorOpen(true), category: 'Actions' },
    { icon: <Video size={16} />, label: 'Veo Motion Studio', shortcut: 'V', action: () => setIsVeoModalOpen(true), category: 'Actions' },
    { icon: <Palette size={16} />, label: 'Change Style', shortcut: 'C', action: () => {
      const themes: BrandTheme[] = ['modern', 'minimalist', 'luxury', 'tech'];
      const next = themes[(themes.indexOf(style) + 1) % themes.length];
      setStyle(next);
    }, category: 'Customize' },
    { icon: <Type size={16} />, label: 'Edit Brand Name', shortcut: 'N', action: () => document.querySelector('input')?.focus(), category: 'Customize' },
    { icon: <Sun size={16} />, label: 'Toggle Light Mode', shortcut: 'L', action: () => setIsDarkMode(false), category: 'Settings' },
    { icon: <Moon size={16} />, label: 'Toggle Dark Mode', shortcut: 'M', action: () => setIsDarkMode(true), category: 'Settings' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(commandSearch.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, typeof commands>);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0C0C0E] text-[#1D2B3A] dark:text-[#E2E2E6] font-sans transition-colors duration-500 selection:bg-purple-500/30">
      <header className="sticky top-0 z-[100] border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-pink-900/10 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-[#0C0C0E]/60" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-shimmer-slow" />
        
        <div className="relative max-w-screen-2xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-all duration-500 animate-pulse-slow" />
                <div className="relative bg-gradient-to-tr from-purple-600 to-blue-600 p-3 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <Zap size={24} fill="white" className="text-white drop-shadow-2xl" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-2xl bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent tracking-tight">Kynora Studio</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-600">Identity Forge</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-wider">AI Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 relative">
              <nav className="hidden md:flex items-center space-x-2 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-1.5">
                {['Resources', 'Pricing', 'Enterprise'].map((item) => (
                  <a key={item} href="#" className="px-5 py-2.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all duration-300 hover:shadow-lg">{item}</a>
                ))}
              </nav>
              <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              
              <Tooltip content="Live Alerts" position="bottom" isDarkMode={isDarkMode}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative group"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-110">
                    <Activity size={20} className="text-gray-400" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1">
                        <div className="relative">
                          <div className="absolute inset-0 bg-red-500 rounded-full blur-md animate-pulse" />
                          <div className="relative w-6 h-6 bg-gradient-to-tr from-red-500 to-pink-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                            {unreadCount}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </Tooltip>

              {showNotifications && (
                <div className={`absolute top-16 right-0 w-96 backdrop-blur-3xl border rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 z-[200] ${
                  isDarkMode 
                    ? 'bg-[#1A1A1E]/98 border-white/10' 
                    : 'bg-white/98 border-gray-200'
                }`}>
                  <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl border ${
                        isDarkMode 
                          ? 'bg-blue-600/10 border-blue-500/20' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <Activity size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                      </div>
                      <h3 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Notifications
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className={`text-xs font-bold transition-colors ${
                            isDarkMode 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={clearAllNotifications}
                        className={`text-xs font-bold transition-colors ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-red-600 hover:text-red-700'
                        }`}
                      >
                        Clear all
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="px-6 py-20 text-center">
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                           <Activity size={32} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
                        </div>
                        <p className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Node Quiet</p>
                        <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-700' : 'text-gray-500'}`}>No incoming signals detected.</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`px-6 py-4 border-b transition-colors cursor-pointer group ${
                            !notif.read ? (isDarkMode ? 'bg-blue-600/5' : 'bg-blue-50/50') : ''
                          } ${isDarkMode ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50'}`}
                          onClick={() => {
                            setNotifications(notifications.map(n =>
                              n.id === notif.id ? { ...n, read: true } : n
                            ));
                          }}
                        >
                          <div className="flex items-start space-x-4">
                            {!notif.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold group-hover:text-blue-400 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-gray-600 mt-2 font-mono">
                                {notif.time}
                              </p>
                            </div>
                            <CheckCircle2
                              size={16}
                              className={`flex-shrink-0 mt-1 transition-colors ${
                                notif.read ? 'text-emerald-500' : 'text-gray-700'
                              }`}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className={`px-6 py-3 border-t ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <button className="w-full text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors py-2 uppercase tracking-widest">
                      Signal Log Archive
                    </button>
                  </div>
                </div>
              )}

              <Tooltip content={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} position="bottom" isDarkMode={isDarkMode}>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all duration-300 group-hover:scale-110">
                    {isDarkMode ? <Sun size={20} className="text-amber-400 group-hover:rotate-180 transition-transform duration-500" /> : <Moon size={20} className="text-blue-400 group-hover:rotate-180 transition-transform duration-500" />}
                  </div>
                </button>
              </Tooltip>

              <Tooltip content="Launch Console (Cmd+K)" position="bottom" isDarkMode={isDarkMode}>
                <button 
                  onClick={() => setIsCommandOpen(true)}
                  className="relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 opacity-100 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-105 active:scale-95 flex items-center space-x-2">
                    <Terminal size={16} />
                    <span>Console</span>
                  </div>
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <aside className="lg:col-span-4 space-y-8">
          <section className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-pink-600/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
            <div className="relative bg-gradient-to-br from-[#1A1A1E]/95 to-[#161618]/95 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/[0.08] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-float" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-float-delayed" />
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-600/20 rounded-2xl blur-xl animate-pulse-slow" />
                      <div className="relative bg-gradient-to-br from-purple-600/30 to-blue-600/30 p-3 rounded-2xl border border-purple-500/20">
                        <Terminal size={24} className="text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-[0.3em] bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Identity Core</h2>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">Powered by Gemini 3</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                    <span className="text-[9px] font-mono text-gray-600">LIVE</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Brandmark Identity</span>
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-focus-within/input:opacity-100 transition-all duration-500" />
                    <div className="relative flex items-center">
                      <div className="absolute left-5 text-gray-600 group-focus-within/input:text-purple-400 transition-colors"><Edit3 size={16} /></div>
                      <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-black/40 border-2 border-white/[0.08] rounded-2xl text-base font-bold text-white outline-none focus:border-purple-500/50 focus:bg-black/60 transition-all duration-300" placeholder="e.g., Kynora, TechCorp, Luminaire..." />
                      {brandName && <div className="absolute right-5"><CheckCircle2 size={20} className="text-emerald-500 animate-scale-in" /></div>}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Aesthetic Preset</label>
                  <div className="grid grid-cols-2 gap-3">
                    {STYLE_PRESETS.map((preset) => (
                      <button key={preset.id} onClick={() => setStyle(preset.id)} className="relative group/preset overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-500 ${style === preset.id ? 'from-purple-600/30 to-blue-600/30 opacity-100' : 'from-white/5 to-white/5 opacity-0 group-hover/preset:opacity-100'}`} />
                        <div className={`relative flex items-center space-x-3 px-6 py-5 rounded-2xl border-2 transition-all duration-300 ${style === preset.id ? 'border-purple-500/50 bg-purple-600/10 shadow-lg' : 'border-white/[0.08] bg-black/20 hover:border-white/20'}`}>
                          <div className={`p-2 rounded-xl transition-colors ${style === preset.id ? 'bg-purple-500/20' : 'bg-white/5'}`}>{preset.icon}</div>
                          <span className={`text-xs font-black uppercase tracking-wider transition-colors ${style === preset.id ? 'text-white' : 'text-gray-500'}`}>{preset.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Import Existing Logo</label>
                    <CloudUpload size={12} className="text-blue-500" />
                  </div>
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                  <label htmlFor="logo-upload" className="relative block group/upload cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 via-blue-600/50 to-pink-600/50 rounded-[2rem] blur-xl opacity-0 group-hover/upload:opacity-100 transition-all duration-500" />
                    <div className="relative flex flex-col items-center justify-center px-8 py-12 bg-black/40 border-2 border-dashed border-white/[0.08] rounded-[2rem] group-hover/upload:border-purple-500/50 group-hover/upload:bg-black/60 transition-all duration-500">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-2xl animate-pulse-slow" />
                        <div className="relative p-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/20 group-hover/upload:scale-110 transition-all duration-500">
                          <Download size={32} className="text-blue-400" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white">Drop your logo here</p>
                      <p className="text-xs text-gray-500">or <span className="text-blue-400 font-semibold">click to browse</span></p>
                    </div>
                  </label>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Symbolic Vision</label>
                    <button onClick={() => setPrompt('A modern geometric shield with neural patterns')} className="group/surprise flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl transition-all duration-300">
                      <Sparkles size={12} className="text-purple-400 group-hover/surprise:rotate-180 transition-transform duration-500" />
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-wider">Surprise Me</span>
                    </button>
                  </div>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="relative w-full h-48 p-6 text-sm font-medium bg-black/40 border-2 border-white/[0.08] rounded-[2rem] outline-none focus:border-purple-500/50 focus:bg-black/60 resize-none leading-relaxed text-gray-300" placeholder="Describe the icon geometry..." />
                </div>
                <button onClick={handleGenerate} disabled={isGenerating} className="relative w-full group/generate overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600" />
                  <div className="relative py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] text-white shadow-[0_40px_80px_-20px_rgba(139,92,246,0.6)] flex items-center justify-center space-x-4">
                    {isGenerating ? <><Loader2 className="animate-spin" size={24} /> <span>Synthesizing...</span></> : <><Sparkles size={24} /> <span>Forge Identity</span> <ArrowRight size={20} /></>}
                  </div>
                </button>
              </div>
            </div>
          </section>
          {logos.length > 0 && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl border border-amber-500/20"><History size={16} className="text-amber-400" /></div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Archive</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {logos.map((logo) => <LogoCard key={logo.id} logo={logo} isSelected={selectedLogoId === logo.id} onSelect={() => setSelectedLogoId(logo.id)} />)}
              </div>
            </section>
          )}
        </aside>

        <div className="lg:col-span-8 space-y-12">
           {selectedLogo ? (
             <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 w-fit mx-auto shadow-2xl backdrop-blur-xl">
                   <button onClick={() => setActiveTab('preview')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-white/10 text-purple-600 dark:text-white shadow-lg' : 'text-gray-400'}`}>Preview</button>
                   <button onClick={() => selectedLogo.variants ? setActiveTab('variants') : handleGenerateVariants()} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-3 ${activeTab === 'variants' ? 'bg-white dark:bg-white/10 text-purple-600 dark:text-white shadow-lg' : 'text-gray-400'}`}>Variants</button>
                   <button onClick={() => setActiveTab('styles')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-3 ${activeTab === 'styles' ? 'bg-white dark:bg-white/10 text-purple-600 dark:text-white shadow-lg' : 'text-gray-400'}`}>Styles</button>
                   <button onClick={() => setActiveTab('3d')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-3 ${activeTab === '3d' ? 'bg-white dark:bg-white/10 text-purple-600 dark:text-white shadow-lg' : 'text-gray-400'}`}>3D</button>
                </div>

                {activeTab === 'preview' ? (
                  <>
                    <section className="relative group/preview">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-pink-600/5 rounded-[4rem] blur-3xl opacity-0 group-hover/preview:opacity-100 transition-all duration-1000" />
                      <div className="relative bg-gradient-to-br from-[#1A1A1E]/98 to-[#161618]/98 backdrop-blur-3xl rounded-[4rem] border border-white/[0.08] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9)] overflow-hidden">
                        <div className="relative px-12 py-8 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.02] to-transparent">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-blue-600/30 rounded-[1.8rem] blur-2xl animate-pulse-slow" />
                                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-[1.8rem] flex items-center justify-center border border-purple-500/20 shadow-2xl group-hover/preview:scale-110 transition-transform duration-500">
                                  <Layers size={36} className="text-purple-400" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">Identity Artifact</h2>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80">Master Render Synced</p>
                                  </div>
                                  <p className="text-[9px] font-mono text-gray-600">{new Date(selectedLogo.timestamp).toLocaleTimeString()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Tooltip content="Neural Effectiveness Audit" position="top" isDarkMode={isDarkMode}>
                                <button onClick={() => handleNeuralAudit()} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 transition-all"><BarChart3 size={20}/></button>
                              </Tooltip>
                              <Tooltip content="Open Synthesis Lab" position="top" isDarkMode={isDarkMode}>
                                <button onClick={() => setIsEditorOpen(true)} className="relative flex items-center space-x-3 px-8 py-4 bg-white/[0.05] border border-white/10 hover:border-purple-500/30 rounded-2xl transition-all duration-300">
                                  <Edit size={18} className="text-gray-400" /><span className="text-xs font-black uppercase tracking-[0.2em] text-gray-300">Design Lab</span>
                                </button>
                              </Tooltip>
                              <button className="relative p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl transition-all duration-300 group-hover/preview:scale-110"><Download size={22} className="text-white" /></button>
                            </div>
                          </div>
                        </div>

                        <div className="p-20 grid grid-cols-1 md:grid-cols-2 gap-20 relative">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_70%)] opacity-50 pointer-events-none" />
                          <div className="relative space-y-8 group/light">
                            <div className="flex items-center justify-center space-x-4">
                              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-amber-500/30" />
                              <div className="flex items-center space-x-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <Sun size={14} className="text-amber-400" /><span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Optic Light</span>
                              </div>
                              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-amber-500/30" />
                            </div>
                            <div className="relative aspect-square rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_-30px_rgba(0,0,0,0.3)] bg-white p-24 flex items-center justify-center group-hover/light:scale-[1.02] transition-transform duration-700">
                              <img src={selectedLogo.url} alt="Light Mode" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                              <div className="absolute inset-4 border border-black/[0.03] rounded-[3rem] pointer-events-none" />
                            </div>
                          </div>
                          <div className="relative space-y-8 group/dark">
                            <div className="flex items-center justify-center space-x-4">
                              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-blue-500/30" />
                              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <Moon size={14} className="text-blue-400" /><span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Deep Charcoal</span>
                              </div>
                              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-blue-500/30" />
                            </div>
                            <div className="relative aspect-square rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-24 flex items-center justify-center group-hover/dark:scale-[1.02] transition-transform duration-700">
                              <img src={selectedLogo.darkUrl} alt="Dark Mode" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                              <div className="absolute inset-4 border border-white/[0.05] rounded-[3rem] pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="px-12 py-6 border-t border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
                          <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20"><Box size={18} className="text-purple-400" /></div>
                              <div><p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">Resolution</p><p className="text-xs font-black text-white">2048 × 2048px</p></div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20"><Palette size={18} className="text-blue-400" /></div>
                              <div><p className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">Colors</p><p className="text-xs font-black text-white">{selectedLogo.palette?.colors.length || 4} Extracted</p></div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600/10 to-blue-600/10 border border-emerald-500/20 rounded-xl">
                            <ShieldCheck size={16} className="text-emerald-400" /><span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Vector Quality</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="pt-20 border-t border-gray-200 dark:border-white/5">
                      <div className="flex items-center justify-between mb-16">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl flex items-center justify-center text-purple-400"><Smartphone size={32}/></div>
                          <div><h3 className="text-3xl font-black uppercase text-white tracking-tight">Ecosystem Deployment</h3><p className="text-[11px] font-black uppercase text-gray-500 tracking-[0.4em]">Multi-Context Simulation Hub</p></div>
                        </div>
                      </div>
                      <BrandPreview logoUrl={isDarkMode ? selectedLogo.darkUrl : selectedLogo.url} />
                    </div>
                  </>
                ) : activeTab === 'variants' ? (
                  <LogoVariantsGrid variants={selectedLogo.variants || []} onDownloadAll={() => {}} />
                ) : activeTab === 'styles' ? (
                  <StyleTransferPanel currentStyles={selectedLogo.styledVersions || []} isProcessing={isProcessingStyle} onApplyStyle={handleApplyArtisticStyle} onDownloadStyle={(url) => {}} />
                ) : (
                  <ThreeViewer logoUrl={selectedLogo.url} />
                )}
             </div>
           ) : (
             <div className="h-full min-h-[800px] bg-gray-50 dark:bg-[#111113] border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[5rem] flex flex-col items-center justify-center text-center p-24 space-y-10 animate-pulse relative overflow-hidden group">
                <div className="w-40 h-40 bg-gray-200 dark:bg-white/[0.02] rounded-full flex items-center justify-center text-gray-400 dark:text-gray-800 border border-gray-300 dark:border-white/5 relative shadow-inner">
                  <Box size={84} strokeWidth={1} />
                  <div className="absolute inset-0 bg-purple-500/5 blur-3xl rounded-full" />
                </div>
                <div className="space-y-4 max-w-lg">
                   <h3 className="text-4xl font-black tracking-tight text-[#1D2B3A]/40 dark:text-white/40 uppercase">Initiate Genesis</h3>
                   <p className="text-gray-500 dark:text-gray-600 text-base font-medium leading-relaxed">Provide a symbolic vision in the Identity Core to synthesize a brand architecture across neural nodes.</p>
                </div>
             </div>
           )}
        </div>
      </main>

      {(isGenerating || isGeneratingKit || isGeneratingVariants || isAuditing || isProcessingStyle) && (
        <div className={`fixed inset-0 z-[500] backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-300 ${
          isDarkMode ? 'bg-black/90' : 'bg-white/90'
        }`}>
          <div className="relative">
            <div className="absolute inset-0 w-40 h-40">
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-blue-500 rounded-full animate-spin" />
            </div>
            <div className="absolute inset-4 w-32 h-32">
              <div className="absolute inset-0 border-4 border-transparent border-b-pink-500 border-l-cyan-500 rounded-full animate-spin-reverse" style={{ animationDuration: '2s' }} />
            </div>
            <div className="relative w-40 h-40 flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl blur-2xl animate-pulse-slow" />
                <div className="relative p-4 bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-2xl border border-purple-500/30">
                  <Sparkles size={32} className="text-purple-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{processingMessage}</p>
                <div className="flex justify-center space-x-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
            <svg className="absolute inset-0 w-40 h-40 -rotate-90">
              <circle cx="80" cy="80" r="75" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="2" />
              <circle cx="80" cy="80" r="75" fill="none" stroke="url(#loading-gradient)" strokeWidth="2" strokeDasharray="471" strokeDashoffset="471" strokeLinecap="round" className="animate-progress" />
              <defs>
                <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}

      {isEditorOpen && selectedLogo && <LogoEditor logo={selectedLogo} isDarkMode={isDarkMode} onClose={() => setIsEditorOpen(false)} onSave={(updated) => { setLogos(logos.map(l => l.id === updated.id ? updated : l)); setIsEditorOpen(false); }} />}
      {isKitOpen && selectedLogo?.brandKit && <BrandKitGallery kit={selectedLogo.brandKit} onClose={() => setIsKitOpen(false)} />}
      {isAccessibilityModalOpen && selectedLogo && <AccessibilityAuditModal logo={selectedLogo} onClose={() => setIsAccessibilityModalOpen(false)} onApplyFixedPalette={handleApplyFixedPalette} />}
      {isReportOpen && selectedLogo?.effectivenessReport && <EffectivenessReportModal logo={selectedLogo} report={selectedLogo.effectivenessReport} onClose={() => setIsReportOpen(false)} />}
      {isVeoModalOpen && <VeoMotionModal isDarkMode={isDarkMode} onClose={() => setIsVeoModalOpen(false)} />}

      <div className="fixed bottom-8 right-8 z-[100] flex flex-col-reverse items-end space-y-reverse space-y-4">
        <button onClick={() => setIsFabOpen(!isFabOpen)} className="relative group/fab">
          <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
            isDarkMode 
              ? 'bg-gradient-to-tr from-purple-600 to-blue-600' 
              : 'bg-gradient-to-tr from-purple-500 to-blue-500'
          }`} />
          <div className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center group-hover/fab:scale-110 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-tr from-purple-600 to-blue-600 shadow-purple-600/50'
              : 'bg-gradient-to-tr from-purple-500 to-blue-500 shadow-purple-500/30'
          }`}>
            <div className={`transform transition-transform duration-500 ${isFabOpen ? 'rotate-135' : 'rotate-0'}`}>
              {isFabOpen ? <X size={28} className="text-white" /> : <Zap size={28} fill="white" className="text-white" />}
            </div>
          </div>
          <div className={`absolute inset-0 rounded-full blur-2xl opacity-60 group-hover/fab:opacity-100 transition-opacity ${
            isDarkMode
              ? 'bg-gradient-to-tr from-purple-600/30 to-blue-600/30'
              : 'bg-gradient-to-tr from-purple-500/20 to-blue-500/20'
          }`} />
        </button>
        <div className={`flex flex-col-reverse items-end space-y-reverse space-y-3 transition-all duration-500 ${isFabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <FabAction icon={<Upload size={20} />} label="Quick Upload" color={isDarkMode ? "from-blue-600 to-cyan-600" : "from-blue-500 to-cyan-500"} delay="delay-[50ms]" onClick={() => document.getElementById('logo-upload')?.click()} isDarkMode={isDarkMode} />
          <FabAction icon={<Video size={20} />} label="Veo Motion" color={isDarkMode ? "from-blue-600 to-indigo-600" : "from-blue-500 to-indigo-500"} delay="delay-[75ms]" onClick={() => setIsVeoModalOpen(true)} isDarkMode={isDarkMode} />
          <FabAction icon={<Sparkles size={20} />} label="AI Suggestions" color={isDarkMode ? "from-purple-600 to-pink-600" : "from-purple-500 to-pink-500"} delay="delay-[100ms]" onClick={() => { if (selectedLogo) { setActiveTab('preview'); handleNeuralAudit(); } }} isDarkMode={isDarkMode} />
          <FabAction icon={<Download size={20} />} label="Export All" color={isDarkMode ? "from-emerald-600 to-teal-600" : "from-emerald-500 to-teal-500"} delay="delay-[150ms]" onClick={() => { if (selectedLogo) handleGenerateBrandKit(); }} isDarkMode={isDarkMode} />
          <FabAction icon={<Sliders size={20} />} label="Settings" color={isDarkMode ? "from-amber-600 to-orange-600" : "from-amber-500 to-orange-500"} delay="delay-[200ms]" onClick={() => setIsEditorOpen(true)} isDarkMode={isDarkMode} />
        </div>
      </div>

      {isCommandOpen && (
        <div 
          className={`fixed inset-0 z-[500] backdrop-blur-xl flex items-start justify-center pt-32 px-4 animate-in fade-in duration-200 ${
            isDarkMode ? 'bg-black/80' : 'bg-gray-900/60'
          }`}
          onClick={() => setIsCommandOpen(false)}
        >
          <div 
            className={`w-full max-w-2xl backdrop-blur-3xl border rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden animate-in slide-in-from-top-8 zoom-in-95 duration-300 ${
              isDarkMode 
                ? 'bg-[#1A1A1E]/95 border-white/10' 
                : 'bg-white/95 border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`relative p-6 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-purple-600/10 border-purple-500/20' 
                    : 'bg-purple-50 border-purple-200'
                }`}>
                  <Search size={20} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                </div>
                <input 
                  type="text" 
                  value={commandSearch} 
                  onChange={(e) => setCommandSearch(e.target.value)} 
                  placeholder="Type a command or search..." 
                  className={`flex-1 bg-transparent text-lg font-medium outline-none ${
                    isDarkMode 
                      ? 'text-white placeholder:text-gray-600' 
                      : 'text-gray-900 placeholder:text-gray-400'
                  }`}
                  autoFocus 
                />
                <kbd className={`px-3 py-1.5 border rounded-lg text-xs font-mono ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 text-gray-500' 
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                }`}>
                  ESC
                </kbd>
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="p-3">
                  <div className="px-4 py-2">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      {category}
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {cmds.map((cmd, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => { cmd.action(); setIsCommandOpen(false); setCommandSearch(''); }} 
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group/cmd ${
                          isDarkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-white/5' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-xl group-hover/cmd:bg-purple-600/10 transition-colors ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>{cmd.icon}</div>
                          <span className="text-sm font-medium">{cmd.label}</span>
                        </div>
                        <kbd className={`px-3 py-1.5 border rounded-lg text-xs font-mono transition-colors ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10 text-gray-600 group-hover/cmd:text-purple-400 group-hover/cmd:border-purple-500/30' 
                            : 'bg-gray-50 border-gray-200 text-gray-400 group-hover/cmd:text-purple-600 group-hover/cmd:border-purple-200'
                        }`}>{cmd.shortcut}</kbd>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={`px-6 py-4 border-t flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className={`flex items-center space-x-6 text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <div className="flex items-center space-x-2"><kbd className={`px-2 py-1 rounded text-[10px] font-mono ${isDarkMode ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>↑↓</kbd><span>Navigate</span></div>
                <div className="flex items-center space-x-2"><kbd className={`px-2 py-1 rounded text-[10px] font-mono ${isDarkMode ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>Enter</kbd><span>Select</span></div>
                <div className="flex items-center space-x-2"><kbd className={`px-2 py-1 rounded text-[10px] font-mono ${isDarkMode ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>ESC</kbd><span>Close</span></div>
              </div>
              <div className={`flex items-center space-x-2 text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}><Terminal size={12} /><span>Command Palette</span></div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-24 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#08080A]">
         <div className="max-w-screen-2xl mx-auto px-8 flex flex-col items-center space-y-12 text-center">
            <div className="flex items-center space-x-4 text-purple-600 dark:text-purple-500">
               <Zap size={32} fill="currentColor" />
               <span className="text-3xl font-black tracking-tighter text-[#1D2B3A] dark:text-white uppercase">KYNORA STUDIO</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xl font-medium">Forging the identity layer of the intelligent web.</p>
            <div className="pt-12 border-t border-gray-200 dark:border-white/5 w-full flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-gray-700 uppercase tracking-widest">
               <span>© 2025 Kynora Brand Intelligence Labs</span>
               <span>Powered by Gemini 3 & Veo Motion</span>
            </div>
         </div>
      </footer>

      <style>{`
        @keyframes shimmer-slow {
          0%, 100% { background-position: -200% center; }
          50% { background-position: 200% center; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(20px, -20px) rotate(5deg); }
          66% { transform: translate(-15px, 15px) rotate(-5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-20px, 20px) rotate(5deg); }
          66% { transform: translate(15px, -15px) rotate(5deg); }
        }
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-in-from-bottom-8 {
          from { opacity: 0; transform: translateY(2rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-from-right-8 {
          from { opacity: 0; transform: translateX(2rem); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes progress {
          0% { stroke-dashoffset: 471; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes zoom-in-95 {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-shimmer-slow {
          animation: shimmer-slow 8s ease-in-out infinite;
          background-size: 200% 100%;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 12s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .slide-in-from-bottom-12 {
          animation: slide-in-from-bottom-8 0.8s ease-out;
        }
        .slide-in-from-right-8 {
          animation: slide-in-from-right-8 0.5s ease-out;
        }
        .rotate-135 {
          transform: rotate(135deg);
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
        .zoom-in-95 {
          animation: zoom-in-95 0.2s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default App;