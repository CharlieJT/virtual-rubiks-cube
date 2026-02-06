import React from "react";

interface ShuffleIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const ShuffleIcon: React.FC<ShuffleIconProps> = ({
  className = "",
  size = 24,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 3h5v5" />
    <path d="M4 20 21 3" />
    <path d="M21 16v5h-5" />
    <path d="M15 15l6 6" />
    <path d="M4 4l5 5" />
  </svg>
);

export default ShuffleIcon;
