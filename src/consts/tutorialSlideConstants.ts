export const HANDLED_IN_CONDITIONAL_CHAIN = [
  "practice-setup-solution",
  "practice-setup-solution-2",
  "practice-setup-solution-3",
  "practice-setup-solution-4",
  "practice-setup-solution-5",
  "practice-setup-solution-6",
  "yellow-cross-line",
  "yellow-cross-dot",
  "yellow-cross-triangle",
  "yellow-edges-solution",
  "yellow-edges-solution-2",
  "yellow-edges-solution-3",
  "yellow-corners-solution",
  "yellow-corners-solution-2",
  "yellow-corners-solution-3",
  "second-layer-setup-solution",
  "second-layer-setup-solution-2",
  "second-layer-setup-solution-3",
  "second-layer-setup-solution-4",
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

export const hasActiveHighlightBorder = (
  slideId: string | undefined
): boolean => {
  return ACTIVE_HIGHLIGHT_BORDER_SLIDES.includes(slideId as any);
};
