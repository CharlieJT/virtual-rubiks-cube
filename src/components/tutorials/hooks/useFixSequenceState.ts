import { useState, useEffect, useCallback } from "react";

export const useFixSequenceState = (activeSlideId: string | undefined, fixSequenceLength: number) => {
  const [fixIndex, setFixIndex] = useState(0);
  const [fixDoublePartialDir, setFixDoublePartialDir] = useState<0 | 1 | -1>(0);
  const [fixErrorPulse, setFixErrorPulse] = useState(false);
  const [fixShowTick, setFixShowTick] = useState(false);
  const [fixTickAnimKey, setFixTickAnimKey] = useState(0);
  const [fixTickProgress, setFixTickProgress] = useState(false);
  const [fixTickLine, setFixTickLine] = useState(false);

  const [fixFirstTickPlayed, setFixFirstTickPlayed] = useState(false);
  const [fixFirstTickProgress, setFixFirstTickProgress] = useState(false);
  const [fixFirstTickLine, setFixFirstTickLine] = useState(false);

  const [fixSecondTickPlayed, setFixSecondTickPlayed] = useState(false);
  const [fixSecondTickProgress, setFixSecondTickProgress] = useState(false);
  const [fixSecondTickLine, setFixSecondTickLine] = useState(false);

  useEffect(() => {
    setFixIndex(0);
    setFixDoublePartialDir(0);
    setFixErrorPulse(false);
    setFixShowTick(false);
    setFixTickAnimKey((k) => k + 1);
    setFixTickProgress(false);
    setFixTickLine(false);
    setFixFirstTickPlayed(false);
    setFixFirstTickProgress(false);
    setFixFirstTickLine(false);
    setFixSecondTickPlayed(false);
    setFixSecondTickProgress(false);
    setFixSecondTickLine(false);
  }, [activeSlideId, fixSequenceLength]);

  const triggerFixTick = useCallback(() => {
    setFixShowTick(true);
    setFixTickProgress(false);
    setFixTickLine(false);
    setFixTickAnimKey((k) => k + 1);
    setTimeout(() => setFixTickProgress(true), 100);
    setTimeout(() => setFixTickLine(true), 300);
  }, []);

  const resetFixState = useCallback(() => {
    setFixIndex(0);
    setFixDoublePartialDir(0);
    setFixErrorPulse(false);
    setFixShowTick(false);
    setFixTickAnimKey((k) => k + 1);
    setFixTickProgress(false);
    setFixTickLine(false);
    setFixFirstTickPlayed(false);
    setFixFirstTickProgress(false);
    setFixFirstTickLine(false);
    setFixSecondTickPlayed(false);
    setFixSecondTickProgress(false);
    setFixSecondTickLine(false);
  }, []);

  const fixCompleted = fixSequenceLength > 0 && fixIndex >= fixSequenceLength;

  return {
    fixIndex,
    setFixIndex,
    fixDoublePartialDir,
    setFixDoublePartialDir,
    fixErrorPulse,
    setFixErrorPulse,
    fixShowTick,
    setFixShowTick,
    fixTickAnimKey,
    setFixTickAnimKey,
    fixTickProgress,
    setFixTickProgress,
    fixTickLine,
    setFixTickLine,
    fixFirstTickPlayed,
    setFixFirstTickPlayed,
    fixFirstTickProgress,
    setFixFirstTickProgress,
    fixFirstTickLine,
    setFixFirstTickLine,
    fixSecondTickPlayed,
    setFixSecondTickPlayed,
    fixSecondTickProgress,
    setFixSecondTickProgress,
    fixSecondTickLine,
    setFixSecondTickLine,
    fixCompleted,
    triggerFixTick,
    resetFixState,
  };
};

