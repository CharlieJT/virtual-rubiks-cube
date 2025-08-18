/**
 * Auto-orientation utility for Rubik's cube
 *
 * This module provides functions to automatically orient the cube so that:
 * - The face containing the white center is positioned on top
 * - The face containing the green center is positioned on front
 * - Uses only whole-cube rotations (x, y, z moves)
 */

import type { CubeState, CubeMove } from "../types/cube";
import * as THREE from "three";

export type FacePosition =
  | "top"
  | "bottom"
  | "front"
  | "back"
  | "left"
  | "right";

/**
 * Find which face currently contains the white center
 */
function findWhiteCenterFace(cubeState: CubeState[][][]): FacePosition | null {
  // Check each center position for white color
  const centers = [
    { pos: [2, 1, 1], face: "right" as FacePosition },
    { pos: [0, 1, 1], face: "left" as FacePosition },
    { pos: [1, 2, 1], face: "top" as FacePosition },
    { pos: [1, 0, 1], face: "bottom" as FacePosition },
    { pos: [1, 1, 2], face: "front" as FacePosition },
    { pos: [1, 1, 0], face: "back" as FacePosition },
  ];

  for (const center of centers) {
    const [x, y, z] = center.pos;
    const cubie = cubeState[x]?.[y]?.[z];
    if (cubie && isWhiteColor(cubie.colors[center.face])) {
      return center.face;
    }
  }
  return null;
}

/**
 * Find which face currently contains the green center
 */
function findGreenCenterFace(cubeState: CubeState[][][]): FacePosition | null {
  // Check each center position for green color
  const centers = [
    { pos: [2, 1, 1], face: "right" as FacePosition },
    { pos: [0, 1, 1], face: "left" as FacePosition },
    { pos: [1, 2, 1], face: "top" as FacePosition },
    { pos: [1, 0, 1], face: "bottom" as FacePosition },
    { pos: [1, 1, 2], face: "front" as FacePosition },
    { pos: [1, 1, 0], face: "back" as FacePosition },
  ];

  for (const center of centers) {
    const [x, y, z] = center.pos;
    const cubie = cubeState[x]?.[y]?.[z];
    if (cubie && isGreenColor(cubie.colors[center.face])) {
      return center.face;
    }
  }
  return null;
}

/**
 * Check if a color is white
 */
function isWhiteColor(color: string): boolean {
  if (!color) return false;
  let s = color.toLowerCase();
  if (s[0] === "#" && s.length === 4) {
    s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return s === "#ffffff" || s === "white";
}

/**
 * Check if a color is green
 */
function isGreenColor(color: string): boolean {
  if (!color) return false;
  let s = color.toLowerCase();
  if (s[0] === "#" && s.length === 4) {
    s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return s === "#00e676" || s === "#00ff00" || s === "#008000" || s === "green";
}

/**
 * Calculate the sequence of whole-cube rotations needed to position:
 * - The face with white center as top
 * - The face with green center as front
 */
export function calculateAutoOrientMoves(
  cubeState: CubeState[][][],
  _cubeRotation?: THREE.Quaternion
): CubeMove[] {
  const whiteFace = findWhiteCenterFace(cubeState);
  const greenFace = findGreenCenterFace(cubeState);

  if (!whiteFace || !greenFace) {
    return [];
  }

  const moves: CubeMove[] = [];

  // Step 1: Get white to top
  switch (whiteFace) {
    case "top":
      // Already on top
      break;
    case "bottom":
      moves.push("x", "x"); // 180° rotation around x-axis
      break;
    case "front":
      moves.push("x'"); // -90° rotation around x-axis
      break;
    case "back":
      moves.push("x"); // 90° rotation around x-axis
      break;
    case "right":
      moves.push("z'"); // -90° rotation around z-axis
      break;
    case "left":
      moves.push("z"); // 90° rotation around z-axis
      break;
  }

  // Step 2: After white is on top, we need to figure out where green ended up
  // and rotate around y-axis to get it to front
  let greenFaceAfterWhiteToTop = greenFace;

  // Simulate where green goes after the white-to-top rotations
  for (const move of moves) {
    greenFaceAfterWhiteToTop = applyMoveToFace(greenFaceAfterWhiteToTop, move);
  }

  // Now get green to front with y rotations (which don't affect white on top)
  switch (greenFaceAfterWhiteToTop) {
    case "front":
      // Already on front
      break;
    case "back":
      moves.push("y", "y"); // 180° rotation around y-axis
      break;
    case "right":
      moves.push("y'"); // -90° rotation around y-axis
      break;
    case "left":
      moves.push("y"); // 90° rotation around y-axis
      break;
    case "top":
    case "bottom":
      // This shouldn't happen if white is on top, but handle gracefully
      console.warn(
        `Green ended up on ${greenFaceAfterWhiteToTop} after white to top moves`
      );
      break;
  }

  return moves;
}

/**
 * Simulate where a face ends up after applying a whole-cube rotation
 */
function applyMoveToFace(face: FacePosition, move: CubeMove): FacePosition {
  switch (move) {
    case "x": // 90° rotation around x-axis (R face towards you)
      switch (face) {
        case "top":
          return "front";
        case "front":
          return "bottom";
        case "bottom":
          return "back";
        case "back":
          return "top";
        case "left":
          return "left";
        case "right":
          return "right";
      }
      break;
    case "x'": // -90° rotation around x-axis
      switch (face) {
        case "top":
          return "back";
        case "back":
          return "bottom";
        case "bottom":
          return "front";
        case "front":
          return "top";
        case "left":
          return "left";
        case "right":
          return "right";
      }
      break;
    case "y": // 90° rotation around y-axis (U face towards you)
      switch (face) {
        case "front":
          return "left";
        case "left":
          return "back";
        case "back":
          return "right";
        case "right":
          return "front";
        case "top":
          return "top";
        case "bottom":
          return "bottom";
      }
      break;
    case "y'": // -90° rotation around y-axis
      switch (face) {
        case "front":
          return "right";
        case "right":
          return "back";
        case "back":
          return "left";
        case "left":
          return "front";
        case "top":
          return "top";
        case "bottom":
          return "bottom";
      }
      break;
    case "z": // 90° rotation around z-axis (F face towards you)
      switch (face) {
        case "top":
          return "right";
        case "right":
          return "bottom";
        case "bottom":
          return "left";
        case "left":
          return "top";
        case "front":
          return "front";
        case "back":
          return "back";
      }
      break;
    case "z'": // -90° rotation around z-axis
      switch (face) {
        case "top":
          return "left";
        case "left":
          return "bottom";
        case "bottom":
          return "right";
        case "right":
          return "top";
        case "front":
          return "front";
        case "back":
          return "back";
      }
      break;
  }
  return face; // fallback
}

/**
 * Check if the cube is already in the desired orientation
 */
export function isAlreadyOriented(
  cubeState: CubeState[][][],
  _cubeRotation?: THREE.Quaternion
): boolean {
  const whiteFace = findWhiteCenterFace(cubeState);
  const greenFace = findGreenCenterFace(cubeState);

  return whiteFace === "top" && greenFace === "front";
}
