import React from "react";

interface SimpleTickProps {
  animKey?: number;
  line?: boolean;
  color?: "green" | "red";
  size?: "sm" | "md" | "lg";
}

const SimpleTick: React.FC<SimpleTickProps> = ({
  animKey,
  line = false,
  color = "green",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const colorClasses = {
    green: "text-green-500",
    red: "text-red-500",
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center`}
    >
      <svg
        key={animKey}
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
          style={{
            strokeDasharray: "20",
            strokeDashoffset: line ? 0 : 20,
            transition: "stroke-dashoffset 0.5s ease-out",
          }}
        />
      </svg>
    </div>
  );
};

export default SimpleTick;
