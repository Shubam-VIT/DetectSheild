import React, { useState, useEffect } from 'react';
import { ThreatReport } from '../types/threat';
import { 
  X, 
  Flag, 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  FileText 
} from 'lucide-react';

interface CommunityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReport?: ThreatReport | null;
}

export const CommunityReportModal: React.FC<CommunityReportModalProps> = ({
  isOpen,
  onClose,
  initialReport,
}) => {
  const [reportType, setReportType] = useState<'false_positive' | 'new_threat'>('false_positive');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('Phishing');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialReport) {
      setTarget(initialReport.target);
      setReportType('false_positive');
      setDetails(`Audit ID: ${initialReport.id}. Initial verdict was ${initialReport.verdict} (${initialReport.confidenceScore}% confidence).`);
    } else {
      setTarget('');
      setDetails('');
      setReportType('new_threat');
    }
    setSubmitted(false);
  }, [initialReport, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;

    // Save report in local list
    const existingReports = JSON.parse(localStorage.getItem('detectshield_community_reports') || '[]');
    existingReports.push({
      id: 'rep_' + Date.now(),
      timestamp: Date.now(),
      type: reportType,
      target,
      category,
      details,
    });
    localStorage.setItem('detectshield_community_reports', JSON.stringify(existingReports));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl glass-strong border border-rose-500/30 p-6 sm:p-8 flex flex-col shadow-2xl space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-minimal font-bold text-xl text-white">
                Threat Intelligence Report
              </h3>
              <p className="text-xs text-gray-400 font-minimal">
                Submit threat telemetry or report a false positive
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

        {submitted ? (
          <div className="text-center py-10 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-minimal font-bold text-lg text-white">
              Report Submitted Successfully
            </h4>
            <p className="text-xs text-gray-400 font-minimal">
              Thank you for strengthening DetectShield's neural classification benchmarks.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => setReportType('false_positive')}
                className={`py-2 rounded-lg text-xs font-minimal font-semibold transition-all ${
                  reportType === 'false_positive'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Report False Positive
              </button>

              <button
                type="button"
                onClick={() => setReportType('new_threat')}
                className={`py-2 rounded-lg text-xs font-minimal font-semibold transition-all ${
                  reportType === 'new_threat'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Submit Malicious Target
              </button>
            </div>

            {/* Target */}
            <div>
              <label className="block text-xs font-minimal font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Target Identifier (URL, Message, or Package Name)
              </label>
              <input
                type="text"
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="https://malicious-link.top or +1 (800) xxx-xxxx"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-rose-400 focus:outline-none text-xs font-code text-white"
              />
            </div>

            {/* Threat Category */}
            <div>
              <label className="block text-xs font-minimal font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Threat Classification
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-rose-400 focus:outline-none text-xs font-minimal text-white"
              >
                <option value="Phishing">Phishing & Credential Theft</option>
                <option value="Social Engineering">Social Engineering (Urgent SMS / Smishing)</option>
                <option value="Malware">Malware / Trojan Distribution</option>
                <option value="Defacement">Domain Defacement / Brand Spoof</option>
                <option value="Permission Overreach">Excessive Android Permissions</option>
                <option value="Clean / Legit">Verified Safe (False Positive)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-minimal font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Analyst Notes / Evidence
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe why this target is malicious or why the previous verdict was incorrect..."
                className="w-full p-3 rounded-xl bg-black/50 border border-white/15 focus:border-rose-400 focus:outline-none text-xs font-minimal text-white placeholder-gray-500"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-minimal text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-minimal font-bold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to DetectShield</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
