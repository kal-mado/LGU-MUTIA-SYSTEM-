import React, { useState, useMemo } from 'react';
import { useDocTrack } from '../context/DocTrackContext';
import { 
  Building2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Filter, 
  Send, 
  FileText, 
  UserCheck, 
  Inbox, 
  PauseCircle, 
  Printer, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { DEPARTMENTS, CLASSIFICATION_RULES } from '../data/mockData';
import { DepartmentCode, DocumentItem, DocumentClassification } from '../types';
import { formatDate, getSLACountdownText, getSLAStatus } from '../utils/helpers';

interface ActionQueueViewProps {
  onOpenIntake: () => void;
}

export const ActionQueueView: React.FC<ActionQueueViewProps> = ({ onOpenIntake }) => {
  const { 
    documents, 
    activeDepartment, 
    setActiveDepartment,
    activeRole,
    setSelectedDocId,
    setRoutingSlipDocId,
    receiveDocument,
    searchQuery,
    setSearchQuery
  } = useDocTrack();

  const [queueTab, setQueueTab] = useState<'inbound' | 'inprogress' | 'outbound' | 'onhold'>('inbound');
  const [filterClassification, setFilterClassification] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const deptInfo = DEPARTMENTS[activeDepartment] || DEPARTMENTS.RMO;

  // Filter documents based on queue tab and department
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = doc.id.toLowerCase().includes(q);
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesRequestor = doc.requestorName.toLowerCase().includes(q);
        const matchesCategory = doc.category.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesRequestor && !matchesCategory) {
          return false;
        }
      }

      // Classification filter
      if (filterClassification !== 'ALL' && doc.classification !== filterClassification) {
        return false;
      }

      // Priority filter
      if (filterPriority !== 'ALL' && doc.priority !== filterPriority) {
        return false;
      }

      // Role specific view: if Executive, can view all documents across departments
      const isExec = activeRole === 'EXECUTIVE';

      if (queueTab === 'inbound') {
        return (isExec || doc.currentOffice === activeDepartment) && doc.status === 'To Receive';
      }

      if (queueTab === 'inprogress') {
        return (isExec || doc.currentOffice === activeDepartment) && doc.status === 'In Progress';
      }

      if (queueTab === 'onhold') {
        return (isExec || doc.currentOffice === activeDepartment) && doc.status === 'On Hold';
      }

      if (queueTab === 'outbound') {
        if (doc.status === 'Completed') return true;
        // Or if previously routed through this department
        return doc.routingSequence.some(
          step => step.office === activeDepartment && step.status === 'COMPLETED'
        ) && doc.currentOffice !== activeDepartment;
      }

      return true;
    });
  }, [documents, activeDepartment, activeRole, queueTab, searchQuery, filterClassification, filterPriority]);

  // Counts for tabs
  const counts = useMemo(() => {
    const isExec = activeRole === 'EXECUTIVE';
    const forStation = (doc: DocumentItem) => isExec || doc.currentOffice === activeDepartment;

    const inbound = documents.filter(d => forStation(d) && d.status === 'To Receive').length;
    const inprogress = documents.filter(d => forStation(d) && d.status === 'In Progress').length;
    const onhold = documents.filter(d => forStation(d) && d.status === 'On Hold').length;
    const outbound = documents.filter(d => 
      d.status === 'Completed' || 
      (d.routingSequence.some(s => s.office === activeDepartment && s.status === 'COMPLETED') && d.currentOffice !== activeDepartment)
    ).length;

    const overdue = documents.filter(d => forStation(d) && getSLAStatus(d) === 'OVERDUE').length;

    return { inbound, inprogress, onhold, outbound, overdue };
  }, [documents, activeDepartment, activeRole]);

  return (
    <div className="space-y-6">
      {/* Department Station Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Active Station: {deptInfo.code}
              </span>
              <span className="text-xs text-slate-500">
                Department Head: <strong className="text-slate-800">{deptInfo.head}</strong>
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
              {deptInfo.name}
            </h2>
            <p className="text-xs text-slate-500">
              Primary Action Officer: <span className="font-semibold text-slate-700">{deptInfo.defaultActionOfficer}</span>
            </p>
          </div>
        </div>

        {/* Station Switcher Pills for Rapid Testing */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 font-medium text-[11px] mr-1 hidden sm:inline">Jump Station:</span>
          {(['RMO', 'BPLO', 'OBO', 'MPDO', 'MTO', 'MO', 'SB', 'ASSO'] as DepartmentCode[]).map(code => (
            <button
              key={code}
              onClick={() => setActiveDepartment(code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDepartment === code
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setQueueTab('inbound')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            queueTab === 'inbound'
              ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${queueTab === 'inbound' ? 'text-blue-200' : 'text-slate-500'}`}>
              Inbound / To Receive
            </span>
            <Inbox className={`w-4 h-4 ${queueTab === 'inbound' ? 'text-amber-300' : 'text-blue-900'}`} />
          </div>
          <div className="text-2xl font-black mt-1">{counts.inbound}</div>
          <div className={`text-[11px] mt-0.5 ${queueTab === 'inbound' ? 'text-blue-200' : 'text-slate-400'}`}>
            Awaiting acceptance
          </div>
        </div>

        <div 
          onClick={() => setQueueTab('inprogress')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            queueTab === 'inprogress'
              ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${queueTab === 'inprogress' ? 'text-blue-200' : 'text-slate-500'}`}>
              Action Queue
            </span>
            <Clock className={`w-4 h-4 ${queueTab === 'inprogress' ? 'text-amber-300' : 'text-amber-600'}`} />
          </div>
          <div className="text-2xl font-black mt-1">{counts.inprogress}</div>
          <div className={`text-[11px] mt-0.5 ${queueTab === 'inprogress' ? 'text-blue-200' : 'text-slate-400'}`}>
            Under active review
          </div>
        </div>

        <div 
          onClick={() => setQueueTab('onhold')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            queueTab === 'onhold'
              ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${queueTab === 'onhold' ? 'text-blue-200' : 'text-slate-500'}`}>
              On Hold / Pending
            </span>
            <PauseCircle className={`w-4 h-4 ${queueTab === 'onhold' ? 'text-amber-300' : 'text-amber-500'}`} />
          </div>
          <div className="text-2xl font-black mt-1">{counts.onhold}</div>
          <div className={`text-[11px] mt-0.5 ${queueTab === 'onhold' ? 'text-blue-200' : 'text-slate-400'}`}>
            Awaiting citizen doc
          </div>
        </div>

        <div 
          onClick={() => setQueueTab('outbound')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            queueTab === 'outbound'
              ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${queueTab === 'outbound' ? 'text-blue-200' : 'text-slate-500'}`}>
              Released / Forwarded
            </span>
            <CheckCircle2 className={`w-4 h-4 ${queueTab === 'outbound' ? 'text-amber-300' : 'text-emerald-600'}`} />
          </div>
          <div className="text-2xl font-black mt-1">{counts.outbound}</div>
          <div className={`text-[11px] mt-0.5 ${queueTab === 'outbound' ? 'text-blue-200' : 'text-slate-400'}`}>
            Forwarded or completed
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters & Queue Tabs */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          {/* Queue Tab Buttons */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setQueueTab('inbound')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                queueTab === 'inbound'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              To Receive ({counts.inbound})
            </button>
            <button
              onClick={() => setQueueTab('inprogress')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                queueTab === 'inprogress'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Action Queue ({counts.inprogress})
            </button>
            <button
              onClick={() => setQueueTab('onhold')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                queueTab === 'onhold'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              On Hold ({counts.onhold})
            </button>
            <button
              onClick={() => setQueueTab('outbound')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                queueTab === 'outbound'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Outbound / Released ({counts.outbound})
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-medium">RA 11032:</span>
              <select
                value={filterClassification}
                onChange={e => setFilterClassification(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Classifications</option>
                <option value="SIMPLE">Simple (3 Days)</option>
                <option value="COMPLEX">Complex (7 Days)</option>
                <option value="HIGHLY_TECHNICAL">Highly Technical (20 Days)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-medium">Priority:</span>
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Confidential">Confidential</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3 pl-5 w-40">Tracking ID</th>
                <th className="p-3 min-w-[220px]">Document Title & Requestor</th>
                <th className="p-3 w-36">Classification</th>
                <th className="p-3 w-36">Current Station</th>
                <th className="p-3 w-40">RA 11032 SLA Target</th>
                <th className="p-3 w-28 text-center">Status</th>
                <th className="p-3 pr-5 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <div className="text-sm font-semibold text-slate-600">No documents found in this queue</div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Change tabs or click "New Intake" to register a document.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => {
                  const sla = getSLAStatus(doc);
                  const countdown = getSLACountdownText(doc);
                  const rule = CLASSIFICATION_RULES[doc.classification];
                  const isAssignedHere = doc.currentOffice === activeDepartment;
                  const isToReceive = doc.status === 'To Receive';

                  return (
                    <tr 
                      key={doc.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedDocId(doc.id)}
                    >
                      {/* Tracking ID & Priority */}
                      <td className="p-3 pl-5 font-mono">
                        <div className="font-bold text-blue-900 group-hover:underline">
                          {doc.id}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {doc.priority === 'Urgent' && (
                            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.2 rounded">
                              URGENT
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">{doc.category}</span>
                        </div>
                      </td>

                      {/* Title & Requestor */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 group-hover:text-blue-900 line-clamp-1">
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span>{doc.requestorName}</span>
                          <span>•</span>
                          <span className="text-slate-400">{doc.requestorType}</span>
                        </div>
                      </td>

                      {/* Classification & SLA rules */}
                      <td className="p-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          doc.classification === 'SIMPLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.classification === 'COMPLEX'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rule?.label}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Max {rule?.maxDays} working days
                        </div>
                      </td>

                      {/* Current Station */}
                      <td className="p-3 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                          <span>{DEPARTMENTS[doc.currentOffice]?.shortName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {doc.daysSpent}d at office
                        </div>
                      </td>

                      {/* RA 11032 SLA Status */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                          {sla === 'OVERDUE' ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          ) : sla === 'WARNING' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          <span className={
                            sla === 'OVERDUE'
                              ? 'text-red-700 font-bold'
                              : sla === 'WARNING'
                              ? 'text-amber-700 font-bold'
                              : 'text-emerald-700 font-medium'
                          }>
                            {countdown.text}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Due: {formatDate(doc.deadlineAt)}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          doc.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'On Hold'
                            ? 'bg-amber-100 text-amber-800'
                            : doc.status === 'Disapproved'
                            ? 'bg-red-100 text-red-800'
                            : doc.status === 'To Receive'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {doc.status}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="p-3 pr-5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Receive Button if To Receive */}
                          {isAssignedHere && isToReceive ? (
                            <button
                              onClick={() => receiveDocument(doc.id)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Accept document into station"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Receive</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedDocId(doc.id)}
                              className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-md font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                            >
                              Process
                            </button>
                          )}

                          {/* Print routing slip */}
                          <button
                            onClick={() => setRoutingSlipDocId(doc.id)}
                            className="p-1 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded transition-colors"
                            title="Print Routing Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{filteredDocs.length}</strong> of{' '}
            <strong className="text-slate-800">{documents.length}</strong> municipal documents
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> On Time
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning (&lt;24h)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> RA 11032 Breach
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
