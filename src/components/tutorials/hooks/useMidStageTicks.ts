import { useState, useEffect } from "react";

export const useMidStageTicks = (activeSlideId: string | undefined) => {
  const [midStage1Played, setMidStage1Played] = useState(false);
  const [midStage1Progress, setMidStage1Progress] = useState(false);
  const [midStage1Line, setMidStage1Line] = useState(false);
  const [midStage2Played, setMidStage2Played] = useState(false);
  const [midStage2Progress, setMidStage2Progress] = useState(false);
  const [midStage2Line, setMidStage2Line] = useState(false);
  const [midStage3Played, setMidStage3Played] = useState(false);
  const [midStage3Progress, setMidStage3Progress] = useState(false);
  const [midStage3Line, setMidStage3Line] = useState(false);
  const [midStage4Played, setMidStage4Played] = useState(false);
  const [midStage4Progress, setMidStage4Progress] = useState(false);
  const [midStage4Line, setMidStage4Line] = useState(false);
  const [midStage5Played, setMidStage5Played] = useState(false);
  const [midStage5Progress, setMidStage5Progress] = useState(false);
  const [midStage5Line, setMidStage5Line] = useState(false);

  const [midStage1Key, setMidStage1Key] = useState(0);
  const [midStage2Key, setMidStage2Key] = useState(0);
  const [midStage3Key, setMidStage3Key] = useState(0);
  const [midStage4Key, setMidStage4Key] = useState(0);
  const [midStage5Key, setMidStage5Key] = useState(0);
  const [midStage6Key, setMidStage6Key] = useState(0);
  const [midStage7Key, setMidStage7Key] = useState(0);

  useEffect(() => {
    setMidStage1Played(false);
    setMidStage1Progress(false);
    setMidStage1Line(false);
    setMidStage2Played(false);
    setMidStage2Progress(false);
    setMidStage2Line(false);
    setMidStage3Played(false);
    setMidStage3Progress(false);
    setMidStage3Line(false);
    setMidStage4Played(false);
    setMidStage4Progress(false);
    setMidStage4Line(false);
    setMidStage5Played(false);
    setMidStage5Progress(false);
    setMidStage5Line(false);
    setMidStage1Key(0);
    setMidStage2Key(0);
    setMidStage3Key(0);
    setMidStage4Key(0);
    setMidStage5Key(0);
    setMidStage6Key(0);
    setMidStage7Key(0);
  }, [activeSlideId]);

  const resetMidStageTicks = (): void => {
    setMidStage1Played(false);
    setMidStage1Progress(false);
    setMidStage1Line(false);
    setMidStage2Played(false);
    setMidStage2Progress(false);
    setMidStage2Line(false);
    setMidStage3Played(false);
    setMidStage3Progress(false);
    setMidStage3Line(false);
    setMidStage4Played(false);
    setMidStage4Progress(false);
    setMidStage4Line(false);
    setMidStage5Played(false);
    setMidStage5Progress(false);
    setMidStage5Line(false);
    setMidStage1Key(0);
    setMidStage2Key(0);
    setMidStage3Key(0);
    setMidStage4Key(0);
    setMidStage5Key(0);
    setMidStage6Key(0);
    setMidStage7Key(0);
  };

  const animateMidlayerStage = (stage: 1 | 2 | 3 | 4 | 5) => {
    const runStageAnimation = (
      played: boolean,
      setKey: React.Dispatch<React.SetStateAction<number>>,
      setProgress: React.Dispatch<React.SetStateAction<boolean>>,
      setLine: React.Dispatch<React.SetStateAction<boolean>>,
      setPlayed: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (played) return;
      setKey((k) => k + 1);
      setProgress(false);
      setLine(false);
      setTimeout(() => setProgress(true), 50); // circle draws
      setTimeout(() => setLine(true), 300); // checkmark draws
      setTimeout(() => setPlayed(true), 700); // mark done
    };

    if (stage === 1) {
      runStageAnimation(
        midStage1Played,
        setMidStage1Key,
        setMidStage1Progress,
        setMidStage1Line,
        setMidStage1Played
      );
    } else if (stage === 2) {
      runStageAnimation(
        midStage2Played,
        setMidStage2Key,
        setMidStage2Progress,
        setMidStage2Line,
        setMidStage2Played
      );
    } else if (stage === 3) {
      runStageAnimation(
        midStage3Played,
        setMidStage3Key,
        setMidStage3Progress,
        setMidStage3Line,
        setMidStage3Played
      );
    } else if (stage === 4) {
      runStageAnimation(
        midStage4Played,
        setMidStage4Key,
        setMidStage4Progress,
        setMidStage4Line,
        setMidStage4Played
      );
    } else {
      runStageAnimation(
        midStage5Played,
        setMidStage5Key,
        setMidStage5Progress,
        setMidStage5Line,
        setMidStage5Played
      );
    }
  };

  return {
    midStage1Played,
    setMidStage1Played,
    midStage1Progress,
    setMidStage1Progress,
    midStage1Line,
    setMidStage1Line,
    midStage1Key,
    setMidStage1Key,
    midStage2Played,
    setMidStage2Played,
    midStage2Progress,
    setMidStage2Progress,
    midStage2Line,
    setMidStage2Line,
    midStage2Key,
    setMidStage2Key,
    midStage3Played,
    setMidStage3Played,
    midStage3Progress,
    setMidStage3Progress,
    midStage3Line,
    setMidStage3Line,
    midStage3Key,
    setMidStage3Key,
    midStage4Played,
    setMidStage4Played,
    midStage4Progress,
    setMidStage4Progress,
    midStage4Line,
    setMidStage4Line,
    midStage4Key,
    setMidStage4Key,
    midStage5Played,
    setMidStage5Played,
    midStage5Progress,
    setMidStage5Progress,
    midStage5Line,
    setMidStage5Line,
    midStage5Key,
    setMidStage5Key,
    midStage6Key,
    setMidStage6Key,
    midStage6Progress: false,
    midStage6Line: false,
    midStage7Key,
    setMidStage7Key,
    midStage7Progress: false,
    midStage7Line: false,
    resetMidStageTicks,
    animateMidlayerStage,
  };
};
