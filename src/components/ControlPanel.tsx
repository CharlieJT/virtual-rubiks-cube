import { useEffect, useRef, useState } from "react";
import type { Solution } from "@/types/cube";
import Button from "@components/UI/Button";
import Backdrop from "@components/UI/Backdrop";
import UndoRedoButtons from "@components/UI/UndoRedoButtons";

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
      <div className="w-full max-w-6xl mx-auto pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-row flex-wrap gap-2 md:gap-3 justify-center items-center w-full relative">
            {isTimerActive ? (
              <div className="flex gap-2">
                <Button
                  className="bg-gradient-to-r from-orange-400 to-orange-500 hover:opacity-90 cursor-pointer text-white font-bold py-2 px-3 md:py-2 md:px-4 rounded transition-all text-base md:text-sm shadow-md"
                  onClick={onTimerReset}
                  disabled={!isTimerRunning || isSolving || isScrambling}
                >
                  Reset
                </Button>
                <Button
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 text-white font-bold py-2 px-3 md:py-2 md:px-4 rounded transition-all text-base md:text-sm shadow-md"
                  onClick={onTimerQuit}
                  disabled={isSolving || isScrambling || inputDisabled}
                >
                  Quit Session
                </Button>
              </div>
            ) : (
              <>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2 px-3 md:py-2 md:px-4 rounded transition-all text-base md:text-sm shadow-md"
                  onClick={onScramble}
                  disabled={isSolving || isScrambling}
                >
                  Scramble
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2 px-3 md:py-2 md:px-4 rounded transition-all text-base md:text-sm shadow-md"
                  onClick={onSolve}
                  disabled={isSolving || isScrambling || !isScrambled}
                >
                  Solve
                </Button>
                <div className="relative" ref={dropdownRef}>
                  <Button
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 px-3 md:py-2 md:px-4 rounded transition-all text-base md:text-sm shadow-md flex items-center gap-2"
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
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] z-50">
                        <Button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700 cursor-pointer"
                          onClick={handleStartTimer}
                          disabled={isSolving || isScrambling}
                        >
                          <span className="text-lg">⏱️</span>
                          Timer Session
                        </Button>
                        {/* Only show Generate Solution if cube is scrambled (not solved) */}
                        {isScrambled && (
                          <Button
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700 relative"
                            onClick={handleGenerateSolution}
                            disabled={isGenerating || isSolving || isScrambling}
                          >
                            <span className="text-lg">
                              {isGenerating ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                              ) : (
                                "🧠"
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
