import React from "react";

interface SeedlingIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const SeedlingIcon: React.FC<SeedlingIconProps> = ({
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
    <path d="M12 22v-7" />
    <path d="M12 15c-4 0-6-2-6-5V4c0-1 2-2 2-2s2 1 2 2v6c0 3 2 5 6 5" />
    <path d="M12 15c4 0 6-2 6-5V4c0-1-2-2-2-2s-2 1-2 2v6c0 3-2 5-6 5" />
    <path d="M12 15v7" />
  </svg>
);

export default SeedlingIcon;
