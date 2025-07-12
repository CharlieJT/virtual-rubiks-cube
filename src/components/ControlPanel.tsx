import { useState } from "react";
import type { Solution } from "../types/cube";

interface ControlPanelProps {
  onScramble: () => void;
  onSolve: () => void;
  onGenerateSolution: () => void;
  solution: Solution | null;
  isScrambled: boolean;
  isSolving: boolean;
}

const ControlPanel = ({
  onScramble,
  onSolve,
  onGenerateSolution,
  solution,
  isScrambled,
  isSolving,
}: ControlPanelProps) => {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="bg-slate-800 bg-opacity-90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">
        Rubik's Cube Controls
      </h2>

      <div className="space-y-4">
        <button
          onClick={onScramble}
          disabled={isSolving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 
                     text-white font-semibold py-3 px-6 rounded-lg transition-colors
                     disabled:cursor-not-allowed"
        >
          Scramble Cube
        </button>

        <button
          onClick={() => {
            onGenerateSolution();
            setShowSolution(true);
          }}
          disabled={!isScrambled || isSolving}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 
                     text-white font-semibold py-3 px-6 rounded-lg transition-colors
                     disabled:cursor-not-allowed"
        >
          Generate Solution
        </button>

        <button
          onClick={onSolve}
          disabled={!isScrambled || isSolving || !solution}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 
                     text-white font-semibold py-3 px-6 rounded-lg transition-colors
                     disabled:cursor-not-allowed"
        >
          {isSolving ? "Solving..." : "Solve Cube"}
        </button>
      </div>

      {solution && showSolution && (
        <div className="mt-6 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">
            Solution Algorithm
          </h3>
          <div className="text-sm text-gray-300 mb-2">
            Moves: {solution.moveCount}
          </div>
          <div className="text-white font-mono text-lg mb-4 p-2 bg-slate-900 rounded">
            {solution.algorithm}
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-medium">Step by step:</h4>
            {solution.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center text-sm text-gray-300"
              >
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                  {index + 1}
                </span>
                <span className="font-mono mr-3 text-white">{step.move}</span>
                <span>{step.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <div className="text-sm text-gray-400 mb-2">Cube Status</div>
        <div
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            isSolving
              ? "bg-yellow-500 text-yellow-900"
              : isScrambled
              ? "bg-red-500 text-red-900"
              : "bg-green-500 text-green-900"
          }`}
        >
          {isSolving ? "Solving" : isScrambled ? "Scrambled" : "Solved"}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
