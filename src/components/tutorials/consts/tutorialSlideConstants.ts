export const HANDLED_IN_CONDITIONAL_CHAIN = [
  "corner-white-facing-right",
  "corner-white-facing-left",
  "corner-white-facing-up",
  "corner-remove-reinsert",
  "corner-remove-reinsert-alt",
  "corner-move-to-correct",
  "yellow-cross-line",
  "yellow-cross-dot",
  "yellow-cross-triangle",
  "yellow-edges-algorithm",
  "yellow-edges-one-correct",
  "yellow-edges-zero-correct",
  "yellow-corners-one-correct",
  "yellow-corners-zero-correct",
  "yellow-corners-zero-repeated",
  "edge-insert-left",
  "edge-insert-right",
  "edge-remove-reinsert",
  "edge-flipped-in-position",
  "midlayer-green-white-extraction",
  "flip-green-white-f2",
  "flip-green-white",
  "flipped-misoriented-green-white",
  "misaligned-green-white",
  "flipped-misoriented-misaligned-green-white",
] as const;

export const ACTIVE_HIGHLIGHT_BORDER_SLIDES = [
  "flip-green-white-f2",
  "flip-green-white",
  "flipped-misoriented-green-white",
  "misaligned-green-white",
  "flipped-misoriented-misaligned-green-white",
  "midlayer-green-white-extraction",
] as const;

export const isHandledInConditionalChain = (
  _slideId: string | undefined
): boolean => {
  return true;
};

type ActiveHighlightBorderSlide = typeof ACTIVE_HIGHLIGHT_BORDER_SLIDES[number];

export const hasActiveHighlightBorder = (
  slideId: string | undefined
): boolean => {
  return ACTIVE_HIGHLIGHT_BORDER_SLIDES.includes(slideId as ActiveHighlightBorderSlide);
};
