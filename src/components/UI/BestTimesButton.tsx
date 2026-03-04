import React from "react";
import Button from "./Button";

interface BestTimesButtonProps {
  onClick: () => void;
}

const BestTimesButton: React.FC<BestTimesButtonProps> = ({ onClick }) => (
  <Button
    onClick={onClick}
    className="absolute top-4 left-4 z-30 p-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg group"
    title="Best Times"
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white/70 group-hover:text-white transition-colors duration-200"
    >
      <path
        d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </Button>
);

export default BestTimesButton;
