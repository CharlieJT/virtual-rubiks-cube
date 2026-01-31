import React from "react";

export interface MovePillState {
  move: string;
  isDone: boolean;
  isCurrent: boolean;
  isPartial?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

interface AlgorithmSequenceProps {
  moves: string[];
  currentIndex: number;
  partialDirection?: 0 | 1 | -1;
  borderColor?: string;
  startIndex?: number;
  hideBorder?: boolean;
  fixErrorPulse?: boolean;
}

const AlgorithmSequence: React.FC<AlgorithmSequenceProps> = ({
  moves,
  currentIndex,
  partialDirection = 0,
  borderColor = "border-green-500",
  startIndex = 0,
  hideBorder = false,
  fixErrorPulse = false,
}) => {
  const getPillState = (idx: number): MovePillState => {
    const globalIdx = startIndex + idx;
    const move = moves[idx];
    const isDouble = move.endsWith("2");
    const isDone = globalIdx < currentIndex;
    const isCurrent = globalIdx === currentIndex;
    const isPartial = isCurrent && isDouble && partialDirection !== 0;

    return {
      move,
      isDone,
      isCurrent,
      isPartial,
      isFirst: idx === 0,
      isLast: idx === moves.length - 1,
    };
  };

  const getPillClassName = (state: MovePillState): string => {
    let baseClass =
      "relative px-1 py-1 text-[14px] md:text-xs leading-none select-none transition-colors duration-200 ";

    if (state.isFirst) {
      baseClass += " rounded-tl-md rounded-bl-md pl-2 ";
    }
    if (state.isLast) {
      baseClass += " rounded-tr-md rounded-br-md pr-2 ";
    }

    if (state.isDone) {
      baseClass += " bg-green-500 text-white border-green-500";
    } else if (state.isPartial) {
      if (fixErrorPulse) {
        baseClass += " bg-red-500 text-white border-red-600";
      } else {
        baseClass += " text-white border-blue-600";
      }
    } else if (state.isCurrent) {
      if (fixErrorPulse) {
        baseClass += " bg-red-500 text-white border-red-600";
      } else {
        baseClass += " bg-white text-blue-700 border-blue-500";
      }
    } else {
      baseClass += " text-gray-600 bg-gray-300 border-gray-300";
    }

    return baseClass;
  };

  const getPillStyle = (
    state: MovePillState
  ): React.CSSProperties | undefined => {
    if (state.isPartial && !fixErrorPulse) {
      return {
        background: "linear-gradient(90deg, #22c55e 50%, #3b82f6 50%)",
      };
    }
    return undefined;
  };

  const isInlineColor = borderColor && borderColor.startsWith("#");
  const borderColorClass = borderColor || "border-green-500";
  const containerStyle =
    isInlineColor && !hideBorder ? { borderColor: borderColor } : undefined;
  const containerClassName = hideBorder
    ? "flex items-center gap-0"
    : isInlineColor
    ? "flex items-center border rounded-[7px] gap-0"
    : `flex items-center ${borderColorClass} border rounded-[7px] gap-0`;

  return (
    <div className={containerClassName} style={containerStyle}>
      {moves.map((move, idx) => {
        const state = getPillState(idx);
        return (
          <div
            key={`${move}-${startIndex + idx}`}
            className={getPillClassName(state)}
            style={getPillStyle(state)}
            title={move}
          >
            {move}
          </div>
        );
      })}
    </div>
  );
};

export default AlgorithmSequence;
