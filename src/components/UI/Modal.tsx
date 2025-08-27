import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = "",
  footer,
}) => {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Wait for mount, then trigger transition in
      setTimeout(() => setEntered(true), 10);
    } else {
      setEntered(false);
      // Delay unmount for transition
      const timeout = setTimeout(() => setVisible(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && !visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, visible, onClose]);

  if (!isOpen && !visible) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[9998] bg-black/70 cursor-pointer transition-all duration-200 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Close modal overlay"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      ></div>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div
          className={`bg-white border-4 mx-4 border-cyan-400 rounded-2xl min-w-[320px] max-w-[400px] shadow-lg relative flex flex-col pointer-events-auto transition-all duration-200 ${
            entered ? "opacity-100 scale-100" : "opacity-0 scale-0 "
          } ${className}`}
          style={{ maxHeight: "74vh", overflow: "hidden" }}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-4xl font-bold text-cyan-500 hover:text-blue-700 transition-colors"
              aria-label="Close"
            >
              &times;
            </button>
          )}
          {/* Header */}
          {title && (
            <div className="pl-5 pr-10 pt-5 pb-3 shrink-0">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                {title}
              </h3>
            </div>
          )}
          {/* Body (scrollable) */}
          <div className="flex-1 min-h-0">
            <div
              className="px-5 pb-4 modal-scroll overflow-y-auto h-full"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
                overscrollBehavior: "contain",
                scrollbarGutter: "stable",
              }}
            >
              {children}
            </div>
          </div>
          {/* Footer */}
          {footer && <div className="px-5 pb-5 pt-3 shrink-0">{footer}</div>}
        </div>
      </div>
    </>,
    document.body
  );
};

export default Modal;
