import Button from "@components/UI/Button";

interface SlideNavigationButtonsProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onBack?: () => void;
}

const SlideNavigationButtons = ({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onBack,
}: SlideNavigationButtonsProps) => {
  const isLastSlide = currentSlide >= totalSlides - 1;

  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <Button
        onClick={onPrev}
        disabled={currentSlide === 0}
        className="px-4 py-2.5 bg-white/90 backdrop-blur-xl text-gray-900 rounded-xl shadow-md hover:shadow-lg border border-gray-200/50 hover:bg-white transition-all duration-200 text-sm font-medium flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-md group"
      >
        <svg
          className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
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
        <span>Previous</span>
      </Button>
      {isLastSlide && onBack ? (
        <Button
          onClick={onBack}
          className="px-4 py-2.5 bg-green-600 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-green-800 transition-all duration-200 text-sm font-medium flex items-center gap-1.5 group"
        >
          <span>Finish</span>
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={isLastSlide}
          className="px-4 py-2.5 bg-gray-900 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-gray-800 transition-all duration-200 text-sm font-medium flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-900 group"
        >
          <span>Next</span>
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
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
        </Button>
      )}
    </div>
  );
};

export default SlideNavigationButtons;
