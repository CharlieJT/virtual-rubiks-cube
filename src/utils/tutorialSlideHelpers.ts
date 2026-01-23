/**
 * Tutorial slide helper utilities
 */

import {
  isPracticeSlide as checkIsPracticeSlide,
  isRecapSlide as checkIsRecapSlide,
} from "@/consts/tutorialSlideConfig";

/**
 * Get the category of a slide
 */
export const getSlideCategory = (
  slideId: string | undefined
): "practice" | "recap" | "tutorial" | "unknown" => {
  if (!slideId) return "unknown";
  if (checkIsPracticeSlide(slideId)) return "practice";
  if (checkIsRecapSlide(slideId)) return "recap";
  return "tutorial";
};

/**
 * Check if a slide is a practice slide
 */
export const isPracticeSlide = (slideId: string | undefined): boolean => {
  return checkIsPracticeSlide(slideId);
};

/**
 * Check if a slide is a recap slide
 */
export const isRecapSlide = (slideId: string | undefined): boolean => {
  return checkIsRecapSlide(slideId);
};
