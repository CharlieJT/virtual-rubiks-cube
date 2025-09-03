import moves from "@/consts/moves";
import Button from "./UI/Button";

interface MoveButtonsPanelProps {
  onMove: (move: string) => void;
}

const MoveButtonsPanel = ({ onMove }: MoveButtonsPanelProps) => (
  <div className="grid grid-cols-6 gap-2 mb-4">
    {moves.map((move) => (
      <Button
        key={move}
        onClick={() => onMove(move)}
        className="bg-slate-700 hover:bg-blue-600 text-white font-mono rounded px-2 py-1 text-sm shadow"
      >
        {move}
      </Button>
    ))}
  </div>
);

export default MoveButtonsPanel;
