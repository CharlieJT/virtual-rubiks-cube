import React from "react";
import Modal from "./UI/Modal";
import Button from "./UI/Button";
import type { BestTime } from "@/hooks/useBestTimes";

interface BestTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestTimes: (BestTime | null)[];
  hasTimes: boolean;
  onReset: () => void;
}

const BestTimesModal: React.FC<BestTimesModalProps> = ({
  isOpen,
  onClose,
  bestTimes,
  hasTimes,
  onReset,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={
      <div className="flex items-center gap-2 pb-4">
        <span>Best times</span>
        {/* Info Icon */}
        <div className="flex items-center justify-between mb-0">
          <h2 className="text-2xl font-bold text-black flex items-center gap-2">
            <span>🏆</span>
          </h2>
        </div>
      </div>
    }
  >
    <div className="space-y-1 m-2">
      {!hasTimes ? (
        <div className="text-center py-8 text-gray-600">
          <p className="text-lg">No times recorded yet!</p>
          <p className="text-sm mt-2">
            Complete some timed solves to see your best times here.
          </p>
        </div>
      ) : (
        bestTimes.map((time, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">{index + 1}.</span>
            <span className="text-black font-mono text-lg">
              {time ? time.time : "-"}
            </span>
          </div>
        ))
      )}
    </div>

    <div className="flex gap-3">
      {hasTimes && (
        <Button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to reset all best times? This cannot be undone."
              )
            ) {
              onReset();
            }
          }}
          className="flex-1 px-4 py-2 rounded-lg font-bold text-white border-none transition-opacity bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 cursor-pointer"
        >
          Reset Times
        </Button>
      )}
    </div>
  </Modal>
);

export default BestTimesModal;
