import React from 'react';
import { Shield, History, Settings, Flag, Activity, Smartphone, Monitor, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'URL' | 'MESSAGE' | 'APP';
  setActiveTab: (tab: 'URL' | 'MESSAGE' | 'APP') => void;
  isExtensionMode: boolean;
  setIsExtensionMode: (val: boolean) => void;
  scanLineActive: boolean;
  setScanLineActive: (val: boolean) => void;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenConfig: () => void;
  onOpenReport: () => void;
  apiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isExtensionMode,
  setIsExtensionMode,
  scanLineActive,
  setScanLineActive,
  historyCount,
  onOpenHistory,
  onOpenConfig,
  onOpenReport,
  apiConnected,
}) => {
  return (
    <header className="border-b border-cyan-500/20 bg-[#080d24]/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative group cursor-pointer" onClick={() => setActiveTab('URL')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#070b1f] rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-hollow font-extrabold text-base sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                <span className="text-cyan-400">D</span>etect<span className="text-purple-400">S</span>hield<span className="hidden sm:inline text-indigo-400">R</span><span className="hidden sm:inline">eview</span>
              </span>
              <span className="hidden lg:inline-flex text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                v6.0 Unified
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-minimal text-gray-400 tracking-wide hidden sm:block">
              Neural Threat Analyzer & Security Guard
            </p>
          </div>
        </div>

        {/* Center Mode Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-[#0e1638]/90 border border-white/10 shadow-inner shrink-0">
          <button
            onClick={() => setActiveTab('URL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-minimal font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'URL'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-400/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span>🔗</span>
            <span>URL Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('MESSAGE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-minimal font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MESSAGE'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25 border border-purple-400/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span>✉️</span>
            <span>SMS & Phishing</span>
          </button>

          <button
            onClick={() => setActiveTab('APP')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-minimal font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'APP'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 border border-amber-400/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span>📱</span>
            <span>App & APK</span>
          </button>
        </nav>

        {/* Right Tools and Status */}
        <div className="flex items-center gap-2">
          {/* API Health Pill */}
          <div
            onClick={onOpenConfig}
            title={apiConnected ? 'API Connected & Operational' : 'API Idle or Offline Fallback Active'}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-minimal cursor-pointer hover:border-cyan-500/40 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
            <span className="text-gray-300 text-[11px]">
              {apiConnected ? 'API Online' : 'AI Engine Ready'}
            </span>
          </div>

          {/* Extension Mode Toggle */}
          <button
            onClick={() => setIsExtensionMode(!isExtensionMode)}
            title={isExtensionMode ? 'Switch to Full Dashboard' : 'Switch to Extension Popup Preview (520px)'}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              isExtensionMode
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {isExtensionMode ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            <span className="hidden md:inline text-[11px] font-minimal">
              {isExtensionMode ? 'Dashboard' : 'Extension View'}
            </span>
          </button>

          {/* Scanline FX Toggle */}
          <button
            onClick={() => setScanLineActive(!scanLineActive)}
            title={scanLineActive ? 'Disable Cyber Scanline' : 'Enable Cyber Scanline'}
            className={`p-2 rounded-lg border text-xs transition-colors hidden sm:flex ${
              scanLineActive
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Report Threat */}
          <button
            onClick={onOpenReport}
            title="Report New Malicious Threat"
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors"
          >
            <Flag className="w-4 h-4" />
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            title="Analysis History"
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-colors relative"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4 text-[9px] font-bold rounded-full bg-cyan-500 text-black text-center">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenConfig}
            title="API Settings & Model Endpoints"
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Mobile Scrollable Navigation Bar */}
      <div className="md:hidden border-t border-cyan-500/15 bg-[#070b20]/95 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x py-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('URL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-minimal font-bold shrink-0 whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
              activeTab === 'URL'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30 border border-cyan-400/40'
                : 'bg-white/5 text-gray-300 hover:text-white border border-white/10'
            }`}
          >
            <span>🔗</span>
            <span>URL Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MESSAGE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-minimal font-bold shrink-0 whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
              activeTab === 'MESSAGE'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30 border border-purple-400/40'
                : 'bg-white/5 text-gray-300 hover:text-white border border-white/10'
            }`}
          >
            <span>✉️</span>
            <span>SMS & Phishing</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('APP')}
            className={`px-3.5 py-2 rounded-xl text-xs font-minimal font-bold shrink-0 whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
              activeTab === 'APP'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30 border border-amber-400/40'
                : 'bg-white/5 text-gray-300 hover:text-white border border-white/10'
            }`}
          >
            <span>📱</span>
            <span>App & APK</span>
          </button>
        </div>
      </div>
    </header>
  );
};
