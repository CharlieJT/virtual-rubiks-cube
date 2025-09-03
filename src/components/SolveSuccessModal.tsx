import React, { useEffect, useState } from "react";
import Button from "@components/UI/Button";
import Modal from "@components/UI/Modal";
import SevenSegmentDisplay from "@components/SevenSegmentDisplay";
import type { BestTimeResult } from "@/hooks/useBestTimes";

interface SolveSuccessModalProps {
  isOpen: boolean;
  time: string;
  onTryAgain: () => void;
  onClose: () => void;
  bestTimeResult?: BestTimeResult | null;
}

const SolveSuccessModal: React.FC<SolveSuccessModalProps> = ({
  isOpen,
  time,
  onTryAgain,
  onClose,
  bestTimeResult,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiElements, setConfettiElements] = useState<
    React.ReactElement[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);

      const colors = [
        "#ff6b6b",
        "#4ecdc4",
        "#45b7d1",
        "#96ceb4",
        "#feca57",
        "#ff9ff3",
      ];

      let confettiId = 0;

      // Function to create a single confetti piece
      const createSingleConfetti = () => {
        const id = confettiId++;

        // Generate random skew values for more realistic confetti effect
        const skewX = Math.random() * 40 - 20; // Random skew between -20deg and 20deg
        const skewY = Math.random() * 20 - 10; // Random skew between -10deg and 10deg
        const rotation = Math.random() * 360; // Random initial rotation

        const style = {
          left: `${Math.random() * 100}%`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          animationDuration: `${3.5 + Math.random() * 1}s`, // Vary duration between 3.5-4.5s
          // Use CSS custom properties for the animation
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

      // Create initial burst of confetti at different heights
      const initialBurst: React.ReactElement[] = [];
      for (let i = 0; i < 15; i++) {
        const id = confettiId++;
        const skewX = Math.random() * 40 - 20;
        const skewY = Math.random() * 20 - 10;
        const rotation = Math.random() * 360;

        // Start confetti at various heights so some are already mid-fall
        const startHeight = Math.random() * 80; // 0% to 80% from top

        const style = {
          left: `${Math.random() * 100}%`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          animationDuration: `${3.5 + Math.random() * 1}s`,
          animationDelay: `0s`, // Start immediately
          "--skew-x": `${skewX}deg`,
          "--skew-y": `${skewY}deg`,
          "--initial-rotation": `${rotation}deg`,
          // Start at different vertical positions
          top: `${startHeight}%`,
        } as React.CSSProperties;

        initialBurst.push(
          <div
            key={`initial-confetti-${id}-${Date.now()}`}
            className="confetti"
            style={style}
          />
        );
      }

      setConfettiElements(initialBurst);

      // Continuous rain - add new pieces every 200ms
      const rainInterval = setInterval(() => {
        // Add 2-3 new pieces every interval
        const newPieces: React.ReactElement[] = [];
        const pieceCount = 2 + Math.floor(Math.random() * 2); // 2-3 pieces

        for (let i = 0; i < pieceCount; i++) {
          newPieces.push(createSingleConfetti());
        }

        setConfettiElements((prev) => {
          // Keep only recent pieces (last 100) to prevent memory buildup
          const updatedElements = [...prev, ...newPieces];
          return updatedElements.slice(-100);
        });
      }, 200);

      // Cleanup
      return () => {
        clearInterval(rainInterval);
      };
    } else {
      setShowConfetti(false);
      setConfettiElements([]);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="text-center relative overflow-hidden">
        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {confettiElements}
          </div>
        )}

        {/* Content */}
        <div className="relative z-20">
          {/* Trophy Icon */}
          <div className="text-4xl my-3">🏆</div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-black mb-2">
            Congratulations!
          </h2>

          <p className="text-black mb-2">You solved the cube!</p>

          {/* Best Time Notification */}
          {bestTimeResult?.isNewBest && (
            <div className="mb-3">
              {bestTimeResult.wasPersonalBest ? (
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg">🎉</span>
                  <span className="font-bold">NEW PERSONAL BEST!</span>
                  <span className="text-lg">🎉</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>⭐</span>
                  <span className="font-bold">
                    New #{bestTimeResult.position} Best Time!
                  </span>
                  <span>⭐</span>
                </div>
              )}
            </div>
          )}
          {/* Time Display */}
          <div className="flex justify-center mb-4">
            <div className="bg-black/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <div className="text-sm text-gray-700 mb-2 text-center">
                Your Time:
              </div>
              <SevenSegmentDisplay time={time} size="md" />
            </div>
          </div>
          {/* Challenge Text */}
          <p className="text-lg text-black mb-4">Think you can beat it?</p>
          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onTryAgain}
              className="px-4 py-1 rounded-lg font-bold w-[125px] text-white border-none transition-opacity bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:opacity-90 cursor-pointer"
            >
              Try Again!
            </Button>
            <Button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-bold bg-cyan-50 text-blue-900 border-2 border-cyan-400 hover:bg-cyan-100 transition-colors"
            >
              Finish Session
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SolveSuccessModal;
