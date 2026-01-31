import React from "react";
import Button from "@components/UI/Button";

interface SlideControlsProps {
  lessonId: string;
  activeSlideId: string | undefined;
  currentSlide: number;
  isAnimating: boolean;
  isResetting: boolean;
  isResettingOrbit?: boolean;
  onReset: () => Promise<void>;
  onReposition: () => void;
  onShowHint?: () => void;
  showHintButton?: boolean;
  fixCompleted?: boolean;
}

const SlideControls: React.FC<SlideControlsProps> = ({
  lessonId,
  activeSlideId,
  currentSlide,
  isAnimating,
  isResetting,
  isResettingOrbit = false,
  onReset,
  onReposition,
  onShowHint,
  showHintButton = false,
  fixCompleted = false,
}) => {
  const shouldShowReset =
    lessonId === "notation" ||
    (lessonId === "rubiks-cube-introduction" && currentSlide > 0) ||
    activeSlideId === "yellow-edges-solution" ||
    activeSlideId === "yellow-corners-solution" ||
    activeSlideId === "orient-two-corners" ||
    currentSlide >= 2;
  const shouldShowReposition = !shouldShowReset;

  if (!shouldShowReset && !shouldShowReposition && !showHintButton) {
    return null;
  }

  return (
    <>
      {(shouldShowReset || shouldShowReposition) && (
        <div className="absolute bottom-6 left-6 md:left-8 z-30 pointer-events-auto flex gap-3">
          {shouldShowReset && (
            <Button
              onClick={async () => {
                await onReset();
              }}
              className="px-4 md:px-5 py-2.5 bg-white/90 backdrop-blur-xl text-gray-900 rounded-xl shadow-lg hover:shadow-xl border border-gray-200/50 hover:bg-white transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              title="Reset cube to solved state"
              disabled={isAnimating || isResetting || isResettingOrbit}
            >
              {isResetting || isResettingOrbit ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span>
                  <span>Resetting</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Reset</span>
                </>
              )}
            </Button>
          )}
          {shouldShowReposition && (
            <Button
              onClick={onReposition}
              className="px-4 md:px-5 py-2.5 bg-white/90 backdrop-blur-xl text-gray-900 rounded-xl shadow-lg hover:shadow-xl border border-gray-200/50 hover:bg-white transition-all duration-200 text-sm font-medium flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              title="Reposition cube"
              disabled={isAnimating}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-sm ml-2">Reposition</span>
            </Button>
          )}
        </div>
      )}
      {showHintButton && onShowHint && (
        <div
          className="absolute top-1 right-4 md:right-4 z-30 pointer-events-auto transition-opacity duration-300"
          style={{
            opacity: fixCompleted ? 0 : 1,
            pointerEvents: fixCompleted ? "none" : "auto",
          }}
        >
          <Button
            onClick={onShowHint}
            className="w-11 h-11 text-gray-100 transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            title="Show hint"
            disabled={isAnimating || fixCompleted}
          >
            <span className="text-sm mr-1">Hint</span>
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={1.5}
                fill="none"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"
              />
            </svg>
          </Button>
        </div>
      )}
    </>
  );
};

export default SlideControls;
