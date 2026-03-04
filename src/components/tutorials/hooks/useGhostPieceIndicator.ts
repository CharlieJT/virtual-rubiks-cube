import { useState, useEffect, useRef, useCallback } from "react";

interface UseGhostPieceIndicatorParams {
  activeSlideId: string | undefined;
  fixCompleted: boolean;
  isInteracting: boolean;
  onCubeInteraction?: () => void;
}

const useGhostPieceIndicator = ({
  activeSlideId,
  fixCompleted,
  isInteracting,
  onCubeInteraction,
}: UseGhostPieceIndicatorParams) => {
  const [opacity, setOpacity] = useState(0);
  const [isAnimatingMove, setIsAnimatingMove] = useState(false);
  const [rotationProgress, setRotationProgress] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const isGhostSlide =
    activeSlideId === "notation-clockwise-f" ||
    activeSlideId === "notation-prime-f" ||
    activeSlideId === "notation-clockwise-r" ||
    activeSlideId === "notation-prime-r" ||
    activeSlideId === "notation-clockwise-l" ||
    activeSlideId === "notation-prime-l" ||
    activeSlideId === "notation-clockwise-u" ||
    activeSlideId === "notation-prime-u" ||
    activeSlideId === "notation-clockwise-d" ||
    activeSlideId === "notation-prime-d" ||
    activeSlideId === "notation-clockwise-b" ||
    activeSlideId === "notation-prime-b" ||
    activeSlideId === "notation-double" ||
    activeSlideId === "notation-double-l" ||
    activeSlideId === "notation-double-d" ||
    activeSlideId === "notation-sequences" ||
    activeSlideId === "notation-sequences-longer";

  const resetCycle = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setOpacity(0);
    setIsAnimatingMove(false);
    setRotationProgress(0);
    startTimeRef.current = null;
  }, []);

  const startFadeIn = useCallback(() => {
    if (fixCompleted || !isGhostSlide) {
      resetCycle();
      return;
    }

    setOpacity(0);
    setIsAnimatingMove(false);
    setRotationProgress(0);

    const fadeInDuration = 10;
    const startTime = Date.now();
    const animateFadeIn = () => {
      if (isInteracting) {
        resetCycle();
        return;
      }
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / fadeInDuration, 1);
      const progress =
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
      setOpacity(progress);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateFadeIn);
      } else {
        startTimeRef.current = Date.now();
        setIsAnimatingMove(true);
        setRotationProgress(0);

        const moveDuration = 800;
        const animateMove = () => {
          if (isInteracting) {
            resetCycle();
            return;
          }
          if (startTimeRef.current) {
            const moveElapsed = Date.now() - startTimeRef.current;
            const rawProgress = Math.min(moveElapsed / moveDuration, 1);
            const moveProgress =
              rawProgress < 0.5
                ? 2 * rawProgress * rawProgress
                : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
            setRotationProgress(moveProgress);

            if (moveProgress < 1) {
              animationFrameRef.current = requestAnimationFrame(animateMove);
            } else {
              setIsAnimatingMove(false);
              setRotationProgress(1);

              const fadeOutDuration = 10;
              const fadeOutStart = Date.now();
              const animateFadeOut = () => {
                if (isInteracting) {
                  resetCycle();
                  return;
                }
                const fadeOutElapsed = Date.now() - fadeOutStart;
                const rawProgress = Math.min(
                  fadeOutElapsed / fadeOutDuration,
                  1
                );
                const fadeOutProgress =
                  rawProgress < 0.5
                    ? 2 * rawProgress * rawProgress
                    : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
                setOpacity(1 - fadeOutProgress);

                if (fadeOutProgress < 1) {
                  animationFrameRef.current =
                    requestAnimationFrame(animateFadeOut);
                } else {
                  setOpacity(0);
                  setRotationProgress(0);
                }
              };
              animateFadeOut();
            }
          }
        };
        animateMove();
      }
    };
    animateFadeIn();
  }, [fixCompleted, isGhostSlide, isInteracting, resetCycle]);

  useEffect(() => {
    if (isInteracting) {
      resetCycle();
    }
  }, [isInteracting, resetCycle]);

  useEffect(() => {
    resetCycle();
  }, [activeSlideId, fixCompleted, resetCycle]);

  const handleCubeInteraction = useCallback(() => {
    onCubeInteraction?.();
    resetCycle();
  }, [onCubeInteraction, resetCycle]);

  const isVisible = opacity > 0 || isAnimatingMove;
  const ghostIsAnimating = opacity > 0 || isAnimatingMove;

  return {
    opacity,
    rotationProgress,
    isAnimatingMove,
    handleCubeInteraction,
    showHint: startFadeIn,
    isVisible,
    isAnimating: ghostIsAnimating,
  };
};

export default useGhostPieceIndicator;
