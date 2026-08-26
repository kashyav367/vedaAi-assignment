'use client';
import { ArrowLeft, Bell, Menu, Sparkles } from 'lucide-react';

export default function ExtractingScreen() {
  return (
    <div className="flex flex-col h-screen bg-[#EBEBEB] p-4 md:p-6 overflow-hidden">
      {/* TOP BAR */}
      <div className="bg-white rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-sm border border-gray-100 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button className="text-gray-800 hover:text-black transition">
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-lg text-gray-900">VedaAI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer">
            <Bell size={20} className="text-gray-700" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            MR
          </div>
          <button className="text-gray-800 hover:text-black transition">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* CENTER CARD */}
      <div className="bg-white rounded-[32px] flex-1 flex flex-col items-center justify-center p-8 text-center shadow-sm border border-gray-100 relative">
        {/* Animated Orange Sparkles */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-28 h-28 rounded-full bg-orange-500/10 absolute animate-ping pointer-events-none" />
          <div className="relative">
            <Sparkles size={96} className="text-orange-500 animate-pulse" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Extracting...
        </h2>
        <p className="text-base text-[#71717A] font-normal">
          This may take a while
        </p>
      </div>
    </div>
  );
}