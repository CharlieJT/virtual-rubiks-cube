import React from "react";
import Button from "@components/UI/Button";
import Modal from "@/components/UI/Modal";
import TimerIcon from "@components/UI/Icons/TimerIcon";

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
    compact
    title={
      <div className="flex items-center gap-2 pb-4">
        <span>Start Timer Session?</span>
        {/* Info Icon */}
        <div className="flex items-center justify-between mb-0">
          <h2 className="text-2xl font-bold text-black flex items-center gap-1">
            <TimerIcon size={28} />
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
          className={`px-5 py-2.5 rounded-xl font-semibold w-[150px] text-white border-none relative transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] ${
            isStarting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
          }`}
          style={{ backgroundColor: isStarting ? "#90a4ae" : "#2979FF" }}
        >
          {isStarting ? (
            <span className="inline-flex pt-1 items-center gap-2">
              <span className="w-8 h-6 mr-1 border-4 border-gray-200 border-t-4 border-t-blue-400 rounded-full animate-spin"></span>
            </span>
          ) : (
            "Start Session"
          )}
        </Button>
        <Button
          onClick={onSkip}
          className="px-5 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all duration-200"
        >
          Cancel
        </Button>
      </div>
    </div>
  </Modal>
);

export default TimerModal;
