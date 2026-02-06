import { useState, useEffect } from "react";

interface UseSequencePortalPositionParams {
  fixSequenceLength: number;
  activeSlideId: string | undefined;
  cubeContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const useSequencePortalPosition = ({
  fixSequenceLength,
  activeSlideId,
  cubeContainerRef,
}: UseSequencePortalPositionParams) => {
  const [sequencePortalPosition, setSequencePortalPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (!fixSequenceLength) {
      setSequencePortalPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!cubeContainerRef.current) return false;
      const rect = cubeContainerRef.current.getBoundingClientRect();
      setSequencePortalPosition({
        top: rect.top + 8, // top-2 = 0.5rem = 8px
        left: rect.left + 8, // left-2 = 0.5rem = 8px
      });
      return true;
    };

    // Try to set position immediately
    if (!updatePosition()) {
      // If ref isn't ready, retry with requestAnimationFrame (non-blocking)
      requestAnimationFrame(() => {
        if (!updatePosition()) {
          // One more retry in case it's still not ready
          requestAnimationFrame(updatePosition);
        }
      });
    }

    // Set up listeners for resize/scroll
    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [fixSequenceLength, activeSlideId, cubeContainerRef]);

  return sequencePortalPosition;
};

