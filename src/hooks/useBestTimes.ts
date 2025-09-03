import { useState, useEffect, useCallback } from "react";

const BEST_TIMES_KEY = "rubiks-cube-best-times";
const MAX_BEST_TIMES = 10;

export interface BestTimeResult {
  isNewBest: boolean;
  position: number; // 1-indexed position (1 = best time, 2 = second best, etc.)
  wasPersonalBest: boolean; // true if this is the new #1 best time
}

export interface BestTime {
  time: string;
  timestamp: number;
  timeMs: number; // for sorting
}

export const useBestTimes = () => {
  const [bestTimes, setBestTimes] = useState<BestTime[]>([]);

  // Load best times from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BEST_TIMES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BestTime[];
        setBestTimes(parsed);
      }
    } catch (error) {
      console.error("Failed to load best times from localStorage:", error);
    }
  }, []);

  // Save best times to localStorage whenever they change
  useEffect(() => {
    if (bestTimes.length > 0) {
      try {
        localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(bestTimes));
      } catch (error) {
        console.error("Failed to save best times to localStorage:", error);
      }
    }
  }, [bestTimes]);

  // Add a new time to the best times list and return result info
  const addBestTime = useCallback(
    (timeString: string, timeMs: number): BestTimeResult => {
      const newTime: BestTime = {
        time: timeString,
        timestamp: Date.now(),
        timeMs,
      };

      // Get current times synchronously from state
      const currentTimes = bestTimes;

      // Check if this time makes it into the top 10
      const wouldMakeList =
        currentTimes.length < MAX_BEST_TIMES ||
        timeMs < (currentTimes[currentTimes.length - 1]?.timeMs ?? Infinity);

      let result: BestTimeResult = {
        isNewBest: false,
        position: 0,
        wasPersonalBest: false,
      };

      if (wouldMakeList) {
        // Create the updated times list to calculate position
        const updatedTimes = [...currentTimes, newTime]
          .sort((a, b) => a.timeMs - b.timeMs)
          .slice(0, MAX_BEST_TIMES); // Keep only top 10

        // Find the position of our new time
        const position =
          updatedTimes.findIndex(
            (time) => time.timestamp === newTime.timestamp
          ) + 1;

        result = {
          isNewBest: true,
          position,
          wasPersonalBest: position === 1,
        };

        // Update state
        setBestTimes(updatedTimes);

        // Save to localStorage
        try {
          localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(updatedTimes));
        } catch (error) {
          console.error("Failed to save best times to localStorage:", error);
        }
      }

      return result;
    },
    [bestTimes]
  );

  // Reset all best times
  const resetBestTimes = useCallback(() => {
    try {
      localStorage.removeItem(BEST_TIMES_KEY);
      setBestTimes([]);
    } catch (error) {
      console.error("Failed to reset best times in localStorage:", error);
    }
  }, []);

  // Get formatted best times array with placeholders
  const getFormattedBestTimes = useCallback(() => {
    const result: (BestTime | null)[] = [];

    for (let i = 0; i < MAX_BEST_TIMES; i++) {
      result.push(bestTimes[i] || null);
    }

    return result;
  }, [bestTimes]);

  return {
    bestTimes,
    addBestTime,
    resetBestTimes,
    getFormattedBestTimes,
    hasTimes: bestTimes.length > 0,
  };
};
