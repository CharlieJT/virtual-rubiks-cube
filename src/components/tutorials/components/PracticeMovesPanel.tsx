interface PracticeMovesPanelProps {
  activeSlideId: string | undefined;
  activeSlideAllowFaceMoves?: boolean;
  currentSlide: number;
  isAnimating: boolean;
  inputDisabled: boolean;
  onMove: (move: string) => void;
}

const PracticeMovesPanel = ({
  activeSlideId,
  activeSlideAllowFaceMoves,
  currentSlide,
  isAnimating,
  inputDisabled,
  onMove,
}: PracticeMovesPanelProps) => {
  const shouldShow =
    !activeSlideId ||
    (activeSlideAllowFaceMoves && currentSlide >= 100);

  if (!shouldShow) return null;

  const moves = [
    "F",
    "F'",
    "R",
    "R'",
    "U",
    "U'",
    "L",
    "L'",
    "B",
    "B'",
    "D",
    "D'",
  ];

  return (
    <div className="absolute bottom-4 left-2 right-2 md:left-4 md:right-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-lg">
        <div className="text-sm text-gray-600 mb-2">Practice Moves:</div>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-1 md:gap-2">
          {moves.map((move) => (
            <button
              key={move}
              onClick={() => onMove(move)}
              disabled={isAnimating || inputDisabled}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
            >
              {move}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticeMovesPanel;

