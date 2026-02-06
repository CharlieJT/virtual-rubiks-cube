import React, { useRef, useEffect } from "react";
import { useSequenceMeasurements } from "@components/tutorials/hooks/useSequenceMeasurements";
import { useSequenceAnimations } from "@components/tutorials/hooks/useSequenceAnimations";
import {
  getPartState,
  getActiveColorInfo,
} from "@components/tutorials/utils/sequenceAnimationHelpers";
import SequenceLabel from "./SequenceLabel";
import SequencePartItem from "./SequencePartItem";

export interface SequencePart {
  moves: string[];
  colorName: string;
  colorValue: string;
  startIndex: number;
  boundaryIndex: number;
  tickAnimKey?: number;
  tickProgress?: boolean;
  tickLine?: boolean;
  borderColor?: string;
}

interface AnimatedSequenceProps {
  parts: SequencePart[];
  currentIndex: number;
  partialDirection?: 0 | 1 | -1;
  slideKey?: string | number;
  showFrontFaceLabel?: boolean;
  disablePointerEvents?: boolean;
  deferMeasurements?: boolean;
  fixErrorPulse?: boolean;
}

const AnimatedSequence: React.FC<AnimatedSequenceProps> = ({
  parts,
  currentIndex,
  partialDirection = 0,
  slideKey,
  showFrontFaceLabel = false,
  disablePointerEvents = false,
  deferMeasurements = false,
  fixErrorPulse = false,
}) => {
  const allSequencesComplete =
    parts.length > 0 && currentIndex >= parts[parts.length - 1].boundaryIndex;

  const { measureRefs, sequenceWidths, sequenceHeights, disableTransitions } =
    useSequenceMeasurements({
      parts,
      currentIndex,
      deferMeasurements,
      slideKey,
    });

  const {
    collapsingIndex,
    showTickAfterCollapse,
    expandingOpacity,
    collapsingToPendingOpacity,
    tickLineStates,
    tickOpacity,
    collapsingToPending,
    frontFaceLabelOpacity,
    frontFaceLabelTranslateY,
    completionMessageOpacity,
    completionMessageTranslateY,
  } = useSequenceAnimations({
    parts,
    currentIndex,
    deferMeasurements,
    allSequencesComplete,
    slideKey,
  });

  const getPartStateFn = (partIdx: number) =>
    getPartState(partIdx, parts, currentIndex);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activePartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePartRef.current && scrollContainerRef.current) {
      activePartRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  const activeColorInfo =
    showFrontFaceLabel && !allSequencesComplete
      ? getActiveColorInfo(parts, allSequencesComplete, getPartStateFn)
      : null;

  return (
    <div className="flex flex-col text-left gap-0">
      {showFrontFaceLabel && (
        <SequenceLabel
          activeColorInfo={activeColorInfo}
          frontFaceLabelOpacity={frontFaceLabelOpacity}
          frontFaceLabelTranslateY={frontFaceLabelTranslateY}
          completionMessageOpacity={completionMessageOpacity}
          completionMessageTranslateY={completionMessageTranslateY}
          disablePointerEvents={disablePointerEvents}
        />
      )}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide overflow-x-auto overflow-y-hidden max-w-[min(calc(100vw-3rem),480px)] scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex items-center gap-2">
          {parts.map((part, partIdx) => {
            const { isCompleted, isActive, isFuture } = getPartStateFn(partIdx);
            const measuredWidth = sequenceWidths.get(partIdx) || 200;
            const isCollapsing = collapsingIndex === partIdx;
            const isCollapsingToPending = collapsingToPending.has(partIdx);
            const collapsingToPendingOpacityValue =
              collapsingToPendingOpacity.get(partIdx);
            const showTick = showTickAfterCollapse.has(partIdx) && isCompleted;
            const tickOpacityValue = tickOpacity.get(partIdx) ?? 1;
            const isExpanding = expandingOpacity.has(partIdx);
            const expandOpacity = expandingOpacity.get(partIdx);
            const measuredHeight = sequenceHeights.get(partIdx);
            const isExpandingFromFuture =
              isExpanding && expandOpacity !== undefined && expandOpacity < 1;

            const borderOpacityForRender = isFuture
              ? 0
              : isExpandingFromFuture && expandOpacity !== undefined
                ? expandOpacity
                : isCollapsingToPending &&
                    collapsingToPendingOpacityValue !== undefined
                  ? collapsingToPendingOpacityValue
                  : 1;

            return (
              <SequencePartItem
                key={partIdx}
                part={part}
                innerRef={isActive ? activePartRef : undefined}
                partIdx={partIdx}
                currentIndex={currentIndex}
                partialDirection={partialDirection}
                measuredWidth={measuredWidth}
                measuredHeight={measuredHeight}
                isCompleted={isCompleted}
                isActive={isActive}
                isFuture={isFuture}
                isCollapsing={isCollapsing}
                isCollapsingToPending={isCollapsingToPending}
                collapsingToPendingOpacityValue={
                  collapsingToPendingOpacityValue
                }
                showTick={showTick}
                tickOpacityValue={tickOpacityValue}
                isExpanding={isExpanding}
                expandOpacity={expandOpacity}
                isExpandingFromFuture={isExpandingFromFuture}
                borderOpacityForRender={borderOpacityForRender}
                disableTransitions={disableTransitions}
                disablePointerEvents={disablePointerEvents}
                tickLineState={tickLineStates.get(partIdx) ?? false}
                measureRefs={measureRefs}
                fixErrorPulse={fixErrorPulse && isActive}
              />
            );
          })}
          <div className="min-w-2 w-2 h-2"></div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedSequence;
