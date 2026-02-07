import { useEffect, useRef, useState } from "react";
import type { Solution } from "@/types/cube";
import Button from "@components/UI/Button";
import Backdrop from "@components/UI/Backdrop";
import UndoRedoButtons from "@components/UI/UndoRedoButtons";
import TimerIcon from "@components/UI/Icons/TimerIcon";
import BooksIcon from "@components/UI/Icons/BooksIcon";
import BrainIcon from "@components/UI/Icons/BrainIcon";

interface ControlPanelProps {
  onScramble: () => void;
  onSolve: () => void;
  onGenerateSolution: () => void;
  onStartTimer: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onTimerQuit?: () => void;
  onTimerReset?: () => void;
  isTimerRunning?: boolean;
  solution: Solution | null;
  isScrambled: boolean;
  isSolving: boolean;
  isScrambling?: boolean;
  scrambleMoves?: string[] | null;
  scrambleIndex?: number;
  solutionIndex?: number;
  isTimerActive?: boolean;
  isGenerating?: boolean;
  showSolutionGeneratedModal?: boolean;
  showSolutionAlreadyGeneratedModal?: boolean;
  inputDisabled?: boolean;
  onLearnToSolve?: () => void;
}

const ControlPanel = ({
  onScramble,
  onSolve,
  onGenerateSolution,
  onStartTimer,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onTimerQuit,
  onTimerReset,
  isTimerRunning = false,
  isScrambled,
  isSolving,
  isScrambling,
  isTimerActive = false,
  isGenerating = false,
  showSolutionGeneratedModal = false,
  showSolutionAlreadyGeneratedModal = false,
  inputDisabled = false,
  onLearnToSolve,
}: ControlPanelProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when any solution modal appears
  useEffect(() => {
    if (showSolutionGeneratedModal || showSolutionAlreadyGeneratedModal) {
      setShowDropdown(false);
    }
  }, [showSolutionGeneratedModal, showSolutionAlreadyGeneratedModal]);

  const handleGenerateSolution = () => {
    // Don't close dropdown immediately - let it stay open during generation
    onGenerateSolution();
  };

  const handleStartTimer = () => {
    setShowDropdown(false);
    onStartTimer();
  };

  const handleLearnToSolve = () => {
    setShowDropdown(false);
    onLearnToSolve?.();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-5 left-0 right-0 z-40">
      <div className="w-full max-w-6xl mx-auto pb-[calc(env(safe-area-inset-bottom,0px)+.9rem)]">
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-row flex-wrap gap-2 md:gap-3 justify-center items-center w-full relative">
            {isTimerActive ? (
              <div className="flex gap-2.5">
                <Button
                  className="cursor-pointer text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm shadow-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#FF9100" }}
                  onClick={onTimerReset}
                  disabled={!isTimerRunning || isSolving || isScrambling}
                >
                  Reset
                </Button>
                <Button
                  className="cursor-pointer text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm shadow-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#FF1744" }}
                  onClick={onTimerQuit}
                  disabled={isSolving || isScrambling || inputDisabled}
                >
                  Quit Session
                </Button>
              </div>
            ) : (
              <>
                <Button
                  className="cursor-pointer text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm shadow-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#2979FF" }}
                  onClick={onScramble}
                  disabled={isSolving || isScrambling}
                >
                  Scramble
                </Button>
                <Button
                  className="cursor-pointer text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm shadow-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#0DB400" }}
                  onClick={onSolve}
                  disabled={isSolving || isScrambling || !isScrambled}
                >
                  Solve
                </Button>
                <div className="relative" ref={dropdownRef}>
                  <Button
                    className="cursor-pointer bg-white/15 backdrop-blur-md text-white font-semibold py-2.5 px-3 rounded-xl transition-all duration-200 text-sm shadow-lg border border-white/20 hover:bg-white/25 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={isSolving || isScrambling}
                  >
                    More
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <>
                      {/* Backdrop */}
                      <Backdrop
                        isOpen={showDropdown}
                        onClose={() => setShowDropdown(false)}
                        opacity="light"
                        withTransition={false}
                        zIndex="z-40"
                      />
                      {/* Dropdown Content */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 py-1.5 min-w-[210px] z-50">
                        <Button
                          className="w-full px-4 py-2.5 text-left hover:bg-white/15 transition-colors duration-150 flex items-center gap-2.5 text-white/90 cursor-pointer text-sm font-medium"
                          onClick={handleStartTimer}
                          disabled={isSolving || isScrambling}
                        >
                          <TimerIcon className="w-5 h-5 opacity-70" size={20} />
                          Timer Session
                        </Button>
                        <Button
                          className="w-full px-4 py-2.5 text-left hover:bg-white/15 transition-colors duration-150 flex items-center gap-2.5 text-white/90 cursor-pointer text-sm font-medium"
                          onClick={handleLearnToSolve}
                          disabled={isSolving || isScrambling}
                        >
                          <BooksIcon className="w-5 h-5 opacity-70" size={20} />
                          Learn to Solve
                        </Button>
                        {/* Only show Generate Solution if cube is scrambled (not solved) */}
                        {isScrambled && (
                          <Button
                            className="w-full px-4 py-2.5 text-left hover:bg-white/15 transition-colors duration-150 flex items-center gap-2.5 text-white/90 relative text-sm font-medium"
                            onClick={handleGenerateSolution}
                            disabled={isGenerating || isSolving || isScrambling}
                          >
                            <span className="flex items-center opacity-70">
                              {isGenerating ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                <BrainIcon className="w-5 h-5" size={20} />
                              )}
                            </span>
                            <span className="flex-1">
                              {isGenerating
                                ? "Generating..."
                                : "Generate Solution"}
                            </span>
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {/* Undo/Redo between Solve and More */}
                <UndoRedoButtons
                  onUndo={onUndo}
                  onRedo={onRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
