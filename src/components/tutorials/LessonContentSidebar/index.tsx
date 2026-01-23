import React from "react";
import { isRecapSlide } from "@/consts/tutorialSlideConfig";
import LessonContent from "@components/LessonContent";
import type { Slide } from "@components/tutorials/slideDefinitions";

interface LessonContentSidebarProps {
  activeSlide: Slide | null;
  lessonId: string;
  showLessonContent: boolean;
}

const LessonContentSidebar: React.FC<LessonContentSidebarProps> = ({
  activeSlide,
  lessonId,
  showLessonContent,
}) => {
  const isRecap = isRecapSlide(activeSlide?.id);
  const shouldShow = !isRecap || activeSlide?.id === "yellow-cross-states";

  if (!shouldShow) return null;

  return (
    <div
      className={`${
        showLessonContent ? "block" : "hidden"
      } md:block w-full md:w-80 bg-gray-50 border-r overflow-y-auto ${
        showLessonContent ? "absolute md:relative z-10 h-full" : ""
      }`}
    >
      <LessonContent lessonId={lessonId} />
    </div>
  );
};

export default LessonContentSidebar;
