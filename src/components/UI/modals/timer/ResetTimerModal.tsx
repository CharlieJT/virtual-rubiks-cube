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
    compact
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
          className={`px-5 py-2.5 rounded-xl font-semibold w-[85px] text-white border-none transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] ${
            isResetting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
          }`}
          style={{ backgroundColor: isResetting ? "#ffcc80" : "#FF9100" }}
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
          className="px-5 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all duration-200"
        >
          Cancel
        </Button>
      </div>
    </div>
  </Modal>
);

export default ResetTimerModal;
