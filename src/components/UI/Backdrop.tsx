import React from "react";

interface BackdropProps {
  isOpen: boolean;
  onClose: () => void;
  opacity?: "light" | "medium" | "dark";
  className?: string;
  entered?: boolean;
  withTransition?: boolean;
  zIndex?: string;
  disableClick?: boolean;
}

const Backdrop: React.FC<BackdropProps> = ({
  isOpen,
  onClose,
  opacity = "medium",
  className = "",
  entered = true,
  withTransition = true,
  zIndex = "z-[9998]",
  disableClick = false,
}) => {
  const opacityClasses = {
    light: "bg-black/25",
    medium: "bg-black/50",
    dark: "bg-black/70",
  };

  const transitionClasses = withTransition
    ? `transition-all duration-200 ${entered ? "opacity-100" : "opacity-0"}`
    : "";

  return (
    <div
      className={`fixed inset-0 ${zIndex} ${opacityClasses[opacity]} ${
        !disableClick ? "cursor-pointer" : "cursor-default"
      } ${transitionClasses} ${className}`}
      onClick={disableClick ? undefined : onClose}
      aria-label={disableClick ? "Overlay" : "Close overlay"}
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    />
  );
};

export default Backdrop;
