import React from "react";

interface CompletionTickProps {
  animKey?: number;
  progress?: boolean;
  line?: boolean;
  color?: "green" | "red";
  size?: "sm" | "md" | "lg";
}

const CompletionTick: React.FC<CompletionTickProps> = ({
  animKey,
  progress = false,
  line = false,
  color = "green",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const checkmarkSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const colorClasses = {
    green: "text-green-500",
    red: "text-red-500",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ml-1`}>
      <svg
        key={animKey}
        className={`${sizeClasses[size]} transform -rotate-90`}
        viewBox="0 0 24 24"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#e5e7eb"
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className={colorClasses[color]}
          style={{
            strokeDasharray: "63",
            strokeDashoffset: progress ? 0 : 63,
            transition: "stroke-dashoffset 0.4s ease-in-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className={`${checkmarkSizes[size]} ${colorClasses[color]}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
    </div>
  );
};

export default CompletionTick;
