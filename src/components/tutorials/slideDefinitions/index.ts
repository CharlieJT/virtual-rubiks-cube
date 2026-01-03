import { getNotationSlides, type Slide } from "./notationSlides";
import { getWhiteCrossSlides } from "./whiteCrossSlides";
import { getWhiteCornersSlides } from "./whiteCornersSlides";
import { getSecondLayerSlides } from "./secondLayerSlides";
import { getYellowCrossSlides } from "./yellowCrossSlides";
import { getYellowEdgesSlides } from "./yellowEdgesSlides";

export type { Slide };

const getSlidesForLesson = (lessonId: string): Slide[] => {
  if (lessonId === "notation") {
    return getNotationSlides();
  } else if (lessonId === "white-cross") {
    return getWhiteCrossSlides();
  } else if (lessonId === "white-corners") {
    return getWhiteCornersSlides();
  } else if (lessonId === "second-layer") {
    return getSecondLayerSlides();
  } else if (lessonId === "yellow-cross") {
    return getYellowCrossSlides();
  } else if (lessonId === "yellow-edges") {
    return getYellowEdgesSlides();
  }
  return [];
};

export default getSlidesForLesson;
