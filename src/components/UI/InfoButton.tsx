import React, { useState } from "react";

interface InfoButtonProps {
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const InfoButton: React.FC<InfoButtonProps> = ({
  onClick,
  className = "",
  style,
}) => {
  const [hovered, setHovered] = useState(false);
  const bgColor = hovered ? "#4060cb" : "transparent";
  const borderColor = hovered ? "#2a3a7a" : "#4060cb";
  const textColor = hovered ? "#2a3a7a" : "#4060cb";
  return (
    <button
      className={`absolute top-5 right-4 z-[10000] bg-transparent border-2 rounded-full w-11 h-11 flex items-center justify-center shadow-lg transition-colors ${className}`}
      style={{
        fontSize: 24,
        borderColor,
        backgroundColor: bgColor,
        ...style,
      }}
      aria-label="Information"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="font-extrabold text-2xl" style={{ color: textColor }}>
        i
      </span>
    </button>
  );
};

export default InfoButton;
