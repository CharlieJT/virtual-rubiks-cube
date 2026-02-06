import React from "react";

interface LightningIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const LightningIcon: React.FC<LightningIconProps> = ({
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
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export default LightningIcon;
