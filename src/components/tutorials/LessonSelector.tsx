import React, { useEffect, useRef, useState } from "react";
import type { CustomWindowType } from "@/types/window";
import BeginnerShieldIcon from "@components/UI/Icons/BeginnerShieldIcon";
import IntermediateShieldIcon from "@components/UI/Icons/IntermediateShieldIcon";
import AdvancedShieldIcon from "@components/UI/Icons/AdvancedShieldIcon";
import LightbulbIcon from "@components/UI/Icons/LightbulbIcon";

interface LessonSelectorProps {
  onSelectLesson: (lessonId: string) => void;
  initialSection?: SectionLevel | null;
  initialLessonId?: string;
}

type SectionLevel = "beginner" | "intermediate" | "advanced";

type LessonType =
  | "rubiks-cube-introduction"
  | "notation"
  | "white-cross"
  | "white-corners"
  | "second-layer"
  | "yellow-cross"
  | "yellow-edges"
  | "yellow-corners"
  | "orient-yellow-corners"
  | "f2l-beginner"
  | "2-look-oll"
  | "2-look-pll"
  | "full-oll"
  | "full-pll"
  | "white-cross-comprehensive"
  | "f2l-advanced";

interface Lesson {
  id: LessonType;
  title: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}

interface LessonSection {
  title: string;
  description: string;
  level: SectionLevel;
  lessons: Lesson[];
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: {
    gradient: string;
    badge: string;
    border: string;
    accent: string;
    shadow: string;
  };
}

const lessonSections: LessonSection[] = [
  {
    title: "Beginner",
    description: "Learn the fundamentals and solve your first cube",
    level: "beginner",
    icon: BeginnerShieldIcon,
    color: {
      gradient: "from-blue-50/80 to-blue-100/60",
      badge: "text-blue-600",
      border: "border-blue-200/70",
      accent: "from-blue-400 to-blue-600",
      shadow: "shadow-blue-200/20",
    },
    lessons: [
      {
        id: "rubiks-cube-introduction",
        title: "Rubik's Cube Introduction",
        description: "A basic introduction to the cube and how it works",
        icon: "/assets/complete-cube-white-top-image.png",
      },
      {
        id: "notation",
        title: "Notation & Moves",
        description: "Learn how to read and follow moves",
        icon: "/assets/notation-image.png",
      },
      {
        id: "white-cross",
        title: "White Cross",
        description: "Form a white cross on the bottom face",
        icon: "/assets/white-cross-image.png",
      },
      {
        id: "white-corners",
        title: "White Corners",
        description: "Complete the white face by placing corner pieces",
        icon: "/assets/white-corners-image.png",
      },
      {
        id: "second-layer",
        title: "Second Layer",
        description: "Solve the middle layer edge pieces",
        icon: "/assets/second-layer-image.png",
      },
      {
        id: "yellow-cross",
        title: "Yellow Cross",
        description: "Form a yellow cross on the top face",
        icon: "/assets/yellow-cross-image.png",
      },
      {
        id: "yellow-edges",
        title: "Yellow Edges",
        description: "Position the yellow cross edges correctly",
        icon: "/assets/yellow-edges-image.png",
      },
      {
        id: "yellow-corners",
        title: "Yellow Corners",
        description: "Position the yellow corner pieces",
        icon: "/assets/yellow-corners-image.png",
      },
      {
        id: "orient-yellow-corners",
        title: "Orient Yellow Corners",
        description: "Complete the cube by orienting yellow corners",
        icon: "/assets/complete-cube-yellow-top-image.png",
      },
    ],
  },
  {
    title: "Intermediate",
    description: "Speed up your solves with advanced techniques",
    level: "intermediate",
    icon: IntermediateShieldIcon,
    color: {
      gradient: "from-purple-50/80 to-purple-100/60",
      badge: "text-purple-600",
      border: "border-purple-200/70",
      accent: "from-purple-400 to-purple-600",
      shadow: "shadow-purple-200/20",
    },
    lessons: [
      {
        id: "white-cross-comprehensive",
        title: "White Cross (Comprehensive)",
        description: "Master efficient cross solving with advanced techniques",
        icon: "/assets/white-cross-image.png",
        comingSoon: true,
      },
      {
        id: "f2l-beginner",
        title: "F2L (First Two Layers)",
        description: "Learn to solve the first two layers simultaneously",
        icon: "/assets/second-layer-image.png",
        comingSoon: true,
      },
      {
        id: "2-look-oll",
        title: "2-Look OLL",
        description: "Orient the last layer in two steps",
        icon: "/assets/oll-image.png",
        comingSoon: true,
      },
      {
        id: "2-look-pll",
        title: "2-Look PLL",
        description: "Permute the last layer in two steps",
        icon: "/assets/complete-cube-yellow-top-image.png",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Advanced",
    description: "Master speedcubing with full algorithm sets",
    level: "advanced",
    icon: AdvancedShieldIcon,
    color: {
      gradient: "from-amber-50/80 to-amber-100/60",
      badge: "text-amber-600",
      border: "border-amber-200/70",
      accent: "from-amber-400 to-amber-600",
      shadow: "shadow-amber-200/20",
    },
    lessons: [
      {
        id: "f2l-advanced",
        title: "Advanced F2L",
        description:
          "Master F2L with look-ahead and recognizing your next pair while solving",
        icon: "/assets/second-layer-image.png",
        comingSoon: true,
      },
      {
        id: "full-oll",
        title: "Full OLL",
        description:
          "Learn all 57 OLL cases for one-step last layer orientation",
        icon: "/assets/oll-image.png",
        comingSoon: true,
      },
      {
        id: "full-pll",
        title: "Full PLL",
        description:
          "Master all 21 PLL cases for one-step last layer permutation",
        icon: "/assets/complete-cube-yellow-top-image.png",
        comingSoon: true,
      },
    ],
  },
];

const LessonSelector = ({
  onSelectLesson,
  initialSection = null,
  initialLessonId,
}: LessonSelectorProps) => {
  const windowLessonId = (window as CustomWindowType).__tutorialBackLessonId;
  const shouldBlockFromWindow = !!windowLessonId;
  const shouldBlockInitially = !!(initialLessonId || shouldBlockFromWindow);
  const interactionBlockedRef = useRef(shouldBlockInitially);
  const persistentBlockRef = useRef(shouldBlockInitially);
  const userNavigatedRef = useRef(false);
  const isBlockedNow =
    interactionBlockedRef.current || persistentBlockRef.current;

  useEffect(() => {
    if (userNavigatedRef.current) {
      return;
    }

    if (initialLessonId || windowLessonId) {
      interactionBlockedRef.current = true;
      if (!persistentBlockRef.current) {
        persistentBlockRef.current = true;
      }
      const timeout = setTimeout(() => {
        interactionBlockedRef.current = false;
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      interactionBlockedRef.current = false;
    }
  }, [initialLessonId, windowLessonId]);
  const getSectionForLesson = (lessonId: string): SectionLevel | null => {
    for (const section of lessonSections) {
      if (section.lessons.some((lesson) => lesson.id === lessonId)) {
        return section.level;
      }
    }
    return null;
  };

  const [selectedSection, setSelectedSection] = useState<SectionLevel | null>(
    initialSection ||
      (initialLessonId ? getSectionForLesson(initialLessonId) : null),
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Initialize scroll positions from window storage or defaults
  const getStoredScrollPositions = () => {
    const stored = (window as CustomWindowType).__lessonSelectorScrollPositions;
    return (
      stored || {
        overview: 0,
        sections: { beginner: 0, intermediate: 0, advanced: 0 },
      }
    );
  };

  const overviewScrollPositionRef = useRef<number>(
    getStoredScrollPositions().overview,
  );
  const sectionScrollPositionsRef = useRef<Record<SectionLevel, number>>(
    getStoredScrollPositions().sections as Record<SectionLevel, number>,
  );

  // Save scroll positions to window storage
  const saveScrollPositions = () => {
    (window as CustomWindowType).__lessonSelectorScrollPositions = {
      overview: overviewScrollPositionRef.current,
      sections: { ...sectionScrollPositionsRef.current },
    };
  };

  const getScrollContainer = (): HTMLElement | null => {
    const modalScroll = document.querySelector(".modal-scroll");
    if (!modalScroll) return null;
    // The actual scrollable container is the parent with overflow-y-auto
    const scrollContainer = modalScroll.parentElement;
    if (
      scrollContainer &&
      scrollContainer.classList.contains("overflow-y-auto")
    ) {
      return scrollContainer as HTMLElement;
    }
    // Fallback: try to find the scrollable container by traversing up
    let parent = modalScroll.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (style.overflowY === "auto" || style.overflowY === "scroll") {
        return parent as HTMLElement;
      }
      parent = parent.parentElement;
    }
    return null;
  };

  const handleSectionClick = (level: SectionLevel) => {
    userNavigatedRef.current = true;
    interactionBlockedRef.current = false;
    persistentBlockRef.current = false;

    // Save current scroll position before transitioning
    const scrollContainer = getScrollContainer();
    if (scrollContainer) {
      if (selectedSection) {
        // Save scroll position for the current section view
        sectionScrollPositionsRef.current[selectedSection] =
          scrollContainer.scrollTop;
      } else {
        // Save scroll position for overview (where user was when they clicked)
        overviewScrollPositionRef.current = scrollContainer.scrollTop;
      }
      saveScrollPositions();
    }
    setIsTransitioning(true);
    setIsVisible(false);
    setTimeout(() => {
      setSelectedSection(level);
      // Set scroll position BEFORE making content visible
      const scrollContainer = getScrollContainer();
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
      // Small delay to ensure scroll is set, then show content
      setTimeout(() => {
        setIsVisible(true);
        setIsTransitioning(false);
      }, 10);
    }, 200);
  };

  const handleBack = () => {
    userNavigatedRef.current = true;
    interactionBlockedRef.current = false;
    persistentBlockRef.current = false;

    // Save current section scroll position before going back
    if (selectedSection) {
      const scrollContainer = getScrollContainer();
      if (scrollContainer) {
        sectionScrollPositionsRef.current[selectedSection] =
          scrollContainer.scrollTop;
        saveScrollPositions();
      }
    }
    // Get the saved overview scroll position to restore
    // Read from both ref and stored positions (in case component remounted)
    const stored = getStoredScrollPositions();
    const savedOverviewPosition =
      overviewScrollPositionRef.current || stored.overview;
    setIsTransitioning(true);
    setIsVisible(false);
    setTimeout(() => {
      setSelectedSection(null);
      // Set scroll position BEFORE making content visible
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const scrollContainer = getScrollContainer();
        if (scrollContainer) {
          scrollContainer.scrollTop = savedOverviewPosition;
          // Update ref to match
          overviewScrollPositionRef.current = savedOverviewPosition;
          // Small delay to ensure scroll is set, then show content
          setTimeout(() => {
            setIsVisible(true);
            setIsTransitioning(false);
          }, 10);
        } else {
          // Fallback if container not found
          setIsVisible(true);
          setIsTransitioning(false);
        }
      });
    }, 200);
  };

  // Handle initial section selection and scroll restoration
  useEffect(() => {
    if (initialLessonId && !initialSection) {
      const section = getSectionForLesson(initialLessonId);
      if (section) {
        setIsVisible(true);
        setSelectedSection(section);
        setTimeout(() => {
          const scrollContainer = getScrollContainer();
          if (scrollContainer) {
            const stored = getStoredScrollPositions();
            const savedPosition = stored.sections[section] || 0;
            scrollContainer.scrollTop = savedPosition;
            sectionScrollPositionsRef.current[section] = savedPosition;
          }
        }, 200);
      }
    } else if (!initialLessonId && !initialSection) {
      setIsVisible(false);
      const scrollContainer = getScrollContainer();
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
      overviewScrollPositionRef.current = 0;
      sectionScrollPositionsRef.current = {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      };
      delete (window as CustomWindowType).__lessonSelectorScrollPositions;
      setTimeout(() => {
        setIsVisible(true);
      }, 10);
    }
  }, [initialLessonId, initialSection]);

  const currentSection = selectedSection
    ? lessonSections.find((s) => s.level === selectedSection)
    : null;

  // Section Overview View
  if (!selectedSection) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight mb-1.5">
            Learn to Solve
          </h2>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Master the Rubik's cube with our step-by-step tutorial system.
            Progress from beginner to advanced techniques.
          </p>
        </div>
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 transition-all duration-300 ease-out ${
            isVisible && !isTransitioning
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
          style={{
            visibility: isVisible || isTransitioning ? "visible" : "hidden",
          }}
        >
          {lessonSections.map((section) => (
            <div
              key={section.level}
              onClickCapture={(e) => {
                const isBlocked =
                  isBlockedNow ||
                  interactionBlockedRef.current ||
                  persistentBlockRef.current;
                if (isBlocked) {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.nativeEvent.stopImmediatePropagation) {
                    e.nativeEvent.stopImmediatePropagation();
                  }
                  return false;
                }
              }}
              onClick={(e) => {
                const isBlocked =
                  isBlockedNow ||
                  interactionBlockedRef.current ||
                  persistentBlockRef.current;
                if (isBlocked) {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.nativeEvent.stopImmediatePropagation) {
                    e.nativeEvent.stopImmediatePropagation();
                  }
                  return false;
                }
                handleSectionClick(section.level);
              }}
              onPointerDown={(e) => {
                if (interactionBlockedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onTouchStart={(e) => {
                if (interactionBlockedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onTouchEnd={(e) => {
                if (interactionBlockedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              className={`group relative p-6 md:p-8 bg-white/90 backdrop-blur-xl border rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
                border-l-4 ${section.level === "beginner" ? "border-l-blue-400" : section.level === "intermediate" ? "border-l-purple-400" : "border-l-amber-400"}
                shadow-lg hover:shadow-2xl hover:-translate-y-1
                border-t border-r border-b border-gray-200/60
                hover:border-gray-300/80`}
            >
              <svg
                className="absolute inset-x-0 -bottom-32 w-full h-[420px] md:h-[430px] opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-300 pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  fill={
                    section.level === "beginner"
                      ? "#3b82f6"
                      : section.level === "intermediate"
                        ? "#a855f7"
                        : "#f59e0b"
                  }
                  d="M 0,25 Q 25,35 50,30 Q 75,25 100,30 L 100,100 Q 50,110 0,100 Z"
                />
              </svg>
              <div className="relative flex flex-col items-center text-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl ${section.color.badge} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                >
                  {React.createElement(section.icon, { size: 42 })}
                </div>
                <div className="space-y-1.5">
                  <h3
                    className={`text-lg md:text-xl font-bold tracking-tight ${section.level === "beginner" ? "text-blue-800" : section.level === "intermediate" ? "text-purple-800" : "text-amber-800"}`}
                  >
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-[200px] mx-auto">
                    {section.description}
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                  ${section.level === "beginner" ? "bg-blue-50 text-blue-700" : section.level === "intermediate" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"}`}
                >
                  <span>{section.lessons.length} Lessons</span>
                  <svg
                    className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 md:p-7 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/50 backdrop-blur-sm">
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-200/50 flex items-center justify-center text-sm">
              <LightbulbIcon size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">
                Getting Started
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                New to cubing? Start with the{" "}
                <strong className="font-semibold text-gray-900">
                  Beginner
                </strong>{" "}
                section and work through each lesson in order. Each tutorial
                includes interactive examples and guided practice to help you
                master the cube.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lessons View for Selected Section
  if (currentSection) {
    return (
      <div
        className={`max-w-6xl mx-auto transition-all duration-300 ease-out ${
          isVisible && !isTransitioning
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
        style={{
          visibility: isVisible || isTransitioning ? "visible" : "hidden",
        }}
      >
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back to Sections</span>
        </button>

        {/* Section Heading */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            {currentSection.title}
          </h2>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            {currentSection.description}
          </p>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {currentSection.lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={(e) => {
                if (interactionBlockedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (!lesson.comingSoon) {
                  // Save current section scroll position before navigating to lesson
                  const scrollContainer = getScrollContainer();
                  if (scrollContainer && selectedSection) {
                    sectionScrollPositionsRef.current[selectedSection] =
                      scrollContainer.scrollTop;
                    saveScrollPositions();
                  }
                  onSelectLesson(lesson.id);
                }
              }}
              onPointerDown={(e) => {
                if (interactionBlockedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onTouchStart={(e) => {
                if (interactionBlockedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onTouchEnd={(e) => {
                if (interactionBlockedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              className={`group relative p-6 md:p-7 bg-white/80 backdrop-blur-xl border ${
                currentSection.color.border
              } rounded-2xl transition-all duration-300 overflow-hidden ${
                lesson.comingSoon
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-gray-300/50 hover:shadow-xl cursor-pointer"
              }`}
              style={{
                transform: "translateY(0)",
              }}
              onMouseEnter={(e) => {
                if (!lesson.comingSoon) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {lesson.comingSoon && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100/80 rounded-md backdrop-blur-sm">
                    Coming Soon
                  </span>
                </div>
              )}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${currentSection.color.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
              <div
                className={`relative flex items-start gap-3 ${
                  lesson.comingSoon ? "pt-3" : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-xl ${
                    currentSection.color.badge
                  } flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 ${
                    lesson.icon.startsWith("/assets/") ||
                    lesson.icon.endsWith(".png") ||
                    lesson.icon.endsWith(".jpg") ||
                    lesson.icon.endsWith(".svg")
                      ? "p-1.5"
                      : ""
                  }`}
                >
                  {lesson.icon.startsWith("/assets/") ||
                  lesson.icon.endsWith(".png") ||
                  lesson.icon.endsWith(".jpg") ||
                  lesson.icon.endsWith(".svg") ? (
                    <img
                      src={lesson.icon}
                      alt={lesson.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    lesson.icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm md:text-base font-semibold text-gray-900 tracking-tight mb-1 ${
                      lesson.comingSoon ? "pr-2" : ""
                    }`}
                  >
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed lg:hidden">
                    {lesson.description}
                  </p>
                </div>
                {!lesson.comingSoon && (
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-all duration-300 group-hover:translate-x-1 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
              <p className="text-xs pt-2 text-gray-600 leading-relaxed hidden lg:block">
                {lesson.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default LessonSelector;
