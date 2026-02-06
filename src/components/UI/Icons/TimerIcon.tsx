import React from "react";

interface TimerIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const TimerIcon: React.FC<TimerIconProps> = ({
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
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export default TimerIcon;
