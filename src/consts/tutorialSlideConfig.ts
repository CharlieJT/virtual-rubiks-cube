export const PRACTICE_SLIDES = [
  "practice-two-edges",
  "practice-three-edges",
  "practice-full-cross",
  "practice-white-corners",
  "practice-white-corners-2",
  "practice-white-corners-3",
  "practice-second-layer",
  "practice-second-layer-2",
  "practice-second-layer-3",
  "bonus-halfway-solve",
] as const;

export const PRACTICE_WHITE_CORNERS_SLIDES = [
  "practice-white-corners",
  "practice-white-corners-2",
  "practice-white-corners-3",
] as const;

export const PRACTICE_SECOND_LAYER_SLIDES = [
  "practice-second-layer",
  "practice-second-layer-2",
  "practice-second-layer-3",
] as const;

export const RECAP_SLIDES = [
  "recap-white-cross",
  "white-cross-completion",
  "recap-white-corners",
  "white-corners-completion",
  "second-layer-recap",
  "second-layer-completion",
  "yellow-cross-completion",
  "yellow-edges-completion",
  "yellow-corners-completion",
] as const;

export const MULTI_STAGE_SLIDES = [
  "midlayer-green-white-extraction",
  "practice-setup-solution-3",
  "practice-setup-solution-4",
  "practice-setup-solution-5",
  "practice-setup-solution-6",
  "second-layer-setup-solution",
  "second-layer-setup-solution-2",
  "second-layer-setup-solution-3",
  "second-layer-setup-solution-4",
  "yellow-cross-triangle",
  "yellow-cross-dot",
  "yellow-edges-solution-2",
  "yellow-edges-solution-3",
  "yellow-edges-solution-4",
  "yellow-corners-solution-2",
  "yellow-corners-solution-3",
] as const;

export const ANIMATED_SEQUENCE_SLIDES = [
  "flip-green-white-f2",
  "flip-green-white",
  "flipped-misoriented-green-white",
  "misaligned-green-white",
  "flipped-misoriented-misaligned-green-white",
  "midlayer-green-white-extraction",
  "practice-setup-solution",
  "practice-setup-solution-2",
  "practice-setup-solution-3",
  "practice-setup-solution-4",
  "practice-setup-solution-5",
  "practice-setup-solution-6",
  "second-layer-setup-solution",
  "second-layer-setup-solution-2",
  "second-layer-setup-solution-3",
  "second-layer-setup-solution-4",
  "yellow-cross-line",
  "yellow-cross-triangle",
  "yellow-cross-dot",
  "yellow-edges-solution",
  "yellow-edges-solution-2",
  "yellow-edges-solution-3",
  "yellow-corners-solution",
  "yellow-corners-solution-2",
  "yellow-corners-solution-3",
] as const;

export const SLIDES_WITH_FRONT_FACE_LABEL = [
  "flip-green-white-f2",
  "flip-green-white",
  "flipped-misoriented-green-white",
  "misaligned-green-white",
  "flipped-misoriented-misaligned-green-white",
  "midlayer-green-white-extraction",
  "practice-setup-solution",
  "practice-setup-solution-2",
  "practice-setup-solution-3",
  "practice-setup-solution-4",
  "practice-setup-solution-5",
  "practice-setup-solution-6",
  "yellow-cross-line",
  "yellow-cross-triangle",
  "yellow-cross-dot",
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
] as const;

export const WHITE_CROSS_SLIDES_WITHOUT_FRONT_FACE = [
  "flip-green-white-f2",
  "flip-green-white",
  "flipped-misoriented-green-white",
  "misaligned-green-white",
  "flipped-misoriented-misaligned-green-white",
] as const;

export const HIGHLIGHT_INTENSITY_SLIDES = [
  "flip-green-white",
  "flip-green-white-f2",
  "misaligned-green-white",
  "flipped-misoriented-green-white",
  "flipped-misoriented-misaligned-green-white",
  "midlayer-green-white-extraction",
  "practice-two-edges",
] as const;

export const SLIDES_WITH_SETUP_DELAY = [
  "practice-two-edges",
  "practice-three-edges",
  "practice-full-cross",
  "practice-white-corners",
  "practice-white-corners-2",
  "practice-white-corners-3",
  "practice-second-layer",
  "practice-second-layer-2",
  "practice-second-layer-3",
  "practice-setup-solution",
  "practice-setup-solution-2",
  "practice-setup-solution-3",
  "practice-setup-solution-4",
  "practice-setup-solution-5",
  "practice-setup-solution-6",
  "second-layer-setup-solution",
  "second-layer-setup-solution-2",
  "second-layer-setup-solution-3",
  "second-layer-setup-solution-4",
  "yellow-cross-triangle",
  "yellow-cross-dot",
  "yellow-corners-solution-2",
] as const;

export type SlideId =
  | (typeof PRACTICE_SLIDES)[number]
  | (typeof RECAP_SLIDES)[number]
  | (typeof MULTI_STAGE_SLIDES)[number]
  | (typeof ANIMATED_SEQUENCE_SLIDES)[number]
  | string;

export const isPracticeSlide = (slideId: string | undefined): boolean => {
  return PRACTICE_SLIDES.includes(slideId as any);
};

export const isPracticeWhiteCornersSlide = (
  slideId: string | undefined
): boolean => {
  return PRACTICE_WHITE_CORNERS_SLIDES.includes(slideId as any);
};

export const isPracticeSecondLayerSlide = (
  slideId: string | undefined
): boolean => {
  return PRACTICE_SECOND_LAYER_SLIDES.includes(slideId as any);
};

export const isRecapSlide = (slideId: string | undefined): boolean => {
  return RECAP_SLIDES.includes(slideId as any);
};

export const isMultiStageSlide = (slideId: string | undefined): boolean => {
  return MULTI_STAGE_SLIDES.includes(slideId as any);
};

export const isAnimatedSequenceSlide = (
  slideId: string | undefined
): boolean => {
  return ANIMATED_SEQUENCE_SLIDES.includes(slideId as any);
};

export const isHighlightIntensitySlide = (
  slideId: string | undefined
): boolean => {
  return HIGHLIGHT_INTENSITY_SLIDES.includes(slideId as any);
};

export const requiresSetupDelay = (slideId: string | undefined): boolean => {
  return SLIDES_WITH_SETUP_DELAY.includes(slideId as any);
};
