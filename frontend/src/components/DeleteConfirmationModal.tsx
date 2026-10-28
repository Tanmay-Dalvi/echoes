import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Memory } from '../types';

interface DeleteConfirmationModalProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  memory,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !memory) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#11261C]/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#FBF9F4] border border-[#DFD7C7] rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1A382A]">
              Remove from Memory Garden?
            </h3>
            <p className="text-xs text-[#5C554C] mt-1 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#1A382A]">"{memory.title}"</strong>? This will remove the story and any generated remembrance cards from this device.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#DFD7C7]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-[#F6F1E7] text-[#5C554C] text-xs font-medium hover:bg-[#EDE5D5] transition-colors"
          >
            Keep Memory
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-700 text-white text-xs font-medium hover:bg-red-800 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Permanently Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

