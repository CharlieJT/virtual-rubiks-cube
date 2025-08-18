/**
 * Orientation Tracker for Rubik's Cube
 *
 * This tracks how slice moves affect the logical orientation of the cube,
 * treating slice moves as equivalent whole-cube rotations for auto-orient purposes.
 */

import type { CubeMove } from "../types/cube";

export class OrientationTracker {
  // Track how many quarter-turns the cube has been rotated logically in each axis
  private xRotation: number = 0; // Around x-axis (M slice equivalent)
  private yRotation: number = 0; // Around y-axis (E slice equivalent)
  private zRotation: number = 0; // Around z-axis (S slice equivalent)

  constructor() {
    this.reset();
  }

  reset() {
    this.xRotation = 0;
    this.yRotation = 0;
    this.zRotation = 0;
  }

  /**
   * Apply a move to the orientation tracking
   */
  applyMove(move: CubeMove) {
    const cleanMove = move.replace(/['2]/g, "");
    const baseMove = cleanMove[0].toUpperCase();
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");

    let steps = 1;
    if (isDouble) steps = 2;
    if (isPrime) steps = -steps;

    switch (baseMove) {
      case "M":
        // M slice = logical rotation around x-axis
        this.xRotation = (this.xRotation + steps) % 4;
        if (this.xRotation < 0) this.xRotation += 4;
        break;
      case "E":
        // E slice = logical rotation around y-axis (but opposite direction)
        this.yRotation = (this.yRotation - steps) % 4;
        if (this.yRotation < 0) this.yRotation += 4;
        break;
      case "S":
        // S slice = logical rotation around z-axis (but opposite direction)
        this.zRotation = (this.zRotation - steps) % 4;
        if (this.zRotation < 0) this.zRotation += 4;
        break;
      case "X":
        // Actual whole-cube rotation
        this.xRotation = (this.xRotation + steps) % 4;
        if (this.xRotation < 0) this.xRotation += 4;
        break;
      case "Y":
        // Actual whole-cube rotation
        this.yRotation = (this.yRotation + steps) % 4;
        if (this.yRotation < 0) this.yRotation += 4;
        break;
      case "Z":
        // Actual whole-cube rotation
        this.zRotation = (this.zRotation + steps) % 4;
        if (this.zRotation < 0) this.zRotation += 4;
        break;
      // Face moves (F, B, L, R, U, D) don't affect overall orientation
    }
  }

  /**
   * Get the moves needed to return to standard orientation (white top, green front)
   */
  getOrientationMoves(): CubeMove[] {
    const moves: CubeMove[] = [];

    // Calculate how many moves needed to get back to 0 rotation
    const xNeeded = (4 - this.xRotation) % 4;
    const yNeeded = (4 - this.yRotation) % 4;
    const zNeeded = (4 - this.zRotation) % 4;

    // Add x rotations
    for (let i = 0; i < xNeeded; i++) {
      moves.push("x");
    }

    // Add y rotations
    for (let i = 0; i < yNeeded; i++) {
      moves.push("y");
    }

    // Add z rotations
    for (let i = 0; i < zNeeded; i++) {
      moves.push("z");
    }

    return moves;
  }

  /**
   * Check if the cube is in standard orientation
   */
  isStandardOrientation(): boolean {
    return this.xRotation === 0 && this.yRotation === 0 && this.zRotation === 0;
  }

  /**
   * Get current orientation state for debugging
   */
  getState() {
    return {
      x: this.xRotation,
      y: this.yRotation,
      z: this.zRotation,
    };
  }
}
