import React from "react";
import Button from "@components/UI/Button";

interface InfoButtonProps {
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const InfoButton: React.FC<InfoButtonProps> = ({
  onClick,
  className = "",
  style,
}) => (
  <Button
    className={`absolute top-4 right-4 z-[10000] bg-white/10 backdrop-blur-md border border-white/20 rounded-xl w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 ${className}`}
    style={style}
    aria-label="Information"
    onClick={onClick}
    type="button"
  >
    <svg
      className="w-7 h-7 text-white/70 hover:text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  </Button>
);

export default InfoButton;
