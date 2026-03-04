import React, { useState, useEffect, useRef } from "react";
import TimerDisplay from "./TimerDisplay";

interface TimerDisplayContainerProps {
  getCurrentTime: () => string;
  isTimerActive: boolean;
  isScrambling: boolean;
}

/**
 * Wraps TimerDisplay and drives its time via rAF so only this subtree
 * re-renders on tick — keeps App/canvas from re-rendering every frame.
 */
const TimerDisplayContainer: React.FC<TimerDisplayContainerProps> = ({
  getCurrentTime,
  isTimerActive,
  isScrambling,
}) => {
  const [displayTime, setDisplayTime] = useState(getCurrentTime());
  const rafRef = useRef<number | null>(null);
  const getCurrentTimeRef = useRef(getCurrentTime);
  getCurrentTimeRef.current = getCurrentTime;

  useEffect(() => {
    if (!isTimerActive) {
      setDisplayTime(getCurrentTimeRef.current());
      return;
    }
    const tick = () => {
      const t = getCurrentTimeRef.current();
      setDisplayTime((prev) => (t === prev ? prev : t));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isTimerActive, getCurrentTime]);

  return (
    <TimerDisplay
      time={displayTime}
      isActive={isTimerActive}
      hasStarted={isTimerActive}
      isScrambling={isScrambling}
    />
  );
};

export default TimerDisplayContainer;
