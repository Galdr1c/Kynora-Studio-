
import React from 'react';
import { Tablet, Home, CreditCard, Smartphone, ShoppingBag } from 'lucide-react';

interface BrandPreviewProps {
  logoUrl: string;
}

const BrandPreview: React.FC<BrandPreviewProps> = ({ logoUrl }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {/* Mobile App View */}
      <div className="bg-white dark:bg-[#111827] rounded-[3rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl space-y-8 flex flex-col items-center transition-all group hover:border-[#E2725B]/20">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2"><Smartphone size={12}/> Digital Experience</p>
        <div className="w-48 h-[380px] bg-[#070B14] rounded-[3rem] border-[8px] border-[#1F2937] shadow-2xl relative overflow-hidden flex flex-col group-hover:scale-105 duration-700">
          <div className="flex-1 bg-white dark:bg-[#070B14] flex flex-col items-center justify-center p-8 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 p-3 shadow-inner"><img src={logoUrl} alt="Logo" className="w-full h-full object-contain" /></div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-24 h-2 bg-gray-100 dark:bg-white/10 rounded-full"></div>
              <div className="w-16 h-1.5 bg-gray-50 dark:bg-white/5 rounded-full"></div>
            </div>
            <div className="mt-8 w-full h-10 bg-[#E2725B] rounded-xl flex items-center justify-center"><div className="w-10 h-1 bg-white/30 rounded-full"></div></div>
          </div>
        </div>
      </div>

      {/* Packaging Mockup */}
      <div className="bg-white dark:bg-[#111827] rounded-[3rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl space-y-8 flex flex-col items-center group hover:border-[#E2725B]/20">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2"><ShoppingBag size={12}/> Product Packaging</p>
        <div className="w-full aspect-[3/4] rounded-3xl relative overflow-hidden shadow-2xl bg-[#E2725B]/5 flex items-center justify-center p-12">
           <div className="w-full aspect-square bg-white dark:bg-[#1F2937] rounded-lg shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-700 p-10 flex items-center justify-center border-b-[20px] border-[#E2725B]/20">
              <img src={logoUrl} alt="Packaging Logo" className="w-32 h-32 object-contain" />
              <div className="absolute bottom-4 right-4 text-[8px] font-bold text-gray-300 dark:text-gray-500">PREMIUM CULINARY SERIES</div>
           </div>
        </div>
      </div>

      {/* Business Card */}
      <div className="bg-white dark:bg-[#111827] rounded-[3rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl space-y-8 flex flex-col items-center group hover:border-[#E2725B]/20">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2"><CreditCard size={12}/> Stationery</p>
        <div className="w-full aspect-[1.58/1] bg-[#1D2B3A] dark:bg-[#F8FAFC] rounded-2xl shadow-xl flex flex-col p-8 justify-between items-start group-hover:-translate-y-2 duration-500 border border-white/5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#E2725B] opacity-10 rounded-full"></div>
          <img src={logoUrl} alt="Card Logo" className="w-20 h-20 object-contain filter invert dark:invert-0 brightness-200 dark:brightness-100" />
          <div className="space-y-1 z-10">
            <div className="w-24 h-2 bg-white/20 dark:bg-black/10 rounded-full"></div>
            <div className="w-16 h-1.5 bg-white/10 dark:bg-black/5 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPreview;
