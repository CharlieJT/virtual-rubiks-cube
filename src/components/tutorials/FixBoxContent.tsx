import { createPortal } from "react-dom";
import AnimatedSequence from "./AnimatedSequence";
import { getSequenceConfig } from "@/utils/sequenceConfigHelpers";

interface FixBoxContentProps {
  activeSlideId: string | undefined;
  lessonId: string;
  fixIndex: number;
  fixDoublePartialDir: 0 | 1 | -1;
  fixSequence: string[];
  fixSequenceDisplay: string[];
  fixErrorPulse: boolean;
  hasActiveHighlightBorder: boolean;
  fixSequenceLength: number;
  deferMeasurements?: boolean;
  sequencePortalPosition?: { top: number; left: number } | null;
  midStage1Key: number;
  midStage1Progress: boolean;
  midStage1Line: boolean;
  midStage2Key: number;
  midStage2Progress: boolean;
  midStage2Line: boolean;
  midStage3Key: number;
  midStage3Progress: boolean;
  midStage3Line: boolean;
  midStage4Key: number;
  midStage4Progress: boolean;
  midStage4Line: boolean;
  midStage5Key: number;
  midStage5Progress: boolean;
  midStage5Line: boolean;
  midStage6Key: number;
  midStage6Progress: boolean;
  midStage6Line: boolean;
  midStage7Key: number;
  midStage7Progress: boolean;
  midStage7Line: boolean;
}

const FixBoxContent = ({
  activeSlideId,
  lessonId,
  fixIndex,
  fixDoublePartialDir,
  fixSequence,
  fixSequenceDisplay,
  fixErrorPulse,
  hasActiveHighlightBorder,
  fixSequenceLength,
  deferMeasurements = false,
  sequencePortalPosition = null,
  midStage1Key,
  midStage1Progress,
  midStage1Line,
  midStage2Key,
  midStage2Progress,
  midStage2Line,
  midStage3Key,
  midStage3Progress,
  midStage3Line,
  midStage4Key,
  midStage4Progress,
  midStage4Line,
  midStage5Key,
  midStage5Progress,
  midStage5Line,
  midStage6Key,
  midStage6Progress,
  midStage6Line,
  midStage7Key,
  midStage7Progress,
  midStage7Line,
}: FixBoxContentProps) => {
  if (fixSequence.length === 0) return null;

  const inProgress = hasActiveHighlightBorder && fixIndex < fixSequenceLength;
  const base =
    "rounded-lg h-10 px-3 py-2 text-xs md:text-sm font-semibold flex items-center gap-2 transition-colors ";
  const className = inProgress
    ? base + " border-blue-500 text-blue-200"
    : base + " border-blue-300 text-blue-200";

  const sequenceConfig = getSequenceConfig({
    activeSlideId,
    lessonId,
    fixSequence,
    fixSequenceDisplay,
    midStage1Key,
    midStage1Progress,
    midStage1Line,
    midStage2Key,
    midStage2Progress,
    midStage2Line,
    midStage3Key,
    midStage3Progress,
    midStage3Line,
    midStage4Key,
    midStage4Progress,
    midStage4Line,
    midStage5Key,
    midStage5Progress,
    midStage5Line,
    midStage6Key,
    midStage6Progress,
    midStage6Line,
    midStage7Key,
    midStage7Progress,
    midStage7Line,
  });

  const content = (
    <div
      className="absolute top-2 left-2 md:top-3 md:left-3"
      style={{
        zIndex: -1,
        pointerEvents: "none",
        touchAction: "none",
        userSelect: "none",
        isolation: "isolate",
        willChange: "auto",
      }}
    >
      <div
        className={className}
        style={{
          minWidth: "140px",
          pointerEvents: "none",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {sequenceConfig && (
          <div className="mb-1">
            <AnimatedSequence
              parts={sequenceConfig}
              currentIndex={fixIndex}
              partialDirection={fixDoublePartialDir}
              slideKey={activeSlideId}
              showFrontFaceLabel={true}
              disablePointerEvents={true}
              deferMeasurements={deferMeasurements}
              fixErrorPulse={fixErrorPulse}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (sequencePortalPosition && typeof document !== "undefined") {
    return createPortal(
      <div
        className="fixed"
        style={{
          top: `${sequencePortalPosition.top}px`,
          left: `${sequencePortalPosition.left}px`,
          zIndex: 10,
          pointerEvents: "none",
          touchAction: "none",
          userSelect: "none",
          isolation: "isolate",
        }}
      >
        {content}
      </div>,
      document.body
    );
  }

  return content;
};

export default FixBoxContent;
