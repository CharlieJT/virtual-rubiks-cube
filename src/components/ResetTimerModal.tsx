import React from "react";
import Button from "@components/UI/Button";
import Modal from "@/components/UI/Modal";

interface ResetTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isResetting?: boolean;
}

const ResetTimerModal: React.FC<ResetTimerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isResetting = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Reset Timer Session?"
    theme="orange"
  >
    <div className="space-y-4 text-gray-800 text-base">
      <p className="text-md text-slate-700">
        Are you sure you want to reset the timer? The cube will be scrambled
        again and your current time will be lost.
      </p>
      <div className="flex gap-3 justify-end">
        <Button
          onClick={onConfirm}
          disabled={isResetting}
          className={`px-4 py-1 rounded-lg font-bold w-[85px] text-white border-none transition-opacity ${
            isResetting
              ? "bg-orange-300 opacity-70 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-400 to-orange-600 hover:opacity-90 cursor-pointer"
          }`}
        >
          {isResetting ? (
            <span className="inline-flex pt-1 items-center gap-2">
              <span className="w-6 h-6 mr-1 border-4 border-gray-200 border-t-4 border-t-orange-400 rounded-full animate-spin"></span>
            </span>
          ) : (
            "Reset"
          )}
        </Button>
        <Button
          onClick={onClose}
          className="px-4 py-2 rounded-lg font-bold bg-orange-50 text-orange-900 border-2 border-orange-400 hover:bg-orange-100 transition-colors"
        >
          Cancel
        </Button>
      </div>
    </div>
  </Modal>
);

export default ResetTimerModal;
