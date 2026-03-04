import { useState, useRef, useCallback } from "react";

export interface TimerState {
  isActive: boolean;
  startTime: number | null;
  elapsedMs: number;
  finalTime: string | null;
}

const formatTime = (ms: number): string => {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toFixed(2).padStart(5, "0");
  return `${minutesStr}:${secondsStr}`;
};

const useTimer = () => {
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    startTime: null,
    elapsedMs: 0,
    finalTime: null,
  });

  const startTimeRef = useRef<number | null>(null);

  // No state updates during run — avoids re-rendering App/canvas every tick
  const getCurrentTime = useCallback((): string => {
    if (timerState.finalTime) return timerState.finalTime;
    if (timerState.isActive && timerState.startTime !== null)
      return formatTime(Date.now() - timerState.startTime);
    return formatTime(timerState.elapsedMs);
  }, [
    timerState.finalTime,
    timerState.isActive,
    timerState.startTime,
    timerState.elapsedMs,
  ]);

  const startTimer = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    setTimerState({
      isActive: true,
      startTime: now,
      elapsedMs: 0,
      finalTime: null,
    });
  }, []);

  const stopTimer = useCallback((): string => {
    let finalTimeString = "00:00.00";
    const startTime = startTimeRef.current ?? timerState.startTime;
    if (timerState.isActive && startTime !== null) {
      const finalMs = Date.now() - startTime;
      finalTimeString = formatTime(finalMs);
      startTimeRef.current = null;
      setTimerState((prev) => ({
        ...prev,
        isActive: false,
        elapsedMs: finalMs,
        finalTime: finalTimeString,
      }));
    } else if (timerState.finalTime) {
      finalTimeString = timerState.finalTime;
    }
    return finalTimeString;
  }, [timerState.isActive, timerState.startTime, timerState.finalTime]);

  const cancelTimer = useCallback(() => {
    startTimeRef.current = null;
    setTimerState({
      isActive: false,
      startTime: null,
      elapsedMs: 0,
      finalTime: null,
    });
  }, []);

  const resetTimer = useCallback(() => {
    cancelTimer();
  }, [cancelTimer]);

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
