import React from "react";

type CurvedArrowProps = {
  rotation?: number;
  scale?: number | string;
  rotateX?: string | number;
  left?: number;
  top?: number;
  position?: "absolute" | "relative" | "fixed" | "sticky" | "static";
  // Multiplier applied only to the arrowhead geometry (not the curve)
  headScale?: number;
  // Optional stroke width override for the arrowhead only
  headStrokeWidth?: number;
  isUndoRedo?: boolean;
};

const CurvedArrow: React.FC<CurvedArrowProps> = ({
  rotation = 0,
  scale = 1.05,
  rotateX = 0,
  left = -1,
  top = 1,
  position = "absolute",
  headScale = 1,
  headStrokeWidth,
  isUndoRedo,
}) => (
  <span
    style={{
      display: "inline-block",
      transform: `rotate(${rotation}deg) scale(${scale}) rotateX(${rotateX}deg)`,
      position,
      left,
      top,
    }}
  >
    <svg
      width="40"
      height="40"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Curved arrow wrapping around the cube */}
      <path
        d="M8 16c0-5 4-9 9-9s9 4 9 9c0 3.5-2.1 6.5-5.2 8"
        stroke="#fff"
        strokeWidth={isUndoRedo ? "2.6" : "1.6"}
        fill="none"
      />
      {/* Arrowhead */}
      {(() => {
        // Scale the arrowhead relative to the tip (21.5, 24.5)
        const tipX = isUndoRedo ? 24.5 : 21.5;
        const tipY = isUndoRedo ? 25 : 24.5;
        const dx1 = (isUndoRedo ? -2.2 : -2.2) * headScale;
        const dy1 = (isUndoRedo ? 0 : -0.5) * headScale;
        const dx2 = (isUndoRedo ? 1 : 2) * headScale;
        const dy2 = (isUndoRedo ? -2 : -2) * headScale;
        const d = `M${tipX} ${tipY} l${dx1} ${dy1} l${dx2} ${dy2}`;
        const sw = headStrokeWidth ?? 1.6;
        return (
          <path
            d={d}
            stroke="#fff"
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })()}
    </svg>
  </span>
);

export default CurvedArrow;
