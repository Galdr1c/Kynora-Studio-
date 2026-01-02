
import React, { useState, useRef } from 'react';
import { X, Upload, Video, Sparkles, Loader2, Download, ArrowRight, Monitor, Smartphone, Play, Image as ImageIcon } from 'lucide-react';
import { generateVeoMotion } from '../services/gemini';

interface VeoMotionModalProps {
  isDarkMode: boolean;
  onClose: () => void;
}

const VeoMotionModal: React.FC<VeoMotionModalProps> = ({ isDarkMode, onClose }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [motionPrompt, setMotionPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "Analyzing image topology...",
    "Initializing temporal neural latents...",
    "Synthesizing motion frames...",
    "Rendering cinematic lighting pass...",
    "Encoding master broadcast stream..."
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSourceImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!sourceImage || isGenerating) return;
    
    // Check API Key selection via Studio API if applicable
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        return;
      }
    }

    setIsGenerating(true);
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length);
    }, 8000);

    try {
      const url = await generateVeoMotion(sourceImage, motionPrompt, aspectRatio);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || JSON.stringify(err);
      if (msg.includes("Requested entity was not found.")) {
        if (typeof window !== 'undefined' && (window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
        }
      } else {
        alert("Video synthesis disrupted. Please ensure you have a selected paid API key.");
      }
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className={`max-w-6xl w-full h-full max-h-[90vh] rounded-[3.5rem] border overflow-hidden flex flex-col shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] ${isDarkMode ? 'bg-[#111113] border-white/10' : 'bg-white border-gray-200'}`}>
        {/* Header */}
        <header className={`h-24 px-12 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'border-white/5 bg-white/[0.01]' : 'border-gray-100 bg-gray-50'}`}>
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
              <Video size={28}/>
            </div>
            <div>
              <h2 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Veo Motion Synthesis</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Generative Temporal Identity Forge</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-4 rounded-2xl transition-colors ${isDarkMode ? 'bg-white/5 text-gray-500 hover:text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-900'}`}><X size={28}/></button>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Config Sidebar */}
          <aside className={`w-96 border-r p-10 flex flex-col space-y-10 shrink-0 ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50/30'}`}>
            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Source Image</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden ${sourceImage ? 'border-blue-500/50' : 'border-white/10 hover:border-blue-500/30'}`}
              >
                {sourceImage ? (
                  <>
                    <img src={sourceImage} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-black uppercase tracking-widest">Change Photo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform mb-4"><Upload size={24}/></div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Upload Reference</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Motion Narrative</label>
              <textarea 
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                placeholder="Describe how the scene should move... (e.g. 'Soft cinematic camera pan, elements glowing gradually')"
                className={`w-full h-32 p-6 text-sm font-medium rounded-3xl border-2 outline-none focus:border-blue-500/50 resize-none leading-relaxed ${isDarkMode ? 'bg-black/40 border-white/5 text-gray-300' : 'bg-white border-gray-200 text-gray-900'}`}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Broadcast Target</label>
              <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white border-gray-200'}`}>
                <button 
                  onClick={() => setAspectRatio('16:9')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${aspectRatio === '16:9' ? (isDarkMode ? 'bg-white/10 text-white shadow-xl' : 'bg-gray-100 text-gray-900 shadow-md') : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Monitor size={14}/><span>Landscape</span>
                </button>
                <button 
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${aspectRatio === '9:16' ? (isDarkMode ? 'bg-white/10 text-white shadow-xl' : 'bg-gray-100 text-gray-900 shadow-md') : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Smartphone size={14}/><span>Portrait</span>
                </button>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!sourceImage || isGenerating}
              className={`w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center space-x-4 shadow-2xl ${!sourceImage || isGenerating ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'}`}
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{isGenerating ? 'Synthesizing...' : 'Ignite Motion'}</span>
            </button>
          </aside>

          {/* Canvas Main */}
          <main className={`flex-1 relative flex items-center justify-center p-12 overflow-auto bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:48px_48px] ${isDarkMode ? 'bg-[#08080A]' : 'bg-gray-50'}`}>
            {!videoUrl && !isGenerating && (
              <div className="flex flex-col items-center space-y-6 opacity-30 text-center max-w-sm">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center"><ImageIcon size={48}/></div>
                <div className="space-y-2">
                  <p className="text-xl font-black uppercase tracking-widest text-white">Genesis Node Idle</p>
                  <p className="text-xs font-medium text-gray-500">Upload a static artifact and describe its evolution to initiate temporal synthesis.</p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center space-y-10 w-full max-w-md">
                <div className="relative">
                   <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />
                   <div className="w-32 h-32 relative">
                      <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin" />
                      <div className="absolute inset-4 border-4 border-transparent border-b-cyan-500 border-l-cyan-500 rounded-full animate-spin-reverse" style={{ animationDuration: '3s' }} />
                   </div>
                </div>
                <div className="space-y-3 text-center">
                  <p className="text-lg font-black text-white uppercase tracking-widest">{loadingMessages[loadingStep]}</p>
                  <div className="flex justify-center space-x-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 animate-progress-indefinite" />
                </div>
              </div>
            )}

            {videoUrl && !isGenerating && (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-10 animate-in zoom-in-95 duration-700">
                <div className={`rounded-[3rem] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.8)] border border-white/10 ${aspectRatio === '16:9' ? 'w-full max-w-4xl aspect-video' : 'h-[600px] aspect-[9/16]'}`}>
                   <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = videoUrl;
                      link.download = 'kynora-motion.mp4';
                      link.click();
                    }}
                    className="bg-white text-black px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl hover:bg-gray-200 transition-all active:scale-95 flex items-center space-x-4"
                  >
                    <Download size={20}/>
                    <span>Export MP4</span>
                  </button>
                  <button 
                    onClick={() => { setVideoUrl(null); }}
                    className="bg-white/5 border border-white/10 text-white px-8 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Resynthesize
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <style>{`
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .animate-spin-reverse { animation: spin-reverse 3s linear infinite; }
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-indefinite {
          animation: progress-indefinite 2s ease-in-out infinite;
          width: 50%;
        }
      `}</style>
    </div>
  );
};

export default VeoMotionModal;
