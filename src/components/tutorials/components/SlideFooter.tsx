import React, { useEffect, useRef, useState } from "react";
import { isRecapSlide } from "@components/tutorials/consts/tutorialSlideConfig";
import TypewriterText from "@components/tutorials/components/TypewriterText";
import SlideNavigationButtons from "@components/tutorials/components/SlideNavigationButtons";
import ConfettiOverlay from "@components/tutorials/components/ConfettiOverlay";
import type { Slide } from "@components/tutorials/slideDefinitions";

interface SlideFooterProps {
  activeSlide: Slide | null;
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onBack?: () => void;
}

const SlideFooter: React.FC<SlideFooterProps> = ({
  activeSlide,
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onBack,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const chevronPortalRef = useRef<HTMLDivElement>(null);

  if (!activeSlide) return null;

  const isRecap = isRecapSlide(activeSlide.id);

  useEffect(() => {
    if (isRecap) {
      // Reset to hidden first, then animate up
      setIsExpanded(false);
      // Delay to allow for smooth animation
      const timer = setTimeout(() => setIsExpanded(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsExpanded(false);
    }
  }, [isRecap, activeSlide?.id]);

  if (isRecap) {
    // Full height recap slide
    const isCompletionSlide =
      activeSlide.id === "white-cross-completion" ||
      activeSlide.id === "white-corners-completion" ||
      activeSlide.id === "second-layer-completion" ||
      activeSlide.id === "yellow-cross-completion" ||
      activeSlide.id === "yellow-edges-completion" ||
      activeSlide.id === "yellow-corners-completion" ||
      activeSlide.id === "orient-yellow-corners-final";

    return (
      <div
        className={`fixed inset-0 w-screen h-screen bg-white/70 backdrop-blur-2xl z-40 ${
          isExpanded ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: "100dvh", width: "100vw" }}
      >
        {activeSlide.showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            <ConfettiOverlay active={!!activeSlide.showConfetti} />
          </div>
        )}
        <div
          className="relative z-0 h-full flex flex-col overflow-hidden"
          style={{ height: "100dvh" }}
        >
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="max-w-screen-2xl mx-auto px-3 md:px-8 py-3">
              <div className="flex items-center gap-2 mb-3 h-12">
                <span className="text-xs font-medium text-gray-500 tracking-wider uppercase whitespace-nowrap">
                  {currentSlide + 1} / {totalSlides}
                </span>
                <span className="text-gray-300">•</span>
                <h3 className="text-base font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                  {activeSlide.title}
                  {isCompletionSlide && (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </h3>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                <TypewriterText
                  text={activeSlide.description}
                  keyProp={String(currentSlide)}
                  activeSlideId={activeSlide.id}
                  chevronPortalRef={chevronPortalRef}
                />
              </div>
            </div>
          </div>
          <div
            ref={chevronPortalRef}
            className="absolute bottom-0 left-0 right-0 h-20 flex items-end justify-center pointer-events-none z-50 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          />
          <div className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="max-w-screen-2xl mx-auto px-3 pt-3 md:pt-3">
              <div className="flex justify-end">
                <SlideNavigationButtons
                  currentSlide={currentSlide}
                  totalSlides={totalSlides}
                  onPrev={onPrev}
                  onNext={onNext}
                  onBack={onBack}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular footer at bottom
  return (
    <div className="sticky bottom-0 w-full bg-white/70 backdrop-blur-2xl border-t border-gray-200/30 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-40">
      <div
        className="max-w-screen-2xl mx-auto px-3 py-3"
        style={{ minHeight: "4em" }}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6">
          <div className="flex-1 text-gray-900 md:hidden">
            <div className="flex items-center gap-2 mb-3 h-12">
              <span className="text-xs font-medium text-gray-500 tracking-wider uppercase whitespace-nowrap">
                {currentSlide + 1} / {totalSlides}
              </span>
              <span className="text-gray-300">•</span>
              <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                {activeSlide.title}
              </h3>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              <TypewriterText
                text={activeSlide.description}
                keyProp={String(currentSlide)}
                activeSlideId={activeSlide.id}
              />
            </div>
          </div>
          <div className="flex-shrink-0 md:w-full">
            <SlideNavigationButtons
              currentSlide={currentSlide}
              totalSlides={totalSlides}
              onPrev={onPrev}
              onNext={onNext}
              onBack={onBack}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideFooter;
