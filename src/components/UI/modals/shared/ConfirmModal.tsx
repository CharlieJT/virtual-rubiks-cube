import React from "react";
import Button from "@components/UI/Button";
import Modal from "@/components/UI/Modal";

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSolving?: boolean;
  theme?: "default" | "red" | "orange" | "green";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = "Are you sure?",
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  isOpen,
  onConfirm,
  onCancel,
  isSolving = false,
  theme = "default",
}) => (
  <Modal
    compact
    isOpen={isOpen}
    onClose={onCancel}
    title={<div className="pb-4">{title}</div>}
    theme={theme === "green" ? "default" : theme}
  >
    <p className="text-gray-800 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <Button
        onClick={onConfirm}
        disabled={isSolving}
        className={`relative px-5 py-2.5 rounded-xl font-semibold w-[105px] border-none transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] ${
          isSolving ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
        }`}
        style={{
          backgroundColor: isSolving
            ? "#90a4ae"
            : theme === "green"
              ? "#0DB400"
              : theme === "red"
                ? "#FF1744"
                : theme === "orange"
                  ? "#FF9100"
                  : "#2979FF",
          color: "#ffffff",
        }}
      >
        {isSolving ? (
          <span className="absolute top-[2px] left-10 inline-flex pt-2 items-center gap-2">
            <span
              className={`w-6 h-6 mr-1 border-4 border-gray-200 border-t-4 rounded-full animate-spin`}
              style={{
                borderTopColor:
                  theme === "green"
                    ? "#00E676"
                    : theme === "red"
                      ? "#FF1744"
                      : theme === "orange"
                        ? "#FF9100"
                        : "#2979FF",
              }}
            ></span>
          </span>
        ) : (
          confirmText
        )}
      </Button>
      <Button
        onClick={onCancel}
        className="px-5 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all duration-200"
      >
        {cancelText}
      </Button>
    </div>
  </Modal>
);

export default ConfirmModal;
