import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSolving?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = (props) => {
  const {
    title = "Are you sure?",
    message,
    confirmText = "Yes",
    cancelText = "Cancel",
    isOpen,
    onConfirm,
    onCancel,
    isSolving = false,
  } = props;
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // Prevent background scroll

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      <div className="bg-white border-4 mx-4 border-cyan-400 rounded-2xl p-5 min-w-[320px] max-w-[400px] shadow-lg">
        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-gray-800 mb-6">{message}</p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg font-bold bg-cyan-50 text-blue-900 border-2 border-cyan-400 hover:bg-cyan-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSolving}
            className={`px-6 py-1 rounded-lg font-bold w-[125px] text-white border-none relative transition-opacity ${
              isSolving
                ? "bg-indigo-300 opacity-70 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:opacity-90 cursor-pointer"
            }`}
          >
            {isSolving ? (
              <span className="inline-flex py-1 items-center gap-2">
                <span className="w-6 h-6 mr-1 border-4 border-gray-200 border-t-4 border-t-cyan-400 rounded-full animate-spin"></span>
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
