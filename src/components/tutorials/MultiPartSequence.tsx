import React from "react";
import AlgorithmSequence from "./AlgorithmSequence";
import CompletionTick from "./CompletionTick";

export interface SequencePart {
  /** The moves for this part */
  moves: string[];
  /** The color name to display above this sequence (e.g., "Red", "Green") */
  colorName: string;
  /** The color value to use for the color name text */
  colorValue: string;
  /** The start index in the full sequence (0-based) */
  startIndex: number;
  /** The boundary index - tick appears when currentIndex >= this */
  boundaryIndex: number;
  /** Animation key for the tick */
  tickAnimKey?: number;
  /** Whether the tick progress animation should be complete */
  tickProgress?: boolean;
  /** Whether the tick line animation should be complete */
  tickLine?: boolean;
  /** Optional border color for the sequence (default: border-green-600) */
  borderColor?: string;
}

interface MultiPartSequenceProps {
  /** Array of sequence parts */
  parts: SequencePart[];
  /** Current move index in the full sequence (0-based) */
  currentIndex: number;
  /** Direction for partial double moves (1 for CW, -1 for CCW, 0 for none) */
  partialDirection?: 0 | 1 | -1;
}

const MultiPartSequence: React.FC<MultiPartSequenceProps> = ({
  parts,
  currentIndex,
  partialDirection = 0,
}) => {
  return (
    <div className="flex flex-col py-1">
      <div className="flex gap-0">
        {parts.map((part, partIdx) => (
          <React.Fragment key={partIdx}>
            {/* Sequence part */}
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-[9px] font-bold normal-case"
                style={{ color: part.colorValue }}
              >
                {part.colorName}
              </span>
              <div className="flex items-center gap-0">
                <AlgorithmSequence
                  moves={part.moves}
                  currentIndex={currentIndex}
                  partialDirection={partialDirection}
                  startIndex={part.startIndex}
                  borderColor={part.borderColor}
                />
                {currentIndex >= part.boundaryIndex && (
                  <CompletionTick
                    animKey={part.tickAnimKey}
                    progress={part.tickProgress}
                    line={part.tickLine}
                    color="green"
                  />
                )}
              </div>
            </div>
            {/* Separator (except for last part) */}
            {partIdx < parts.length - 1 && (
              <span className="mx-1 text-gray-400 mt-5">/</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MultiPartSequence;
