import React from "react";
import CheckIcon from "@components/UI/Icons/CheckIcon";
import HourglassIcon from "@components/UI/Icons/HourglassIcon";
import LightningIcon from "@components/UI/Icons/LightningIcon";
import CompassIcon from "@components/UI/Icons/CompassIcon";
import ShuffleIcon from "@components/UI/Icons/ShuffleIcon";

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
  let colorClass = "bg-green-500/15 text-green-400 border-green-500/30";
  let Icon = CheckIcon;
  let label = "Solved";

  if (isScrambling) {
    colorClass = "bg-blue-500/15 text-blue-400 border-blue-500/30";
    Icon = HourglassIcon;
    label = "Scrambling";
  } else if (isSolving) {
    colorClass = "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
    Icon = LightningIcon;
    label = "Solving";
  } else if (isAutoOrienting) {
    colorClass = "bg-orange-500/15 text-orange-400 border-orange-500/30";
    Icon = CompassIcon;
    label = "Orienting";
  } else if (isScrambled) {
    colorClass = "bg-red-500/15 text-red-400 border-red-500/30";
    Icon = ShuffleIcon;
    label = "Scrambled";
  }

  return (
    <div className="absolute left-4 bottom-4 z-30 pointer-events-none">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm border backdrop-blur-sm ${colorClass}`}
      >
        <Icon size={16} className="flex-shrink-0" />
        {label}
      </div>
    </div>
  );
};

export default StatusBadge;
