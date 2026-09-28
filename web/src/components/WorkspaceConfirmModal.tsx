import React from 'react';
import { AlertTriangle, Check, X, Shield } from 'lucide-react';

interface WorkspaceConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  affectedDataSummary: string;
  serviceName: 'Google Drive' | 'Google Docs' | 'Google Tasks' | 'Google Chat' | 'Google Forms' | 'Google Meet';
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const WorkspaceConfirmModal: React.FC<WorkspaceConfirmModalProps> = ({
  isOpen,
  title,
  description,
  affectedDataSummary,
  serviceName,
  confirmLabel = 'Confirm & Execute',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-300 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 id="confirm-modal-title" className="text-sm font-bold text-white">
                {title}
              </h2>
              <span className="text-[11px] text-amber-400 font-medium">
                {serviceName} Integration Authorization
              </span>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed font-serif-body">
              <p className="font-semibold font-sans text-slate-900 mb-1">{description}</p>
              <p>
                In compliance with user data privacy standards, your explicit permission is required before creating, modifying, or uploading data to your personal {serviceName} account.
              </p>
            </div>
          </div>

          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block">
              Affected Payload & Action Details:
            </span>
            <p className="font-mono text-slate-800 text-[11px] whitespace-pre-wrap max-h-32 overflow-y-auto">
              {affectedDataSummary}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 border border-slate-300 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isLoading ? (
              <span>Executing with Permission...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
