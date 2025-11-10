import React from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  const confirmButtonClasses = isDestructive
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
    : 'bg-[#0057b8] hover:bg-blue-700 focus:ring-blue-500 text-white';

  return (
    <Modal title={title} onClose={onClose}>
      <div className="text-slate-600 dark:text-slate-300">
        <p>{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`px-4 py-2 font-semibold rounded-lg shadow-md transition-colors ${confirmButtonClasses}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
