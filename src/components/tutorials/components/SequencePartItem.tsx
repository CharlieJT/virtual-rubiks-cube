import React from "react";
import AlgorithmSequence from "./AlgorithmSequence";
import SimpleTick from "./SimpleTick";
import type { SequencePart } from "./AnimatedSequence";
import {
  getBorderStyles,
  calculateSequenceDimensions,
} from "@components/tutorials/utils/sequenceAnimationHelpers";

interface SequencePartItemProps {
  part: SequencePart;
  partIdx: number;
  currentIndex: number;
  innerRef?: React.RefObject<HTMLDivElement | null>;
  partialDirection: 0 | 1 | -1;
  measuredWidth: number | undefined;
  measuredHeight: number | undefined;
  isCompleted: boolean;
  isActive: boolean;
  isFuture: boolean;
  isCollapsing: boolean;
  isCollapsingToPending: boolean;
  collapsingToPendingOpacityValue: number | undefined;
  showTick: boolean;
  tickOpacityValue: number;
  isExpanding: boolean;
  expandOpacity: number | undefined;
  isExpandingFromFuture: boolean;
  borderOpacityForRender: number;
  disableTransitions: boolean;
  disablePointerEvents: boolean;
  tickLineState: boolean;
  measureRefs: React.RefObject<Map<number, HTMLDivElement>>;
  fixErrorPulse?: boolean;
}

const SequencePartItem: React.FC<SequencePartItemProps> = ({
  part,
  partIdx,
  currentIndex,
  innerRef,
  partialDirection,
  measuredWidth,
  measuredHeight,
  isCompleted,
  isActive,
  isFuture,
  isCollapsing,
  isCollapsingToPending,
  collapsingToPendingOpacityValue,
  showTick,
  tickOpacityValue,
  isExpanding,
  expandOpacity,
  isExpandingFromFuture,
  borderOpacityForRender,
  disableTransitions,
  disablePointerEvents,
  tickLineState,
  measureRefs,
  fixErrorPulse = false,
}) => {
  const borderStyles = getBorderStyles(
    part.borderColor,
    isFuture,
    isCompleted,
    isCollapsing
  );
  
  // Override border color to red when there's an error on the active part
  const errorBorderStyle = fixErrorPulse && isActive
    ? { borderColor: "#dc2626" }
    : borderStyles.borderStyle;
  
  const errorBorderClass = fixErrorPulse && isActive
    ? "border-2 border-red-600"
    : borderStyles.borderClass;
  
  const isCircle = isCompleted && showTick;

  const { containerWidth, containerHeight, borderRadius, circleSize, dotSize } =
    calculateSequenceDimensions(
      isExpanding,
      expandOpacity,
      isCollapsingToPending,
      collapsingToPendingOpacityValue,
      isCollapsing,
      isCircle,
      isFuture,
      isExpandingFromFuture,
      measuredWidth,
      measuredHeight
    );

  const sequenceOpacity = isCollapsing
    ? 0
    : isCollapsingToPending
    ? collapsingToPendingOpacityValue ?? 0
    : isExpanding
    ? expandOpacity ?? 0
    : isActive
    ? 1
    : 0;

  return (
    <React.Fragment>
      <div
        ref={(el) => {
          if (el) measureRefs.current.set(partIdx, el);
        }}
        className="absolute invisible pointer-events-none flex items-center gap-0"
        style={{ whiteSpace: "nowrap" }}
      >
        <AlgorithmSequence
          moves={part.moves}
          currentIndex={currentIndex}
          partialDirection={partialDirection}
          startIndex={part.startIndex}
        />
      </div>

      <div
        ref={innerRef}
        className="flex flex-col items-center gap-1"
        style={{
          pointerEvents: disablePointerEvents ? "none" : "auto",
        }}
      >
        <div
          className={`flex items-center justify-center overflow-hidden ${errorBorderClass}`}
          style={{
            width:
              typeof containerWidth === "number"
                ? `${containerWidth}px`
                : containerWidth,
            height:
              typeof containerHeight === "number"
                ? `${containerHeight}px`
                : containerHeight,
            minHeight:
              typeof containerHeight === "number"
                ? `${containerHeight}px`
                : "auto",
            minWidth: isFuture ? `${dotSize}px` : `${circleSize}px`,
            borderRadius: borderRadius,
            transition: disableTransitions
              ? "none"
              : "width 300ms ease-in-out, height 300ms ease-in-out, border-radius 300ms ease-in-out, opacity 300ms ease-in-out, background-color 200ms ease-in-out, border-color 200ms ease-in-out",
            ...errorBorderStyle,
            ...(errorBorderClass
              ? { opacity: borderOpacityForRender }
              : {}),
            backgroundColor: fixErrorPulse && isActive ? "#fecaca" : "transparent",
            position: "relative",
            pointerEvents: disablePointerEvents ? "none" : "auto",
          }}
        >
          <div
            className="flex items-center gap-0 transition-opacity duration-300"
            style={{
              opacity: isFuture ? 0 : showTick ? 0 : sequenceOpacity,
              pointerEvents:
                disablePointerEvents || isFuture || showTick ? "none" : "auto",
            }}
          >
            <AlgorithmSequence
              moves={part.moves}
              currentIndex={currentIndex}
              partialDirection={partialDirection}
              startIndex={part.startIndex}
              hideBorder={true}
              fixErrorPulse={fixErrorPulse && isActive}
            />
          </div>
          {(isFuture || isExpandingFromFuture || isCollapsingToPending) && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-400 transition-opacity duration-300"
              style={{
                opacity:
                  isExpandingFromFuture && expandOpacity !== undefined
                    ? 0.5 * (1 - expandOpacity)
                    : 0.5,
              }}
            />
          )}
          {showTick && (
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
              style={{ opacity: tickOpacityValue }}
            >
              <SimpleTick
                animKey={part.tickAnimKey}
                line={tickLineState}
                color="green"
                size="md"
              />
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default SequencePartItem;
