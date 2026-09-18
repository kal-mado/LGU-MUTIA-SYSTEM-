import React from 'react';
import { useDocTrack } from '../context/DocTrackContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDocTrack();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-slate-900 border-slate-700 text-white';
        let Icon = Info;
        let iconColor = 'text-sky-400';

        if (toast.type === 'success') {
          bg = 'bg-emerald-900/95 border-emerald-700 text-white';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-300';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-900/95 border-amber-700 text-white';
          Icon = AlertTriangle;
          iconColor = 'text-amber-300';
        } else if (toast.type === 'error') {
          bg = 'bg-red-900/95 border-red-700 text-white';
          Icon = AlertCircle;
          iconColor = 'text-red-300';
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bg}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              {toast.title && <div className="text-sm font-semibold tracking-wide">{toast.title}</div>}
              <div className="text-xs text-slate-200 leading-relaxed break-words">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
