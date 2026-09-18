import React, { useState } from 'react';
import { DocTrackProvider, useDocTrack } from './context/DocTrackContext';
import { Navbar } from './components/Navbar';
import { ActionQueueView } from './components/ActionQueueView';
import { ExecutiveAnalyticsView } from './components/ExecutiveAnalyticsView';
import { CitizenTrackingPortal } from './components/CitizenTrackingPortal';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { RoutingSlipModal } from './components/RoutingSlipModal';
import { IntakeModal } from './components/IntakeModal';
import { LogbookModal } from './components/LogbookModal';
import { ToastContainer } from './components/ToastContainer';
import { 
  Building2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Scale, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, activeRole } = useDocTrack();
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Header with Navigation & Role Switcher */}
      <Navbar 
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenLogbook={() => setIsLogbookOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
        {activeView === 'dashboard' && (
          <ActionQueueView onOpenIntake={() => setIsIntakeOpen(true)} />
        )}
        {activeView === 'analytics' && (
          <ExecutiveAnalyticsView />
        )}
        {activeView === 'track' && (
          <CitizenTrackingPortal />
        )}
      </main>

      {/* Modals */}
      <IntakeModal 
        isOpen={isIntakeOpen} 
        onClose={() => setIsIntakeOpen(false)} 
      />
      <LogbookModal 
        isOpen={isLogbookOpen} 
        onClose={() => setIsLogbookOpen(false)} 
      />
      <DocumentDetailModal />
      <RoutingSlipModal />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Official Philippine LGU Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Col 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-900 border border-amber-400 flex items-center justify-center text-amber-400 font-bold text-xs">
                  PH
                </div>
                <span className="font-extrabold text-white text-sm">
                  LGU e-DocTrack
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Philippine Municipal Document Monitoring & Tracking System engineered for complete transparency and compliance with Republic Act No. 11032.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Statutory Mandate
              </h4>
              <p className="text-[11px] leading-relaxed">
                Anti-Red Tape Authority (ARTA) Memorandum Circular 2019-002 & DILG Joint Memorandum on Ease of Doing Business.
              </p>
              <div className="text-[10px] text-amber-400 font-mono">
                Prescribed SLA: Simple (3d) • Complex (7d) • Highly Tech (20d)
              </div>
            </div>

            {/* Col 3 */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Municipal Contact Center
              </h4>
              <div className="text-[11px] space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Municipal Hall, San Fernando, La Union</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Hotline: (072) 888-2026 / ARTA 8888</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>records@sanfernando.gov.ph</span>
                </div>
              </div>
            </div>

            {/* Col 4 */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Citizen's Charter
              </h4>
              <p className="text-[11px] leading-relaxed">
                Citizens are entitled to a copy of the official routing slip and receiving acknowledgment receipt upon document submission.
              </p>
              <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Contact Policy Compliant</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 Republic of the Philippines • Municipality of San Fernando. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>National Archives Certified</span>
              <span>•</span>
              <span>ARTA Standard v2.4</span>
              <span>•</span>
              <span>Bagong Pilipinas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <DocTrackProvider>
      <MainContent />
    </DocTrackProvider>
  );
}
