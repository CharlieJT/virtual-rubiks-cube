import React from "react";
import Button from "@components/UI/Button";

interface MoveOverlayProps {
  title: string;
  icon: React.ReactNode;
  moves: string[];
  highlightIndex?: number;
  moveCount?: number;
  show: boolean;
  onClose: () => void;
  colorTheme?: "scramble" | "solution";
}

const MoveOverlay: React.FC<MoveOverlayProps> = ({
  title,
  icon,
  moves,
  highlightIndex = -1,
  moveCount,
  show,
  onClose,
  colorTheme = "scramble",
}) => {
  if (!show || !moves || moves.length === 0) return null;

  const highlightClass =
    colorTheme === "solution"
      ? "bg-purple-400 text-purple-900"
      : "bg-yellow-400 text-yellow-900";
  const badgeClass =
    colorTheme === "solution"
      ? "bg-purple-500 text-white"
      : "bg-yellow-400 text-yellow-900";

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-white/20 rounded-lg px-2 md:px-3 pt-1 md:pt-2 pb-1 shadow-xl backdrop-blur-md flex flex-col w-full max-w-[95vw] text-[1em] md:text-base pointer-events-none">
      <div className="flex justify-between items-center w-full mb-0">
        <h4 className="text-white font-semibold text-[0.85em] md:text-lg flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h4>
        <div className="flex items-center gap-2">
          {typeof moveCount === "number" && (
            <span
              className={`px-1 py-0.5 md:px-2 md:py-1 rounded text-[0.8em] md:text-base font-semibold ${badgeClass}`}
            >
              {moveCount} moves
            </span>
          )}
          <Button
            className="ml-2 text-white/80 hover:text-white text-lg font-bold px-2 py-0.5 rounded transition pointer-events-auto"
            aria-label={`Close ${title.toLowerCase()} overlay`}
            onClick={onClose}
          >
            ×
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 text-[0.8em] md:text-base">
        {moves.map((move, i) => (
          <span
            key={i}
            className={`px-1.5 py-0.5 md:px-2.25 md:py-1 rounded font-mono transition-colors ${
              i === highlightIndex ? highlightClass : "bg-white/30 text-white"
            }`}
          >
            {move}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-end w-full mt-1 gap-1">
        <div className="flex items-center justify-center w-[1.3em] h-[1.3em] md:w-[1.5em] md:h-[1.5em] border-1 border-white/50 text-white rounded-full text-[0.6em]">
          i
        </div>
        <p className="text-xs md:text-sm text-white/50 italic">
          Moves are relative to white top & green front
        </p>
      </div>
    </div>
  );
};

export default MoveOverlay;
