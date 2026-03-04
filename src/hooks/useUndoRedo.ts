import { useRef, useEffect, useCallback } from "react";
import type { CubeMove } from "@/types/cube";

interface UseUndoRedoParams {
  moveHistory: string[];
  historyIndex: number;
  isAnimating: boolean;
  setMoveHistory: React.Dispatch<React.SetStateAction<string[]>>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  setPendingMove: React.Dispatch<React.SetStateAction<CubeMove | null>>;
  lastMoveSourceRef: React.MutableRefObject<"queue" | "manual" | "undo" | "redo" | null>;
  undoInProgressRef: React.MutableRefObject<boolean>;
  redoInProgressRef: React.MutableRefObject<boolean>;
}

const getInverseMove = (move: string): string => {
  if (move.endsWith("'")) return move.slice(0, -1);
  if (move.endsWith("2")) return move;
  return move + "'";
};

const useUndoRedo = ({
  moveHistory,
  historyIndex,
  isAnimating,
  setMoveHistory,
  setHistoryIndex,
  setPendingMove,
  lastMoveSourceRef,
  undoInProgressRef,
  redoInProgressRef,
}: UseUndoRedoParams) => {
  const moveHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const addingToHistoryRef = useRef(false);

  useEffect(() => {
    moveHistoryRef.current = moveHistory;
  }, [moveHistory]);
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (undoInProgressRef.current || isAnimating) return;
    undoInProgressRef.current = true;
    if (historyIndex >= 0 && moveHistory.length > 0) {
      const inverseMove = getInverseMove(moveHistory[historyIndex]);
      lastMoveSourceRef.current = "undo";
      setPendingMove(inverseMove as CubeMove);
      setHistoryIndex(historyIndex - 1);
      setTimeout(() => {
        undoInProgressRef.current = false;
      }, 120);
    } else {
      undoInProgressRef.current = false;
    }
  }, [historyIndex, moveHistory, isAnimating]);

  const handleRedo = useCallback(() => {
    if (redoInProgressRef.current || isAnimating) return;
    redoInProgressRef.current = true;
    if (historyIndex < moveHistory.length - 1) {
      const newIndex = historyIndex + 1;
      lastMoveSourceRef.current = "redo";
      setPendingMove(moveHistory[newIndex] as CubeMove);
      setHistoryIndex(newIndex);
      setTimeout(() => {
        redoInProgressRef.current = false;
      }, 120);
    }
  }, [historyIndex, moveHistory, isAnimating]);

  const addMoveToHistory = useCallback((move: string) => {
    if (addingToHistoryRef.current) return;
    addingToHistoryRef.current = true;
    const currentIndex = historyIndexRef.current;
    const currentHistory = moveHistoryRef.current;
    const newHistory =
      currentIndex === currentHistory.length - 1
        ? [...currentHistory, move]
        : [...currentHistory.slice(0, currentIndex + 1), move];
    const newIndex = newHistory.length - 1;
    setMoveHistory(newHistory);
    setHistoryIndex(newIndex);
    moveHistoryRef.current = newHistory;
    historyIndexRef.current = newIndex;
    setTimeout(() => {
      addingToHistoryRef.current = false;
    }, 100);
  }, []);

  const clearMoveHistory = useCallback(() => {
    setMoveHistory([]);
    setHistoryIndex(-1);
  }, []);

  return { handleUndo, handleRedo, addMoveToHistory, clearMoveHistory };
};

export default useUndoRedo;
