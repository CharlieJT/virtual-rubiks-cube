import type { CubeMove, Solution, CubeState } from "../types/cube";

// Rubik's cube colors
export const CUBE_COLORS = {
  WHITE: "#ffffff",
  YELLOW: "#ffff00",
  RED: "#ff0000",
  ORANGE: "#ff6500",
  BLUE: "#0000ff",
  GREEN: "#00ff00",
  BLACK: "#1a1a1a", // Internal faces
};

// Standard cube face configuration
export const FACE_COLORS = {
  F: CUBE_COLORS.RED, // Front
  B: CUBE_COLORS.ORANGE, // Back
  L: CUBE_COLORS.BLUE, // Left
  R: CUBE_COLORS.GREEN, // Right
  U: CUBE_COLORS.WHITE, // Up (Top)
  D: CUBE_COLORS.YELLOW, // Down (Bottom)
};

// Initialize solved cube state
export function createSolvedCube(): CubeState[][][] {
  const cubes: CubeState[][][] = [];

  for (let x = 0; x < 3; x++) {
    cubes[x] = [];
    for (let y = 0; y < 3; y++) {
      cubes[x][y] = [];
      for (let z = 0; z < 3; z++) {
        cubes[x][y][z] = {
          position: { x, y, z },
          rotation: [0, 0, 0],
          colors: {
            front: z === 2 ? FACE_COLORS.F : CUBE_COLORS.BLACK,
            back: z === 0 ? FACE_COLORS.B : CUBE_COLORS.BLACK,
            left: x === 0 ? FACE_COLORS.L : CUBE_COLORS.BLACK,
            right: x === 2 ? FACE_COLORS.R : CUBE_COLORS.BLACK,
            top: y === 2 ? FACE_COLORS.U : CUBE_COLORS.BLACK,
            bottom: y === 0 ? FACE_COLORS.D : CUBE_COLORS.BLACK,
          },
        };
      }
    }
  }

  return cubes;
}

// Generate random scramble
export function generateScramble(length: number = 20): CubeMove[] {
  const moves: CubeMove[] = ["F", "B", "L", "R", "U", "D", "M"];
  const modifiers = ["", "'", "2"];
  const scramble: CubeMove[] = [];

  for (let i = 0; i < length; i++) {
    const move = moves[Math.floor(Math.random() * moves.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push((move + modifier) as CubeMove);
  }

  return scramble;
}

// Basic solver (simplified Kociemba algorithm representation)
export function solveCube(_cubeState: unknown): Solution {
  // This is a simplified solver for demonstration
  // In a real implementation, you'd use the Kociemba algorithm or similar

  const solution: Solution = {
    steps: [
      { move: "F", description: "Rotate front face clockwise" },
      { move: "R", description: "Rotate right face clockwise" },
      { move: "U", description: "Rotate upper face clockwise" },
      { move: "R'", description: "Rotate right face counter-clockwise" },
      { move: "U'", description: "Rotate upper face counter-clockwise" },
      { move: "F'", description: "Rotate front face counter-clockwise" },
    ],
    moveCount: 6,
    algorithm: "F R U R' U' F'",
  };

  return solution;
}

// Helper to deep clone the cube state
function cloneCubeState(cubes: CubeState[][][]): CubeState[][][] {
  return cubes.map((x) =>
    x.map((y) =>
      y.map((cube) => ({
        position: { ...cube.position },
        rotation: [...cube.rotation],
        colors: { ...cube.colors },
      }))
    )
  );
}

// Apply a single move to the cube state (only U, U', U2, L, L', L2, F, F', F2 for demo)
export function applyMove(
  cubes: CubeState[][][],
  move: CubeMove
): CubeState[][][] {
  const newCubes = cloneCubeState(cubes);
  if (move.startsWith("U")) {
    // U = rotate y=2 layer (top) clockwise
    const y = 2;
    let turns = move.endsWith("2") ? 2 : 1;
    if (move.endsWith("'")) turns = 3;
    for (let t = 0; t < turns; t++) {
      const temp = [
        [newCubes[0][y][0], newCubes[1][y][0], newCubes[2][y][0]],
        [newCubes[0][y][1], newCubes[1][y][1], newCubes[2][y][1]],
        [newCubes[0][y][2], newCubes[1][y][2], newCubes[2][y][2]],
      ];
      for (let x = 0; x < 3; x++)
        for (let z = 0; z < 3; z++) {
          newCubes[x][y][z] = temp[2 - z][x];
        }
    }
    return newCubes;
  } else if (move.startsWith("L")) {
    // L = rotate x=0 layer (left) clockwise
    const x = 0;
    let turns = move.endsWith("2") ? 2 : 1;
    if (move.endsWith("'")) turns = 3;
    for (let t = 0; t < turns; t++) {
      const temp = [
        [newCubes[x][0][0], newCubes[x][1][0], newCubes[x][2][0]],
        [newCubes[x][0][1], newCubes[x][1][1], newCubes[x][2][1]],
        [newCubes[x][0][2], newCubes[x][1][2], newCubes[x][2][2]],
      ];
      for (let y = 0; y < 3; y++)
        for (let z = 0; z < 3; z++) {
          newCubes[x][y][z] = temp[2 - z][y];
        }
    }
    return newCubes;
  } else if (move.startsWith("F")) {
    // F = rotate z=2 layer (front) clockwise
    const z = 2;
    let turns = move.endsWith("2") ? 2 : 1;
    if (move.endsWith("'")) turns = 3;
    for (let t = 0; t < turns; t++) {
      const temp = [
        [newCubes[0][0][z], newCubes[1][0][z], newCubes[2][0][z]],
        [newCubes[0][1][z], newCubes[1][1][z], newCubes[2][1][z]],
        [newCubes[0][2][z], newCubes[1][2][z], newCubes[2][2][z]],
      ];
      for (let x = 0; x < 3; x++)
        for (let y = 0; y < 3; y++) {
          newCubes[x][y][z] = temp[2 - y][x];
        }
    }
    return newCubes;
  }
  // (Other moves can be implemented similarly)
  return newCubes;
}

// Apply a sequence of moves
export function applyMoves(
  cubes: CubeState[][][],
  moves: CubeMove[]
): CubeState[][][] {
  let state = cubes;
  for (const move of moves) {
    state = applyMove(state, move);
  }
  return state;
}
