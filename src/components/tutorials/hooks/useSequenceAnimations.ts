import { useState, useRef, useLayoutEffect } from "react";
import type { SequencePart } from "@/components/tutorials/components/AnimatedSequence";

interface UseSequenceAnimationsProps {
  parts: SequencePart[];
  currentIndex: number;
  deferMeasurements?: boolean;
  allSequencesComplete: boolean;
  slideKey?: string | number;
}

export const useSequenceAnimations = ({
  parts,
  currentIndex,
  deferMeasurements = false,
  allSequencesComplete,
  slideKey,
}: UseSequenceAnimationsProps) => {
  const prevIndexRef = useRef(currentIndex);
  const prevSlideKeyRef = useRef(slideKey);
  const slideJustChangedRef = useRef(false);
  const [collapsingIndex, setCollapsingIndex] = useState<number | null>(null);
  const [showTickAfterCollapse, setShowTickAfterCollapse] = useState<
    Set<number>
  >(new Set());
  const [expandingOpacity, setExpandingOpacity] = useState<Map<number, number>>(
    new Map()
  );
  const [collapsingToPendingOpacity, setCollapsingToPendingOpacity] = useState<
    Map<number, number>
  >(new Map());
  const [tickLineStates, setTickLineStates] = useState<Map<number, boolean>>(
    new Map()
  );
  const [tickOpacity, setTickOpacity] = useState<Map<number, number>>(
    new Map()
  );
  const [collapsingToPending, setCollapsingToPending] = useState<Set<number>>(
    new Set()
  );

  const isCompleteOnMount =
    parts.length > 0 && currentIndex >= parts[parts.length - 1].boundaryIndex;
  const [frontFaceLabelOpacity, setFrontFaceLabelOpacity] = useState(
    isCompleteOnMount ? 0 : 1
  );
  const [frontFaceLabelTranslateY, setFrontFaceLabelTranslateY] = useState(
    isCompleteOnMount ? -20 : 0
  );
  const [completionMessageOpacity, setCompletionMessageOpacity] = useState(
    isCompleteOnMount ? 1 : 0
  );
  const [completionMessageTranslateY, setCompletionMessageTranslateY] =
    useState(isCompleteOnMount ? 0 : 20);

  useLayoutEffect(() => {
    if (slideKey !== undefined && slideKey !== prevSlideKeyRef.current) {
      prevSlideKeyRef.current = slideKey;
      slideJustChangedRef.current = true;
      
      prevIndexRef.current = 0;
      setCollapsingIndex(null);
      setShowTickAfterCollapse(new Set());
      setExpandingOpacity(new Map());
      setCollapsingToPendingOpacity(new Map());
      setTickLineStates(new Map());
      setTickOpacity(new Map());
      setCollapsingToPending(new Set());
      
      setFrontFaceLabelOpacity(1);
      setFrontFaceLabelTranslateY(0);
      setCompletionMessageOpacity(0);
      setCompletionMessageTranslateY(20);
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          slideJustChangedRef.current = false;
        });
      });
    } else if (slideKey !== undefined) {
      prevSlideKeyRef.current = slideKey;
    }
  }, [slideKey]);

  useLayoutEffect(() => {
    if (deferMeasurements) {
      return;
    }

    if (slideJustChangedRef.current) {
      return;
    }

    const prevIndex = prevIndexRef.current;
    const isReset = currentIndex === 0 && prevIndex > 0;
    const wasAllComplete =
      parts.length > 0 && prevIndex >= parts[parts.length - 1].boundaryIndex;
    prevIndexRef.current = currentIndex;

    if (allSequencesComplete && !wasAllComplete) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFrontFaceLabelOpacity(0);
          setFrontFaceLabelTranslateY(-20);
          setCompletionMessageOpacity(1);
          setCompletionMessageTranslateY(0);
        });
      });
    } else if (isReset && wasAllComplete) {
      setFrontFaceLabelOpacity(1);
      setFrontFaceLabelTranslateY(0);
      setCompletionMessageOpacity(0);
      setCompletionMessageTranslateY(20);
    } else if (!allSequencesComplete && wasAllComplete) {
      setFrontFaceLabelOpacity(1);
      setFrontFaceLabelTranslateY(0);
      setCompletionMessageOpacity(0);
      setCompletionMessageTranslateY(20);
    }

    if (isReset) {
      parts.forEach((_part, partIdx) => {
        const part = parts[partIdx];
        const wasCompleted = prevIndex >= part.boundaryIndex;
        const wasActive =
          prevIndex >= part.startIndex && prevIndex < part.boundaryIndex;
        const isNowFuture =
          currentIndex < part.startIndex ||
          (partIdx > 0 && currentIndex < parts[0].boundaryIndex);

        if (wasCompleted) {
          setTickOpacity((prev) => {
            const newMap = new Map(prev);
            newMap.set(partIdx, 1);
            return newMap;
          });
          setTimeout(() => {
            setTickOpacity((prev) => {
              const newMap = new Map(prev);
              newMap.set(partIdx, 0);
              return newMap;
            });
          }, 50);
          setTimeout(() => {
            setShowTickAfterCollapse((prev) => {
              const newSet = new Set(prev);
              newSet.delete(partIdx);
              return newSet;
            });
            setTickLineStates((prev) => {
              const newMap = new Map(prev);
              newMap.delete(partIdx);
              return newMap;
            });
            setTickOpacity((prev) => {
              const newMap = new Map(prev);
              newMap.delete(partIdx);
              return newMap;
            });
          }, 350);
        }

        if ((wasActive || wasCompleted) && isNowFuture) {
          setCollapsingToPending((prev) => new Set(prev).add(partIdx));
          setCollapsingToPendingOpacity((prev) => {
            const newMap = new Map(prev);
            newMap.set(partIdx, 1);
            return newMap;
          });

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setCollapsingToPendingOpacity((prev) => {
                const newMap = new Map(prev);
                newMap.set(partIdx, 0);
                return newMap;
              });
              setTimeout(() => {
                setCollapsingToPending((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(partIdx);
                  return newSet;
                });
                setCollapsingToPendingOpacity((prev) => {
                  const newMap = new Map(prev);
                  newMap.delete(partIdx);
                  return newMap;
                });
              }, 300);
            });
          });
        }
      });

      setCollapsingIndex(null);
      if (parts.length > 0) {
        const firstPart = parts[0];
        if (
          currentIndex >= firstPart.startIndex &&
          currentIndex < firstPart.boundaryIndex
        ) {
          setExpandingOpacity((prev) => {
            const newMap = new Map(prev);
            newMap.set(0, 0);
            return newMap;
          });
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setExpandingOpacity((prev) => {
                const newMap = new Map(prev);
                newMap.set(0, 1);
                return newMap;
              });
            });
          });
          setTimeout(() => {
            setExpandingOpacity((prev) => {
              const newMap = new Map(prev);
              newMap.delete(0);
              return newMap;
            });
          }, 300);
        }
      }
      return;
    }

    parts.forEach((_part, partIdx) => {
      const part = parts[partIdx];
      const wasActive =
        prevIndex >= part.startIndex && prevIndex < part.boundaryIndex;
      const isCompleted = currentIndex >= part.boundaryIndex;
      const wasFuture = prevIndex < part.startIndex;
      const isActive =
        currentIndex >= part.startIndex && currentIndex < part.boundaryIndex;

      if (wasActive && isCompleted) {
        setCollapsingIndex(partIdx);
        setTimeout(() => {
          setCollapsingIndex(null);
          setShowTickAfterCollapse((prev) => new Set(prev).add(partIdx));
          setTickLineStates((prev) => {
            const newMap = new Map(prev);
            newMap.set(partIdx, false);
            return newMap;
          });
          setTimeout(() => {
            setTickLineStates((prev) => {
              const newMap = new Map(prev);
              newMap.set(partIdx, true);
              return newMap;
            });
          }, 50);
        }, 300);
      }

      if (wasFuture && isActive) {
        setExpandingOpacity((prev) => {
          const newMap = new Map(prev);
          newMap.set(partIdx, 0);
          return newMap;
        });

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setExpandingOpacity((prev) => {
              const newMap = new Map(prev);
              newMap.set(partIdx, 1);
              return newMap;
            });
            setTimeout(() => {
              setExpandingOpacity((prev) => {
                const newMap = new Map(prev);
                newMap.delete(partIdx);
                return newMap;
              });
            }, 300);
          });
        });
      }

      if (!isCompleted) {
        setShowTickAfterCollapse((prev) => {
          const newSet = new Set(prev);
          newSet.delete(partIdx);
          return newSet;
        });
        setTickLineStates((prev) => {
          const newMap = new Map(prev);
          newMap.delete(partIdx);
          return newMap;
        });
      }
    });
  }, [currentIndex, parts, deferMeasurements, allSequencesComplete]);

  return {
    collapsingIndex,
    showTickAfterCollapse,
    expandingOpacity,
    collapsingToPendingOpacity,
    tickLineStates,
    tickOpacity,
    collapsingToPending,
    frontFaceLabelOpacity,
    frontFaceLabelTranslateY,
    completionMessageOpacity,
    completionMessageTranslateY,
  };
};

