import React, { useState, useRef } from 'react';
import { useDocTrack } from '../context/DocTrackContext';
import { 
  X, 
  PlusCircle, 
  Upload, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  AlertCircle,
  Clock,
  Sparkles,
  Paperclip,
  Trash2,
  Eye,
  FileSpreadsheet,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import { CLASSIFICATION_RULES, DEPARTMENTS } from '../data/mockData';
import { 
  DocumentClassification, 
  DocumentCategory, 
  RequestorType, 
  PriorityLevel, 
  DepartmentCode 
} from '../types';
import { generateTrackingId, formatBytes, getFileTypeDetails } from '../utils/helpers';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AttachedFile {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export const IntakeModal: React.FC<IntakeModalProps> = ({ isOpen, onClose }) => {
  const { createDocument, documents, addToast } = useDocTrack();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [initialOffice, setInitialOffice] = useState<DepartmentCode>('BPLO');
  const [classification, setClassification] = useState<DocumentClassification>('SIMPLE');
  const [category, setCategory] = useState<DocumentCategory>('Business Permit');
  const [title, setTitle] = useState('');
  const [requestorType, setRequestorType] = useState<RequestorType>('Citizen');
  const [requestorName, setRequestorName] = useState('');
  const [requestorEmail, setRequestorEmail] = useState('');
  const [requestorPhone, setRequestorPhone] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Normal');
  const [purposeOrNotes, setPurposeOrNotes] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([
    { name: 'Application_Form_Filled.pdf', size: '1.2 MB', type: 'application/pdf' }
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);

  if (!isOpen) return null;

  const previewId = generateTrackingId(initialOffice, documents.length);
  const selectedRule = CLASSIFICATION_RULES[classification];

  // Auto-switch category or office hints
  const handleCategoryChange = (cat: DocumentCategory) => {
    setCategory(cat);
    if (cat === 'Business Permit') {
      setInitialOffice('BPLO');
      setClassification('COMPLEX');
    } else if (cat === 'Building Permit') {
      setInitialOffice('OBO');
      setClassification('HIGHLY_TECHNICAL');
    } else if (cat === 'Ordinance Draft') {
      setInitialOffice('SB');
      setClassification('HIGHLY_TECHNICAL');
    } else if (cat === 'Executive Order') {
      setInitialOffice('MO');
      setClassification('SIMPLE');
    } else if (cat === 'Tax Assessment') {
      setInitialOffice('ASSO');
      setClassification('COMPLEX');
    } else if (cat === 'Zoning Clearance') {
      setInitialOffice('MPDO');
      setClassification('COMPLEX');
    }
  };

  const processIncomingFiles = (incomingFiles: FileList | File[]) => {
    const filesArray = Array.from(incomingFiles);
    if (filesArray.length === 0) return;

    const newAttachments: AttachedFile[] = filesArray.map(file => {
      let objectUrl: string | undefined;
      try {
        objectUrl = URL.createObjectURL(file);
      } catch {
        // Fallback for safety
      }

      return {
        name: file.name,
        size: formatBytes(file.size),
        type: file.type || 'application/octet-stream',
        url: objectUrl
      };
    });

    setAttachments(prev => [...prev, ...newAttachments]);
    addToast(`Successfully added ${newAttachments.length} document ${newAttachments.length === 1 ? 'file' : 'files'}`, 'success');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(e.target.files);
      // Reset input value so the same file name can be re-selected if removed and picked again
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

  const handleBrowseFolderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllAttachments = () => {
    setAttachments([]);
    addToast('All attachments cleared', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !requestorName.trim()) {
      addToast('Please enter the document title and requestor name', 'warning');
      return;
    }

    createDocument({
      title,
      classification,
      category,
      requestorType,
      requestorName,
      requestorEmail: requestorEmail || 'citizen@portal.ph',
      requestorPhone: requestorPhone || '+63 900 000 0000',
      priority,
      initialOffice,
      purposeOrNotes,
      attachments
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 border border-blue-700 flex items-center justify-center text-amber-300 shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                New Document Intake & Registration
              </h3>
              <p className="text-xs text-slate-300">
                Central Receiving Office • RA 11032 Anti-Red Tape Standard Entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto Generated ID Bar */}
        <div className="bg-blue-50/80 px-6 py-2.5 border-b border-blue-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Auto-Generated Tracking No:</span>
            <span className="font-mono font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
              {previewId}
            </span>
          </div>
          <div className="text-[11px] text-blue-800 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Printable routing slip will generate immediately on save
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* 1. Classification (RA 11032 Card Selector) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              1. RA 11032 Transaction Classification & SLA Limit <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.values(CLASSIFICATION_RULES).map(r => {
                const isSelected = classification === r.type;
                return (
                  <div
                    key={r.type}
                    onClick={() => setClassification(r.type)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/50 shadow-xs ring-1 ring-blue-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{r.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.type === 'SIMPLE' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : r.type === 'COMPLEX' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        Max {r.maxDays} Days
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {r.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Metadata: Category & Initial Office */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Document Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => handleCategoryChange(e.target.value as DocumentCategory)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
              >
                <option value="Business Permit">Business Permit</option>
                <option value="Building Permit">Building Permit</option>
                <option value="Ordinance Draft">Ordinance Draft</option>
                <option value="Executive Order">Executive Order</option>
                <option value="Barangay Clearance">Barangay Clearance</option>
                <option value="Purchase Order / Voucher">Purchase Order / Voucher</option>
                <option value="Tax Assessment">Tax Assessment</option>
                <option value="Zoning Clearance">Zoning Clearance</option>
                <option value="General Correspondence">General Correspondence</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Initial Office Routing Destination <span className="text-red-500">*</span>
              </label>
              <select
                value={initialOffice}
                onChange={e => setInitialOffice(e.target.value as DepartmentCode)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
              >
                {Object.values(DEPARTMENTS).map(dept => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name} ({dept.shortName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Title / Subject matter */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Title / Subject Matter <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Application for Mayor's Business Permit: Golden Sunrise Hardware & Builders Supply"
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none font-medium"
            />
          </div>

          {/* 4. Requestor Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
              2. Requestor / Originator Profile
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-slate-600 mb-1 font-medium">Requestor Type:</label>
                <select
                  value={requestorType}
                  onChange={e => setRequestorType(e.target.value as RequestorType)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Private Business">Private Business</option>
                  <option value="Internal Office">Internal Office</option>
                  <option value="External Agency">External Agency</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-600 mb-1 font-medium">Full Name / Entity Name <span className="text-red-500">*</span>:</label>
                <input
                  type="text"
                  required
                  value={requestorName}
                  onChange={e => setRequestorName(e.target.value)}
                  placeholder="e.g. Juanito dela Cruz / Alpha Horizon Logistics Corp."
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Email Address:</label>
                <input
                  type="email"
                  value={requestorEmail}
                  onChange={e => setRequestorEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Contact Mobile Phone:</label>
                <input
                  type="tel"
                  value={requestorPhone}
                  onChange={e => setRequestorPhone(e.target.value)}
                  placeholder="+63 917 000 0000"
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Priority Flag:</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as PriorityLevel)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent (Expedited)</option>
                  <option value="Confidential">Confidential</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Purpose & Attachments Mock */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Purpose / Brief Notes:
            </label>
            <textarea
              rows={2}
              value={purposeOrNotes}
              onChange={e => setPurposeOrNotes(e.target.value)}
              placeholder="Provide background context or specific directives..."
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          {/* Drag & Drop Attachments */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Accompanying Documents / Attachments:
              </label>
              {attachments.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {attachments.length} {attachments.length === 1 ? 'file' : 'files'} attached
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllAttachments}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Real Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              id="intake-file-upload-input"
              aria-label="Upload document attachments"
            />

            {/* Interactive Drag & Drop / Click Zone */}
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
              className={`p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-blue-700 bg-blue-50/90 scale-[0.99] ring-4 ring-blue-100' 
                  : 'border-slate-300 hover:border-blue-600 hover:bg-slate-50/80 bg-slate-50/40'
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mb-2 shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-800 text-xs sm:text-sm">
                Drag and drop your files here, or{' '}
                <span className="text-blue-900 underline font-extrabold hover:text-blue-700">
                  browse your device folder
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                Accepts any file format: <span className="font-semibold text-slate-700">Word (.docx, .doc), PDF, Excel (.xlsx, .xls, .csv), Images (.jpg, .png), Text, Zip</span>, and all statutory exhibits
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-2xs">
                <FolderOpen className="w-3.5 h-3.5 text-blue-800" />
                <span>Click anywhere to select files</span>
              </div>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                {attachments.map((file, idx) => {
                  const typeInfo = getFileTypeDetails(file.name, file.type);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white text-xs border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${typeInfo.badgeColor}`}>
                          {typeInfo.badge}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {file.size} • Ready for upload
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {file.url && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setPreviewFile(file);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Preview file"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleRemoveAttachment(idx);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Assigned SLA: <strong className="text-slate-800">{selectedRule?.maxDays} working days</strong>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-intake-btn"
                className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>Register & Print Routing Slip</span>
              </button>
            </div>
          </div>
        </form>
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
                    Size: {previewFile.size} • Type: {previewFile.type || 'Document'}
                  </div>
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 py-1 px-3 rounded-md inline-block font-semibold">
                    Document validated & ready for official archival
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
