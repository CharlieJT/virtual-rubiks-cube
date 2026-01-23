import type { SequencePart } from "@/components/tutorials/AnimatedSequence";
import CUBE_COLORS from "@/consts/cubeColours";

interface SequenceConfigParams {
  activeSlideId: string | undefined;
  lessonId: string;
  fixSequence: string[];
  fixSequenceDisplay: string[];
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

export const getSequenceConfig = ({
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
}: SequenceConfigParams): SequencePart[] | null => {
  if (!activeSlideId) return null;

  switch (activeSlideId) {
    case "flip-green-white-f2":
      return [
        {
          moves: ["F2"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 0,
          boundaryIndex: 1,
        },
      ];

    case "flip-green-white":
      return [
        {
          moves: ["F", "U'", "R", "U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 0,
          boundaryIndex: 4,
        },
      ];

    case "flipped-misoriented-green-white":
      return [
        {
          moves: ["F2"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 0,
          boundaryIndex: 1,
        },
        {
          moves: ["F", "U'", "R", "U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 1,
          boundaryIndex: 5,
        },
      ];

    case "misaligned-green-white":
      return [
        {
          moves: ["D'"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 0,
          boundaryIndex: 1,
        },
        {
          moves: ["F2"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 1,
          boundaryIndex: 2,
        },
      ];

    case "flipped-misoriented-misaligned-green-white":
      return [
        {
          moves: ["D'"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 0,
          boundaryIndex: 1,
        },
        {
          moves: ["F2"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 1,
          boundaryIndex: 2,
        },
        {
          moves: ["F", "U'", "R", "U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 2,
          boundaryIndex: 6,
        },
      ];

    case "practice-setup-solution":
      return [
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 4,
        },
      ];

    case "practice-setup-solution-2":
      return [
        {
          moves: ["L'", "U'", "L", "U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 0,
          boundaryIndex: 4,
        },
      ];

    case "practice-setup-solution-3":
      return [
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 4,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 4,
          boundaryIndex: 8,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 8,
          boundaryIndex: 12,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
      ];

    case "practice-setup-solution-4":
      return [
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 4,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 4,
          boundaryIndex: 8,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
      ];

    case "practice-setup-solution-5":
      return [
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 4,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 4,
          boundaryIndex: 8,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 8,
          boundaryIndex: 12,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 12,
          boundaryIndex: 16,
          tickAnimKey: midStage4Key,
          tickProgress: midStage4Progress,
          tickLine: midStage4Line,
        },
      ];

    case "practice-setup-solution-6":
      return [
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 0,
          boundaryIndex: 4,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 4,
          boundaryIndex: 5,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 5,
          boundaryIndex: 9,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
      ];

    case "practice-setup-solution-9":
      return [
        {
          moves: ["U2"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 0,
          boundaryIndex: 1,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 1,
          boundaryIndex: 5,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 5,
          boundaryIndex: 6,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
        {
          moves: ["L'", "U'", "L", "U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 6,
          boundaryIndex: 10,
          tickAnimKey: midStage4Key,
          tickProgress: midStage4Progress,
          tickLine: midStage4Line,
        },
      ];

    case "midlayer-green-white-extraction":
      return [
        {
          moves: ["R'", "D'", "R"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 3,
        },
        {
          moves: ["D'"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 3,
          boundaryIndex: 4,
        },
        {
          moves: ["F2"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 4,
          boundaryIndex: 5,
        },
      ];

    case "second-layer-setup-solution":
      return [
        {
          moves: ["U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 0,
          boundaryIndex: 1,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["L'", "U'", "L", "U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 1,
          boundaryIndex: 5,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 5,
          boundaryIndex: 9,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
      ];

    case "second-layer-setup-solution-2":
      return [
        {
          moves: ["U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 0,
          boundaryIndex: 1,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 1,
          boundaryIndex: 5,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["L'", "U'", "L", "U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 5,
          boundaryIndex: 9,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
      ];

    case "second-layer-setup-solution-3":
      return [
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: "#9ca3af", // gray-400
          startIndex: 0,
          boundaryIndex: 1,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 1,
          boundaryIndex: 5,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["L'", "U'", "L", "U"],
          colorName: "Orange",
          colorValue: CUBE_COLORS.ORANGE,
          startIndex: 5,
          boundaryIndex: 9,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
        {
          moves: ["U2"],
          colorName: "N/A",
          colorValue: "#9ca3af", // gray-400
          startIndex: 9,
          boundaryIndex: 10,
          tickAnimKey: midStage4Key,
          tickProgress: midStage4Progress,
          tickLine: midStage4Line,
        },
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: "#9ca3af", // gray-400
          startIndex: 10,
          boundaryIndex: 11,
          tickAnimKey: midStage5Key,
          tickProgress: midStage5Progress,
          tickLine: midStage5Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 11,
          boundaryIndex: 15,
          tickAnimKey: midStage6Key,
          tickProgress: midStage6Progress,
          tickLine: midStage6Line,
        },
        {
          moves: ["L'", "U'", "L", "U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 15,
          boundaryIndex: 19,
          tickAnimKey: midStage7Key,
          tickProgress: midStage7Progress,
          tickLine: midStage7Line,
        },
      ];

    case "second-layer-setup-solution-4":
      return [
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 0,
          boundaryIndex: 1,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 1,
          boundaryIndex: 5,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["L'", "U'", "L", "U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 5,
          boundaryIndex: 9,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 9,
          boundaryIndex: 10,
          tickAnimKey: midStage4Key,
          tickProgress: midStage4Progress,
          tickLine: midStage4Line,
        },
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 10,
          boundaryIndex: 11,
          tickAnimKey: midStage5Key,
          tickProgress: midStage5Progress,
          tickLine: midStage5Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 11,
          boundaryIndex: 15,
          tickAnimKey: midStage6Key,
          tickProgress: midStage6Progress,
          tickLine: midStage6Line,
        },
        {
          moves: ["L'", "U'", "L", "U"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 15,
          boundaryIndex: 19,
          tickAnimKey: midStage7Key,
          tickProgress: midStage7Progress,
          tickLine: midStage7Line,
        },
      ];

    case "yellow-cross-line":
      return [
        {
          moves: ["F", "R", "U", "R'", "U'", "F'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 6,
        },
      ];

    case "yellow-cross-dot":
      return [
        {
          moves: ["F", "R", "U", "R'", "U'", "F'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 6,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["U2"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 6,
          boundaryIndex: 7,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["F", "R", "U", "R'", "U'", "F'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 7,
          boundaryIndex: 13,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
        {
          moves: ["F", "R", "U", "R'", "U'", "F'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 13,
          boundaryIndex: 19,
          tickAnimKey: midStage4Key,
          tickProgress: midStage4Progress,
          tickLine: midStage4Line,
        },
      ];

    case "yellow-cross-triangle":
      return [
        {
          moves: ["F", "R", "U", "R'", "U'", "F'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 6,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["F", "R", "U", "R'", "U'", "F'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 6,
          boundaryIndex: 12,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
      ];

    case "yellow-edges-solution":
      return [
        {
          moves: ["R", "U", "R'", "U", "R", "U2", "R'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 7,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 7,
          boundaryIndex: 8,
        },
      ];

    case "yellow-edges-solution-2":
      return [
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 0,
          boundaryIndex: 1,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U", "R", "U2", "R'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 1,
          boundaryIndex: 8,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 8,
          boundaryIndex: 9,
        },
      ];

    case "yellow-edges-solution-3":
      return [
        {
          moves: ["U2"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 0,
          boundaryIndex: 1,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U", "R", "U2", "R'"],
          colorName: "Blue",
          colorValue: CUBE_COLORS.BLUE,
          startIndex: 1,
          boundaryIndex: 8,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 8,
          boundaryIndex: 9,
        },
      ];

    case "yellow-edges-solution-4":
      return [
        {
          moves: ["R", "U", "R'", "U", "R", "U2", "R'"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 7,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U", "R", "U2", "R'"],
          colorName: "Blue",
          colorValue: CUBE_COLORS.BLUE,
          startIndex: 7,
          boundaryIndex: 14,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["U"],
          colorName: "N/A",
          colorValue: CUBE_COLORS.GRAY,
          startIndex: 14,
          boundaryIndex: 15,
        },
      ];

    case "yellow-corners-solution":
      return [
        {
          moves: ["U", "R", "U'", "L'", "U", "R'", "U'", "L"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 8,
        },
      ];

    case "yellow-corners-solution-2":
      return [
        {
          moves: ["U", "R", "U'", "L'", "U", "R'", "U'", "L"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 8,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["U", "R", "U'", "L'", "U", "R'", "U'", "L"],
          colorName: "Blue",
          colorValue: CUBE_COLORS.BLUE,
          startIndex: 8,
          boundaryIndex: 16,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
      ];

    case "yellow-corners-solution-3":
      return [
        {
          moves: ["U", "R", "U'", "L'", "U", "R'", "U'", "L"],
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex: 8,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["U", "R", "U'", "L'", "U", "R'", "U'", "L"],
          colorName: "Orange",
          colorValue: CUBE_COLORS.ORANGE,
          startIndex: 8,
          boundaryIndex: 16,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["U", "R", "U'", "L'", "U", "R'", "U'", "L"],
          colorName: "Orange",
          colorValue: CUBE_COLORS.ORANGE,
          startIndex: 16,
          boundaryIndex: 24,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
      ];

    case "orient-two-corners":
      return [
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 0,
          boundaryIndex: 4,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 4,
          boundaryIndex: 8,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 8,
          boundaryIndex: 12,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 12,
          boundaryIndex: 16,
          tickAnimKey: midStage4Key,
          tickProgress: midStage4Progress,
          tickLine: midStage4Line,
        },
        {
          moves: ["D"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 16,
          boundaryIndex: 17,
          tickAnimKey: midStage5Key,
          tickProgress: midStage5Progress,
          tickLine: midStage5Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 17,
          boundaryIndex: 21,
          tickAnimKey: midStage6Key,
          tickProgress: midStage6Progress,
          tickLine: midStage6Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 21,
          boundaryIndex: 25,
          tickAnimKey: midStage7Key,
          tickProgress: midStage7Progress,
          tickLine: midStage7Line,
        },
        {
          moves: ["D'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 25,
          boundaryIndex: 26,
        },
      ];

    case "orient-three-corners":
      return [
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 0,
          boundaryIndex: 4,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 4,
          boundaryIndex: 8,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["D"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 8,
          boundaryIndex: 9,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 9,
          boundaryIndex: 13,
          tickAnimKey: midStage4Key,
          tickProgress: midStage4Progress,
          tickLine: midStage4Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 13,
          boundaryIndex: 17,
          tickAnimKey: midStage5Key,
          tickProgress: midStage5Progress,
          tickLine: midStage5Line,
        },
        {
          moves: ["D"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 17,
          boundaryIndex: 18,
          tickAnimKey: midStage6Key,
          tickProgress: midStage6Progress,
          tickLine: midStage6Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 18,
          boundaryIndex: 22,
          tickAnimKey: midStage7Key,
          tickProgress: midStage7Progress,
          tickLine: midStage7Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 22,
          boundaryIndex: 26,
        },
        {
          moves: ["D2"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 26,
          boundaryIndex: 27,
        },
      ];

    case "orient-four-corners":
      return [
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 0,
          boundaryIndex: 4,
          tickAnimKey: midStage1Key,
          tickProgress: midStage1Progress,
          tickLine: midStage1Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 4,
          boundaryIndex: 8,
          tickAnimKey: midStage2Key,
          tickProgress: midStage2Progress,
          tickLine: midStage2Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 8,
          boundaryIndex: 12,
          tickAnimKey: midStage3Key,
          tickProgress: midStage3Progress,
          tickLine: midStage3Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 12,
          boundaryIndex: 16,
          tickAnimKey: midStage4Key,
          tickProgress: midStage4Progress,
          tickLine: midStage4Line,
        },
        {
          moves: ["D"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 16,
          boundaryIndex: 17,
          tickAnimKey: midStage5Key,
          tickProgress: midStage5Progress,
          tickLine: midStage5Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 17,
          boundaryIndex: 21,
          tickAnimKey: midStage6Key,
          tickProgress: midStage6Progress,
          tickLine: midStage6Line,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 21,
          boundaryIndex: 25,
          tickAnimKey: midStage7Key,
          tickProgress: midStage7Progress,
          tickLine: midStage7Line,
        },
        {
          moves: ["D"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 25,
          boundaryIndex: 26,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 26,
          boundaryIndex: 30,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 30,
          boundaryIndex: 34,
        },
        {
          moves: ["D"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 34,
          boundaryIndex: 35,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 35,
          boundaryIndex: 39,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 39,
          boundaryIndex: 43,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 43,
          boundaryIndex: 47,
        },
        {
          moves: ["R", "U", "R'", "U'"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 47,
          boundaryIndex: 51,
        },
        {
          moves: ["D"],
          colorName: "Green",
          colorValue: CUBE_COLORS.GREEN,
          startIndex: 51,
          boundaryIndex: 52,
        },
      ];

    default:
      // Default rendering for other slides
      if (lessonId === "notation") {
        // Notation lessons use fixSequenceDisplay with Green front face
        return [
          {
            moves: fixSequenceDisplay,
            colorName: "Green",
            colorValue: CUBE_COLORS.GREEN,
            startIndex: 0,
            boundaryIndex: fixSequenceDisplay.length,
          },
        ];
      }

      // Use fixSequenceDisplay for certain slides, fixSequence for others
      const useDisplay =
        activeSlideId === "practice-setup-solution" ||
        activeSlideId === "practice-setup-solution-2" ||
        activeSlideId === "practice-setup-solution-3" ||
        activeSlideId === "yellow-cross-line" ||
        activeSlideId === "yellow-edges-solution";

      const moves = useDisplay ? fixSequenceDisplay : fixSequence;
      const boundaryIndex = useDisplay
        ? fixSequenceDisplay.length
        : fixSequence.length;

      return [
        {
          moves,
          colorName: "Red",
          colorValue: CUBE_COLORS.RED,
          startIndex: 0,
          boundaryIndex,
          borderColor:
            activeSlideId === "midlayer-green-white-extraction"
              ? CUBE_COLORS.GREEN
              : "border-green-500",
        },
      ];
  }
};
