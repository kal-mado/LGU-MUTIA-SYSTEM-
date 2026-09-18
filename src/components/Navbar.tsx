import React, { useState, useRef, useEffect } from 'react';
import { useDocTrack } from '../context/DocTrackContext';
import { 
  Building2, 
  Search, 
  Bell, 
  PlusCircle, 
  BarChart3, 
  FileText, 
  Globe, 
  RotateCcw, 
  Check, 
  Shield, 
  UserCheck, 
  FileSpreadsheet,
  Clock,
  Layers,
  CheckCircle2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { DEPARTMENTS } from '../data/mockData';
import { Role, DepartmentCode } from '../types';

interface NavbarProps {
  onOpenIntake: () => void;
  onOpenLogbook: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenIntake, onOpenLogbook }) => {
  const {
    activeRole,
    setActiveRole,
    activeDepartment,
    setActiveDepartment,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,
    resetToMockData,
    setSelectedDocId
  } = useDocTrack();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter(n => !n.read);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { key: Role; label: string; sub: string; icon: any }[] = [
    { key: 'RMO', label: 'Central Records Officer (RMO)', sub: 'Document Intake & Routing Slips', icon: FileSpreadsheet },
    { key: 'ACTION_OFFICER', label: 'Department Action Officer', sub: 'Inbound Acceptance & Processing', icon: UserCheck },
    { key: 'DEPT_HEAD', label: 'Department Head / Approver', sub: 'Sign-off, Re-routing & Endorsements', icon: Shield },
    { key: 'EXECUTIVE', label: 'LGU Administrator / Mayor', sub: 'RA 11032 Analytics & Bottlenecks', icon: BarChart3 },
    { key: 'CITIZEN', label: 'Public Citizen Portal', sub: 'Track Document / RA 11032 Citizen Charter', icon: Globe }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Gov.ph Official Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-200">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            Republic of the Philippines • Local Government Unit
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            RA 11032 Ease of Doing Business & Efficient Gov't Service Delivery Compliant
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={resetToMockData}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
            title="Reset to initial mock documents"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: LGU Crest & App Identity */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveView('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Seal Graphic */}
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-blue-900 via-indigo-900 to-blue-800 border-2 border-amber-400/80 shadow-sm flex items-center justify-center text-white shrink-0">
              <Building2 className="w-6 h-6 text-amber-300 group-hover:scale-105 transition-transform" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-[9px] font-bold px-1 rounded-full text-white border border-white">
                LGU
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-900">
                  Municipality of San Fernando
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-semibold border border-blue-200">
                  e-DocTrack
                </span>
              </div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                Document Monitoring & Tracking System
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md min-w-[240px] order-3 md:order-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="global-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tracking no. (e.g. LGU-BPLO-...), title, requestor..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-0.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Controls & Role Switcher */}
        <div className="flex items-center gap-2.5 order-2 md:order-3">
          {/* Intake Button for RMO / Authorized */}
          <button
            id="nav-btn-intake"
            onClick={onOpenIntake}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>New Intake</span>
          </button>

          {/* Records Logbook button if RMO */}
          {activeRole === 'RMO' && (
            <button
              onClick={onOpenLogbook}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 transition-colors"
              title="Daily Receiving Logbook"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-900" />
              <span>Logbook</span>
            </button>
          )}

          {/* Department Selector (for Action Officers & Dept Heads) */}
          {(activeRole === 'ACTION_OFFICER' || activeRole === 'DEPT_HEAD') && (
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-300 text-xs">
              <span className="text-slate-500 font-medium text-[11px] hidden lg:inline">Station:</span>
              <select
                value={activeDepartment}
                onChange={e => setActiveDepartment(e.target.value as DepartmentCode)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {Object.values(DEPARTMENTS).map(dept => (
                  <option key={dept.code} value={dept.code}>
                    {dept.shortName} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-0 z-50 overflow-hidden">
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">RA 11032 System Alerts</span>
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">No new notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.documentId) {
                            setSelectedDocId(notif.documentId);
                            setShowNotifMenu(false);
                          }
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start ${
                          !notif.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            notif.type === 'error'
                              ? 'bg-red-500'
                              : notif.type === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 flex items-center justify-between">
                            <span>{notif.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{notif.timestamp}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{notif.message}</p>
                          {notif.documentId && (
                            <span className="inline-block text-[10px] text-blue-900 font-mono mt-1 underline">
                              View {notif.documentId} →
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Pill & Dropdown */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              id="role-switcher-btn"
              className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-blue-950 text-white px-3 py-1.5 rounded-lg border border-slate-800 shadow-xs hover:border-amber-400 transition-all text-xs font-semibold cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <div className="text-left">
                <div className="text-[9px] uppercase tracking-wider text-amber-300 font-bold">Role Switcher</div>
                <div className="truncate max-w-[130px] sm:max-w-[180px]">
                  {roles.find(r => r.key === activeRole)?.label || activeRole}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300 ml-1" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50">
                <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100">
                  Switch Operational Perspective
                </div>
                <div className="mt-1 space-y-1">
                  {roles.map(r => {
                    const Icon = r.icon;
                    const isSelected = activeRole === r.key;
                    return (
                      <button
                        key={r.key}
                        onClick={() => {
                          setActiveRole(r.key);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors text-xs cursor-pointer ${
                          isSelected ? 'bg-blue-900 text-white' : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-amber-300' : 'text-blue-900'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold flex items-center justify-between">
                            <span>{r.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                          </div>
                          <div className={`text-[11px] leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                            {r.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-4 lg:px-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between overflow-x-auto text-xs font-semibold">
        <div className="flex items-center gap-1 py-1">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Work Queue & Documents</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeView === 'analytics'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>RA 11032 Analytics & ARTA</span>
          </button>

          <button
            onClick={() => setActiveView('track')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeView === 'track'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>Public Citizen Portal</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-500 py-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Simple (3d)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Complex (7d)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Highly Tech (20d)
          </span>
        </div>
      </div>
    </header>
  );
};
