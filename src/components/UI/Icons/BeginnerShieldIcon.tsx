import React from "react";

interface BeginnerShieldIconProps {
  className?: string;
  size?: number;
}

const BeginnerShieldIcon: React.FC<BeginnerShieldIconProps> = ({
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
      x="6"
      y="10"
      width="12"
      height="3"
      rx="1.5"
      fill="white"
      fillOpacity="0.9"
    />
  </svg>
);

export default BeginnerShieldIcon;
