import React, { useState, useMemo } from 'react';
import { useDocTrack } from '../context/DocTrackContext';
import { 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Download, 
  Printer, 
  Clock, 
  FileSpreadsheet, 
  TrendingUp, 
  Building2, 
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import { DEPARTMENTS, CLASSIFICATION_RULES } from '../data/mockData';
import { getSLAStatus, exportToCSV, formatDate } from '../utils/helpers';
import { DepartmentCode } from '../types';

export const ExecutiveAnalyticsView: React.FC = () => {
  const { documents, setSelectedDocId, addToast } = useDocTrack();
  const [showExportModal, setShowExportModal] = useState(false);

  // Compute metrics
  const totalDocs = documents.length;
  const completedDocs = documents.filter(d => d.status === 'Completed').length;
  const inProgressDocs = documents.filter(d => d.status === 'In Progress' || d.status === 'To Receive').length;
  const onHoldDocs = documents.filter(d => d.status === 'On Hold').length;

  const overdueDocs = documents.filter(d => getSLAStatus(d) === 'OVERDUE');
  const warningDocs = documents.filter(d => getSLAStatus(d) === 'WARNING');
  const onTimeDocs = documents.filter(d => getSLAStatus(d) === 'ON_TIME' || d.status === 'Completed');

  // Overall RA 11032 Compliance Rate (%)
  const complianceRate = totalDocs > 0 
    ? Math.round(((totalDocs - overdueDocs.length) / totalDocs) * 100) 
    : 100;

  // Breakdown by classification
  const simpleCount = documents.filter(d => d.classification === 'SIMPLE').length;
  const complexCount = documents.filter(d => d.classification === 'COMPLEX').length;
  const technicalCount = documents.filter(d => d.classification === 'HIGHLY_TECHNICAL').length;

  // Department workload & bottleneck analysis
  const deptStats = useMemo(() => {
    return Object.values(DEPARTMENTS).map(dept => {
      const deptDocs = documents.filter(d => d.currentOffice === dept.code);
      const pendingCount = deptDocs.filter(d => d.status !== 'Completed' && d.status !== 'Archived').length;
      const overdueCount = deptDocs.filter(d => getSLAStatus(d) === 'OVERDUE').length;
      const warningCount = deptDocs.filter(d => getSLAStatus(d) === 'WARNING').length;

      // Avg days spent calculation
      const avgDays = deptDocs.length > 0 
        ? (deptDocs.reduce((acc, curr) => acc + curr.daysSpent, 0) / deptDocs.length).toFixed(1)
        : '0.0';

      const bottleneckScore = overdueCount * 3 + warningCount * 1.5 + pendingCount * 0.5;

      return {
        dept,
        pendingCount,
        overdueCount,
        warningCount,
        avgDays,
        bottleneckScore
      };
    }).sort((a, b) => b.bottleneckScore - a.bottleneckScore);
  }, [documents]);

  const handleExportCSV = () => {
    const rows = documents.map(d => ({
      Tracking_ID: d.id,
      Document_Title: d.title,
      Classification: d.classification,
      Category: d.category,
      Current_Office: d.currentOffice,
      Current_Status: d.status,
      Requestor_Name: d.requestorName,
      Days_Spent: d.daysSpent,
      RA11032_SLA_Status: getSLAStatus(d),
      Date_Received: d.createdAt,
      Deadline_Date: d.deadlineAt
    }));

    exportToCSV(`ARTA_RA11032_Compliance_Summary_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    addToast('ARTA Compliance CSV Summary exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Executive Overview Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-2xl text-white p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border-2 border-amber-400/80 flex items-center justify-center text-amber-300 shrink-0">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                Office of the Municipal Mayor & Administrator
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                RA 11032 / ARTA Dashboard
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Municipal SLA Compliance & Bottleneck Analytics
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Ease of Doing Business monitoring under Republic Act 11032 statutory guidelines
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Generate ARTA Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>SLA Compliance Rate</span>
            <ShieldCheck className={`w-5 h-5 ${complianceRate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900">{complianceRate}%</span>
            <span className="text-xs text-slate-500 font-medium">RA 11032 Target: 90%+</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full ${complianceRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${complianceRate}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex justify-between">
            <span>{totalDocs - overdueDocs.length} on time</span>
            <span className="text-red-600 font-bold">{overdueDocs.length} SLA breach</span>
          </div>
        </div>

        {/* Active Transactions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Active In-Pipeline</span>
            <TrendingUp className="w-5 h-5 text-blue-900" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-blue-950">{inProgressDocs}</span>
            <span className="text-xs text-slate-500 font-medium">of {totalDocs} total logged</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>In Progress at Stations:</span>
              <strong className="text-slate-800">{inProgressDocs}</strong>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>On Hold (Pending Citizen):</span>
              <strong className="text-amber-700">{onHoldDocs}</strong>
            </div>
          </div>
        </div>

        {/* Overdue Lapsed Warnings */}
        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs bg-red-50/20">
          <div className="flex items-center justify-between text-xs font-bold text-red-700 uppercase tracking-wider">
            <span>Lapsed / SLA Breaches</span>
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-red-700">{overdueDocs.length}</span>
            <span className="text-xs text-red-600 font-medium">Immediate Action Required</span>
          </div>
          <div className="mt-3 text-[11px] text-red-800 leading-snug">
            Violations under Section 21 of RA 11032 subject to ARTA administrative inquiry.
          </div>
        </div>

        {/* Successfully Released */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Released / Completed</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-700">{completedDocs}</span>
            <span className="text-xs text-slate-500 font-medium">Permits / Documents</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            Average turnaround: <strong className="text-slate-800">4.2 working days</strong> across all departments.
          </div>
        </div>
      </div>

      {/* Middle Section: Bottleneck Barometer & Volume Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Bottleneck Barometer (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Department Bottleneck Radar & SLA Performance
              </h3>
              <p className="text-xs text-slate-500">
                Offices ranked by pending volume and overdue statutory time limits
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Sorted by urgency</span>
          </div>

          {/* Department Barometers */}
          <div className="space-y-3.5 pt-2">
            {deptStats.map(item => {
              const isBottleneck = item.overdueCount > 0 || item.warningCount > 0;
              return (
                <div 
                  key={item.dept.code}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.overdueCount > 0 
                      ? 'bg-red-50/40 border-red-200' 
                      : item.warningCount > 0 
                      ? 'bg-amber-50/30 border-amber-200' 
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-xs">
                        {item.dept.code}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{item.dept.name}</div>
                        <div className="text-[10px] text-slate-500">Head: {item.dept.head}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-500">Pending Load</div>
                        <div className="font-extrabold text-slate-900">{item.pendingCount} docs</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-500">Avg Turnaround</div>
                        <div className="font-extrabold text-blue-900">{item.avgDays} days</div>
                      </div>
                      {item.overdueCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          {item.overdueCount} Overdue
                        </span>
                      )}
                      {item.warningCount > 0 && item.overdueCount === 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {item.warningCount} Warning
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar of Load */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.overdueCount > 0 ? 'bg-red-600' : item.warningCount > 0 ? 'bg-amber-500' : 'bg-blue-800'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(8, item.pendingCount * 20))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volume Distribution by RA 11032 Classification (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Volume by RA 11032 Classification
            </h3>
            <p className="text-xs text-slate-500">
              Standard processing limits under ARTA guidelines
            </p>

            {/* Custom SVG Distribution Chart */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Simple Transactions (3 Days)
                  </span>
                  <span className="text-slate-800 font-bold">{simpleCount} ({Math.round((simpleCount / totalDocs) * 100 || 0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(simpleCount / totalDocs) * 100}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Certifications, clearances, public requests
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-amber-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Complex Transactions (7 Days)
                  </span>
                  <span className="text-slate-800 font-bold">{complexCount} ({Math.round((complexCount / totalDocs) * 100 || 0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(complexCount / totalDocs) * 100}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Business permits, vouchers, land tax assessments
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    Highly Technical (20 Days)
                  </span>
                  <span className="text-slate-800 font-bold">{technicalCount} ({Math.round((technicalCount / totalDocs) * 100 || 0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(technicalCount / totalDocs) * 100}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Building permits, subdivision plans, council ordinances
                </div>
              </div>
            </div>
          </div>

          {/* Citizen Charter Guarantee Badge */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Citizen’s Charter Guarantee
            </div>
            <p className="leading-relaxed">
              Section 12 of RA 11032 mandates all frontline municipal services maintain zero-contact policy where feasible 
              and strict adherence to posted service standards.
            </p>
          </div>
        </div>
      </div>

      {/* Critical SLA Overdue Watchlist */}
      {overdueDocs.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Critical SLA Overdue Watchlist ({overdueDocs.length} Pending Breach Cases)</span>
            </div>
            <span className="text-xs text-red-700 font-medium">Mayor's Direct Intervention List</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdueDocs.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => setSelectedDocId(doc.id)}
                className="bg-white p-3.5 rounded-xl border border-red-200 hover:border-red-400 cursor-pointer shadow-2xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-blue-900">{doc.id}</span>
                    <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded text-[10px]">
                      {doc.daysSpent} Days Elapsed
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-1 leading-snug">{doc.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Station: <strong>{DEPARTMENTS[doc.currentOffice]?.name}</strong>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-red-700 italic border-t border-slate-100 pt-1">
                  Reason: {doc.purposeOrNotes || 'Pending specialized evaluation'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: ARTA Compliance Summary Report Preview */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Anti-Red Tape Authority (ARTA) Compliance Report</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="text-center border-b pb-3">
                <p className="font-semibold text-slate-500 uppercase text-[10px]">Republic of the Philippines • ARTA Monitoring Division</p>
                <h4 className="font-black text-slate-900 text-sm">MUNICIPALITY OF SAN FERNANDO</h4>
                <p className="text-xs text-blue-900 font-bold">Quarterly Republic Act No. 11032 Service Delivery Compliance Report</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Report Generated on: {new Date().toLocaleDateString('en-PH', { dateStyle: 'full' })}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total Processed</div>
                  <div className="text-xl font-bold text-slate-900">{totalDocs}</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-[10px] text-emerald-800 uppercase font-bold">Compliant Within SLA</div>
                  <div className="text-xl font-bold text-emerald-700">{totalDocs - overdueDocs.length}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <div className="text-[10px] text-red-800 uppercase font-bold">Overdue / SLA Breached</div>
                  <div className="text-xl font-bold text-red-700">{overdueDocs.length}</div>
                </div>
              </div>

              <table className="w-full border border-slate-300 text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                    <th className="p-2 border-r">Department / Office</th>
                    <th className="p-2 border-r text-center">Pending</th>
                    <th className="p-2 border-r text-center">Overdue</th>
                    <th className="p-2 border-r text-center">Avg Turnaround</th>
                    <th className="p-2 text-center">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {deptStats.map(item => (
                    <tr key={item.dept.code}>
                      <td className="p-2 border-r font-semibold text-slate-800">
                        {item.dept.name} ({item.dept.code})
                      </td>
                      <td className="p-2 border-r text-center">{item.pendingCount}</td>
                      <td className="p-2 border-r text-center font-bold text-red-600">{item.overdueCount}</td>
                      <td className="p-2 border-r text-center">{item.avgDays} days</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.overdueCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.overdueCount === 0 ? 'COMPLIANT' : 'NEEDS IMPROVEMENT'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 border rounded-xl text-[11px] text-slate-600">
                <span className="font-bold text-slate-900">Certification:</span> I hereby certify that the document turnaround 
                data reflected herein represents accurate timestamped records from the Municipal e-DocTrack System pursuant 
                to Section 17 of RA 11032.
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Print Formal Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
