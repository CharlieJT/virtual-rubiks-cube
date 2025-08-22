import React from "react";

interface StatusBadgeProps {
  isScrambling?: boolean;
  isSolving?: boolean;
  isAutoOrienting?: boolean;
  isScrambled?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  isScrambling = false,
  isSolving = false,
  isAutoOrienting = false,
  isScrambled = false,
}) => {
  let colorClass = "bg-green-400 text-green-900";
  let icon = "✅";
  let label = "Solved";

  if (isScrambling) {
    colorClass = "bg-blue-400 text-blue-900";
    icon = "⏳";
    label = "Scrambling";
  } else if (isSolving) {
    colorClass = "bg-yellow-400 text-yellow-900";
    icon = "⚡";
    label = "Solving";
  } else if (isAutoOrienting) {
    colorClass = "bg-orange-400 text-orange-900";
    icon = "🧭";
    label = "Orienting";
  } else if (isScrambled) {
    colorClass = "bg-red-400 text-red-900";
    icon = "🔀";
    label = "Scrambled";
  }

  return (
    <div className="absolute left-4 bottom-4 z-30 pointer-events-none">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-base md:text-sm ${colorClass}`}
      >
        <span>{icon}</span>
        {label}
      </div>
    </div>
  );
};

export default StatusBadge;
