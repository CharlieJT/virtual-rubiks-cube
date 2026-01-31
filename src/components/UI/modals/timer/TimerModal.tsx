import React from "react";
import Button from "@components/UI/Button";
import Modal from "@/components/UI/Modal";

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTimer: () => void;
  onSkip: () => void;
  isStarting?: boolean;
}

const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  onStartTimer,
  onSkip,
  isStarting = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={
      <div className="flex items-center gap-2 pb-4">
        <span>Start Timer Session?</span>
        {/* Info Icon */}
        <div className="flex items-center justify-between mb-0">
          <h2 className="text-2xl font-bold text-black flex items-center gap-1">
            <span>⏱️</span>
          </h2>
        </div>
      </div>
    }
  >
    <div className="space-y-4 text-gray-800 text-base">
      <p className="text-md text-slate-700">
        This will scramble the cube and start a timer session. The timer will
        begin when you make your first move.
      </p>
      <div className="flex gap-3 justify-end">
        <Button
          onClick={onStartTimer}
          disabled={isStarting}
          className={`px-4 py-1 rounded-lg font-bold w-[140px] text-white border-none relative transition-opacity ${
            isStarting
              ? "bg-indigo-300 opacity-70 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:opacity-90 cursor-pointer"
          }`}
        >
          {isStarting ? (
            <span className="inline-flex pt-1 items-center gap-2">
              <span className="w-6 h-6 mr-1 border-4 border-gray-200 border-t-4 border-t-cyan-400 rounded-full animate-spin"></span>
            </span>
          ) : (
            "Start Session"
          )}
        </Button>
        <Button
          onClick={onSkip}
          className="px-4 py-2 rounded-lg font-bold bg-cyan-50 text-blue-900 border-2 border-cyan-400 hover:bg-cyan-100 transition-colors"
        >
          Cancel
        </Button>
      </div>
    </div>
  </Modal>
);

export default TimerModal;
