import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Backdrop from "./Backdrop";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  footer?: React.ReactNode;
  disableBackdropClick?: boolean;
  disablePointerEvents?: boolean;
  centerTitle?: boolean;
  titlePadding?: string;
  theme?: "default" | "red" | "orange";
  fullHeight?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = "",
  footer,
  disableBackdropClick = false,
  disablePointerEvents = false,
  centerTitle = false,
  titlePadding,
  fullHeight = false,
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
    if (disablePointerEvents) return; 

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
  }, [isOpen, visible, onClose, disablePointerEvents]);

  if (!isOpen && !visible) return null;

  return createPortal(
    <div
      className={
        disablePointerEvents ? "pointer-events-none" : "pointer-events-auto"
      }
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9997,
        pointerEvents: disablePointerEvents ? "none" : "auto",
      }}
    >
      <Backdrop
        isOpen={isOpen}
        onClose={onClose}
        opacity="dark"
        entered={entered}
        withTransition={true}
        disableClick={disableBackdropClick || disablePointerEvents}
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4">
        <div
          className={`bg-white/95 backdrop-blur-2xl border border-gray-200/50 rounded-3xl min-w-[320px] max-w-[95vw] md:max-w-[900px] shadow-2xl relative flex flex-col transition-all duration-300 ${
            disablePointerEvents ? "pointer-events-none" : "pointer-events-auto"
          } ${
            entered
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          } ${className}`}
          style={{
            maxHeight: fullHeight ? "90vh" : "80vh",
            overflow: "hidden",
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08)",
          }}
        >
          {showCloseButton && (
            <Button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full transition-all duration-200 z-10"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          )}
          {/* Header */}
          {title && (
            <div
              className={
                titlePadding ||
                `pl-8 pr-12 pt-8 pb-2 ${""} shrink-0 border-b border-gray-100`
              }
            >
              <h3
                className={`text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight ${
                  centerTitle ? "text-center" : ""
                }`}
              >
                {title}
              </h3>
            </div>
          )}
          {/* Body (scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div
              className="px-8 md:px-10 py-8 md:py-10 modal-scroll"
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
          {footer && (
            <div className="px-8 pb-8 pt-4 shrink-0 border-t border-gray-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
