import React from "react";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import CurvedArrow from "./CurvedArrow";

interface SpinTrackpadProps {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
  isTouchDevice: boolean;
}

const SpinTrackpad: React.FC<SpinTrackpadProps> = ({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  isTouchDevice,
}) => (
  <>
    {/* Spin Trackpad - bottom right (only show on desktop/non-touch devices) */}
    {!isTouchDevice && (
      <div
        className="absolute right-3 bottom-3 z-30 select-none"
        aria-label="Spin trackpad"
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          className="flex flex-col w-32 h-14 md:w-40 md:h-16 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg items-center justify-center text-white text-xs md:text-sm font-semibold cursor-ew-resize"
          title="Drag left/right to spin"
        >
          <div>Drag here to spin</div>
          <div className="flex items-center justify-center h-6.5">
            <GoArrowLeft className="w-5 h-5 text-white drop-shadow" />
            <span className="relative">
              <CurvedArrow rotation={-30} />
              <svg
                width="40"
                height="40"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Cube (isometric) */}
                <polygon
                  points="16,10 22,13 22,19 16,22 10,19 10,13"
                  fill="#fff"
                  stroke="#888"
                  strokeWidth="1.5"
                />
                <polygon
                  points="16,10 22,13 16,16 10,13"
                  fill="#e0e7ff"
                  stroke="#888"
                  strokeWidth="1"
                />
                <polygon
                  points="16,16 22,13 22,19 16,22"
                  fill="#bae6fd"
                  stroke="#888"
                  strokeWidth="1"
                />
                <polygon
                  points="16,16 10,13 10,19 16,22"
                  fill="#f3e8ff"
                  stroke="#888"
                  strokeWidth="1"
                />
              </svg>
            </span>
            <GoArrowRight className="w-5 h-5 text-white drop-shadow" />
          </div>
        </div>
      </div>
    )}
  </>
);

export default SpinTrackpad;
