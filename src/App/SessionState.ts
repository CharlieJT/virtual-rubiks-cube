import { useState } from "react";
import type { BestTimeResult } from "@/hooks/useBestTimes";

const useSessionState = () => {
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [showQuitTimerModal, setShowQuitTimerModal] = useState(false);
  const [isQuittingSession, setIsQuittingSession] = useState(false);
  const [showResetTimerModal, setShowResetTimerModal] = useState(false);
  const [isResettingSession, setIsResettingSession] = useState(false);
  const [showSolveSuccessModal, setShowSolveSuccessModal] = useState(false);
  const [finalSolveTime, setFinalSolveTime] = useState<string>("");
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [bestTimeResult, setBestTimeResult] = useState<BestTimeResult | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showSolutionGeneratedModal, setShowSolutionGeneratedModal] = useState(false);
  const [showSolutionAlreadyGeneratedModal, setShowSolutionAlreadyGeneratedModal] = useState(false);

  return {
    showTimerModal,
    setShowTimerModal,
    isStartingSession,
    setIsStartingSession,
    showQuitTimerModal,
    setShowQuitTimerModal,
    isQuittingSession,
    setIsQuittingSession,
    showResetTimerModal,
    setShowResetTimerModal,
    isResettingSession,
    setIsResettingSession,
    showSolveSuccessModal,
    setShowSolveSuccessModal,
    finalSolveTime,
    setFinalSolveTime,
    isTimerEnabled,
    setIsTimerEnabled,
    bestTimeResult,
    setBestTimeResult,
    isGenerating,
    setIsGenerating,
    showSolutionGeneratedModal,
    setShowSolutionGeneratedModal,
    showSolutionAlreadyGeneratedModal,
    setShowSolutionAlreadyGeneratedModal,
  };
};

export default useSessionState;
