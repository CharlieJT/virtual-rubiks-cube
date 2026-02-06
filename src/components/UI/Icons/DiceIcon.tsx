import React from "react";

interface DiceIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const DiceIcon: React.FC<DiceIconProps> = ({
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
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <path d="M9 9h.01" />
    <path d="M15 9h.01" />
    <path d="M9 15h.01" />
    <path d="M15 15h.01" />
    <path d="M12 12h.01" />
  </svg>
);

export default DiceIcon;
