import React, { useEffect, useState } from "react";

const COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#96ceb4",
  "#feca57",
  "#ff9ff3",
];

interface ConfettiOverlayProps {
  active: boolean;
}

const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ active }) => {
  const [elements, setElements] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    if (!active) {
      setElements([]);
      return;
    }

    let confettiId = 0;
    const createSingleConfetti = () => {
      const id = confettiId++;
      const skewX = Math.random() * 40 - 20;
      const skewY = Math.random() * 20 - 10;
      const rotation = Math.random() * 360;
      const style = {
        left: `${Math.random() * 100}%`,
        top: 0,
        backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        animationDuration: `${3.5 + Math.random() * 1}s`,
        "--skew-x": `${skewX}deg`,
        "--skew-y": `${skewY}deg`,
        "--initial-rotation": `${rotation}deg`,
      } as React.CSSProperties;
      return (
        <div
          key={`confetti-${id}-${Date.now()}`}
          className="confetti"
          style={style}
        />
      );
    };

    const initialBurst: React.ReactElement[] = [];
    for (let i = 0; i < 15; i++) {
      confettiId++;
      const skewX = Math.random() * 40 - 20;
      const skewY = Math.random() * 20 - 10;
      const rotation = Math.random() * 360;
      const style = {
        left: `${Math.random() * 100}%`,
        top: 0,
        backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        animationDuration: `${3.5 + Math.random() * 1}s`,
        animationDelay: "0s",
        "--skew-x": `${skewX}deg`,
        "--skew-y": `${skewY}deg`,
        "--initial-rotation": `${rotation}deg`,
      } as React.CSSProperties;
      initialBurst.push(
        <div
          key={`initial-confetti-${confettiId}-${Date.now()}`}
          className="confetti"
          style={style}
        />
      );
    }

    setElements(initialBurst);

    const rainInterval = setInterval(() => {
      const newPieces: React.ReactElement[] = [];
      const pieceCount = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < pieceCount; i++) {
        newPieces.push(createSingleConfetti());
      }
      setElements((prev) => {
        const next = [...prev, ...newPieces];
        return next.slice(-100);
      });
    }, 200);

    return () => clearInterval(rainInterval);
  }, [active]);

  if (!active && elements.length === 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      aria-hidden
    >
      {elements}
    </div>
  );
};

export default ConfettiOverlay;

