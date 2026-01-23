import React, { useState, useEffect, useRef } from "react";

interface BeginnersMethodGridProps {
  steps: Array<{
    title: string;
    description?: string;
  }>;
}

// Map step titles to image paths
const getStepImage = (title: string, description?: string): string | null => {
  if (title === "Yellow Corners") {
    return description === "Orientation"
      ? "/assets/complete-cube-yellow-top-image.png"
      : "/assets/yellow-corners-image.png";
  }

  const imageMap: Record<string, string> = {
    "White Cross": "/assets/white-cross-image.png",
    "White Corners": "/assets/white-corners-image.png",
    "Second Layer": "/assets/second-layer-image.png",
    "Yellow Cross": "/assets/yellow-cross-image.png",
    "Yellow Edges": "/assets/yellow-edges-image.png",
  };
  return imageMap[title] || null;
};

const BeginnersMethodGrid: React.FC<BeginnersMethodGridProps> = ({ steps }) => {
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
  }, [steps]);

  return (
    <div className="absolute inset-0 z-100 pointer-events-none">
      <style>{`
        .beginners-grid-item {
          flex: 0 0 calc((100% - 2 * 0.75rem) / 3);
          width: calc((100% - 2 * 0.75rem) / 3);
          max-width: calc((100% - 2 * 0.75rem) / 3);
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .beginners-grid-item {
            flex: 0 0 calc((100% - 3 * 1rem) / 4);
            width: calc((100% - 3 * 1rem) / 4);
            max-width: calc((100% - 3 * 1rem) / 4);
            height: calc((75vh - 3 * 1.5rem) / 3);
            max-height: calc((75vh - 3 * 1.5rem) / 3);
            }
        }
        @media (min-width: 768px) {
          .beginners-grid-item {
            flex: 0 0 calc((100% - 2 * 0.75rem) / 3);
            width: calc((100% - 2 * 0.75rem) / 3);
            max-width: calc((100% - 2 * 0.75rem) / 3);
          }
        }
        @media (min-width: 1024px) {
          .beginners-grid-item {
            flex: 0 0 calc((100% - 3 * 1.5rem) / 4);
            width: calc((100% - 3 * 1.5rem) / 4);
            max-width: calc((100% - 3 * 1.5rem) / 4);
            height: calc((100% - 3 * 1.5rem) / 2.8);
            max-height: calc((100% - 3 * 1.5rem) / 2.8);
          }
        }
      `}</style>
      <div className="w-full h-full bg-white/95 backdrop-blur shadow-xl p-4 md:p-6 lg:p-8 flex flex-col pointer-events-auto relative">
        <div
          ref={scrollRef}
          className="flex flex-wrap content-start md:content-center justify-center gap-3 sm:gap-4 md:gap-3 lg:gap-6 overflow-y-auto flex-1 pr-2 slide-text-scroll min-h-0"
        >
          {steps.map((step, index) => {
            const imagePath = getStepImage(step.title, step.description);
            return (
              <div
                key={index}
                className="flex flex-col bg-gray-100 rounded-lg border-2 border-gray-300 p-2 md:p-3 beginners-grid-item"
              >
                {imagePath ? (
                  <div className="w-full mb-1 flex items-center justify-center rounded-lg p-1 overflow-hidden relative flex-shrink-0">
                    <img
                      src={imagePath}
                      alt={step.title}
                      className="w-full h-auto object-contain h-[calc(21vh-120px)] sm:h-[calc(25vh-120px)] md:h-[calc(25vh-120px)] lg:h-[calc(25vh-120px)]"
                      style={{
                        display: "block",
                      }}
                      onError={(e) => {
                        console.error(
                          "Failed to load image:",
                          imagePath,
                          "for step:",
                          step.title
                        );
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full mb-1 flex items-center justify-center bg-gray-200 rounded-lg flex-shrink-0"
                    style={{ height: "100px" }}
                  >
                    <span className="text-xs text-gray-400">No image</span>
                  </div>
                )}
                <div
                  style={{ fontSize: "calc(1.6vh + 0px)" }}
                  className="font-semibold text-gray-700 mb-0.5 text-center flex-shrink-0"
                >
                  {index + 1}. {step.title}
                </div>
                {step.description && (
                  <div
                    style={{ fontSize: "calc(1.4vh + 0px)" }}
                    className="text-xs md:text-sm text-gray-500 text-center flex-shrink-0"
                  >
                    {step.description}
                  </div>
                )}
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

export default BeginnersMethodGrid;
