import type { SequencePart } from "@/components/tutorials/components/AnimatedSequence";

export const getPartState = (
  partIdx: number,
  parts: SequencePart[],
  currentIndex: number
) => {
  const part = parts[partIdx];
  const isCompleted = currentIndex >= part.boundaryIndex;
  const activePartIdx = parts.findIndex((p) => currentIndex < p.boundaryIndex);
  const isActive = activePartIdx === partIdx;
  const isFuture = activePartIdx >= 0 && partIdx > activePartIdx;
  return {
    isCompleted,
    isActive,
    isFuture: isFuture || (activePartIdx < 0 && !isCompleted && partIdx > 0),
  };
};

export const getBorderStyles = (
  borderColor?: string,
  isFuture?: boolean,
  isCompleted?: boolean,
  isCollapsing?: boolean
) => {
  if (isFuture) {
    return { borderClass: "", borderStyle: undefined };
  }
  if (isCompleted || isCollapsing) {
    const color = borderColor || "border-green-500";
    const isInlineColor = color && color.startsWith("#");
    if (isInlineColor) {
      return { borderClass: "border-2", borderStyle: { borderColor: color } };
    }
    const colorClass = color.replace("border-", "");
    return {
      borderClass: `border-2 border-${colorClass}`,
      borderStyle: undefined,
    };
  }
  const color = borderColor || "border-green-500";
  const isInlineColor = color && color.startsWith("#");
  if (isInlineColor) {
    return { borderClass: "border-2", borderStyle: { borderColor: color } };
  }
  const colorClass = color.replace("border-", "");
  return {
    borderClass: `border-2 border-${colorClass}`,
    borderStyle: undefined,
  };
};

export const getActiveColorInfo = (
  parts: SequencePart[],
  allSequencesComplete: boolean,
  getPartStateFn: (idx: number) => ReturnType<typeof getPartState>
) => {
  if (allSequencesComplete) {
    return null;
  }
  const activePartIdx = parts.findIndex((_, idx) => {
    const state = getPartStateFn(idx);
    return state.isActive;
  });
  const partToUse = activePartIdx >= 0 ? parts[activePartIdx] : parts[0];
  return {
    colorName: partToUse?.colorName || "Red",
    colorValue: partToUse?.colorValue || "#EF4444",
  };
};

export const calculateSequenceDimensions = (
  isExpanding: boolean,
  expandOpacity: number | undefined,
  isCollapsingToPending: boolean,
  collapsingToPendingOpacityValue: number | undefined,
  isCollapsing: boolean,
  isCircle: boolean,
  isFuture: boolean,
  isExpandingFromFuture: boolean,
  measuredWidth: number | undefined,
  measuredHeight: number | undefined
) => {
  const circleSize = 24;
  const dotSize = 8;
  const shouldUseExpandingSize = isFuture || isExpandingFromFuture;

  const containerWidth = shouldUseExpandingSize
    ? isExpanding && measuredWidth && expandOpacity !== undefined
      ? dotSize + (measuredWidth - dotSize) * expandOpacity
      : dotSize
    : isCollapsingToPending &&
      collapsingToPendingOpacityValue !== undefined &&
      measuredWidth
    ? dotSize + (measuredWidth - dotSize) * collapsingToPendingOpacityValue
    : isCollapsingToPending
    ? dotSize
    : isCollapsing
    ? circleSize
    : isCircle
    ? circleSize
    : measuredWidth || 200;

  const containerHeight = shouldUseExpandingSize
    ? isExpanding && measuredHeight && expandOpacity !== undefined
      ? dotSize + (measuredHeight - dotSize) * expandOpacity
      : dotSize
    : isCollapsingToPending &&
      collapsingToPendingOpacityValue !== undefined &&
      measuredHeight
    ? dotSize + (measuredHeight - dotSize) * collapsingToPendingOpacityValue
    : isCollapsingToPending
    ? dotSize
    : isExpanding && measuredHeight
    ? measuredHeight
    : isCollapsing
    ? circleSize
    : isCircle
    ? circleSize
    : measuredHeight || "auto";

  const borderRadius =
    isExpandingFromFuture && expandOpacity !== undefined
      ? `${8 + (50 - 8) * (1 - expandOpacity)}%`
      : isCollapsingToPending && collapsingToPendingOpacityValue !== undefined
      ? `${8 + (50 - 8) * (1 - collapsingToPendingOpacityValue)}%`
      : isCollapsingToPending
      ? "50%"
      : isCircle || isCollapsing || isFuture
      ? "50%"
      : "7px";

  return {
    containerWidth,
    containerHeight,
    borderRadius,
    circleSize,
    dotSize,
  };
};
