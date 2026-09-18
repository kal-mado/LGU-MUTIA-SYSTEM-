import React, { useState, useRef } from 'react';
import { useDocTrack } from '../context/DocTrackContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  FileText, 
  Printer, 
  ShieldAlert, 
  ArrowRight, 
  Building2, 
  Paperclip, 
  UserCheck, 
  Calendar, 
  Check, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  PauseCircle,
  XCircle,
  RotateCcw,
  Upload,
  FolderOpen,
  Eye,
  Trash2
} from 'lucide-react';
import { DEPARTMENTS, CLASSIFICATION_RULES } from '../data/mockData';
import { DepartmentCode } from '../types';
import { formatDate, getSLACountdownText, getSLAStatus, formatBytes, getFileTypeDetails } from '../utils/helpers';

export const DocumentDetailModal: React.FC = () => {
  const { 
    selectedDoc, 
    setSelectedDocId, 
    activeRole, 
    activeDepartment,
    receiveDocument,
    forwardDocument,
    approveDocument,
    disapproveDocument,
    putOnHold,
    completeDocument,
    addAttachmentsToDocument,
    setRoutingSlipDocId,
    addToast
  } = useDocTrack();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'timeline' | 'actions' | 'audit' | 'files'>('timeline');
  
  // Action form state
  const [forwardToDept, setForwardToDept] = useState<DepartmentCode>('BPLO');
  const [actionRemarks, setActionRemarks] = useState('');
  const [citizenInstructions, setCitizenInstructions] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // File upload state in detail modal
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ name: string; size: string; type: string; url?: string } | null>(null);

  if (!selectedDoc) return null;

  const processIncomingFiles = (incomingFiles: FileList | File[]) => {
    const filesArray = Array.from(incomingFiles);
    if (filesArray.length === 0 || !selectedDoc) return;

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

    addAttachmentsToDocument(selectedDoc.id, newAttachments);
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

  const rule = CLASSIFICATION_RULES[selectedDoc.classification];
  const slaStatus = getSLAStatus(selectedDoc);
  const countdown = getSLACountdownText(selectedDoc);
  const currentDept = DEPARTMENTS[selectedDoc.currentOffice];

  const isAssignedToActiveStation = selectedDoc.currentOffice === activeDepartment;
  const isToReceive = selectedDoc.status === 'To Receive';

  const handleReceive = () => {
    receiveDocument(selectedDoc.id, actionRemarks || `Acknowledged and received by ${currentDept?.shortName}`);
    setActionRemarks('');
  };

  const handleForward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionRemarks.trim()) {
      addToast('Please enter action remarks or forwarding instructions', 'warning');
      return;
    }
    forwardDocument(selectedDoc.id, forwardToDept, actionRemarks);
    setActionRemarks('');
  };

  const handleApprove = () => {
    approveDocument(selectedDoc.id, actionRemarks || 'Endorsed and approved', forwardToDept !== selectedDoc.currentOffice ? forwardToDept : undefined);
    setActionRemarks('');
  };

  const handleDisapprove = () => {
    if (!actionRemarks.trim()) {
      addToast('Please specify the legal basis or reason for disapproval', 'warning');
      return;
    }
    disapproveDocument(selectedDoc.id, actionRemarks);
    setActionRemarks('');
  };

  const handlePutOnHold = () => {
    if (!actionRemarks.trim()) {
      addToast('Please enter the reason for placing on hold', 'warning');
      return;
    }
    putOnHold(selectedDoc.id, actionRemarks, citizenInstructions);
    setActionRemarks('');
    setCitizenInstructions('');
  };

  const handleComplete = () => {
    completeDocument(selectedDoc.id, actionRemarks || 'Final permits stamped and released.');
    setActionRemarks('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center text-amber-400 shrink-0 font-mono font-bold text-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {selectedDoc.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  selectedDoc.status === 'Completed'
                    ? 'bg-emerald-600 text-white'
                    : selectedDoc.status === 'On Hold'
                    ? 'bg-amber-600 text-white'
                    : selectedDoc.status === 'Disapproved'
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {selectedDoc.status}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  selectedDoc.priority === 'Urgent'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {selectedDoc.priority} Priority
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1 leading-snug">
                {selectedDoc.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRoutingSlipDocId(selectedDoc.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Routing Slip</span>
            </button>
            <button
              onClick={() => setSelectedDocId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SLA Status Banner */}
        <div className={`px-6 py-2.5 flex items-center justify-between text-xs font-medium border-b ${
          slaStatus === 'OVERDUE'
            ? 'bg-red-50 text-red-900 border-red-200'
            : slaStatus === 'WARNING'
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {slaStatus === 'OVERDUE' ? (
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            ) : slaStatus === 'WARNING' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">RA 11032 SLA Status:</span>{' '}
              <span className="font-semibold">{countdown.text}</span>{' '}
              <span className="text-slate-600">
                (Standard: {rule?.label} - {rule?.maxDays} working days limit)
              </span>
            </div>
          </div>
          <div className="hidden sm:block text-[11px] font-mono text-slate-600">
            Legal Deadline: {formatDate(selectedDoc.deadlineAt)}
          </div>
        </div>

        {/* Subnav Tabs */}
        <div className="bg-slate-100 px-6 border-b border-slate-200 flex gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Routing Chain
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'actions'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Department Actions</span>
            {isAssignedToActiveStation && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Trail ({selectedDoc.history.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Attachments ({selectedDoc.attachments.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: LIVE ROUTING CHAIN */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Current Station</div>
                  <div className="text-sm font-bold text-blue-950 mt-0.5">{currentDept?.name}</div>
                  <div className="text-[11px] text-slate-500">Officer: {currentDept?.defaultActionOfficer}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Requestor Information</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedDoc.requestorName}</div>
                  <div className="text-[11px] text-slate-500">{selectedDoc.requestorType} • {selectedDoc.requestorPhone}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Days in Processing</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <span>{selectedDoc.daysSpent} days elapsed</span>
                    <span className="text-xs text-slate-400">/ {rule?.maxDays}d max</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${slaStatus === 'OVERDUE' ? 'bg-red-600' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(100, (selectedDoc.daysSpent / (rule?.maxDays || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Citizen Instructions Callout */}
              {selectedDoc.citizenActionRequired && (
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Next Action / Citizen Advisory:</span>{' '}
                    {selectedDoc.citizenActionRequired}
                  </div>
                </div>
              )}

              {/* Node-based Routing Steps Visualizer */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Document Routing Sequence & Flow
                </h4>
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {selectedDoc.routingSequence.map((step, idx) => {
                    const isCurrent = step.office === selectedDoc.currentOffice && selectedDoc.status !== 'Completed';
                    const isDone = step.status === 'COMPLETED' || selectedDoc.status === 'Completed';
                    const dept = DEPARTMENTS[step.office];

                    return (
                      <div key={idx} className="relative group">
                        {/* Node Bullet */}
                        <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-xs transition-all ${
                          isDone 
                            ? 'bg-emerald-600 border-white text-white' 
                            : isCurrent 
                            ? 'bg-blue-900 border-white text-amber-300 ring-4 ring-blue-100 animate-pulse'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}>
                          {isDone ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Step Card */}
                        <div className={`p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-blue-50/40 border-blue-300 shadow-xs'
                            : isDone
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-50/60 border-slate-200/60 opacity-70'
                        }`}>
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                {dept?.name || step.officeName}
                              </span>
                              {isCurrent && (
                                <span className="bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Current Station
                                </span>
                              )}
                              {isDone && (
                                <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Processed
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {step.receivedAt ? formatDate(step.receivedAt) : 'Awaiting receipt'}
                            </div>
                          </div>

                          {step.actionOfficer && (
                            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                              <span>Action Officer: <strong className="text-slate-800">{step.actionOfficer}</strong></span>
                            </div>
                          )}

                          {step.remarks && (
                            <div className="mt-2 text-xs bg-white/80 p-2.5 rounded-lg border border-slate-200 text-slate-700 italic">
                              "{step.remarks}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEPARTMENT ACTIONS */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Context indicator */}
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-900" />
                  <span>
                    Current Acting Station: <strong>{DEPARTMENTS[activeDepartment]?.name}</strong>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Role: <span className="font-semibold text-slate-800">{activeRole}</span>
                </div>
              </div>

              {/* Action 1: If document is currently "To Receive" at this department */}
              {isAssignedToActiveStation && isToReceive && (
                <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    Incoming Document Awaiting Acceptance
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    This document was dispatched to {DEPARTMENTS[activeDepartment]?.shortName}. Click below to confirm 
                    physical or digital receipt, start the departmental processing clock, and log the action officer.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleReceive}
                      id="action-btn-receive-modal"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept & Receive Document</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action 2: Standard Processing & Forwarding form */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-blue-900" />
                  Process & Forward to Next Office
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Destination Office / Department:</label>
                    <select
                      value={forwardToDept}
                      onChange={e => setForwardToDept(e.target.value as DepartmentCode)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    >
                      {Object.values(DEPARTMENTS).map(dept => (
                        <option key={dept.code} value={dept.code}>
                          {dept.name} ({dept.shortName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Assigned Action Officer:</label>
                    <input
                      type="text"
                      disabled
                      value={DEPARTMENTS[forwardToDept]?.defaultActionOfficer || ''}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1 text-xs">
                    Action Remarks / Technical Endorsement <span className="text-red-500">*</span>:
                  </label>
                  <textarea
                    rows={3}
                    value={actionRemarks}
                    onChange={e => setActionRemarks(e.target.value)}
                    placeholder="Provide specific findings, clearance notes, or endorsements for the receiving officer..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1 text-xs">
                    Citizen Public Advisory / Notification Note (Optional):
                  </label>
                  <input
                    type="text"
                    value={citizenInstructions}
                    onChange={e => setCitizenInstructions(e.target.value)}
                    placeholder="e.g. 'Proceed to Treasury Window 3 for assessment settlement'"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none placeholder-slate-400"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={handleForward}
                    id="action-btn-forward"
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                    <span>Forward to {DEPARTMENTS[forwardToDept]?.shortName}</span>
                  </button>

                  {/* Approver / Head actions */}
                  {(activeRole === 'DEPT_HEAD' || activeRole === 'EXECUTIVE') && (
                    <>
                      <button
                        onClick={handleApprove}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Request</span>
                      </button>

                      <button
                        onClick={handleDisapprove}
                        className="px-3.5 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Disapprove</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={handlePutOnHold}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Put On Hold</span>
                  </button>

                  <button
                    onClick={handleComplete}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Final Release & Complete</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-600">
                  Comprehensive Immutable Audit Log (RA 11032 Record)
                </h4>
                <span className="text-slate-400 font-mono text-[11px]">
                  Total Entries: {selectedDoc.history.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden text-xs">
                {selectedDoc.history.slice().reverse().map(log => (
                  <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500">{log.timestamp}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-blue-900">{DEPARTMENTS[log.office]?.shortName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.action === 'Created'
                          ? 'bg-blue-100 text-blue-800'
                          : log.action === 'Received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'On Hold'
                          ? 'bg-amber-100 text-amber-800'
                          : log.action === 'Disapproved'
                          ? 'bg-red-100 text-red-800'
                          : log.action === 'Completed'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {log.action}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.officerName}</span>
                      <span className="text-slate-400 font-normal text-[11px]">({log.officerRole})</span>
                      {log.toOffice && (
                        <span className="text-blue-800 text-[11px] ml-1">
                          → Forwarded to {DEPARTMENTS[log.toOffice]?.shortName}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                      {log.remarks}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ATTACHMENTS */}
          {activeTab === 'files' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-700">
                    Accompanying Documents & Official Exhibits
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Statutory attachments, endorsements, clearances, and compliance files
                  </p>
                </div>
                <span className="text-slate-500 font-medium text-[11px] bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  {selectedDoc.attachments.length} files attached
                </span>
              </div>

              {/* Upload New Attachment Zone */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="detail-file-upload-input"
                  aria-label="Upload document attachments"
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
                      ? 'border-blue-700 bg-blue-50 ring-4 ring-blue-100'
                      : 'border-slate-300 hover:border-blue-600 hover:bg-slate-50/80 bg-slate-50/50'
                  }`}
                >
                  <div className="w-9 h-9 mx-auto rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mb-1.5 shadow-2xs">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-slate-800 text-xs">
                    Click to browse folder or drag and drop any file here
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Supports Word (.docx, .doc), PDF, Excel (.xlsx, .xls, .csv), Images (.jpg, .png), Text, Zip, and other formats
                  </div>
                </div>
              </div>

              {/* Attachments List */}
              {selectedDoc.attachments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  No electronic attachments logged yet. Upload files above to attach to this transaction.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedDoc.attachments.map((file, i) => {
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
                            <div className="text-[10px] text-slate-500">{file.size} • Verified Archive</div>
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
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-500">
            Intake Date: <span className="font-mono text-slate-800">{formatDate(selectedDoc.createdAt)}</span>
          </div>
          <button
            onClick={() => setSelectedDocId(null)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Quick Attachment Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-amber-300 shrink-0" />
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
                  <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
