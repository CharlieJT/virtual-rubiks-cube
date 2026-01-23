import { useState, useRef, useLayoutEffect } from "react";
import type { SequencePart } from "@/components/tutorials/AnimatedSequence";
import { getPartState } from "@/utils/sequenceAnimationHelpers";

interface UseSequenceMeasurementsProps {
  parts: SequencePart[];
  currentIndex: number;
  deferMeasurements?: boolean;
  slideKey?: string | number;
}

export const useSequenceMeasurements = ({
  parts,
  currentIndex,
  deferMeasurements = false,
  slideKey,
}: UseSequenceMeasurementsProps) => {
  const measureRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [sequenceWidths, setSequenceWidths] = useState<Map<number, number>>(
    new Map()
  );
  const [sequenceHeights, setSequenceHeights] = useState<Map<number, number>>(
    new Map()
  );
  const prevSlideKeyRef = useRef(slideKey);
  const [disableTransitions, setDisableTransitions] = useState(true);
  const isInitialMountRef = useRef(true);

  useLayoutEffect(() => {
    if (deferMeasurements && isInitialMountRef.current) {
      return;
    }

    if (slideKey !== undefined && slideKey !== prevSlideKeyRef.current) {
      prevSlideKeyRef.current = slideKey;
      setDisableTransitions(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDisableTransitions(false);
        });
      });
    } else if (slideKey !== undefined) {
      prevSlideKeyRef.current = slideKey;
    }
  }, [slideKey, parts, currentIndex, deferMeasurements]);

  useLayoutEffect(() => {
    if (deferMeasurements && isInitialMountRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const newWidths = new Map(sequenceWidths);
          const newHeights = new Map(sequenceHeights);
          let changed = false;

          parts.forEach((_part, partIdx) => {
            const measureEl = measureRefs.current.get(partIdx);
            if (measureEl) {
              const width = measureEl.offsetWidth;
              const height = measureEl.offsetHeight;
              if (!newWidths.has(partIdx) || newWidths.get(partIdx) !== width) {
                newWidths.set(partIdx, width);
                changed = true;
              }
              if (
                !newHeights.has(partIdx) ||
                newHeights.get(partIdx) !== height
              ) {
                newHeights.set(partIdx, height);
                changed = true;
              }
            }
          });

          if (changed) {
            setSequenceWidths(newWidths);
            setSequenceHeights(newHeights);
          }

          if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setDisableTransitions(false);
              });
            });
          }
        });
      });
      return;
    }

    if (!deferMeasurements && isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }

    const newWidths = new Map(sequenceWidths);
    const newHeights = new Map(sequenceHeights);
    let changed = false;
    let allMeasured = true;

    parts.forEach((_part, partIdx) => {
      const measureEl = measureRefs.current.get(partIdx);
      if (measureEl) {
        const { isActive } = getPartState(partIdx, parts, currentIndex);
        const shouldMeasure =
          !newWidths.has(partIdx) || isActive || disableTransitions;
        if (shouldMeasure) {
          const width = measureEl.offsetWidth;
          const height = measureEl.offsetHeight;
          if (!newWidths.has(partIdx) || newWidths.get(partIdx) !== width) {
            newWidths.set(partIdx, width);
            changed = true;
          }
          if (!newHeights.has(partIdx) || newHeights.get(partIdx) !== height) {
            newHeights.set(partIdx, height);
            changed = true;
          }
        }
      } else {
        allMeasured = false;
      }
    });

    if (changed) {
      setSequenceWidths(newWidths);
      setSequenceHeights(newHeights);
    }

    if (isInitialMountRef.current && allMeasured && newWidths.size > 0) {
      isInitialMountRef.current = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDisableTransitions(false);
        });
      });
    }
  }, [
    parts,
    currentIndex,
    sequenceWidths,
    sequenceHeights,
    disableTransitions,
    deferMeasurements,
  ]);

  return {
    measureRefs,
    sequenceWidths,
    sequenceHeights,
    disableTransitions,
  };
};
