export interface CubePosition {
  x: number;
  y: number;
  z: number;
}

export interface CubeState {
  position: CubePosition;
  rotation: [number, number, number];
  colors: {
    front: string;
    back: string;
    left: string;
    right: string;
    top: string;
    bottom: string;
  };
}

export type CubeFace = "F" | "B" | "L" | "R" | "U" | "D";
export type SliceMove = "M" | "E" | "S";
export type WholeCubeMove = "x" | "y" | "z";
export type CubeMove =
  | CubeFace
  | `${CubeFace}'`
  | `${CubeFace}2`
  | SliceMove
  | `${SliceMove}'`
  | `${SliceMove}2`
  | WholeCubeMove
  | `${WholeCubeMove}'`
  | `${WholeCubeMove}2`;

export interface RubiksCubeState {
  cubes: CubeState[][][];
  isScrambled: boolean;
  isSolving: boolean;
}

export interface SolutionStep {
  move: CubeMove;
  description: string;
}

export interface Solution {
  steps: SolutionStep[];
  moveCount: number;
  algorithm: string;
}

export type FaceKey = "right" | "left" | "top" | "bottom" | "front" | "back";

export type AngleBucketDeg = 0 | 90 | 180 | 270;

export type AngleMapDeg = Record<AngleBucketDeg, number>; // delta degrees to add (e.g., -90, 0, 90, 180)

type SliceAwareAngleMap = {
  default: AngleMapDeg; // for regular face moves
  M?: AngleMapDeg; // for M slice moves
  E?: AngleMapDeg; // for E slice moves
  S?: AngleMapDeg; // for S slice moves
};

type FaceToFaceMapDeg = Record<FaceKey, SliceAwareAngleMap>;

export type OrientationMapDeg = Record<FaceKey, FaceToFaceMapDeg>;

export type SliceKey = "M" | "E" | "S" | "none"; // "none" for non-slice moves

export type SwipeDirection = "up" | "down" | "left" | "right";
