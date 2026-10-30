import React, { useState, useEffect } from 'react';
import { ThreatReport } from './types/threat';
import { ThreatEngineService } from './services/threatEngine';
import { Navbar } from './components/Navbar';
import { ThreatIntelTicker } from './components/ThreatIntelTicker';
import { UrlScanner } from './components/UrlScanner';
import { MessageScanner } from './components/MessageScanner';
import { AppScanner } from './components/AppScanner';
import { AnalysisHistoryModal } from './components/AnalysisHistoryModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { CommunityReportModal } from './components/CommunityReportModal';
import { Shield, Smartphone, Globe, Lock, Cpu, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'URL' | 'MESSAGE' | 'APP'>('URL');
  const [isExtensionMode, setIsExtensionMode] = useState<boolean>(false);
  const [scanLineActive, setScanLineActive] = useState<boolean>(true);
  const spotlightRef = React.useRef<HTMLDivElement>(null);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ThreatReport | null>(null);

  // History & API status
  const [history, setHistory] = useState<ThreatReport[]>([]);
  const [apiConnected, setApiConnected] = useState(true);

  // Direct DOM spotlight listener (zero React re-renders for smooth paste and focus)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('detectshield_threat_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        // Initial sample history
        const initialSamples: ThreatReport[] = [
          {
            id: 'scan_init0',
            timestamp: Date.now() - 3600000 * 1,
            type: 'URL',
            target: 'https://github.com/explore',
            verdict: 'Safe',
            confidenceScore: 98,
            explanation: 'Official verified domain. Cryptographic certificate checks and reputation benchmarks confirm this target is authentic, legitimate, and safe.',
            riskFactors: [],
            alternativeLinks: [
              { title: 'Visit official portal on github.com', url: 'https://github.com/explore' },
              { title: 'Check Google Safe Browsing Index', url: 'https://transparencyreport.google.com/safe-browsing/search?url=https%3A%2F%2Fgithub.com%2Fexplore' }
            ],
            metadata: { rawLabel: 'official_safe' }
          },
          {
            id: 'scan_init1',
            timestamp: Date.now() - 3600000 * 2,
            type: 'URL',
            target: 'http://fake-bank.com/login',
            verdict: 'Dangerous',
            confidenceScore: 89,
            explanation: 'Dual-Input Deep Learning predicts DEFACEMENT based on URL structure.',
            riskFactors: [
              { type: 'MALWARE', description: 'URL mapped to defacement', severity: 'critical' },
              { type: 'SUSPICIOUS_DOMAIN', description: 'Domain registered on known malicious ASN', severity: 'high' }
            ],
            alternativeLinks: [
              { title: "Search 'fake-bank.com' on Google", url: "https://www.google.com/search?q=fake-bank.com" }
            ],
            metadata: { rawLabel: 'defacement' }
          },
          {
            id: 'scan_init2',
            timestamp: Date.now() - 3600000 * 5,
            type: 'MESSAGE',
            target: 'URGENT: Your account has been suspended. Click here to verify http://fake-bank.com',
            verdict: 'Dangerous',
            confidenceScore: 87,
            explanation: "Spam detected: Embedded link 'http://fake-bank.com' is classified as malicious (defacement).",
            riskFactors: [
              { type: 'SOCIAL_ENGINEERING', description: 'Urgent account suspension bait used to force credential input', severity: 'critical' }
            ],
            metadata: {
              isSpamModule: true,
              is_spam: true,
              spam_probability: 0.92,
              hamPercentage: '8.0',
              spamPercentage: '92.0'
            }
          }
        ];
        setHistory(initialSamples);
        localStorage.setItem('detectshield_threat_history', JSON.stringify(initialSamples));
      }
    } catch (e) {
      console.warn('Failed loading history from localStorage:', e);
    }
  }, []);

  // Check backend connectivity on mount
  useEffect(() => {
    ThreatEngineService.testConnection().then(res => {
      setApiConnected(res.ok);
    });
  }, []);

  // Save scan to history
  const handleScanComplete = (newReport: ThreatReport) => {
    setHistory(prev => {
      const updated = [newReport, ...prev.filter(h => h.id !== newReport.id)].slice(0, 50);
      try {
        localStorage.setItem('detectshield_threat_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('History storage error:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('detectshield_threat_history');
    } catch {}
  };

  const handleReportFalsePositive = (report: ThreatReport) => {
    setReportTarget(report);
    setIsReportOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070b1e] text-gray-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient Spotlight (Driven by direct DOM transforms, zero React re-renders) */}
      <div
        ref={spotlightRef}
        className="spotlight"
        style={{
          left: 0,
          top: 0,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />

      {/* Cyber Grid Pattern Background */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none z-0" />

      {/* Cyber Scanline */}
      {scanLineActive && <div className="scan-line" />}

      {/* Primary Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isExtensionMode={isExtensionMode}
        setIsExtensionMode={setIsExtensionMode}
        scanLineActive={scanLineActive}
        setScanLineActive={setScanLineActive}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenReport={() => {
          setReportTarget(null);
          setIsReportOpen(true);
        }}
        apiConnected={apiConnected}
      />

      {/* Threat Intel Telemetry Ticker */}
      <ThreatIntelTicker />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 relative z-20">
        
        {/* If Extension Mode: Show in Chrome Extension Viewport container */}
        {isExtensionMode ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-center mb-4">
              <span className="text-xs font-minimal text-cyan-400 font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                Extension Simulation (520px)
              </span>
              <p className="text-[11px] text-gray-400 font-minimal mt-1">
                Previewing DetectShieldReview as installed in Google Chrome / Chromium extensions
              </p>
            </div>

            <div className="w-[520px] max-w-full rounded-2xl glass-strong border-2 border-cyan-500/40 shadow-2xl overflow-hidden p-6 relative">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-hollow font-bold text-sm text-white">
                      DetectShieldReview
                    </h3>
                    <span className="text-[10px] text-cyan-300 font-code">Active Guard v6.0</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-minimal font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>PROTECTED</span>
                </div>
              </div>

              {/* In-Extension Scrollable Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x pb-4 mb-4 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('URL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-minimal font-semibold shrink-0 transition-all cursor-pointer ${
                    activeTab === 'URL'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  🔗 URL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('MESSAGE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-minimal font-semibold shrink-0 transition-all cursor-pointer ${
                    activeTab === 'MESSAGE'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  ✉️ SMS & Phishing
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('APP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-minimal font-semibold shrink-0 transition-all cursor-pointer ${
                    activeTab === 'APP'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  📱 App & APK
                </button>
              </div>

              {activeTab === 'URL' && (
                <UrlScanner
                  onScanComplete={handleScanComplete}
                  onReportFalsePositive={handleReportFalsePositive}
                />
              )}

              {activeTab === 'MESSAGE' && (
                <MessageScanner
                  onScanComplete={handleScanComplete}
                  onReportFalsePositive={handleReportFalsePositive}
                />
              )}

              {activeTab === 'APP' && (
                <AppScanner
                  onScanComplete={handleScanComplete}
                  onReportFalsePositive={handleReportFalsePositive}
                />
              )}
            </div>
          </div>
        ) : (
          /* Full Desktop Command Dashboard View */
          <div className="space-y-10">
            {activeTab === 'URL' && (
              <UrlScanner
                onScanComplete={handleScanComplete}
                onReportFalsePositive={handleReportFalsePositive}
              />
            )}

            {activeTab === 'MESSAGE' && (
              <MessageScanner
                onScanComplete={handleScanComplete}
                onReportFalsePositive={handleReportFalsePositive}
              />
            )}

            {activeTab === 'APP' && (
              <AppScanner
                onScanComplete={handleScanComplete}
                onReportFalsePositive={handleReportFalsePositive}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#060a1d]/90 py-6 px-4 sm:px-6 relative z-10 text-xs font-minimal text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-hollow font-bold text-white text-sm">
              <span className="text-cyan-400">D</span>etect<span className="text-purple-400">S</span>hield<span className="text-indigo-400">R</span>eview
            </span>
            <span className="text-gray-600">&bull;</span>
            <span>AI Threat Analyzer & Zero-Trust Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="hover:text-cyan-300 transition-colors"
            >
              API Gateway
            </button>
            <span className="text-gray-600">&bull;</span>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-cyan-300 transition-colors"
            >
              Threat Logs ({history.length})
            </button>
            <span className="text-gray-600">&bull;</span>
            <button
              onClick={() => {
                setReportTarget(null);
                setIsReportOpen(true);
              }}
              className="hover:text-rose-300 transition-colors"
            >
              Report False Positive
            </button>
          </div>
        </div>
      </footer>

      {/* History Modal */}
      <AnalysisHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectReport={(rep) => {
          if (rep.type === 'URL') setActiveTab('URL');
          else if (rep.type === 'MESSAGE') setActiveTab('MESSAGE');
          else if (rep.type === 'APP') setActiveTab('APP');
        }}
        onClearHistory={handleClearHistory}
      />

      {/* Settings Modal */}
      <ApiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigUpdated={() => {
          ThreatEngineService.testConnection().then(res => setApiConnected(res.ok));
        }}
      />

      {/* Community Report Modal */}
      <CommunityReportModal
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setReportTarget(null);
        }}
        initialReport={reportTarget}
      />

    </div>
  );
}
