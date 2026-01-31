export type CustomWindowType = Window & {
    __isWrongMove?: boolean;
    __isManualDragMove?: boolean;
    __tutorialBackLessonId?: string | null;
    __lessonSelectorScrollPositions?: {
      overview: number;
      sections: Record<string, number>;
    };
  };