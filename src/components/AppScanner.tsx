import React, { useState } from 'react';
import { ThreatEngineService, ANDROID_PERMISSIONS_CATALOG } from '../services/threatEngine';
import { ThreatReport, PresetApp } from '../types/threat';
import { PRESET_APPS } from '../data/samples';
import { ThreatReportCard } from './ThreatReportCard';
import { 
  Smartphone, 
  UploadCloud, 
  CheckSquare, 
  Square, 
  ShieldAlert, 
  Sparkles, 
  FileCode, 
  AlertTriangle,
  XCircle,
  FileCheck
} from 'lucide-react';

interface AppScannerProps {
  onScanComplete: (report: ThreatReport) => void;
  onReportFalsePositive: (report: ThreatReport) => void;
}

export const AppScanner: React.FC<AppScannerProps> = ({
  onScanComplete,
  onReportFalsePositive,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom' | 'upload'>('preset');
  
  // Custom form
  const [appName, setAppName] = useState('My Test Application');
  const [appDeveloper, setAppDeveloper] = useState('Third-Party Dev');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'android.permission.INTERNET',
    'android.permission.SEND_SMS',
    'android.permission.RECEIVE_BOOT_COMPLETED',
  ]);

  // Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<ThreatReport | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleScanCustomApp = async () => {
    if (!appName.trim()) {
      setErrorMsg('Please specify an application name.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const rep = await ThreatEngineService.analyzeApp(appName, appDeveloper, selectedPermissions);
      setCurrentReport(rep);
      onScanComplete(rep);
    } catch (e: any) {
      setErrorMsg(e.message || 'Application analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanPreset = async (preset: PresetApp) => {
    setAppName(preset.name);
    setAppDeveloper(preset.developer);
    setSelectedPermissions(preset.permissions);
    setErrorMsg('');
    setLoading(true);

    try {
      const rep = await ThreatEngineService.analyzeApp(preset.name, preset.developer, preset.permissions);
      setCurrentReport(rep);
      onScanComplete(rep);
    } catch (e: any) {
      setErrorMsg(e.message || 'Preset analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await handleScanFile(file);
    }
  };

  const handleScanFile = async (fileToScan?: File) => {
    const file = fileToScan || selectedFile;
    if (!file) {
      setErrorMsg('Please select an APK or binary package to analyze.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const rep = await ThreatEngineService.analyzeFile(file);
      setCurrentReport(rep);
      onScanComplete(rep);
    } catch (e: any) {
      setErrorMsg(e.message || 'Binary analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">◆</span>
            <h2 className="font-minimal font-extrabold text-2xl text-white tracking-wide">
              Android APK & Application Threat Analyzer
            </h2>
            <span className="text-amber-400 font-bold">◆</span>
          </div>
          <p className="text-xs text-gray-400 font-minimal mt-1">
            Audit dangerous privilege combinations, Trojan persistence hooks, SMS toll fraud vectors, and banking overlay permissions.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('preset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-minimal font-semibold transition-all ${
              activeTab === 'preset'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-minimal font-semibold transition-all ${
              activeTab === 'custom'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Permission Config
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-minimal font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upload Binary (.apk)
          </button>
        </div>
      </div>

      {/* Preset View */}
      {activeTab === 'preset' && (
        <div className="space-y-4">
          <div className="text-xs font-minimal text-gray-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select a pre-compiled application security scenario to analyze its attack vectors:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESET_APPS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleScanPreset(preset)}
                className="p-5 rounded-2xl glass hover:border-amber-500/40 cursor-pointer transition-all hover:scale-[1.01] group border border-white/10 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        {preset.icon}
                      </div>
                      <div>
                        <h4 className="font-minimal font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                          {preset.name}
                        </h4>
                        <div className="text-[11px] text-gray-400 font-minimal">
                          By {preset.developer} &bull; {preset.category}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-minimal uppercase ${
                        preset.expectedVerdict === 'Dangerous'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : preset.expectedVerdict === 'Caution'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {preset.expectedVerdict}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 font-minimal leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] font-code text-gray-400">
                    {preset.permissions.length} Requested Permissions
                  </div>
                  <span className="text-xs font-minimal font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Audit App</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Permission Config View */}
      {activeTab === 'custom' && (
        <div className="glass rounded-2xl p-6 border border-white/10 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-minimal font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Application Package / Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. Speed Booster Pro"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 focus:outline-none text-xs font-code text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-minimal font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Developer Identity
              </label>
              <input
                type="text"
                value={appDeveloper}
                onChange={(e) => setAppDeveloper(e.target.value)}
                placeholder="e.g. Unverified Publisher"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 focus:outline-none text-xs font-code text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-minimal font-semibold text-gray-300 uppercase tracking-wider">
                Select Manifest Permissions ({selectedPermissions.length} Active)
              </label>
              <button
                onClick={() => setSelectedPermissions(ANDROID_PERMISSIONS_CATALOG.map(p => p.name))}
                className="text-xs text-amber-400 hover:text-amber-300 font-minimal"
              >
                Select All High Risk
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {ANDROID_PERMISSIONS_CATALOG.map((perm) => {
                const isSelected = selectedPermissions.includes(perm.name);
                return (
                  <div
                    key={perm.name}
                    onClick={() => togglePermission(perm.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="mt-0.5 text-amber-400">
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-code font-semibold truncate">
                          {perm.name.replace('android.permission.', '')}
                        </span>
                        <span
                          className={`text-[9px] font-minimal uppercase px-1.5 py-0.2 rounded font-bold ${
                            perm.risk === 'critical'
                              ? 'bg-rose-500/20 text-rose-300'
                              : perm.risk === 'high'
                              ? 'bg-amber-500/20 text-amber-300'
                              : perm.risk === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {perm.risk}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-minimal line-clamp-1">
                        {perm.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleScanCustomApp}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-minimal font-bold text-xs shadow-lg shadow-amber-500/25 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Privileges...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Analyze Permissions</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Binary Upload View */}
      {activeTab === 'upload' && (
        <div className="glass rounded-2xl p-8 border border-white/10 space-y-6 shadow-xl text-center">
          <label
            htmlFor="file-upload"
            className="border-2 border-dashed border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-10 block cursor-pointer transition-all bg-black/30 hover:bg-amber-500/5 group"
          >
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              accept=".apk,.exe,.dmg,.zip,.bin,.dex"
              onChange={handleFileChange}
            />

            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="font-minimal font-bold text-lg text-white mb-1">
              {selectedFile ? selectedFile.name : 'Click or Drag Application Package Here'}
            </h3>
            <p className="text-xs text-gray-400 font-minimal max-w-sm mx-auto">
              Supports .apk (Android Package), .exe, .dmg, or .dex binary headers.
            </p>

            {selectedFile && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-code">
                <FileCheck className="w-4 h-4" />
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB loaded</span>
              </div>
            )}
          </label>

          {selectedFile && (
            <button
              onClick={() => handleScanFile()}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-minimal font-bold text-xs shadow-lg shadow-amber-500/25 disabled:opacity-50 transition-all mx-auto flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extracting Binary Manifest...</span>
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4" />
                  <span>Execute Full Binary Audit</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Error notification */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-minimal flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading banner */}
      {loading && (
        <div className="glass-strong rounded-2xl p-8 border border-amber-500/30 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-400">
            <Smartphone className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="font-minimal font-bold text-base text-white tracking-wide">
              XGBOOST THREAT AUDIT IN PROGRESS...
            </h3>
            <p className="text-xs text-gray-400 font-minimal">
              Correlating permission privilege matrix against known malware family signatures (Joker, Anatsa, FluBot).
            </p>
          </div>
          <div className="w-64 h-1.5 bg-black/50 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-red-500 animate-[scan_2s_linear_infinite]" />
          </div>
        </div>
      )}

      {/* Output Report */}
      {currentReport && !loading && (
        <ThreatReportCard
          report={currentReport}
          onRescan={() => {
            if (activeTab === 'upload' && selectedFile) {
              handleScanFile(selectedFile);
            } else {
              handleScanCustomApp();
            }
          }}
          onReportFalsePositive={onReportFalsePositive}
        />
      )}

    </div>
  );
};
