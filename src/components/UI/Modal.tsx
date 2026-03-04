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
  theme?: "default" | "red" | "orange" | "green";
  fullHeight?: boolean;
  disableTransition?: boolean;
  compact?: boolean;
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
  theme = "default",
  fullHeight = false,
  disableTransition = false,
  compact = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      if (disableTransition) {
        setEntered(true);
      } else {
        setTimeout(() => setEntered(true), 10);
      }
    } else {
      setEntered(false);
      const timeout = setTimeout(() => setVisible(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && disableTransition) {
      setEntered(true);
    }
  }, [isOpen, disableTransition]);

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
        disablePointerEvents || !isOpen
          ? "pointer-events-none"
          : "pointer-events-auto"
      }
      style={{
        position: "fixed",
        inset: 0,
        zIndex: isOpen ? 9997 : -1,
        pointerEvents: disablePointerEvents || !isOpen ? "none" : "auto",
      }}
    >
      <Backdrop
        isOpen={isOpen}
        onClose={onClose}
        opacity="dark"
        entered={entered}
        withTransition={!disableTransition}
        disableClick={disableBackdropClick || disablePointerEvents}
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4">
        <div
          className={`backdrop-blur-2xl border rounded-2xl min-w-[320px] max-w-[95vw] ${compact ? "md:max-w-[420px]" : "md:max-w-[900px]"} relative flex flex-col transition-all duration-300 ${
            disablePointerEvents ? "pointer-events-none" : "pointer-events-auto"
          } ${
            entered
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          } ${className}`}
          style={{
            maxHeight: fullHeight ? "90vh" : "80vh",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(235,235,235,0.95) 50%, rgba(220,220,220,0.92) 100%)",
            borderColor:
              theme === "red"
                ? "rgba(255,23,68,0.2)"
                : theme === "orange"
                  ? "rgba(255,145,0,0.2)"
                  : theme === "green"
                    ? "rgba(0,230,118,0.2)"
                    : "rgba(41,121,255,0.2)",
            boxShadow:
              theme === "red"
                ? "0 25px 60px -12px rgba(255,23,68,0.25), 0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(255,23,68,0.1)"
                : theme === "orange"
                  ? "0 25px 60px -12px rgba(255,145,0,0.25), 0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(255,145,0,0.1)"
                  : theme === "green"
                    ? "0 25px 60px -12px rgba(0,230,118,0.25), 0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(0,230,118,0.1)"
                    : "0 25px 60px -12px rgba(41,121,255,0.25), 0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(41,121,255,0.1)",
          }}
        >
          {/* Linear gradient overlay */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.08) 100%)",
            }}
          />
          {showCloseButton && (
            <Button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full transition-all duration-200 z-10 shadow-sm hover:shadow-md border border-gray-200/50 hover:scale-110 active:scale-95"
              aria-label="Close"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          )}
          {/* Header */}
          {title && (
            <div
              className={titlePadding || `pl-8 pr-12 pt-9 shrink-0 relative`}
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)",
              }}
            >
              <h3
                className={`text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight relative ${
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
              <div className="text-gray-700 leading-relaxed">{children}</div>
            </div>
          </div>
          {/* Footer */}
          {footer && (
            <div
              className="px-8 pb-8 pt-5 shrink-0 border-t"
              style={{
                borderColor:
                  theme === "red"
                    ? "rgba(255,23,68,0.1)"
                    : theme === "orange"
                      ? "rgba(255,145,0,0.1)"
                      : theme === "green"
                        ? "rgba(0,230,118,0.1)"
                        : "rgba(41,121,255,0.1)",
                background:
                  "linear-gradient(to top, rgba(255,255,255,0.4), transparent)",
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
