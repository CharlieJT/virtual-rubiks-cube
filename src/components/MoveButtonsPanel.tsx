const moves = [
  "F",
  "f",
  "L",
  "l",
  "B",
  "b",
  "R",
  "r",
  "U",
  "u",
  "D",
  "d",
  "M",
  "S",
  "E",
  "x",
  "y",
  "z",
  "F'",
  "f'",
  "L'",
  "l'",
  "B'",
  "b'",
  "R'",
  "r'",
  "U'",
  "u'",
  "D'",
  "d'",
  "M'",
  "S'",
  "E'",
  "x'",
  "y'",
  "z'",
];

interface MoveButtonsPanelProps {
  onMove: (move: string) => void;
}

const MoveButtonsPanel = ({ onMove }: MoveButtonsPanelProps) => {
  return (
    <div className="grid grid-cols-6 gap-2 mb-4">
      {moves.map((move) => (
        <button
          key={move}
          onClick={() => onMove(move)}
          className="bg-slate-700 hover:bg-blue-600 text-white font-mono rounded px-2 py-1 text-sm shadow"
        >
          {move}
        </button>
      ))}
    </div>
  );
};

export default MoveButtonsPanel;
