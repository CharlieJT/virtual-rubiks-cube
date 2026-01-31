import React, { useEffect, useState } from "react";
import Modal from "@/components/UI/Modal";

interface SolutionGeneratedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SolutionGeneratedModal: React.FC<SolutionGeneratedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [showTick, setShowTick] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Reset animation states and force re-render
      setAnimateProgress(false);
      setShowTick(false);
      setAnimationKey((prev) => prev + 1);

      // Start progress animation immediately
      const progressTimer = setTimeout(() => setAnimateProgress(true), 100);

      // Show tick sooner - after half the circle is drawn
      const tickTimer = setTimeout(() => setShowTick(true), 300);

      // Auto close after a few seconds
      const closeTimer = setTimeout(() => onClose(), 1600);

      // Cleanup timers if component unmounts or isOpen changes
      return () => {
        clearTimeout(progressTimer);
        clearTimeout(tickTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [isOpen]); // Remove onClose from dependencies

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      centerTitle={true}
      titlePadding="pl-10 pr-10 pt-5 pb-1 shrink-0"
      title={
        <div className="flex items-center gap-3">
          <span>Solution Generated</span>
          {/* Animated Tick Icon */}
          <div className="relative w-8 h-8">
            <svg
              key={animationKey}
              className="w-8 h-8 transform -rotate-90"
              viewBox="0 0 24 24"
            >
              {/* Background circle (grey) */}
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#e5e7eb"
                strokeWidth="2"
                fill="none"
              />

              {/* Progress circle (green) */}
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-green-500"
                style={{
                  strokeDasharray: "63",
                  strokeDashoffset: animateProgress ? "0" : "63",
                  transition: "stroke-dashoffset 0.4s ease-in-out",
                }}
              />
            </svg>

            {/* Animated Tick */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  style={{
                    strokeDasharray: "20",
                    strokeDashoffset: showTick ? "0" : "20",
                    transition: "stroke-dashoffset 0.5s ease-out",
                  }}
                />
              </svg>
            </div>
          </div>
        </div>
      }
      showCloseButton={false}
      disablePointerEvents={true}
    >
      {/* No content */}
    </Modal>
  );
};

export default SolutionGeneratedModal;
