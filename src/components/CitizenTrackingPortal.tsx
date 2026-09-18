import React, { useState } from 'react';
import { useDocTrack } from '../context/DocTrackContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import { 
  Search, 
  QrCode, 
  Clock, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  HelpCircle, 
  Calendar, 
  FileText,
  MapPin,
  ExternalLink,
  Printer
} from 'lucide-react';
import { DEPARTMENTS, CLASSIFICATION_RULES } from '../data/mockData';
import { formatDate, getSLACountdownText, getSLAStatus } from '../utils/helpers';
import { DocumentItem } from '../types';

export const CitizenTrackingPortal: React.FC = () => {
  const { documents, setRoutingSlipDocId, addToast } = useDocTrack();
  const [trackInput, setTrackInput] = useState('');
  const [trackedDoc, setTrackedDoc] = useState<DocumentItem | null>(() => {
    // Default show Highlands Agri-Trading permit for immediate rich display
    return documents.find(d => d.id === 'LGU-BPLO-20260912-0018') || documents[0] || null;
  });
  const [hasSearched, setHasSearched] = useState(true);
  const [isScanningQR, setIsScanningQR] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = trackInput.trim().toUpperCase();
    if (!query) return;

    const found = documents.find(
      d => d.id.toUpperCase() === query || d.id.toUpperCase().includes(query)
    );

    if (found) {
      setTrackedDoc(found);
      setHasSearched(true);
      addToast(`Document ${found.id} located successfully`, 'success');
    } else {
      setTrackedDoc(null);
      setHasSearched(true);
      addToast(`Tracking number "${query}" not found in Municipal Registry`, 'error');
    }
  };

  const handleSelectSample = (id: string) => {
    setTrackInput(id);
    const found = documents.find(d => d.id === id);
    if (found) {
      setTrackedDoc(found);
      setHasSearched(true);
    }
  };

  const handleSimulateQRScan = (id: string) => {
    setIsScanningQR(false);
    handleSelectSample(id);
    addToast('Simulated QR Code scanned successfully!', 'success');
  };

  // Progress calculation
  const getProgressPercentage = (doc: DocumentItem) => {
    if (doc.status === 'Completed') return 100;
    const totalSteps = Math.max(doc.routingSequence.length, 3);
    const completedSteps = doc.routingSequence.filter(s => s.status === 'COMPLETED').length;
    const base = (completedSteps / totalSteps) * 100;
    return Math.min(90, Math.max(20, Math.round(base)));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Citizen Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 rounded-3xl text-white p-6 sm:p-8 shadow-lg border border-emerald-900/40 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Public Citizen e-Governance Portal • No Login Required
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Track Your Municipal Application in Real Time
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Monitor the exact office location, action officer, and statutory processing deadlines 
            for permits, licenses, clearances, and petitions under Republic Act 11032.
          </p>
        </div>

        {/* Floating Seal Graphic */}
        <div className="absolute right-5 bottom-0 opacity-10 sm:opacity-20 pointer-events-none transform translate-y-6">
          <Building2 className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Tracker Search Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Enter Document Tracking Code or Scan QR Slip:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={trackInput}
                onChange={e => setTrackInput(e.target.value)}
                placeholder="Format: LGU-BPLO-20260912-0018"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-mono font-bold text-slate-900 transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Track Document</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScanningQR(true)}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
              title="Simulate Mobile Camera QR Scanner"
            >
              <QrCode className="w-4 h-4 text-blue-900" />
              <span>Scan QR</span>
            </button>
          </div>

          {/* Quick Click Samples */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Quick Test Codes:</span>
            {documents.slice(0, 4).map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleSelectSample(d.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] border border-slate-200 transition-colors cursor-pointer"
              >
                {d.id.slice(0, 16)}...
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Tracked Document Result View */}
      {hasSearched && (
        trackedDoc ? (
          <div className="space-y-6">
            {/* Primary Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Top Banner */}
              <div className="bg-slate-900 text-white p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-amber-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {trackedDoc.id}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300">{trackedDoc.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1.5 leading-snug">
                    {trackedDoc.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1">
                    Filed by: <strong className="text-slate-200">{trackedDoc.requestorName}</strong> on {formatDate(trackedDoc.createdAt)}
                  </div>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => setRoutingSlipDocId(trackedDoc.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Routing Slip</span>
                  </button>
                </div>
              </div>

              {/* Citizen Action Advisory Callout */}
              {trackedDoc.citizenActionRequired && (
                <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                      Immediate Citizen Advisory / Action Required:
                    </div>
                    <div className="text-amber-900 mt-0.5 text-sm font-semibold leading-relaxed">
                      {trackedDoc.citizenActionRequired}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress & SLA Meter */}
              <div className="p-6 border-b border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Application Status: </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {trackedDoc.status === 'Completed' ? 'Permit Released / Completed' : `Under Processing at ${DEPARTMENTS[trackedDoc.currentOffice]?.shortName}`}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {getProgressPercentage(trackedDoc)}% Completed
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      trackedDoc.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-900'
                    }`}
                    style={{ width: `${getProgressPercentage(trackedDoc)}%` }}
                  />
                </div>

                {/* SLA Timer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Station</span>
                    <div className="font-bold text-blue-900 text-sm mt-0.5">
                      {DEPARTMENTS[trackedDoc.currentOffice]?.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Frontline Office: Ground Floor, Municipal Hall
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">RA 11032 Classification</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {CLASSIFICATION_RULES[trackedDoc.classification]?.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Max Statutory Limit: {CLASSIFICATION_RULES[trackedDoc.classification]?.maxDays} Working Days
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Statutory Target Date</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {formatDate(trackedDoc.deadlineAt)}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      {getSLACountdownText(trackedDoc).text}
                    </div>
                  </div>
                </div>
              </div>

              {/* Public Timeline Visualizer */}
              <div className="p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Step-by-Step Processing Trail
                </h4>

                <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {trackedDoc.routingSequence.map((step, idx) => {
                    const isDone = step.status === 'COMPLETED' || trackedDoc.status === 'Completed';
                    const isCurrent = step.office === trackedDoc.currentOffice && trackedDoc.status !== 'Completed';
                    const dept = DEPARTMENTS[step.office];

                    return (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shadow-2xs ${
                          isDone 
                            ? 'bg-emerald-600 border-white text-white' 
                            : isCurrent 
                            ? 'bg-blue-900 border-white text-amber-300 ring-4 ring-blue-100'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>

                        <div className={`p-3.5 rounded-xl border text-xs ${
                          isCurrent ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">
                              {dept?.name || step.officeName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {step.receivedAt ? formatDate(step.receivedAt) : 'Upcoming'}
                            </span>
                          </div>
                          {step.remarks && (
                            <p className="mt-1 text-slate-600 italic">
                              "{step.remarks}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Municipal Hall Help Desk Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-900" />
                  <span>Public Assistance & Complaints Desk (PACD): Ground Floor Lobby</span>
                </div>
                <div>
                  Hotline: <strong className="text-slate-800">(072) 888-2026</strong> • ARTA Hotline: <strong className="text-slate-800">8888</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">No Document Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please check the tracking number format on your physical routing slip or receipt 
              (e.g., LGU-BPLO-20260912-0018).
            </p>
          </div>
        )
      )}

      {/* Mock QR Scanner Modal */}
      {isScanningQR && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-center p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">QR Code Camera Scanner</h3>
            <p className="text-xs text-slate-500">
              Align the QR code printed on your official LGU routing slip within the viewfinder frame.
            </p>

            <div className="relative w-64 h-64 mx-auto rounded-2xl bg-slate-900 border-4 border-emerald-500 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-bounce"></div>
              <QrCode className="w-24 h-24 text-slate-600 opacity-40" />
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-[11px] text-slate-400 font-medium">Click a demo sample to simulate camera scan:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {documents.slice(0, 4).map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleSimulateQRScan(d.id)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-900 font-mono text-[11px] font-semibold border border-slate-200 truncate cursor-pointer"
                  >
                    {d.id}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsScanningQR(false)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
