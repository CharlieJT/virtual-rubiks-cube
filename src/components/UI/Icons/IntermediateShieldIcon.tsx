import React from "react";

interface IntermediateShieldIconProps {
  className?: string;
  size?: number;
}

const IntermediateShieldIcon: React.FC<IntermediateShieldIconProps> = ({
  className = "",
  size = 24,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L4 5v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V5l-8-3z"
      fill="currentColor"
    />
    <rect
      x="7"
      y="8.5"
      width="10"
      height="2"
      rx="1"
      fill="white"
      fillOpacity="0.9"
    />
    <rect
      x="7"
      y="13"
      width="10"
      height="2"
      rx="1"
      fill="white"
      fillOpacity="0.9"
    />
  </svg>
);

export default IntermediateShieldIcon;
