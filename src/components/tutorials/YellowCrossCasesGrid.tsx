import React, { useState, useEffect, useRef } from "react";

interface YellowCrossCasesGridProps {
  cases: Array<{
    title: string;
    image: string;
  }>;
}

const YellowCrossCasesGrid: React.FC<YellowCrossCasesGridProps> = ({
  cases,
}) => {
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      const element = scrollRef.current;
      if (!element) return;

      const isScrollable = element.scrollHeight > element.clientHeight;
      const atBottom =
        element.scrollHeight - element.scrollTop <= element.clientHeight + 1;

      setShowBottomShadow(isScrollable && !atBottom);
      setIsAtBottom(atBottom);
    };

    checkScroll();
    const timeout = setTimeout(checkScroll, 100);

    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }

    return () => {
      clearTimeout(timeout);
      if (element) {
        element.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      }
    };
  }, [cases]);

  return (
    <div className="absolute inset-0 z-100 pointer-events-none">
      <style>{`
        .yellow-cross-grid-item {
          flex: 0 0 calc((100% - 1 * 0.75rem) / 2);
          width: calc((100% - 1 * 0.75rem) / 2);
          max-width: calc((100% - 1 * 0.75rem) / 2);
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .yellow-cross-grid-item {
            flex: 0 0 calc((100% - 1 * 1rem) / 2);
            width: calc((100% - 1 * 1rem) / 2);
            max-width: calc((100% - 1 * 1rem) / 2);
          }
        }
        @media (min-width: 768px) {
          .yellow-cross-grid-item {
            flex: 0 0 calc((100% - 1 * 0.75rem) / 2);
            width: calc((100% - 1 * 0.75rem) / 2);
            max-width: calc((100% - 1 * 0.75rem) / 2);
          }
        }
        @media (min-width: 1024px) {
          .yellow-cross-grid-item {
            flex: 0 0 calc((100% - 1 * 1.5rem) / 2);
            width: calc((100% - 1 * 1.5rem) / 2);
            max-width: calc((100% - 1 * 1.5rem) / 2);
          }
        }
      `}</style>
      <div className="w-full h-full bg-white/95 backdrop-blur shadow-xl p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center pointer-events-auto relative overflow-y-auto">
        <div
          ref={scrollRef}
          className="flex flex-wrap justify-center content-center justify-center gap-3 sm:gap-4 md:gap-3 lg:gap-6 flex-1 pr-2 slide-text-scroll min-h-0 max-w-[300px] md:max-w-[600px]"
        >
          {cases.map((caseItem, index) => {
            return (
              <div
                key={index}
                className="flex flex-col bg-gray-100 rounded-lg border-2 border-gray-300 p-2 md:p-3 yellow-cross-grid-item"
              >
                <div className="w-full mb-1 flex items-center justify-center rounded-lg p-1 overflow-hidden relative flex-shrink-0">
                  <img
                    src={caseItem.image}
                    alt={caseItem.title}
                    className="w-full object-contain h-[calc(26vh-120px)] md:h-[calc(38vh-120px)] lg:h-[calc(35vh-120px)]"
                    style={{
                      display: "block",
                    }}
                    onError={(e) => {
                      console.error(
                        "Failed to load image:",
                        caseItem.image,
                        "for case:",
                        caseItem.title
                      );
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div
                  style={{ fontSize: "calc(1.6vh + 0px)" }}
                  className="font-semibold text-gray-700 mb-0.5 text-center flex-shrink-0"
                >
                  {caseItem.title}
                </div>
                <div className="flex-grow mt-auto"></div>
              </div>
            );
          })}
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 h-12 pointer-events-none transition-opacity duration-300 ${
            showBottomShadow && !isAtBottom ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0.3) 100%)",
          }}
        />
      </div>
    </div>
  );
};

export default YellowCrossCasesGrid;
