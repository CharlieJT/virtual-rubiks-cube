import React from "react";
import Button from "./Button";
import CurvedArrow from "./CurvedArrow";

interface UndoRedoButtonsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  className?: string;
}

const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  className = "",
}) => {
  return (
    <div className={`flex gap-1 h-[41.5px]  md:h-[38px] ${className}`}>
      <Button
        onClick={onUndo}
        disabled={!canUndo}
        className={`relative pt-[2px] md:pt-0 px-0 rounded-lg font-medium transition-all text-sm bg-black/20 hover:bg-black/30 ${
          canUndo
            ? "bg-black/50 hover:bg-black/50 text-white shadow-md"
            : "bg-black/10 text-black/15 cursor-not-allowed"
        }`}
        title="Undo last move"
      >
        <CurvedArrow
          rotation={300}
          rotateX={180}
          top={8}
          left={12}
          scale={0.7}
          headScale={2.4}
          headStrokeWidth={2.7}
          position="static"
          isUndoRedo
        />
      </Button>
      <Button
        onClick={onRedo}
        disabled={!canRedo}
        className={`relative pt-[2px] md:pt-0 px-0 rounded-lg font-medium transition-all text-sm ${
          canRedo
            ? "bg-black/50 hover:bg-black/50 text-white shadow-md"
            : "bg-black/10 text-black/15 cursor-not-allowed"
        }`}
        title="Redo last undone move"
      >
        <CurvedArrow
          rotation={240}
          top={8}
          left={16}
          scale={0.75}
          headScale={2.4}
          headStrokeWidth={2.7}
          position="static"
          isUndoRedo
        />
      </Button>
    </div>
  );
};

export default UndoRedoButtons;
