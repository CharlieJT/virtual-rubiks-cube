import type { Solution } from "@/types/cube";
import Button from "@components/UI/Button";

interface ControlPanelProps {
  onScramble: () => void;
  onSolve: () => void;
  onGenerateSolution: () => void;
  solution: Solution | null;
  isScrambled: boolean;
  isSolving: boolean;
  isScrambling?: boolean;
  scrambleMoves?: string[] | null;
  scrambleIndex?: number;
  solutionIndex?: number;
}

import { useEffect, useRef, useState } from "react";

const ControlPanel = ({
  onScramble,
  onSolve,
  onGenerateSolution,
  isScrambled,
  isSolving,
  isScrambling,
  solution,
}: ControlPanelProps) => {
  const [showGenerated, setShowGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const prevSolutionRef = useRef<Solution | null>(null);

  const handleGenerateSolution = () => {
    setIsGenerating(true);
    onGenerateSolution();
  };

  // When the solution prop updates while generating, celebrate on the button
  useEffect(() => {
    const prev = prevSolutionRef.current;
    const changed = solution && solution !== prev;
    if (isGenerating && changed) {
      setIsGenerating(false);
      setShowGenerated(true);
      // Update previous solution reference immediately so we don't retrigger
      prevSolutionRef.current = solution ?? null;
      return;
    }
    prevSolutionRef.current = solution ?? null;
  }, [solution, isGenerating]);

  // Auto-hide tick + confetti after 1800ms
  useEffect(() => {
    if (!showGenerated) return;
    const t = setTimeout(() => setShowGenerated(false), 1800);
    return () => clearTimeout(t);
  }, [showGenerated]);

  return (
    <div className="fixed bottom-5 left-0 right-0 z-40">
      <div className="w-full max-w-6xl mx-auto pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-row flex-wrap gap-2 md:gap-4 justify-center items-center w-full relative">
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
            <div className="relative">
              <Button
                className={`w-[170px] text-center bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-2 px-3 md:py-2 md:px-4 rounded transition-all text-base md:text-sm shadow-md ${
                  showGenerated ? "btn-success-pulse" : ""
                }`}
                onClick={handleGenerateSolution}
                disabled={
                  isGenerating || isSolving || isScrambling || !isScrambled
                }
              >
                <span className="relative inline-flex items-center justify-center gap-2">
                  {showGenerated ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Solution generated"
                    >
                      <path
                        d="M7 13.5l3 3 7-7"
                        stroke="#fff"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    "Generate Solution"
                  )}
                </span>
              </Button>
              {showGenerated && (
                <span
                  className="absolute inset-0 flex items-center justify-center z-50"
                  style={{ pointerEvents: "none" }}
                >
                  {/* Confetti burst centered over the button */}
                  <span className="absolute">
                    <span
                      className="confetti"
                      style={{
                        left: -10,
                        top: 6,
                        background: "#22d3ee", //@ts-ignore
                        ["--x" as any]: "-44px",
                        ["--y" as any]: "-18px",
                        ["--r" as any]: "-40deg",
                      }}
                    />
                    <span
                      className="confetti"
                      style={{
                        left: 8,
                        top: -8,
                        background: "#f59e0b", //@ts-ignore
                        ["--x" as any]: "-12px",
                        ["--y" as any]: "-38px",
                        ["--r" as any]: "30deg",
                      }}
                    />
                    <span
                      className="confetti"
                      style={{
                        right: -12,
                        top: 4,
                        background: "#ef4444", //@ts-ignore
                        ["--x" as any]: "46px",
                        ["--y" as any]: "-16px",
                        ["--r" as any]: "60deg",
                      }}
                    />
                    <span
                      className="confetti"
                      style={{
                        right: 0,
                        bottom: -8,
                        background: "#a78bfa", //@ts-ignore
                        ["--x" as any]: "30px",
                        ["--y" as any]: "26px",
                        ["--r" as any]: "-25deg",
                      }}
                    />
                    <span
                      className="confetti"
                      style={{
                        left: 0,
                        bottom: -8,
                        background: "#34d399", //@ts-ignore
                        ["--x" as any]: "-30px",
                        ["--y" as any]: "26px",
                        ["--r" as any]: "18deg",
                      }}
                    />
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
