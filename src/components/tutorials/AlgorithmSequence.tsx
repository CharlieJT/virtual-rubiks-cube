import React from "react";

export interface MovePillState {
  /** The move notation (e.g., "R", "U'", "F2") */
  move: string;
  /** Whether this move is completed */
  isDone: boolean;
  /** Whether this is the current move being executed */
  isCurrent: boolean;
  /** Whether this is a partial double move (halfway through a double turn) */
  isPartial?: boolean;
  /** Whether this is the first move in the sequence */
  isFirst?: boolean;
  /** Whether this is the last move in the sequence */
  isLast?: boolean;
}

interface AlgorithmSequenceProps {
  /** Array of move strings */
  moves: string[];
  /** Current move index (0-based) */
  currentIndex: number;
  /** Direction for partial double moves (1 for CW, -1 for CCW, 0 for none) */
  partialDirection?: 0 | 1 | -1;
  /** Optional border color class (default: border-green-600) or inline style value */
  borderColor?: string;
  /** Start index in the full sequence (for multi-part sequences) */
  startIndex?: number;
}

const AlgorithmSequence: React.FC<AlgorithmSequenceProps> = ({
  moves,
  currentIndex,
  partialDirection = 0,
  borderColor = "border-green-600",
  startIndex = 0,
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
      "relative px-1 py-1 text-[14px] md:text-xs leading-none select-none ";

    if (state.isFirst) {
      baseClass += " rounded-tl-md rounded-bl-md pl-2 ";
    }
    if (state.isLast) {
      baseClass += " rounded-tr-md rounded-br-md pr-2 ";
    }

    if (state.isDone) {
      baseClass += " bg-green-500 text-white border-green-600";
    } else if (state.isPartial) {
      baseClass += " text-white border-blue-600";
    } else if (state.isCurrent) {
      baseClass += " bg-white text-blue-700 border-blue-500";
    } else {
      baseClass += " text-gray-600 bg-gray-300 border-gray-300";
    }

    return baseClass;
  };

  const getPillStyle = (
    state: MovePillState
  ): React.CSSProperties | undefined => {
    if (state.isPartial) {
      return {
        background: "linear-gradient(90deg, #22c55e 50%, #3b82f6 50%)",
      };
    }
    return undefined;
  };

  // Handle border color: if it starts with "#" it's an inline style, otherwise it's a Tailwind class
  const isInlineColor = borderColor && borderColor.startsWith("#");
  const borderColorClass = borderColor || "border-green-600";
  const containerStyle = isInlineColor
    ? { borderColor: borderColor }
    : undefined;
  const containerClassName = isInlineColor
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
