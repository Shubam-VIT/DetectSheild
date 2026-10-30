import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Zap, Cpu } from 'lucide-react';

export const ThreatIntelTicker: React.FC = () => {
  const [stats, setStats] = useState({
    threatsBlocked: 148293,
    scansCompleted: 892401,
    accuracyRate: 99.4,
    latencyMs: 42,
  });

  const [activeIntel, setActiveIntel] = useState([
    { id: 1, type: 'SMS Phishing', source: '+1 (800) ***-4912', vector: 'Bank Account Suspension Bait', status: 'BLOCKED' },
    { id: 2, type: 'Malicious URL', source: 'chase-security-verify.top', vector: 'Defacement & Credential Stealer', status: 'FLAGGED' },
    { id: 3, type: 'Android Trojan', source: 'SuperCleaner_v2.apk', vector: 'Privilege Overreach / SMS Fraud', status: 'INTERCEPTED' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 3) + 1,
        scansCompleted: prev.scansCompleted + Math.floor(Math.random() * 5) + 2,
        accuracyRate: 99.4,
        latencyMs: 38 + Math.floor(Math.random() * 12),
      }));
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#060a1d]/90 border-b border-cyan-500/15 py-2 px-4 sm:px-6 text-xs text-gray-400 font-minimal overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Live Ticker */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider text-[11px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Threat Feed:</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-code overflow-x-auto no-scrollbar py-0.5">
            {activeIntel.map(item => (
              <div key={item.id} className="flex items-center gap-2 whitespace-nowrap bg-white/[0.03] px-2.5 py-0.5 rounded border border-white/5">
                <span className="text-gray-300 font-medium">{item.type}</span>
                <span className="text-gray-500">[{item.source}]</span>
                <span className="text-rose-400 font-bold text-[10px] bg-rose-500/15 px-1.5 py-0.2 rounded border border-rose-500/30">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Metrics Stats */}
        <div className="flex items-center gap-5 text-[11px] shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-gray-400">Blocked:</span>
            <span className="font-code font-bold text-gray-200">
              {stats.threatsBlocked.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-400">Bi-LSTM & XGBoost Acc:</span>
            <span className="font-code font-bold text-emerald-400">
              {stats.accuracyRate}%
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-gray-400">Engine Latency:</span>
            <span className="font-code font-semibold text-gray-300">
              {stats.latencyMs}ms
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
