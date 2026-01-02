import React, { useState } from 'react';
import { Download, LayoutGrid, X, Share2, Package, Image as ImageIcon, Briefcase, FileText, Smartphone, Monitor, BookOpen, Layers } from 'lucide-react';
import { BrandKit, BrandKitAsset } from '../types';

interface BrandKitGalleryProps {
  kit: BrandKit;
  onClose: () => void;
}

const CATEGORIES: { id: BrandKitAsset['type'] | 'all', label: string, icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Artifacts', icon: <LayoutGrid size={14}/> },
  { id: 'business-card', label: 'Networking', icon: <Briefcase size={14}/> },
  { id: 'stationery', label: 'Office Kit', icon: <FileText size={14}/> },
  { id: 'social', label: 'Social Sync', icon: <Share2 size={14}/> },
  { id: 'product', label: 'Mockups', icon: <Package size={14}/> },
  { id: 'print', label: 'Marketing', icon: <ImageIcon size={14}/> },
  { id: 'presentation', label: 'Corporate', icon: <Monitor size={14}/> },
  { id: 'guidelines', label: 'Brand Manual', icon: <BookOpen size={14}/> },
];

const BrandKitGallery: React.FC<BrandKitGalleryProps> = ({ kit, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<BrandKitAsset['type'] | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<BrandKitAsset | null>(null);

  const filteredAssets = activeCategory === 'all' 
    ? kit.assets 
    : kit.assets.filter(a => a.type === activeCategory);

  return (
    <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-black/40">
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-purple-600/30">
            <Layers size={24}/>
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Identity Nexus</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Compiled Brand Identity Package • High-Fidelity Artifacts</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-2xl shadow-white/10">
            <Download size={14}/>
            <span>Compile ZIP</span>
          </button>
          <button onClick={onClose} className="p-3 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-xl"><X size={24}/></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-72 border-r border-white/5 p-8 space-y-8 bg-black/20">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4 block mb-6">Asset Segments</label>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/30' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
          <div className="pt-10 border-t border-white/5 space-y-6">
             <div className="p-8 bg-purple-600/5 rounded-[2.5rem] border border-purple-500/10 space-y-4">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Global Sync</span>
                <p className="text-[10px] text-gray-500 leading-relaxed italic">"Assets are rendered at 300DPI equivalent for professional print environments and optimized for high-density displays."</p>
             </div>
          </div>
        </aside>

        {/* Assets Grid */}
        <main className="flex-1 overflow-y-auto p-12 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:48px_48px] scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            {filteredAssets.length === 0 && (
              <div className="col-span-full h-96 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                <ImageIcon size={64}/>
                <p className="text-xl font-bold uppercase tracking-widest">Segment Empty</p>
              </div>
            )}
            {filteredAssets.map(asset => (
              <div 
                key={asset.id} 
                onClick={() => setSelectedAsset(asset)}
                className="group relative bg-[#161618]/50 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl hover:border-purple-600/40 transition-all flex flex-col cursor-pointer hover:-translate-y-2"
              >
                <div className="aspect-[16/9] bg-black/60 relative overflow-hidden">
                  <img src={asset.imageUrl} alt={asset.label} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500" />
                  <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-xl px-4 py-2 rounded-xl text-[8px] font-black text-white uppercase tracking-[0.3em] border border-white/10 shadow-2xl">{asset.type}</div>
                </div>
                <div className="p-10 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">{asset.label}</h3>
                    <div className="p-3 rounded-2xl bg-white/5 text-gray-500 group-hover:bg-purple-600/20 group-hover:text-purple-400 transition-all">
                      <Download size={16}/>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{asset.description}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Deep Zoom Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-20 animate-in zoom-in-95 duration-300">
           <button onClick={() => setSelectedAsset(null)} className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X size={32}/></button>
           <div className="max-w-6xl w-full flex flex-col space-y-10">
              <div className="aspect-[16/9] rounded-[4rem] overflow-hidden shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] border border-white/10">
                <img src={selectedAsset.imageUrl} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between px-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedAsset.label}</h2>
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{selectedAsset.type} • High Resolution Render</p>
                </div>
                <button className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-purple-600/30 transition-all active:scale-95 flex items-center space-x-4">
                  <Download size={20}/>
                  <span>Download Master Asset</span>
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BrandKitGallery;
