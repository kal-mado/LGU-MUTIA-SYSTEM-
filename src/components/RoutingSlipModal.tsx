import React, { useRef } from 'react';
import { useDocTrack } from '../context/DocTrackContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Printer, X, Download, ShieldCheck, Clock, Building, ArrowRight } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { CLASSIFICATION_RULES, DEPARTMENTS } from '../data/mockData';

export const RoutingSlipModal: React.FC = () => {
  const { routingSlipDoc, setRoutingSlipDocId, addToast } = useDocTrack();
  const printRef = useRef<HTMLDivElement>(null);

  if (!routingSlipDoc) return null;

  const rule = CLASSIFICATION_RULES[routingSlipDoc.classification];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(routingSlipDoc.id);
    addToast(`Tracking number ${routingSlipDoc.id} copied to clipboard!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden print:shadow-none print:border-none print:w-full">
        {/* Screen Controls Header (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Official Document Routing Slip & Transmittal</h3>
              <p className="text-xs text-slate-400">RA 11032 Standard Transmittal Form for Physical Routing Jacket</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyId}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg transition-colors font-mono"
            >
              Copy ID
            </button>
            <button
              onClick={handlePrint}
              id="print-routing-slip-btn"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={() => setRoutingSlipDocId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Physical Slip Content */}
        <div ref={printRef} className="p-8 print:p-6 bg-white text-slate-900 font-sans">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-4">
              {/* Republic Emblem / Municipal Seal */}
              <div className="w-16 h-16 rounded-full border-2 border-blue-900 bg-blue-950 text-amber-400 flex flex-col items-center justify-center text-center p-1 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-tighter leading-none">REPUBLIC</span>
                <span className="text-[7px] font-bold text-slate-200">OF THE</span>
                <span className="text-[8px] font-black tracking-tighter text-amber-300">PHILIPPINES</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                  Republic of the Philippines • Province of La Union
                </p>
                <h2 className="text-lg font-black uppercase text-blue-950 tracking-tight">
                  MUNICIPALITY OF SAN FERNANDO
                </h2>
                <p className="text-xs font-bold text-slate-700 uppercase">
                  Central Records Management Office • e-Governance Division
                </p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">
                  In compliance with Republic Act No. 11032 (Ease of Doing Business Act)
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border-2 border-emerald-800 bg-emerald-900 text-white flex flex-col items-center justify-center text-center p-1 shrink-0">
                <span className="text-[9px] font-black tracking-tighter text-amber-300">ARTA</span>
                <span className="text-[7px] font-bold">CITIZEN</span>
                <span className="text-[8px] font-black tracking-tighter">CHARTER</span>
              </div>
            </div>
            <div className="mt-3 py-1 bg-slate-900 text-white font-extrabold text-xs tracking-widest uppercase rounded">
              DOCUMENT ROUTING SLIP & ACTION MONITORING SHEET
            </div>
          </div>

          {/* Quick Header Matrix with QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-5 border-b border-slate-300">
            <div className="md:col-span-2 space-y-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Document Title / Subject:</span>
                <p className="text-sm font-bold text-slate-900 leading-snug">{routingSlipDoc.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Document Category:</span>
                  <p className="font-semibold text-blue-900">{routingSlipDoc.category}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Classification (RA 11032):</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-800"></span>
                    <span className="text-slate-900">{rule?.label}</span>
                    <span className="text-slate-500 font-normal">({rule?.maxDays} Working Days)</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Requestor / Originator:</span>
                  <p className="font-semibold text-slate-900">{routingSlipDoc.requestorName}</p>
                  <p className="text-[10px] text-slate-600">{routingSlipDoc.requestorType} • {routingSlipDoc.requestorPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Priority & Filing Date:</span>
                  <p className="font-semibold text-slate-900">
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold mr-1 ${
                      routingSlipDoc.priority === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {routingSlipDoc.priority}
                    </span>
                    {formatDate(routingSlipDoc.createdAt)}
                  </p>
                  <p className="text-[10px] text-red-700 font-medium">
                    Strict SLA Cutoff: {formatDate(routingSlipDoc.deadlineAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code & Barcode Section */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-300 text-center">
              <QRCodeDisplay value={routingSlipDoc.id} size={120} />
              <div className="mt-2 font-mono text-xs font-black tracking-wider text-slate-900">
                {routingSlipDoc.id}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Scan via Citizen Portal to track progress
              </div>
            </div>
          </div>

          {/* Department Action Routing Sequence Table */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-900" />
                Department Routing & Accountability Checklist
              </span>
              <span className="text-[10px] text-slate-500">Attach firmly to front of document jacket</span>
            </div>

            <table className="w-full text-xs border border-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-400 text-left">
                  <th className="p-2 border-r border-slate-400 w-8 text-center">Seq</th>
                  <th className="p-2 border-r border-slate-400 w-44">Department / Office</th>
                  <th className="p-2 border-r border-slate-400 w-28">Date & Time In</th>
                  <th className="p-2 border-r border-slate-400 w-28">Date & Time Out</th>
                  <th className="p-2 border-r border-slate-400">Action Taken / Remarks</th>
                  <th className="p-2 w-32 text-center">Officer Signature</th>
                </tr>
              </thead>
              <tbody>
                {routingSlipDoc.routingSequence.map((step, idx) => {
                  const dept = DEPARTMENTS[step.office];
                  return (
                    <tr key={idx} className="border-b border-slate-300 min-h-[44px]">
                      <td className="p-2 border-r border-slate-300 font-bold text-center text-slate-500">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">
                        {dept?.name || step.officeName}
                        <div className="text-[10px] text-slate-500 font-normal">Head: {dept?.head}</div>
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        {step.receivedAt ? formatDate(step.receivedAt) : <span className="text-slate-400 italic">Pending receipt</span>}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        {step.completedAt ? formatDate(step.completedAt) : <span className="text-slate-400 italic">--</span>}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        {step.remarks || <span className="text-slate-400 italic">For action/evaluation</span>}
                      </td>
                      <td className="p-2 text-center align-bottom pb-1">
                        <div className="border-b border-dashed border-slate-400 w-24 mx-auto mb-1"></div>
                        <span className="text-[9px] text-slate-500 uppercase">{step.actionOfficer || 'Action Officer'}</span>
                      </td>
                    </tr>
                  );
                })}

                {/* Blank extra lines for manual forwarding */}
                {[...Array(Math.max(1, 4 - routingSlipDoc.routingSequence.length))].map((_, i) => (
                  <tr key={`blank-${i}`} className="border-b border-slate-300 h-11">
                    <td className="p-2 border-r border-slate-300 text-center text-slate-400 font-mono">
                      {routingSlipDoc.routingSequence.length + i + 1}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-slate-400 italic">___________________</td>
                    <td className="p-2 border-r border-slate-300 text-slate-400 italic">___/___/___ __:__</td>
                    <td className="p-2 border-r border-slate-300 text-slate-400 italic">___/___/___ __:__</td>
                    <td className="p-2 border-r border-slate-300"></td>
                    <td className="p-2 text-center align-bottom pb-1">
                      <div className="border-b border-dashed border-slate-400 w-24 mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legal Warning Section - RA 11032 */}
          <div className="mt-5 p-3 bg-amber-50 rounded-lg border border-amber-300 text-[10px] leading-relaxed text-amber-950">
            <div className="font-bold uppercase tracking-wider flex items-center gap-1 text-amber-900 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Statutory Warning Under Republic Act No. 11032 (Anti-Red Tape Act of 2018):
            </div>
            <p>
              "Section 21. Violations and Persons Liable. Any public official or employee who fails to process applications 
              within the prescribed period of three (3) days for simple transactions, seven (7) days for complex transactions, 
              and twenty (20) working days for highly technical applications shall be administratively and criminally liable. 
              Refusal to accept requests without valid cause is strictly prohibited under ARTA regulations."
            </p>
          </div>

          {/* Bottom Sign-off block */}
          <div className="mt-6 pt-4 border-t border-slate-300 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase text-slate-500">Logged By (Central Receiving):</span>
              <p className="font-bold text-slate-900">{DEPARTMENTS.RMO.head}</p>
              <p className="text-[10px] text-slate-500">Records Management Officer II</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500">Municipal Verification Seal:</span>
              <div className="w-28 h-8 border border-dashed border-slate-400 rounded flex items-center justify-center text-[9px] text-slate-400 mt-0.5">
                [ OFFICIAL DRY SEAL ]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
