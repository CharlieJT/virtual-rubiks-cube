export const PRACTICE_SLIDES = [
  "practice-two-edges",
  "practice-three-edges",
  "practice-full-cross",
  "practice-two-corners",
  "practice-three-corners",
  "practice-four-corners",
  "practice-two-second-edges",
  "practice-three-second-edges",
  "practice-four-second-edges",
  "bonus-halfway-solve",
  "practice-last-three-steps",
  "practice-full-cube",
] as const;

export const PRACTICE_WHITE_CORNERS_SLIDES = [
  "practice-two-corners",
  "practice-three-corners",
  "practice-four-corners",
] as const;

export const PRACTICE_SECOND_LAYER_SLIDES = [
  "practice-two-second-edges",
  "practice-three-second-edges",
  "practice-four-second-edges",
] as const;

export const RECAP_SLIDES = [
  "white-cross-recap",
  "white-cross-completion",
  "white-corners-recap",
  "white-corners-completion",
  "second-layer-recap",
  "second-layer-completion",
  "intermediate-white-cross-recap",
  "yellow-cross-completion",
  "yellow-edges-completion",
  "yellow-corners-completion",
  "orient-yellow-corners-final",
] as const;

export const MULTI_STAGE_SLIDES = [
  "midlayer-green-white-extraction",
  "corner-white-facing-up",
  "corner-remove-reinsert",
  "corner-remove-reinsert-alt",
  "corner-move-to-correct",
  "edge-insert-left",
  "edge-insert-right",
  "edge-remove-reinsert",
  "edge-flipped-in-position",
  "yellow-cross-triangle",
  "yellow-cross-dot",
  "yellow-edges-one-correct",
  "yellow-edges-zero-correct",
  "yellow-edges-two-opposite",
  "yellow-corners-zero-correct",
  "yellow-corners-zero-repeated",
] as const;

export const ANIMATED_SEQUENCE_SLIDES = [
  "flip-green-white-f2",
  "flip-green-white",
  "flipped-misoriented-green-white",
  "misaligned-green-white",
  "flipped-misoriented-misaligned-green-white",
  "midlayer-green-white-extraction",
  "corner-white-facing-right",
  "corner-white-facing-left",
  "corner-white-facing-up",
  "corner-remove-reinsert",
  "corner-remove-reinsert-alt",
  "corner-move-to-correct",
  "edge-insert-left",
  "edge-insert-right",
  "edge-remove-reinsert",
  "edge-flipped-in-position",
  "yellow-cross-line",
  "yellow-cross-triangle",
  "yellow-cross-dot",
  "yellow-edges-algorithm",
  "yellow-edges-one-correct",
  "yellow-edges-zero-correct",
  "yellow-corners-one-correct",
  "yellow-corners-zero-correct",
  "yellow-corners-zero-repeated",
] as const;

export const SLIDES_WITH_FRONT_FACE_LABEL = [
  "flip-green-white-f2",
  "flip-green-white",
  "flipped-misoriented-green-white",
  "misaligned-green-white",
  "flipped-misoriented-misaligned-green-white",
  "midlayer-green-white-extraction",
  "corner-white-facing-right",
  "corner-white-facing-left",
  "corner-white-facing-up",
  "corner-remove-reinsert",
  "corner-remove-reinsert-alt",
  "corner-move-to-correct",
  "yellow-cross-line",
  "yellow-cross-triangle",
  "yellow-cross-dot",
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
] as const;

export const WHITE_CROSS_SLIDES_WITHOUT_FRONT_FACE = [
  "flip-green-white-f2",
  "flip-green-white",
  "flipped-misoriented-green-white",
  "misaligned-green-white",
  "flipped-misoriented-misaligned-green-white",
] as const;

export const HIGHLIGHT_INTENSITY_SLIDES = [
  "find-green-white", // white cross slide 2
  "mechanical-approach", // white corners slide 2 and second layer slide 2
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
  "practice-two-corners",
  "practice-three-corners",
  "practice-four-corners",
  "practice-two-second-edges",
  "practice-three-second-edges",
  "practice-four-second-edges",
  "practice-last-three-steps",
  "practice-full-cube",
  "corner-white-facing-right",
  "corner-white-facing-left",
  "corner-white-facing-up",
  "corner-remove-reinsert",
  "corner-remove-reinsert-alt",
  "corner-move-to-correct",
  "edge-insert-left",
  "edge-insert-right",
  "edge-remove-reinsert",
  "edge-flipped-in-position",
  "yellow-cross-triangle",
  "yellow-cross-dot",
  "yellow-corners-zero-correct",
] as const;

export type SlideId =
  | (typeof PRACTICE_SLIDES)[number]
  | (typeof RECAP_SLIDES)[number]
  | (typeof MULTI_STAGE_SLIDES)[number]
  | (typeof ANIMATED_SEQUENCE_SLIDES)[number]
  | string;

export const isPracticeSlide = (slideId: string | undefined): boolean =>
  PRACTICE_SLIDES.includes(slideId as (typeof PRACTICE_SLIDES)[number]);

export const isPracticeWhiteCornersSlide = (
  slideId: string | undefined
): boolean =>
  PRACTICE_WHITE_CORNERS_SLIDES.includes(slideId as (typeof PRACTICE_WHITE_CORNERS_SLIDES)[number]);

export const isPracticeSecondLayerSlide = (
  slideId: string | undefined
): boolean =>
  PRACTICE_SECOND_LAYER_SLIDES.includes(slideId as (typeof PRACTICE_SECOND_LAYER_SLIDES)[number]);

export const isRecapSlide = (slideId: string | undefined): boolean =>
  RECAP_SLIDES.includes(slideId as (typeof RECAP_SLIDES)[number]);

export const isMultiStageSlide = (slideId: string | undefined): boolean =>
  MULTI_STAGE_SLIDES.includes(slideId as (typeof MULTI_STAGE_SLIDES)[number]);

export const isAnimatedSequenceSlide = (
  slideId: string | undefined
): boolean =>
  ANIMATED_SEQUENCE_SLIDES.includes(slideId as (typeof ANIMATED_SEQUENCE_SLIDES)[number]);

export const isHighlightIntensitySlide = (
  slideId: string | undefined
): boolean =>
  HIGHLIGHT_INTENSITY_SLIDES.includes(slideId as (typeof HIGHLIGHT_INTENSITY_SLIDES)[number]);

export const requiresSetupDelay = (slideId: string | undefined): boolean =>
  SLIDES_WITH_SETUP_DELAY.includes(slideId as (typeof SLIDES_WITH_SETUP_DELAY)[number]);
