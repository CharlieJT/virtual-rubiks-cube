import React from "react";
import { isRecapSlide } from "@components/tutorials/consts/tutorialSlideConfig";
import TypewriterText from "@components/tutorials/components/TypewriterText";
import type { Slide } from "@components/tutorials/slideDefinitions";

interface SlideSidePanelProps {
  activeSlide: Slide | null;
  currentSlide: number;
  totalSlides: number;
}

const SlideSidePanel: React.FC<SlideSidePanelProps> = ({
  activeSlide,
  currentSlide,
  totalSlides,
}) => {
  if (!activeSlide) return null;

  const isRecap = isRecapSlide(activeSlide.id);
  const shouldShow = !isRecap || activeSlide.id === "yellow-cross-states";

  if (!shouldShow) return null;

  return (
    <div className="hidden md:flex md:w-80 md:flex-shrink-0 bg-white/80 backdrop-blur-xl border-l border-gray-200/50">
      <div className="flex flex-col w-full h-full overflow-hidden">
        <div className="p-1 flex items-center ml-6 mr-4 border-b border-gray-200/50 shrink-0 h-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 tracking-wider uppercase whitespace-nowrap">
              {currentSlide + 1} / {totalSlides}
            </span>
            <span className="text-gray-300">•</span>
            <h3 className="text-base font-semibold text-gray-900 tracking-tight">
              {activeSlide.title}
            </h3>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="text-sm text-gray-600 leading-relaxed">
            <TypewriterText
              text={activeSlide.description}
              keyProp={String(currentSlide)}
              activeSlideId={activeSlide.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideSidePanel;
