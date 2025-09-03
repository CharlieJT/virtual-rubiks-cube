import React, { useEffect } from "react";
import Modal from "@/components/UI/Modal";

interface SolutionAlreadyGeneratedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SolutionAlreadyGeneratedModal: React.FC<
  SolutionAlreadyGeneratedModalProps
> = ({ isOpen, onClose }) => {
  // Auto-close after 1.6 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1600);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      centerTitle={true}
      titlePadding="pl-10 pr-10 pt-5 pb-1 shrink-0"
      title={
        <div className="flex items-center gap-3">
          <span>Already Generated</span>
          {/* Info Icon */}
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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

export default SolutionAlreadyGeneratedModal;
