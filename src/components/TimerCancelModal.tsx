import React from "react";
import Button from "@components/UI/Button";
import Modal from "@/components/UI/Modal";

interface TimerCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onReset: () => void;
  isTimerActive: boolean;
}

const TimerCancelModal: React.FC<TimerCancelModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onReset,
  isTimerActive,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={<div className="pb-4">Timer Session Options</div>}
  >
    <div className="space-y-4 text-gray-800 text-base">
      <p className="text-md text-slate-700">
        What would you like to do with your current timer session?
      </p>
      <div className="flex gap-3 justify-end">
        <Button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded transition-colors"
        >
          Keep Going
        </Button>
        {isTimerActive && (
          <Button
            onClick={onReset}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded transition-all shadow-md"
          >
            Reset
          </Button>
        )}
        <Button
          onClick={onCancel}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold rounded transition-all shadow-md"
        >
          Quit
        </Button>
      </div>
    </div>
  </Modal>
);

export default TimerCancelModal;
