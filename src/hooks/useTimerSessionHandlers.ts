import { useCallback } from "react";

interface UseTimerSessionHandlersParams {
  fadeToSolvedState: (onComplete?: () => void) => void;
  performAnimatedScramble: () => void;
  resetTimer: () => void;
  cancelTimer: () => void;
  setShowTimerModal: React.Dispatch<React.SetStateAction<boolean>>;
  setIsStartingSession: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTimerEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setShowQuitTimerModal: React.Dispatch<React.SetStateAction<boolean>>;
  setIsQuittingSession: React.Dispatch<React.SetStateAction<boolean>>;
  setShowResetTimerModal: React.Dispatch<React.SetStateAction<boolean>>;
  setIsResettingSession: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSolveSuccessModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const useTimerSessionHandlers = ({
  fadeToSolvedState,
  performAnimatedScramble,
  resetTimer,
  cancelTimer,
  setShowTimerModal,
  setIsStartingSession,
  setIsTimerEnabled,
  setShowQuitTimerModal,
  setIsQuittingSession,
  setShowResetTimerModal,
  setIsResettingSession,
  setShowSolveSuccessModal,
}: UseTimerSessionHandlersParams) => {
  const handleStartTimer = useCallback(() => setShowTimerModal(true), []);

  const handleTimerModalYes = useCallback(() => {
    setIsStartingSession(true);
    setIsTimerEnabled(true);
    setShowTimerModal(false);
    setTimeout(() => {
      setIsStartingSession(false);
      fadeToSolvedState(performAnimatedScramble);
    }, 300);
  }, [fadeToSolvedState, performAnimatedScramble]);

  const handleTimerModalNo = useCallback(() => setShowTimerModal(false), []);
  const handleTimerQuit = useCallback(() => setShowQuitTimerModal(true), []);

  const handleQuitTimerConfirm = useCallback(() => {
    setIsQuittingSession(true);
    setIsTimerEnabled(false);
    cancelTimer();
    setShowQuitTimerModal(false);
    setTimeout(() => {
      setIsQuittingSession(false);
      fadeToSolvedState();
    }, 300);
  }, [cancelTimer, fadeToSolvedState]);

  const handleQuitTimerCancel = useCallback(
    () => setShowQuitTimerModal(false),
    [],
  );
  const handleTimerResetNew = useCallback(
    () => setShowResetTimerModal(true),
    [],
  );

  const handleResetTimerConfirm = useCallback(() => {
    setIsResettingSession(true);
    setIsTimerEnabled(true);
    resetTimer();
    setShowResetTimerModal(false);
    setTimeout(() => {
      setIsResettingSession(false);
      fadeToSolvedState(performAnimatedScramble);
    }, 300);
  }, [resetTimer, fadeToSolvedState, performAnimatedScramble]);

  const handleResetTimerCancel = useCallback(
    () => setShowResetTimerModal(false),
    [],
  );

  const handleSolveSuccessTryAgain = useCallback(() => {
    setIsTimerEnabled(true);
    resetTimer();
    setShowSolveSuccessModal(false);
    setTimeout(() => {
      fadeToSolvedState(performAnimatedScramble);
    }, 300);
  }, [resetTimer, fadeToSolvedState, performAnimatedScramble]);

  const handleSolveSuccessClose = useCallback(() => {
    setIsTimerEnabled(false);
    resetTimer();
    setShowSolveSuccessModal(false);
    setTimeout(() => {
      fadeToSolvedState();
    }, 300);
  }, [resetTimer, fadeToSolvedState]);

  return {
    handleStartTimer,
    handleTimerModalYes,
    handleTimerModalNo,
    handleTimerQuit,
    handleQuitTimerConfirm,
    handleQuitTimerCancel,
    handleTimerResetNew,
    handleResetTimerConfirm,
    handleResetTimerCancel,
    handleSolveSuccessTryAgain,
    handleSolveSuccessClose,
  };
};

export default useTimerSessionHandlers;
