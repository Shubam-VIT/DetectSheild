import React, { useState } from 'react';
import { ThreatEngineService } from '../services/threatEngine';
import { ThreatReport } from '../types/threat';
import { SAMPLE_MESSAGES } from '../data/samples';
import { ThreatReportCard } from './ThreatReportCard';
import { 
  MessageSquare, 
  Sparkles, 
  AlertOctagon, 
  CheckCircle2, 
  Send, 
  FileText, 
  Cpu, 
  ShieldAlert,
  XCircle,
  HelpCircle,
  ClipboardPaste,
  Copy,
  Check
} from 'lucide-react';

interface MessageScannerProps {
  onScanComplete: (report: ThreatReport) => void;
  onReportFalsePositive: (report: ThreatReport) => void;
}

export const MessageScanner: React.FC<MessageScannerProps> = ({
  onScanComplete,
  onReportFalsePositive,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<ThreatReport | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Copy feedback states
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedSampleIdx, setCopiedSampleIdx] = useState<number | null>(null);
  const [justPastedMsg, setJustPastedMsg] = useState(false);

  // In-app fallback paste modal
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [tempPasteText, setTempPasteText] = useState('');
  const messageInputRef = React.useRef<HTMLTextAreaElement>(null);

  // Paste message from clipboard with multi-tier fallback
  const handlePasteMessage = async () => {
    // Tier 1: Try modern clipboard API
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setMessage(text.trim());
          setErrorMsg('');
          setJustPastedMsg(true);
          setTimeout(() => setJustPastedMsg(false), 2200);
          messageInputRef.current?.focus();
          return;
        }
      }
    } catch (err) {
      console.warn('Direct clipboard read restricted by browser/iframe:', err);
    }

    // Tier 2: Focus textarea and attempt execCommand paste
    if (messageInputRef.current) {
      messageInputRef.current.focus();
      messageInputRef.current.select();
      try {
        const success = document.execCommand('paste');
        if (success && messageInputRef.current.value) {
          setMessage(messageInputRef.current.value.trim());
          setErrorMsg('');
          setJustPastedMsg(true);
          setTimeout(() => setJustPastedMsg(false), 2200);
          return;
        }
      } catch {
        // execCommand not permitted
      }
    }

    // Tier 3: In-app paste dialog with auto-insert
    setTempPasteText('');
    setPasteModalOpen(true);
  };

  // Copy current message
  const handleCopyMessage = () => {
    if (!message.trim()) return;
    navigator.clipboard.writeText(message.trim());
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  // Copy a sample preset text
  const handleCopySample = (e: React.MouseEvent, text: string, idx: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedSampleIdx(idx);
    setTimeout(() => setCopiedSampleIdx(null), 2000);
  };

  const handleScanMessage = async (textToScan?: string) => {
    const text = (textToScan || message).trim();
    if (!text) {
      setErrorMsg('Please enter a message or SMS text to analyze.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const rep = await ThreatEngineService.analyzeMessage(text);
      setCurrentReport(rep);
      onScanComplete(rep);
    } catch (e: any) {
      setErrorMsg(e.message || 'Message analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setMessage(sampleText);
    handleScanMessage(sampleText);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-bold">◆</span>
          <h2 className="font-minimal font-extrabold text-2xl text-white tracking-wide">
            SMS Phishing & Spam Neural Classifier
          </h2>
          <span className="text-purple-400 font-bold">◆</span>
        </div>
        <p className="text-xs text-gray-400 font-minimal mt-1">
          Bi-LSTM Deep Learning model trained on global smishing datasets to detect urgent psychological lures and credential theft.
        </p>
      </div>

      {/* Model Badges */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs font-minimal text-purple-300">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Architecture: <strong>Bi-Directional LSTM Neural Network</strong></span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-xs font-minimal text-cyan-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Feature Extraction: <strong>Sub-word & Lexical Urgency Tokenizer</strong></span>
        </div>
      </div>

      {/* Input Card */}
      <div className="glass rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-xs font-minimal font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>SMS Message or Unsolicited Communication Body</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteMessage}
              className={`px-2.5 py-1 rounded-lg border text-xs font-minimal flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                justPastedMsg
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50'
                  : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-500/35'
              }`}
              title="Paste SMS message from clipboard"
            >
              {justPastedMsg ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-emerald-300">Pasted!</span>
                </>
              ) : (
                <>
                  <ClipboardPaste className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-semibold">Paste Message</span>
                </>
              )}
            </button>

            {message && (
              <>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-minimal flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  title="Copy current message text"
                >
                  {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  <span>{copiedMsg ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMessage('')}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-1"
                  title="Clear input"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        <textarea
          ref={messageInputRef}
          rows={4}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          onPaste={(e) => {
            const text = e.clipboardData?.getData('text/plain') || e.clipboardData?.getData('text');
            if (text && !message.trim()) {
              e.preventDefault();
              setMessage(text.trim());
              setErrorMsg('');
            }
          }}
          placeholder="Paste SMS text message, WhatsApp notice, or unsolicited security alert..."
          className="w-full p-4 rounded-xl bg-black/50 border border-white/15 focus:border-purple-400 focus:outline-none text-xs font-code text-white placeholder-gray-500 transition-colors shadow-inner leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-[11px] font-minimal text-gray-400">
            Char count: {message.length} &bull; Real-time tokenizer active
          </div>

          <button
            onClick={() => handleScanMessage()}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-minimal font-bold text-xs shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Classifying Tokens...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Analyze Message</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Samples */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-[11px] font-minimal text-gray-400 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Select a test case to evaluate classifier accuracy (click to test, or copy text):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SAMPLE_MESSAGES.map((sample, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSample(sample.text)}
                className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/30 text-left transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-minimal font-semibold text-gray-200 group-hover:text-purple-300">
                      {sample.title}
                    </span>
                    <span
                      className={`text-[9px] font-code font-bold uppercase px-1.5 py-0.2 rounded ${
                        sample.type === 'Dangerous'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {sample.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-code line-clamp-2">
                    "{sample.text}"
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-purple-300 group-hover:underline">
                    Run Analysis →
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopySample(e, sample.text, idx)}
                    className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-purple-300 transition-colors flex items-center gap-1 text-[10px]"
                    title="Copy this SMS to clipboard"
                  >
                    {copiedSampleIdx === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error notification */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-minimal flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Scanning status banner */}
      {loading && (
        <div className="glass-strong rounded-2xl p-8 border border-purple-500/30 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mx-auto text-purple-400">
            <Cpu className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="font-minimal font-bold text-base text-white tracking-wide">
              RUNNING Bi-LSTM NEURAL INFERENCE...
            </h3>
            <p className="text-xs text-gray-400 font-minimal">
              Evaluating psychological pressure indicators, token sequence probabilities, and financial trigger matrices.
            </p>
          </div>
          <div className="w-64 h-1.5 bg-black/50 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-[scan_2s_linear_infinite]" />
          </div>
        </div>
      )}

      {/* Output Report */}
      {currentReport && !loading && (
        <ThreatReportCard
          report={currentReport}
          onRescan={() => handleScanMessage(currentReport.target)}
          onReportFalsePositive={onReportFalsePositive}
        />
      )}

      {/* In-App Direct Paste Dialog Fallback */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-strong border border-purple-500/40 p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-minimal font-bold text-base text-white flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-purple-400" />
                <span>Quick Paste SMS Message</span>
              </h4>
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300 font-minimal leading-relaxed">
              Paste your message below using <kbd className="px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-purple-300 font-code text-[11px]">Ctrl + V</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-purple-300 font-code text-[11px]">Cmd + V</kbd>, or long-tap Paste — it will automatically detect and load:
            </p>

            <textarea
              autoFocus
              rows={4}
              value={tempPasteText}
              onChange={(e) => setTempPasteText(e.target.value)}
              onPaste={(e) => {
                const text = e.clipboardData?.getData('text/plain') || e.clipboardData?.getData('text');
                if (text && text.trim()) {
                  e.preventDefault();
                  setMessage(text.trim());
                  setErrorMsg('');
                  setJustPastedMsg(true);
                  setTimeout(() => setJustPastedMsg(false), 2200);
                  setPasteModalOpen(false);
                }
              }}
              placeholder="Paste SMS text message body here..."
              className="w-full p-3.5 rounded-xl bg-black/60 border border-purple-500/40 focus:border-purple-400 text-xs font-code text-white focus:outline-none shadow-inner leading-relaxed"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-minimal text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempPasteText.trim()) {
                    setMessage(tempPasteText.trim());
                    setErrorMsg('');
                    setJustPastedMsg(true);
                    setTimeout(() => setJustPastedMsg(false), 2200);
                  }
                  setPasteModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-minimal font-bold text-xs shadow-lg shadow-purple-500/25 cursor-pointer"
              >
                Insert Message
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
