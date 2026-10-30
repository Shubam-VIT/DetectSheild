import React, { useState } from 'react';
import { ThreatReport } from '../types/threat';
import { 
  X, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface AnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ThreatReport[];
  onSelectReport: (report: ThreatReport) => void;
  onClearHistory: () => void;
}

export const AnalysisHistoryModal: React.FC<AnalysisHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectReport,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVerdict = filterVerdict === 'ALL' || item.verdict.toUpperCase() === filterVerdict;
    const matchesType = filterType === 'ALL' || item.type === filterType;

    return matchesSearch && matchesVerdict && matchesType;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `detectshield_threat_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl glass-strong border border-cyan-500/30 flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-minimal font-bold text-xl text-white">
                Threat Audit History
              </h3>
              <p className="text-xs text-gray-400 font-minimal">
                Recorded scan results and vector classifications ({history.length} logged)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportJson}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-minimal text-gray-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export JSON</span>
                </button>
                <button
                  onClick={onClearHistory}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-minimal text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search target domain, message text, or threat..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-minimal text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs font-minimal text-gray-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Types</option>
              <option value="URL">URL Scans</option>
              <option value="MESSAGE">SMS Scans</option>
              <option value="APP">App Audits</option>
            </select>

            <select
              value={filterVerdict}
              onChange={(e) => setFilterVerdict(e.target.value)}
              className="px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs font-minimal text-gray-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Verdicts</option>
              <option value="DANGEROUS">Dangerous</option>
              <option value="CAUTION">Caution</option>
              <option value="SAFE">Safe</option>
            </select>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-500 space-y-2">
              <div className="text-3xl">📭</div>
              <p className="text-sm font-minimal">No threat analysis logs match your criteria.</p>
              <p className="text-xs font-minimal text-gray-600">Scan URLs, SMS phishing, or apps to build history.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectReport(item);
                  onClose();
                }}
                className="p-4 rounded-xl glass hover:border-cyan-500/40 border border-white/10 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-minimal uppercase ${
                        item.verdict === 'Dangerous'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : item.verdict === 'Caution'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {item.verdict}
                    </span>

                    <span className="text-[10px] font-minimal font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10 uppercase">
                      {item.type}
                    </span>

                    <span className="text-[11px] text-gray-500 font-code">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>

                    <span className="text-[11px] text-cyan-400 font-code ml-auto sm:ml-0">
                      Conf: {item.confidenceScore}%
                    </span>
                  </div>

                  <div className="text-xs font-code text-white group-hover:text-cyan-300 transition-colors truncate">
                    {item.target}
                  </div>

                  <p className="text-[11px] text-gray-400 font-minimal line-clamp-1">
                    {item.explanation}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-cyan-400 shrink-0 self-end sm:self-center">
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/50 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-minimal">
          <span>🔒 Analysis logs are stored client-side in secure sandbox memory.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
