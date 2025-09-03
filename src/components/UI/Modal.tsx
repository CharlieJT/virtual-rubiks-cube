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
}) => {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  // Theme configurations
  const themeConfig = {
    default: {
      border: "border-cyan-400",
      closeButton: "text-cyan-500 hover:text-blue-700",
      titleGradient: "from-cyan-400 via-blue-500 to-indigo-500",
    },
    red: {
      border: "border-red-500",
      closeButton: "text-red-500 hover:text-red-700",
      titleGradient: "from-red-400 via-red-500 to-red-600",
    },
    orange: {
      border: "border-orange-500",
      closeButton: "text-orange-500 hover:text-orange-700",
      titleGradient: "from-orange-400 via-orange-500 to-orange-600",
    },
  };

  const currentTheme = themeConfig[theme];

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
    if (disablePointerEvents) return; // Don't add keyboard handlers if pointer events are disabled

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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div
          className={`bg-white border-4 mx-4 ${
            currentTheme.border
          } rounded-2xl min-w-[320px] max-w-[400px] shadow-lg relative flex flex-col transition-all duration-200 ${
            disablePointerEvents ? "pointer-events-none" : "pointer-events-auto"
          } ${
            entered ? "opacity-100 scale-100" : "opacity-0 scale-0 "
          } ${className}`}
          style={{ maxHeight: "74vh", overflow: "hidden" }}
        >
          {showCloseButton && (
            <Button
              onClick={onClose}
              className={`absolute top-3 right-3 text-4xl font-bold ${currentTheme.closeButton} transition-colors cursor-pointer`}
              aria-label="Close"
            >
              &times;
            </Button>
          )}
          {/* Header */}
          {title && (
            <div className={titlePadding || `pl-6 pr-10 pt-5 ${""} shrink-0`}>
              <h3
                className={`text-2xl font-bold bg-gradient-to-r ${
                  currentTheme.titleGradient
                } bg-clip-text text-transparent ${
                  centerTitle ? "text-center" : ""
                }`}
              >
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
    </div>,
    document.body
  );
};

export default Modal;
