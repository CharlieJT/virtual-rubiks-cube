import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { isRecapSlide } from "@components/tutorials/consts/tutorialSlideConfig";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";

interface TypewriterTextProps {
  text: string;
  keyProp: string;
  activeSlideId?: string;
  chevronPortalRef?: React.RefObject<HTMLDivElement | null>;
}

// Helper function to parse HTML and reveal text progressively
const revealTextWithHTML = (text: string, length: number): string => {
  let result = "";
  let charIndex = 0;
  let inTag = false;
  let tagContent = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === "<") {
      inTag = true;
      tagContent = char;
    } else if (char === ">") {
      inTag = false;
      tagContent += char;
      // Always include complete tags
      result += tagContent;
      tagContent = "";
    } else if (inTag) {
      tagContent += char;
    } else {
      // Regular text character
      if (charIndex < length) {
        result += char;
        charIndex++;
      } else {
        break;
      }
    }
  }

  // Close any unclosed tags if we've shown all text
  if (charIndex >= length && inTag && tagContent) {
    // Find the matching closing tag
    const tagMatch = tagContent.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/);
    if (tagMatch && tagMatch[1] !== "/") {
      // Open tag - add the rest of the tag
      result += tagContent + ">";
    }
  }

  return result;
};

const TypewriterText = ({
  text,
  keyProp,
  activeSlideId,
  chevronPortalRef,
}: TypewriterTextProps) => {
  const [displayed, setDisplayed] = useState("");
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollRef = useRef<HTMLSpanElement>(null);
  const scrollMetricsRef = useRef({
    isScrollable: false,
    showBottomShadow: false,
    isAtBottom: false,
  });
  const isTouchDevice = useIsTouchDevice();
  const isRecap = activeSlideId ? isRecapSlide(activeSlideId) : false;
  // Increase minHeight for all slides (e.g. 10em for more comfort)
  const minHeight = "8.6em";

  useEffect(() => {
    let charCount = 0;
    let rafId = 0;
    let lastFrameTime = 0;
    const frameIntervalMs = 16;

    setDisplayed("");

    // Count text characters (excluding HTML tags)
    const textCharsOnly = text.replace(/<[^>]*>/g, "").length;

    const tick = (timestamp: number) => {
      if (timestamp - lastFrameTime < frameIntervalMs) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      lastFrameTime = timestamp;

      const revealed = revealTextWithHTML(text, charCount);
      setDisplayed((prev) => (prev === revealed ? prev : revealed));
      charCount += 1;

      if (charCount <= textCharsOnly) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [text, keyProp]);

  useEffect(() => {
    const updateScrollMetrics = () => {
      const element = scrollRef.current;
      if (!element) return;

      const scrollable = element.scrollHeight > element.clientHeight;
      const atBottom =
        element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
      const nextShowBottomShadow = scrollable && !atBottom;
      const prev = scrollMetricsRef.current;

      if (
        prev.isScrollable === scrollable &&
        prev.showBottomShadow === nextShowBottomShadow &&
        prev.isAtBottom === atBottom
      ) {
        return;
      }

      scrollMetricsRef.current = {
        isScrollable: scrollable,
        showBottomShadow: nextShowBottomShadow,
        isAtBottom: atBottom,
      };
      setIsScrollable(scrollable);
      setShowBottomShadow(nextShowBottomShadow);
      setIsAtBottom(atBottom);
    };

    updateScrollMetrics();
    const timeout = window.setTimeout(updateScrollMetrics, 100);

    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", updateScrollMetrics);
      window.addEventListener("resize", updateScrollMetrics);
    }

    return () => {
      window.clearTimeout(timeout);
      if (element) {
        element.removeEventListener("scroll", updateScrollMetrics);
        window.removeEventListener("resize", updateScrollMetrics);
      }
    };
  }, [displayed, text]);

  const handleScrollDown = () => {
    const element = scrollRef.current;
    if (!element) return;

    const scrollAmount = isTouchDevice ? 150 : 600;
    const newScrollTop = Math.min(
      element.scrollTop + scrollAmount,
      element.scrollHeight - element.clientHeight,
    );
    element.scrollTo({
      top: newScrollTop,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <span
        ref={scrollRef}
        className={`slide-text-scroll bg-slate-200/75 backdrop-blur border border-slate-400 border-2 rounded-lg h-40 overflow-y-scroll text-sm md:text-md text-gray-700 whitespace-pre-line block pb-10 p-4 ${
          isRecap
            ? "h-[calc(100dvh-8.6rem)] md:h-[calc(100dvh-9rem)]"
            : "md:h-[calc(100dvh-16.5rem)]"
        }`}
        style={{ minHeight, display: "block" }}
        dangerouslySetInnerHTML={{ __html: displayed }}
      />
      {/* Shadow overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-12 pointer-events-none rounded-lg transition-opacity duration-300 ${
          showBottomShadow && !isAtBottom ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.3) 100%)",
        }}
      />
      {/* Scroll down chevron button - portaled above footer on recap slides */}
      {isScrollable &&
        !isAtBottom &&
        (() => {
          const ChevronSvg = () => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700 group-hover:text-gray-900 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          );
          if (chevronPortalRef?.current && isRecap) {
            return createPortal(
              <button
                onClick={handleScrollDown}
                className="pointer-events-auto absolute bottom-7 left-[50%] rounded-xl p-2 transition-all duration-200 flex items-center justify-center group cursor-pointer animate-scroll-hint"
                aria-label="Scroll down"
              >
                <ChevronSvg />
              </button>,
              chevronPortalRef.current,
            );
          }
          return (
            <button
              onClick={handleScrollDown}
              className="absolute -bottom-8 left-[calc(50%+1rem)] transform -translate-x-1/2 z-50 rounded-xl p-2 transition-all duration-200 flex items-center justify-center group cursor-pointer animate-scroll-hint"
              aria-label="Scroll down"
            >
              <ChevronSvg />
            </button>
          );
        })()}
      <style>{`
        @keyframes scroll-hint {
          0% {
            transform: translate(-50%, 0);
          }
          10% {
            transform: translate(-50%, 4px);
          }
          20% {
            transform: translate(-50%, 0);
          }
          30% {
            transform: translate(-50%, 4px);
          }
          40% {
            transform: translate(-50%, 0);
          }
          60% {
            transform: translate(-50%, 0);
          }
          70% {
            transform: translate(-50%, 0);
          }
          80% {
            transform: translate(-50%, 0);
          }
          90% {
            transform: translate(-50%, 0);
          }
          100% {
            transform: translate(-50%, 0);
          }
        }
        .animate-scroll-hint {
          animation: scroll-hint 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TypewriterText;
