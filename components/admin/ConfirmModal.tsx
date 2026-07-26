"use client";

import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[1400] flex items-center justify-center bg-ink-900/40 p-4 animate-fade-in"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-popup animate-slide-up">
        <div className="mb-3 flex items-center gap-2 text-red-600">
          <AlertTriangle size={20} />
          <h2 id="confirm-modal-title" className="text-sm font-semibold text-ink-900">
            {title}
          </h2>
        </div>
        <p className="mb-5 text-sm text-ink-700">{description}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
