import React from "react";

interface SequenceLabelProps {
  activeColorInfo: { colorName: string; colorValue: string } | null;
  frontFaceLabelOpacity: number;
  frontFaceLabelTranslateY: number;
  completionMessageOpacity: number;
  completionMessageTranslateY: number;
  disablePointerEvents: boolean;
}

const SequenceLabel: React.FC<SequenceLabelProps> = ({
  activeColorInfo,
  frontFaceLabelOpacity,
  frontFaceLabelTranslateY,
  completionMessageOpacity,
  completionMessageTranslateY,
  disablePointerEvents,
}) => {
  return (
    <div className="relative min-h-[14px] mb-1">
      {activeColorInfo && (
        <span
          className="text-[9px] uppercase tracking-wide font-semibold transition-all duration-300 ease-in-out block"
          style={{
            opacity: frontFaceLabelOpacity,
            transform: `translateY(${frontFaceLabelTranslateY}px)`,
          }}
        >
          <span className="text-blue-200">Front Face: </span>
          <span
            className="font-bold normal-case"
            style={{ color: activeColorInfo.colorValue }}
          >
            {activeColorInfo.colorName}
          </span>
        </span>
      )}
      <span
        className="text-[9px] uppercase tracking-wide font-semibold text-green-500 transition-all duration-300 ease-in-out absolute top-0 left-0"
        style={{
          opacity: completionMessageOpacity,
          transform: `translateY(${completionMessageTranslateY}px)`,
          pointerEvents:
            disablePointerEvents || completionMessageOpacity > 0
              ? "none"
              : "auto",
        }}
      >
        Complete
      </span>
    </div>
  );
};

export default SequenceLabel;

