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
  let colorClass = "bg-green-400 text-green-900";
  let Icon = CheckIcon;
  let label = "Solved";

  if (isScrambling) {
    colorClass = "bg-blue-400 text-blue-900";
    Icon = HourglassIcon;
    label = "Scrambling";
  } else if (isSolving) {
    colorClass = "bg-yellow-400 text-yellow-900";
    Icon = LightningIcon;
    label = "Solving";
  } else if (isAutoOrienting) {
    colorClass = "bg-orange-400 text-orange-900";
    Icon = CompassIcon;
    label = "Orienting";
  } else if (isScrambled) {
    colorClass = "bg-red-400 text-red-900";
    Icon = ShuffleIcon;
    label = "Scrambled";
  }

  return (
    <div className="absolute left-4 bottom-4 z-30 pointer-events-none">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-base md:text-sm ${colorClass}`}
      >
        <Icon size={18} className="flex-shrink-0" />
        {label}
      </div>
    </div>
  );
};

export default StatusBadge;
