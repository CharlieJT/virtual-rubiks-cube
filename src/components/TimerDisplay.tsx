import React from "react";
import SevenSegmentDisplay from "./SevenSegmentDisplay";

interface TimerDisplayProps {
  time: string;
  isActive: boolean;
  hasStarted: boolean;
  isScrambling?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  time,
  isActive,
  hasStarted,
  isScrambling = false,
}) => (
  <div className="space-y-1">
    {/* Timer display */}
    <div className="flex items-center justify-center bg-black/30 rounded-lg px-6 py-2 backdrop-blur-sm border border-white/20">
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            isActive ? "bg-green-400 animate-pulse" : "bg-gray-400"
          }`}
        />
        {/* Use larger size on desktop (lg and above), medium on mobile */}
        <div className="block lg:hidden">
          <SevenSegmentDisplay time={time} size="md" />
        </div>
        <div className="hidden lg:block">
          <SevenSegmentDisplay time={time} size="xl" />
        </div>
      </div>
    </div>

    {!hasStarted && !isScrambling && (
      <p className="text-white/80 text-xs italic tracking-wide mt-0">
        Timer will start after your first move
      </p>
    )}

    {/* Scrambling message */}
    {isScrambling && (
      <p className="text-yellow-300 text-xs italic tracking-wide mt-0 animate-pulse">
        🎲 Scrambling cube for timed solve...
      </p>
    )}
  </div>
);

export default TimerDisplay;
