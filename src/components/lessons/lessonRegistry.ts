export type LessonLevel = "beginner" | "intermediate" | "advanced";

export interface LessonConfig {
  id: string;
  title: string;
  description: string;
  level: LessonLevel;
  icon: string;
  comingSoon?: boolean;
}

import { BEGINNER_LESSONS } from "./beginner";
import { INTERMEDIATE_LESSONS } from "./intermediate";
import { ADVANCED_LESSONS } from "./advanced";

const LESSON_REGISTRY: Record<string, LessonConfig> = {
  ...BEGINNER_LESSONS,
  ...INTERMEDIATE_LESSONS,
  ...ADVANCED_LESSONS,
};

export const getLessonById = (id: string): LessonConfig | undefined => LESSON_REGISTRY[id];
