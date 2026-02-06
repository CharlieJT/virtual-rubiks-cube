import React from "react";

interface PracticeStatusIndicatorProps {
  isSolved: boolean;
  showTick: boolean;
  tickAnimKey: number;
  tickProgress: boolean;
  tickLine: boolean;
}

const PracticeStatusIndicator: React.FC<PracticeStatusIndicatorProps> = ({
  isSolved,
  showTick,
  tickAnimKey,
  tickProgress,
  tickLine,
}) => 
  <div className="absolute top-4 left-4 z-50">
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm ${
        isSolved
          ? "bg-green-100/90 border-green-300 text-green-800"
          : "bg-red-100/90 border-red-300 text-red-800"
      }`}
    >
      {isSolved ? (
        showTick ? (
          <div className="relative w-4 h-4">
            <svg
              key={tickAnimKey}
              className="w-4 h-4 transform -rotate-90"
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
                className="text-green-600"
                style={{
                  strokeDasharray: "63",
                  strokeDashoffset: tickProgress ? 0 : 63,
                  transition: "stroke-dashoffset 0.4s ease-in-out",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-green-600"
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
                    strokeDashoffset: tickLine ? 0 : 20,
                    transition: "stroke-dashoffset 0.5s ease-out",
                  }}
                />
              </svg>
            </div>
          </div>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      <span className="font-medium text-sm">
        {isSolved ? "Solved" : "Not Solved"}
      </span>
    </div>
  </div>

export default PracticeStatusIndicator;

