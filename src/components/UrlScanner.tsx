import React, { useState } from 'react';
import { ThreatEngineService } from '../services/threatEngine';
import { ThreatReport, BulkUrlResult } from '../types/threat';
import { SAMPLE_URLS } from '../data/samples';
import { ThreatReportCard } from './ThreatReportCard';
import { 
  Search, 
  Layers, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  CheckCircle2, 
  XCircle,
  ClipboardPaste,
  Copy,
  Check
} from 'lucide-react';

interface UrlScannerProps {
  onScanComplete: (report: ThreatReport) => void;
  onReportFalsePositive: (report: ThreatReport) => void;
}

export const UrlScanner: React.FC<UrlScannerProps> = ({
  onScanComplete,
  onReportFalsePositive,
}) => {
  const [scanMode, setScanMode] = useState<'single' | 'bulk'>('single');
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<ThreatReport | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkUrlResult[] | null>(null);
  const [selectedBulkDetail, setSelectedBulkDetail] = useState<BulkUrlResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Copy feedback states
  const [copiedSingle, setCopiedSingle] = useState(false);
  const [copiedBulk, setCopiedBulk] = useState(false);
  const [copiedPresetIdx, setCopiedPresetIdx] = useState<number | null>(null);
  const [justPastedSingle, setJustPastedSingle] = useState(false);
  const [justPastedBulk, setJustPastedBulk] = useState(false);

  // In-app fallback paste modal for sandboxed iframe environments
  const [pasteModal, setPasteModal] = useState<{ open: boolean; type: 'single' | 'bulk'; tempText: string }>({
    open: false,
    type: 'single',
    tempText: '',
  });

  const singleInputRef = React.useRef<HTMLInputElement>(null);
  const bulkTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Paste single URL from clipboard with multi-tier fallback
  const handlePasteSingle = async () => {
    // Tier 1: Try modern clipboard API
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setSingleUrl(text.trim());
          setErrorMsg('');
          setJustPastedSingle(true);
          setTimeout(() => setJustPastedSingle(false), 2200);
          singleInputRef.current?.focus();
          return;
        }
      }
    } catch (err) {
      console.warn('Direct clipboard read restricted by browser/iframe:', err);
    }

    // Tier 2: Focus input and attempt execCommand paste
    if (singleInputRef.current) {
      singleInputRef.current.focus();
      singleInputRef.current.select();
      try {
        const success = document.execCommand('paste');
        if (success && singleInputRef.current.value) {
          setSingleUrl(singleInputRef.current.value.trim());
          setErrorMsg('');
          setJustPastedSingle(true);
          setTimeout(() => setJustPastedSingle(false), 2200);
          return;
        }
      } catch {
        // execCommand not permitted
      }
    }

    // Tier 3: Open Quick Paste Helper Modal with auto-detect
    setPasteModal({ open: true, type: 'single', tempText: '' });
  };

  // Copy current single URL
  const handleCopySingle = () => {
    if (!singleUrl.trim()) return;
    navigator.clipboard.writeText(singleUrl.trim());
    setCopiedSingle(true);
    setTimeout(() => setCopiedSingle(false), 2000);
  };

  // Paste bulk URLs from clipboard with multi-tier fallback
  const handlePasteBulk = async () => {
    // Tier 1: Try modern clipboard API
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setBulkInput(prev => prev ? `${prev.trim()}\n${text.trim()}` : text.trim());
          setErrorMsg('');
          setJustPastedBulk(true);
          setTimeout(() => setJustPastedBulk(false), 2200);
          bulkTextareaRef.current?.focus();
          return;
        }
      }
    } catch (err) {
      console.warn('Direct clipboard read restricted:', err);
    }

    // Tier 2: Focus textarea and attempt execCommand paste
    if (bulkTextareaRef.current) {
      bulkTextareaRef.current.focus();
      try {
        const success = document.execCommand('paste');
        if (success && bulkTextareaRef.current.value) {
          setBulkInput(bulkTextareaRef.current.value.trim());
          setErrorMsg('');
          setJustPastedBulk(true);
          setTimeout(() => setJustPastedBulk(false), 2200);
          return;
        }
      } catch {
        // execCommand not permitted
      }
    }

    // Tier 3: Open Quick Paste Helper Modal
    setPasteModal({ open: true, type: 'bulk', tempText: '' });
  };

  // Copy bulk URLs
  const handleCopyBulk = () => {
    if (!bulkInput.trim()) return;
    navigator.clipboard.writeText(bulkInput.trim());
    setCopiedBulk(true);
    setTimeout(() => setCopiedBulk(false), 2000);
  };

  // Copy a preset sample URL
  const handleCopyPresetUrl = (e: React.MouseEvent, url: string, idx: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedPresetIdx(idx);
    setTimeout(() => setCopiedPresetIdx(null), 2000);
  };

  const handleScanSingle = async (urlToScan?: string) => {
    const target = (urlToScan || singleUrl).trim();
    if (!target) {
      setErrorMsg('Please enter a target URL to analyze.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    setBulkResults(null);

    try {
      const rep = await ThreatEngineService.analyzeUrl(target);
      setCurrentReport(rep);
      onScanComplete(rep);
    } catch (e: any) {
      setErrorMsg(e.message || 'Analysis failed. Please check network or API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanBulk = async () => {
    const urls = bulkInput
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urls.length === 0) {
      setErrorMsg('Please enter at least one URL (one per line) for bulk scanning.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setCurrentReport(null);
    setBulkResults(null);
    setSelectedBulkDetail(null);

    try {
      const results = await ThreatEngineService.analyzeBulkUrls(urls);
      setBulkResults(results);
    } catch (e: any) {
      setErrorMsg(e.message || 'Bulk scan failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setSingleUrl(sampleUrl);
    handleScanSingle(sampleUrl);
  };

  const loadBulkSamples = () => {
    const list = SAMPLE_URLS.map(s => s.url).join('\n');
    setBulkInput(list);
  };

  // Bulk stats calculations
  const bulkStats = bulkResults ? {
    total: bulkResults.length,
    dangerous: bulkResults.filter(r => r.verdict === 'Dangerous').length,
    caution: bulkResults.filter(r => r.verdict === 'Caution').length,
    safe: bulkResults.filter(r => r.verdict === 'Safe').length,
  } : null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Banner & Sub-mode switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">◆</span>
            <h2 className="font-minimal font-extrabold text-2xl text-white tracking-wide">
              URL Threat & Phishing Detection
            </h2>
            <span className="text-cyan-400 font-bold">◆</span>
          </div>
          <p className="text-xs text-gray-400 font-minimal mt-1">
            Analyze domains, redirect paths, defacement indicators, and credential-harvesting lures.
          </p>
        </div>

        {/* Single vs Bulk switch */}
        <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setScanMode('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-minimal font-semibold flex items-center gap-1.5 transition-all ${
              scanMode === 'single'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Single URL</span>
          </button>

          <button
            onClick={() => setScanMode('bulk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-minimal font-semibold flex items-center gap-1.5 transition-all ${
              scanMode === 'bulk'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Batch Scan</span>
          </button>
        </div>
      </div>

      {/* Input Section */}
      {scanMode === 'single' ? (
        <div className="glass rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-minimal font-semibold text-gray-300 uppercase tracking-wider">
              Target Domain or Full URL
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteSingle}
                className={`px-2.5 py-1 rounded-lg border text-xs font-minimal flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                  justPastedSingle
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50'
                    : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/35'
                }`}
                title="Paste URL directly from clipboard"
              >
                {justPastedSingle ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-emerald-300">Pasted!</span>
                  </>
                ) : (
                  <>
                    <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold">Paste URL</span>
                  </>
                )}
              </button>

              {singleUrl && (
                <>
                  <button
                    type="button"
                    onClick={handleCopySingle}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-minimal flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="Copy current URL to clipboard"
                  >
                    {copiedSingle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    <span>{copiedSingle ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleUrl('')}
                    className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-1"
                    title="Clear input"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 pointer-events-none text-gray-500">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>

            <input
              ref={singleInputRef}
              type="text"
              value={singleUrl}
              onChange={(e) => {
                setSingleUrl(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onPaste={(e) => {
                const text = e.clipboardData?.getData('text/plain') || e.clipboardData?.getData('text');
                if (text && !singleUrl.trim()) {
                  e.preventDefault();
                  setSingleUrl(text.trim());
                  setErrorMsg('');
                }
                // If singleUrl already has content, native paste inserts cleanly at cursor
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleScanSingle()}
              placeholder="Paste or type URL: https://example.com/login or domain.com"
              className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-sm font-code text-white placeholder-gray-500 transition-colors shadow-inner"
            />

            {singleUrl && (
              <button
                onClick={() => setSingleUrl('')}
                className="absolute right-24 text-gray-400 hover:text-gray-200 p-1"
                title="Clear input"
              >
                ✕
              </button>
            )}

            <button
              onClick={() => handleScanSingle()}
              disabled={loading}
              className="absolute right-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-minimal font-bold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Scan</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Samples */}
          <div className="pt-2">
            <div className="text-[11px] font-minimal text-gray-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Or test with verified threat benchmarks (click to scan, or copy to clipboard):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_URLS.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSample(sample.url)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-xs font-minimal text-gray-300 hover:text-cyan-200 transition-all flex items-center gap-1.5 group cursor-pointer"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    sample.expected === 'Dangerous' ? 'bg-rose-400' : sample.expected === 'Caution' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span>{sample.label}</span>

                  <button
                    type="button"
                    onClick={(e) => handleCopyPresetUrl(e, sample.url, idx)}
                    className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-cyan-300 transition-colors ml-1"
                    title={`Copy "${sample.url}" to clipboard`}
                  >
                    {copiedPresetIdx === idx ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>

                  <span className="text-[10px] text-gray-500 group-hover:text-cyan-400">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Bulk Batch Mode */
        <div className="glass rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-minimal font-semibold text-gray-300 uppercase tracking-wider">
              Batch URLs to analyze (one per line)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteBulk}
                className={`px-2.5 py-1 rounded-lg border text-xs font-minimal flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                  justPastedBulk
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50'
                    : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/35'
                }`}
                title="Paste multiple URLs from clipboard"
              >
                {justPastedBulk ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-emerald-300">Pasted!</span>
                  </>
                ) : (
                  <>
                    <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold">Paste from Clipboard</span>
                  </>
                )}
              </button>

              {bulkInput && (
                <>
                  <button
                    type="button"
                    onClick={handleCopyBulk}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-minimal flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="Copy all URLs in box"
                  >
                    {copiedBulk ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    <span>{copiedBulk ? 'Copied' : 'Copy All'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkInput('')}
                    className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-1"
                    title="Clear box"
                  >
                    Clear
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={loadBulkSamples}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-minimal flex items-center gap-1 cursor-pointer"
              >
                <span>Load Benchmark Set</span>
              </button>
            </div>
          </div>

          <textarea
            ref={bulkTextareaRef}
            rows={5}
            value={bulkInput}
            onChange={(e) => {
              setBulkInput(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            onPaste={(e) => {
              const text = e.clipboardData?.getData('text/plain') || e.clipboardData?.getData('text');
              if (text && !bulkInput.trim()) {
                e.preventDefault();
                setBulkInput(text.trim());
                setErrorMsg('');
              }
            }}
            placeholder={`https://chase-bank-verify.top\nhttp://fake-bank.com/login\nhttps://github.com\nhttps://google.com`}
            className="w-full p-4 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-xs font-code text-white placeholder-gray-500 transition-colors shadow-inner leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400 font-minimal">
              💡 Tip: Paste up to 50 URLs for concurrent neural analysis
            </span>

            <button
              onClick={handleScanBulk}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-minimal font-bold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Vectors...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Run Batch Scan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error notification */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-minimal flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Active Scan Animation Banner */}
      {loading && (
        <div className="glass-strong rounded-2xl p-8 border border-cyan-500/30 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mx-auto text-cyan-400">
            <Search className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="font-minimal font-bold text-base text-white tracking-wide">
              ANALYZING THREAT VECTORS...
            </h3>
            <p className="text-xs text-gray-400 font-minimal">
              Querying XGBoost domain classifier, extracting lexical features, and checking reputation signatures.
            </p>
          </div>
          <div className="w-64 h-1.5 bg-black/50 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 animate-[scan_2s_linear_infinite]" />
          </div>
        </div>
      )}

      {/* Single Report Output */}
      {currentReport && !loading && (
        <ThreatReportCard
          report={currentReport}
          onRescan={() => handleScanSingle(currentReport.target)}
          onReportFalsePositive={onReportFalsePositive}
        />
      )}

      {/* Bulk Results Overview */}
      {bulkResults && !loading && bulkStats && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-minimal font-bold text-lg text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Bulk Analysis Report ({bulkStats.total} URLs Analyzed)</span>
            </h3>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-xl border border-white/10">
              <div className="text-[11px] font-minimal text-gray-400 uppercase tracking-wider">Total Scanned</div>
              <div className="text-2xl font-bold font-code text-white mt-1">{bulkStats.total}</div>
            </div>

            <div className="glass p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
              <div className="text-[11px] font-minimal text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Dangerous</span>
              </div>
              <div className="text-2xl font-bold font-code text-rose-400 mt-1">{bulkStats.dangerous}</div>
            </div>

            <div className="glass p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <div className="text-[11px] font-minimal text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Caution</span>
              </div>
              <div className="text-2xl font-bold font-code text-amber-400 mt-1">{bulkStats.caution}</div>
            </div>

            <div className="glass p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="text-[11px] font-minimal text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Safe</span>
              </div>
              <div className="text-2xl font-bold font-code text-emerald-400 mt-1">{bulkStats.safe}</div>
            </div>
          </div>

          {/* Table / List of Bulk Results */}
          <div className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              {bulkResults.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-minimal uppercase ${
                          res.verdict === 'Dangerous'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : res.verdict === 'Caution'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {res.verdict}
                      </span>
                      <span className="text-[10px] text-gray-500 font-code">
                        Confidence: {res.confidenceScore}%
                      </span>
                    </div>
                    <div className="text-xs font-code text-cyan-200 truncate select-all">
                      {res.url}
                    </div>
                    <p className="text-[11px] text-gray-400 font-minimal line-clamp-1">
                      {res.explanation}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const rep: ThreatReport = {
                        id: 'bulk_' + idx,
                        timestamp: Date.now(),
                        type: 'URL',
                        target: res.url,
                        verdict: res.verdict,
                        confidenceScore: res.confidenceScore,
                        explanation: res.explanation,
                        riskFactors: res.riskFactors,
                        alternativeLinks: res.alternativeLinks,
                      };
                      setCurrentReport(rep);
                      setBulkResults(null);
                      setScanMode('single');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-minimal text-gray-300 hover:text-white transition-colors flex items-center gap-1 shrink-0 self-start sm:self-center"
                  >
                    <span>Inspect Full Report</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* In-App Direct Paste Dialog Fallback */}
      {pasteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-strong border border-cyan-500/40 p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-minimal font-bold text-base text-white flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-cyan-400" />
                <span>Quick Paste {pasteModal.type === 'single' ? 'URL' : 'Batch URLs'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setPasteModal({ open: false, type: 'single', tempText: '' })}
                className="text-gray-400 hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300 font-minimal leading-relaxed">
              Paste your link below using <kbd className="px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-cyan-300 font-code text-[11px]">Ctrl + V</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-cyan-300 font-code text-[11px]">Cmd + V</kbd>, or long-tap Paste — it will automatically detect and load:
            </p>

            <textarea
              autoFocus
              rows={4}
              value={pasteModal.tempText}
              onChange={(e) => setPasteModal(prev => ({ ...prev, tempText: e.target.value }))}
              onPaste={(e) => {
                const text = e.clipboardData?.getData('text/plain') || e.clipboardData?.getData('text');
                if (text && text.trim()) {
                  e.preventDefault();
                  if (pasteModal.type === 'single') {
                    setSingleUrl(text.trim());
                    setJustPastedSingle(true);
                    setTimeout(() => setJustPastedSingle(false), 2200);
                  } else {
                    setBulkInput(prev => prev ? `${prev}\n${text.trim()}` : text.trim());
                    setJustPastedBulk(true);
                    setTimeout(() => setJustPastedBulk(false), 2200);
                  }
                  setErrorMsg('');
                  setPasteModal({ open: false, type: 'single', tempText: '' });
                }
              }}
              placeholder={pasteModal.type === 'single' ? 'Paste URL here: https://example.com' : 'Paste batch URLs here (one per line)...'}
              className="w-full p-3.5 rounded-xl bg-black/60 border border-cyan-500/40 focus:border-cyan-400 text-xs font-code text-white focus:outline-none shadow-inner"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPasteModal({ open: false, type: 'single', tempText: '' })}
                className="px-4 py-2 rounded-xl text-xs font-minimal text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pasteModal.tempText.trim()) {
                    if (pasteModal.type === 'single') {
                      setSingleUrl(pasteModal.tempText.trim());
                      setJustPastedSingle(true);
                      setTimeout(() => setJustPastedSingle(false), 2200);
                    } else {
                      setBulkInput(prev => prev ? `${prev}\n${pasteModal.tempText.trim()}` : pasteModal.tempText.trim());
                      setJustPastedBulk(true);
                      setTimeout(() => setJustPastedBulk(false), 2200);
                    }
                    setErrorMsg('');
                  }
                  setPasteModal({ open: false, type: 'single', tempText: '' });
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-minimal font-bold text-xs shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                Insert & Continue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
