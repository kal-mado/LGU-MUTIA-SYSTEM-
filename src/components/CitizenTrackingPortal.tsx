import React, { useState, useRef } from 'react';
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
  Printer,
  Paperclip,
  Upload,
  Eye,
  X,
  FolderOpen
} from 'lucide-react';
import { DEPARTMENTS, CLASSIFICATION_RULES } from '../data/mockData';
import { formatDate, getSLACountdownText, getSLAStatus, formatBytes, getFileTypeDetails } from '../utils/helpers';
import { DocumentItem } from '../types';

export const CitizenTrackingPortal: React.FC = () => {
  const { documents, setRoutingSlipDocId, addToast, addAttachmentsToDocument } = useDocTrack();
  const [trackInput, setTrackInput] = useState('');
  const [trackedDoc, setTrackedDoc] = useState<DocumentItem | null>(() => {
    // Default show Highlands Agri-Trading permit for immediate rich display
    return documents.find(d => d.id === 'LGU-BPLO-20260912-0018') || documents[0] || null;
  });
  const [hasSearched, setHasSearched] = useState(true);
  const [isScanningQR, setIsScanningQR] = useState(false);

  // File upload state in portal
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ name: string; size: string; type: string; url?: string } | null>(null);

  const processIncomingFiles = (incomingFiles: FileList | File[]) => {
    const filesArray = Array.from(incomingFiles);
    if (filesArray.length === 0 || !trackedDoc) return;

    const newAttachments = filesArray.map(file => {
      let objectUrl: string | undefined;
      try {
        objectUrl = URL.createObjectURL(file);
      } catch {
        // Fallback
      }

      return {
        name: file.name,
        size: formatBytes(file.size),
        type: file.type || 'application/octet-stream',
        url: objectUrl
      };
    });

    addAttachmentsToDocument(trackedDoc.id, newAttachments);
    // Update local trackedDoc view
    setTrackedDoc(prev => prev ? {
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    } : null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleBrowseFolderClick = () => {
    fileInputRef.current?.click();
  };

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

              {/* Submitted Attachments & Citizen Compliance Section */}
              <div className="p-6 border-t border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-blue-900" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Accompanying Documents & Verification Records
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {trackedDoc.attachments.length} attached
                  </span>
                </div>

                {/* File Cards */}
                {trackedDoc.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {trackedDoc.attachments.map((file, i) => {
                      const typeInfo = getFileTypeDetails(file.name, file.type);
                      return (
                        <div
                          key={i}
                          className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${typeInfo.badgeColor}`}>
                              {typeInfo.badge}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-900 truncate" title={file.name}>
                                {file.name}
                              </div>
                              <div className="text-[10px] text-slate-500">{file.size} • Verified Valid</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-900 text-slate-700 font-semibold border border-slate-200 rounded-md shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 bg-white border border-dashed rounded-xl">
                    No attachments logged for this transaction.
                  </div>
                )}

                {/* Citizen Compliance Upload Box (Especially if On Hold or action requested) */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Submit Additional Documentary Compliance (Optional)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Word, PDF, Excel, JPG, and other file types accepted
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="citizen-portal-file-input"
                    aria-label="Upload citizen compliance documents"
                  />

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleBrowseFolderClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-100'
                        : 'border-slate-300 hover:border-emerald-600 hover:bg-white bg-white/70'
                    }`}
                  >
                    <Upload className="w-4 h-4 mx-auto text-emerald-700 mb-1" />
                    <div className="text-xs font-bold text-slate-800">
                      Click to browse your device folder or drag & drop files here
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Upload supporting affidavits, scanned receipts, revised forms, or required attachments
                    </div>
                  </div>
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

      {/* Quick Attachment Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-xs truncate">{previewFile.name}</span>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 text-center">
              {previewFile.type.startsWith('image/') && previewFile.url ? (
                <div className="max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 mb-3 flex items-center justify-center">
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-h-72 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 mb-3 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    {getFileTypeDetails(previewFile.name, previewFile.type).badge}
                  </div>
                  <div className="font-bold text-sm text-slate-800">{previewFile.name}</div>
                  <div className="text-xs text-slate-500">
                    Size: {previewFile.size} • Format: {getFileTypeDetails(previewFile.name, previewFile.type).extension.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 py-1 px-3 rounded-md inline-block font-semibold">
                    Document verified under RA 11032 compliance log
                  </div>
                </div>
              )}

              {previewFile.url && (
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 rotate-180" />
                  <span>Download / Open Original File</span>
                </a>
              )}
            </div>

            <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
