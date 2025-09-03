import { useState, useRef, useCallback, useEffect } from "react";

export interface TimerState {
  isActive: boolean;
  startTime: number | null;
  elapsedMs: number;
  finalTime: string | null;
}

export const useTimer = () => {
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    startTime: null,
    elapsedMs: 0,
    finalTime: null,
  });

  const intervalRef = useRef<number | null>(null);

  // Format milliseconds to MM:SS.ss
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Always format as MM:SS.ss with leading zeros
    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toFixed(2).padStart(5, "0");
    return `${minutesStr}:${secondsStr}`;
  }, []);

  // Get current formatted time
  const getCurrentTime = useCallback((): string => {
    if (timerState.finalTime) {
      return timerState.finalTime;
    }
    return formatTime(timerState.elapsedMs);
  }, [timerState.elapsedMs, timerState.finalTime, formatTime]);

  // Start the timer
  const startTimer = useCallback(() => {
    const now = Date.now();
    setTimerState({
      isActive: true,
      startTime: now,
      elapsedMs: 0,
      finalTime: null,
    });

    intervalRef.current = window.setInterval(() => {
      setTimerState((prev) => {
        if (!prev.startTime || !prev.isActive) return prev;
        return {
          ...prev,
          elapsedMs: Date.now() - prev.startTime,
        };
      });
    }, 10); // Update every 10ms for smooth display
  }, []);

  // Stop the timer and record final time
  const stopTimer = useCallback((): string => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Calculate the final time synchronously before state update
    let finalTimeString = "00:00.00";

    const currentState = timerState;
    if (currentState.isActive && currentState.startTime) {
      const finalMs = Date.now() - currentState.startTime;
      finalTimeString = formatTime(finalMs);

      setTimerState((prev) => ({
        ...prev,
        isActive: false,
        elapsedMs: finalMs,
        finalTime: finalTimeString,
      }));
    } else if (currentState.finalTime) {
      finalTimeString = currentState.finalTime;
    }

    return finalTimeString;
  }, [formatTime, timerState]);

  // Cancel the timer completely
  const cancelTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimerState({
      isActive: false,
      startTime: null,
      elapsedMs: 0,
      finalTime: null,
    });
  }, []);

  // Reset timer for new scramble
  const resetTimer = useCallback(() => {
    cancelTimer();
  }, [cancelTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timerState,
    getCurrentTime,
    startTimer,
    stopTimer,
    cancelTimer,
    resetTimer,
    isTimerActive: timerState.isActive,
    hasTimerStarted: timerState.startTime !== null,
  };
};

export default useTimer;
