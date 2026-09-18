import React, { useState } from 'react';
import { useDocTrack } from '../context/DocTrackContext';
import { 
  FileSpreadsheet, 
  X, 
  Printer, 
  Download, 
  Search, 
  Calendar,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { formatDate, exportToCSV } from '../utils/helpers';
import { DEPARTMENTS } from '../data/mockData';

interface LogbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogbookModal: React.FC<LogbookModalProps> = ({ isOpen, onClose }) => {
  const { documents, addToast } = useDocTrack();
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredDocs = documents.filter(d => {
    if (filterDate && !d.createdAt.startsWith(filterDate)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.requestorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportLogbookCSV = () => {
    const rows = filteredDocs.map((d, index) => ({
      Item_No: index + 1,
      Tracking_Number: d.id,
      Date_Time_Received: d.createdAt,
      Title_Subject: d.title,
      Category: d.category,
      Classification: d.classification,
      Requestor_Name: d.requestorName,
      Contact_Number: d.requestorPhone,
      Initial_Routing: d.currentOffice,
      Current_Status: d.status
    }));

    exportToCSV(`RMO_Daily_Receiving_Logbook_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    addToast('Daily Receiving Logbook CSV exported successfully!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] print:shadow-none print:border-none print:w-full">
        {/* Header (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Records Management Office (RMO) Receiving Logbook</h3>
              <p className="text-xs text-slate-400">Official Daily Document Registry & Transmittal Record</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Logbook</span>
            </button>
            <button
              onClick={handleExportLogbookCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter logbook records..."
              className="w-full p-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredDocs.length}</strong> logged entries
          </div>
        </div>

        {/* Logbook Print Layout */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* Print Letterhead */}
          <div className="text-center pb-4 border-b border-slate-800 mb-4">
            <p className="text-[10px] uppercase font-bold text-slate-600">Republic of the Philippines • Local Government of San Fernando</p>
            <h2 className="text-base font-black uppercase text-blue-950">
              CENTRAL RECORDS MANAGEMENT DIVISION (RMO)
            </h2>
            <h3 className="text-xs font-bold text-slate-800 uppercase">
              DAILY DOCUMENT INTAKE & TRANSMITTAL LOGBOOK
            </h3>
            <p className="text-[10px] text-slate-500 italic mt-0.5">
              Official Logbook pursuant to National Archives of the Philippines & RA 11032 Guidelines
            </p>
          </div>

          <table className="w-full border border-slate-400 border-collapse text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400 text-[11px]">
                <th className="p-2 border-r border-slate-400 w-10 text-center">#</th>
                <th className="p-2 border-r border-slate-400 w-36">Tracking No.</th>
                <th className="p-2 border-r border-slate-400 w-28">Date/Time Received</th>
                <th className="p-2 border-r border-slate-400 min-w-[200px]">Document Title / Subject</th>
                <th className="p-2 border-r border-slate-400 w-36">Requestor / Entity</th>
                <th className="p-2 border-r border-slate-400 w-24">Class</th>
                <th className="p-2 border-r border-slate-400 w-28">Routed To</th>
                <th className="p-2 w-24 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {filteredDocs.map((doc, idx) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-300 font-mono font-bold text-blue-900">{doc.id}</td>
                  <td className="p-2 border-r border-slate-300 text-slate-600 font-mono text-[10px]">{formatDate(doc.createdAt)}</td>
                  <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">{doc.title}</td>
                  <td className="p-2 border-r border-slate-300 text-slate-700">
                    <div>{doc.requestorName}</div>
                    <div className="text-[10px] text-slate-400">{doc.requestorPhone}</div>
                  </td>
                  <td className="p-2 border-r border-slate-300 font-bold text-slate-700">{doc.classification}</td>
                  <td className="p-2 border-r border-slate-300 font-semibold text-blue-900">
                    {DEPARTMENTS[doc.currentOffice]?.shortName}
                  </td>
                  <td className="p-2 text-center">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom Sign-off for Print */}
          <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Prepared & Certified By:</p>
              <div className="mt-4 font-bold text-slate-900 border-b border-slate-800 inline-block pb-0.5 min-w-[200px]">
                {DEPARTMENTS.RMO.head}
              </div>
              <p className="text-[10px] text-slate-500">Chief, Records Management Office</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Noted By:</p>
              <div className="mt-4 font-bold text-slate-900 border-b border-slate-800 inline-block pb-0.5 min-w-[200px]">
                {DEPARTMENTS.MO.defaultActionOfficer}
              </div>
              <p className="text-[10px] text-slate-500">Municipal Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
