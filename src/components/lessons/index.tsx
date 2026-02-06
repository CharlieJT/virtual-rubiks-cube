import React from "react";
import TutorialPage from "@components/tutorials/TutorialPage";
import { getLessonById } from "./lessonRegistry";

interface RenderLessonProps {
  lessonId: string;
  onBack: () => void;
}

const renderLesson: React.FC<RenderLessonProps> = ({
  lessonId,
  onBack,
}) => {
    const lesson = getLessonById(lessonId);

    if (!lesson) {
      return (
        <TutorialPage lessonId={lessonId} title="Tutorial" onBack={onBack} />
      );
    }
  
    return (
      <TutorialPage
        lessonId={lesson.id}
        title={lesson.title}
        onBack={onBack}
      />
    );
};

export default renderLesson;
