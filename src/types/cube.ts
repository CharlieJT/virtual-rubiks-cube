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
