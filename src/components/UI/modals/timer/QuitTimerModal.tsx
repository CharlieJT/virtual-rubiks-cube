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
    compact
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
          className={`px-5 py-2.5 rounded-xl font-semibold w-[80px] text-white border-none transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] ${
            isQuitting
              ? "opacity-70 cursor-not-allowed"
              : "cursor-pointer"
          }`}
          style={{ backgroundColor: isQuitting ? "#ef9a9a" : "#FF1744" }}
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
          className="px-5 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all duration-200"
        >
          Cancel
        </Button>
      </div>
    </div>
  </Modal>
);

export default QuitTimerModal;
