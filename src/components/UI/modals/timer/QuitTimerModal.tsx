import React from "react";
import Button from "@components/UI/Button";
import Modal from "@/components/UI/Modal";

interface QuitTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isQuitting?: boolean;
}

const QuitTimerModal: React.FC<QuitTimerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isQuitting = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Quit Timer Session?"
    theme="red"
  >
    <div className="space-y-4 text-gray-800 text-base">
      <p className="text-md text-slate-700">
        Are you sure you want to quit the current timer session? Your current
        progress will be lost.
      </p>
      <div className="flex gap-3 justify-end">
        <Button
          onClick={onConfirm}
          disabled={isQuitting}
          className={`px-4 py-1 rounded-lg font-bold w-[80px] text-white border-none transition-opacity ${
            isQuitting
              ? "bg-red-300 opacity-70 cursor-not-allowed"
              : "bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 cursor-pointer"
          }`}
        >
          {isQuitting ? (
            <span className="inline-flex pt-1 items-center gap-2">
              <span className="w-6 h-6 border-4 border-gray-200 border-t-4 border-t-red-400 rounded-full animate-spin"></span>
            </span>
          ) : (
            "Quit"
          )}
        </Button>
        <Button
          onClick={onClose}
          className="px-4 py-2 rounded-lg font-bold bg-red-50 text-red-900 border-2 border-red-400 hover:bg-red-100 transition-colors"
        >
          Cancel
        </Button>
      </div>
    </div>
  </Modal>
);

export default QuitTimerModal;
