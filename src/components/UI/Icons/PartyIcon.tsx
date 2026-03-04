import React from "react";

interface PartyIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const PartyIcon: React.FC<PartyIconProps> = ({
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
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Cone (party hat) - yellow */}
    <path
      d="M5.8 11.3 2 22l10.7-3.79"
      stroke="#eab308"
      strokeWidth={strokeWidth}
    />
    <path
      d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"
      stroke="#ec4899"
      strokeWidth={strokeWidth}
      fill="none"
    />
    <path
      d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"
      stroke="#22c55e"
      strokeWidth={strokeWidth}
      fill="none"
    />
    <path
      d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"
      stroke="#3b82f6"
      strokeWidth={strokeWidth}
      fill="none"
    />
    <path
      d="M11 13c1.93 1.93 2.83 4.17 2.5 6.5"
      stroke="#eab308"
      strokeWidth={strokeWidth}
      fill="none"
    />
    {/* Confetti - multi-coloured */}
    <path d="M4 3h.01" stroke="#ef4444" strokeWidth={strokeWidth} />
    <path d="M22 8h.01" stroke="#3b82f6" strokeWidth={strokeWidth} />
    <path d="M15 2h.01" stroke="#22c55e" strokeWidth={strokeWidth} />
    <path d="M22 20h.01" stroke="#ec4899" strokeWidth={strokeWidth} />
  </svg>
);

export default PartyIcon;
