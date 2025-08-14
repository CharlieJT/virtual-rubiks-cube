import type { Solution } from "../types/cube";

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
}: ControlPanelProps) => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-row flex-wrap gap-2 md:gap-4 justify-center items-center w-full bg-white/10 rounded-xl shadow-lg p-2 md:p-4 backdrop-blur-md">
        <button
          className={`bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-1 px-2 md:py-2 md:px-4 rounded transition-all text-base md:text-sm shadow-md${
            isSolving || isScrambling ? " opacity-50" : ""
          }`}
          onClick={isSolving || isScrambling ? undefined : onScramble}
          style={isSolving || isScrambling ? { pointerEvents: "none" } : {}}
        >
          Scramble
        </button>
        <button
          className={`bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-1 px-2 md:py-2 md:px-4 rounded transition-all text-base md:text-sm shadow-md${
            isSolving || isScrambling || !isScrambled ? " opacity-50" : ""
          }`}
          onClick={
            isSolving || isScrambling || !isScrambled ? undefined : onSolve
          }
          style={
            isSolving || isScrambling || !isScrambled
              ? { pointerEvents: "none" }
              : {}
          }
        >
          Solve
        </button>
        <button
          className={`bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-1 px-2 md:py-2 md:px-4 rounded transition-all text-base md:text-sm shadow-md${
            isSolving || isScrambling || !isScrambled ? " opacity-50" : ""
          }`}
          onClick={
            isSolving || isScrambling || !isScrambled
              ? undefined
              : onGenerateSolution
          }
          style={
            isSolving || isScrambling || !isScrambled
              ? { pointerEvents: "none" }
              : {}
          }
        >
          Generate Solution
        </button>
        {/* ...other controls... */}
      </div>
      {/* Status */}
      <div className="text-center mt-2">
        <div className="text-white/70 text-base mb-2 font-medium">Status</div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-base md:text-sm ${
            isSolving
              ? "bg-yellow-400 text-yellow-900"
              : isScrambled
              ? "bg-red-400 text-red-900"
              : "bg-green-400 text-green-900"
          }`}
        >
          <span>{isSolving ? "⚡" : isScrambled ? "🔀" : "✅"}</span>
          {isSolving ? "Solving" : isScrambled ? "Scrambled" : "Solved"}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
