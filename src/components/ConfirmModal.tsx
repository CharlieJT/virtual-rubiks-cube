import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSolving?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = (props) => {
  const {
    title = "Are you sure?",
    message,
    confirmText = "Yes",
    cancelText = "Cancel",
    isOpen,
    onConfirm,
    onCancel,
    isSolving = false,
  } = props;
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // Prevent background scroll

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  console.log("ConfirmModal rendered");
  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
      }}
    >
      <div
        style={{
          background: "white",
          border: "4px solid #06b6d4",
          borderRadius: 20,
          padding: 40,
          minWidth: 320,
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <h3
          style={{
            fontSize: 24,
            fontWeight: "bold",
            background: "linear-gradient(90deg,#06b6d4,#3b82f6,#6366f1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 12,
          }}
        >
          {title}
        </h3>
        <p style={{ color: "#333", marginBottom: 24 }}>{message}</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              fontWeight: "bold",
              background: "#e0f7fa",
              color: "#036",
              border: "2px solid #06b6d4",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSolving}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              fontWeight: "bold",
              background: isSolving
                ? "#a5b4fc"
                : "linear-gradient(90deg,#06b6d4,#3b82f6,#6366f1)",
              color: "white",
              border: "none",
              position: "relative",
              opacity: isSolving ? 0.7 : 1,
              cursor: isSolving ? "not-allowed" : "pointer",
              width: "125px",
            }}
          >
            {isSolving ? (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <svg
                  style={{ width: 20, height: 20, marginRight: 6 }}
                  viewBox="0 0 50 50"
                >
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="5"
                    opacity="0.2"
                  />
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="5"
                    strokeDasharray="90"
                    strokeDashoffset="60"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </svg>
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
