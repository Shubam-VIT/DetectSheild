import React, { useState } from 'react';
import { ThreatEngineService } from '../services/threatEngine';
import { 
  X, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  Server, 
  Radio, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [apiUrl, setApiUrl] = useState(ThreatEngineService.getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; latencyMs: number; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async (targetToTest?: string) => {
    const url = targetToTest || apiUrl;
    setTesting(true);
    setTestResult(null);

    const res = await ThreatEngineService.testConnection(url);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = () => {
    ThreatEngineService.setApiBaseUrl(apiUrl);
    onConfigUpdated();
    onClose();
  };

  const handleSetPreset = (url: string) => {
    setApiUrl(url);
    handleTestConnection(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl glass-strong border border-cyan-500/30 p-6 sm:p-8 flex flex-col shadow-2xl space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-minimal font-bold text-xl text-white">
                API & Model Backend Settings
              </h3>
              <p className="text-xs text-gray-400 font-minimal">
                Configure DetectShield Unified API server endpoint
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-minimal font-semibold text-gray-300 uppercase tracking-wider mb-2">
              DetectShield API Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://detectsr.onrender.com or /proxy-detectsr"
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-xs font-code text-white"
              />
              <button
                onClick={() => handleTestConnection()}
                disabled={testing}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-minimal font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <RotateCw className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <Radio className="w-4 h-4 text-cyan-400" />
                )}
                <span>Test Ping</span>
              </button>
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-minimal flex items-center justify-between gap-3 ${
                testResult.ok
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
              <span className="font-code text-[11px] font-bold">
                {testResult.latencyMs} ms
              </span>
            </div>
          )}

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-minimal text-gray-400 uppercase tracking-wider block">
              Quick Connect Preset Endpoints:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleSetPreset('/proxy-detectsr')}
                className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/30 text-left transition-all"
              >
                <div className="text-xs font-minimal font-semibold text-white">
                  Local Vite Proxy (Recommended)
                </div>
                <div className="text-[10px] font-code text-gray-400 truncate mt-0.5">
                  /proxy-detectsr &rarr; Render
                </div>
              </button>

              <button
                onClick={() => handleSetPreset('https://detectsr.onrender.com')}
                className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/30 text-left transition-all"
              >
                <div className="text-xs font-minimal font-semibold text-white">
                  Direct Render Cloud API
                </div>
                <div className="text-[10px] font-code text-gray-400 truncate mt-0.5">
                  https://detectsr.onrender.com
                </div>
              </button>
            </div>
          </div>

          {/* Fallback Notice */}
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15 text-xs text-gray-300 font-minimal space-y-1">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <span>🛡️ Automatic Zero-Downtime Guarantee</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              If the remote Render container is spinning up from cold sleep (~30-50s) or offline, the app automatically switches to the built-in offline Bi-LSTM and XGBoost Threat Engine so audits execute without disruption.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-minimal text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-minimal font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
};
