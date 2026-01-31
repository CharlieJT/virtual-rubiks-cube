import React from "react";
import Button from "@components/UI/Button";
import Modal from "@/components/UI/Modal";

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

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = "Are you sure?",
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  isOpen,
  onConfirm,
  onCancel,
  isSolving = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    title={<div className="pb-4">{title}</div>}
  >
    <p className="text-gray-800 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <Button
        onClick={onConfirm}
        disabled={isSolving}
        className={`relative px-1 py-1 rounded-lg font-bold w-[105px] text-white border-none transition-opacity ${
          isSolving
            ? "bg-indigo-300 opacity-70 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:opacity-90 cursor-pointer"
        }`}
      >
        {isSolving ? (
          <span className="absolute top-[2px] left-10 inline-flex pt-2 items-center gap-2">
            <span className="w-6 h-6 mr-1 border-4 border-gray-200 border-t-4 border-t-cyan-400 rounded-full animate-spin"></span>
          </span>
        ) : (
          confirmText
        )}
      </Button>
      <Button
        onClick={onCancel}
        className="px-4 py-2 rounded-lg font-bold bg-cyan-50 text-blue-900 border-2 border-cyan-400 hover:bg-cyan-100 transition-colors"
      >
        {cancelText}
      </Button>
    </div>
  </Modal>
);

export default ConfirmModal;
