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

const ControlPanel = ({
  onScramble,
  onSolve,
  onGenerateSolution,
  isScrambled,
  isSolving,
  isScrambling,
}: ControlPanelProps) => (
  // Control panel fixed at bottom (mobile-safe) - scramble/solve buttons remain here
  <div className="fixed bottom-0 left-0 right-0 z-40">
    <div className="w-full max-w-6xl mx-auto pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-row flex-wrap gap-2 md:gap-4 justify-center items-center w-full">
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
          <Button
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-2 px-3 md:py-2 md:px-4 rounded transition-all text-base md:text-sm shadow-md"
            onClick={onGenerateSolution}
            disabled={isSolving || isScrambling || !isScrambled}
          >
            Generate Solution
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default ControlPanel;
