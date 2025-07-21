import type { CubeMove, Solution, CubeState } from "../types/cube";

export const CUBE_COLORS = {
  WHITE: "#ffffff",
  YELLOW: "#ffff00",
  RED: "#ff0000",
  ORANGE: "#ff9600",
  BLUE: "#6279f7",
  GREEN: "#2cdd5a",
  BLACK: "#1a1a1a",
};

export const FACE_COLORS = {
  F: CUBE_COLORS.RED,
  B: CUBE_COLORS.ORANGE,
  L: CUBE_COLORS.BLUE,
  R: CUBE_COLORS.GREEN,
  U: CUBE_COLORS.WHITE,
  D: CUBE_COLORS.YELLOW,
};

export const createSolvedCube = (): CubeState[][][] => {
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
};

export const generateScramble = (length: number = 20): CubeMove[] => {
  const moves: CubeMove[] = ["F", "B", "L", "R", "U", "D", "M"];
  const modifiers = ["", "'", "2"];
  const scramble: CubeMove[] = [];

  for (let i = 0; i < length; i++) {
    const move = moves[Math.floor(Math.random() * moves.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push((move + modifier) as CubeMove);
  }

  return scramble;
};

export const solveCube = (_cubeState: unknown): Solution => {
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
};

const cloneCubeState = (cubes: CubeState[][][]): CubeState[][][] =>
  cubes.map((x) =>
    x.map((y) =>
      y.map((cube) => ({
        position: { ...cube.position },
        rotation: [...cube.rotation],
        colors: { ...cube.colors },
      }))
    )
  );

type Axis = "x" | "y" | "z";

const getLayerSelector = (
  move: CubeMove
): { axis: Axis; index: number } | null => {
  switch (move[0]) {
    case "U":
      return { axis: "y", index: 2 };
    case "D":
      return { axis: "y", index: 0 };
    case "L":
      return { axis: "x", index: 0 };
    case "R":
      return { axis: "x", index: 2 };
    case "F":
      return { axis: "z", index: 2 };
    case "B":
      return { axis: "z", index: 0 };
    default:
      return null;
  }
};

const getTurns = (move: CubeMove): number => {
  if (move.endsWith("2")) return 2;
  if (move.endsWith("'")) return 3;
  return 1;
};

const rotateMatrix = <T>(matrix: T[][], turns: number): T[][] => {
  let result = matrix;
  for (let t = 0; t < turns; t++) {
    result = result[0].map((_, i) => result.map((row) => row[i]).reverse());
  }
  return result;
};

export const applyMove = (
  cubes: CubeState[][][],
  move: CubeMove
): CubeState[][][] => {
  const newCubes = cloneCubeState(cubes);
  const layer = getLayerSelector(move);
  if (!layer) return newCubes;

  const turns = getTurns(move);

  // Extract the 3x3 layer matrix
  let matrix: CubeState[][];
  if (layer.axis === "x") {
    matrix = Array.from({ length: 3 }, (_, y) =>
      Array.from({ length: 3 }, (_, z) => newCubes[layer.index][y][z])
    );
    const rotated = rotateMatrix(matrix, turns);
    for (let y = 0; y < 3; y++)
      for (let z = 0; z < 3; z++) newCubes[layer.index][y][z] = rotated[y][z];
  } else if (layer.axis === "y") {
    matrix = Array.from({ length: 3 }, (_, x) =>
      Array.from({ length: 3 }, (_, z) => newCubes[x][layer.index][z])
    );
    const rotated = rotateMatrix(matrix, turns);
    for (let x = 0; x < 3; x++)
      for (let z = 0; z < 3; z++) newCubes[x][layer.index][z] = rotated[x][z];
  } else if (layer.axis === "z") {
    matrix = Array.from({ length: 3 }, (_, x) =>
      Array.from({ length: 3 }, (_, y) => newCubes[x][y][layer.index])
    );
    const rotated = rotateMatrix(matrix, turns);
    for (let x = 0; x < 3; x++)
      for (let y = 0; y < 3; y++) newCubes[x][y][layer.index] = rotated[x][y];
  }

  return newCubes;
};

export const applyMoves = (
  cubes: CubeState[][][],
  moves: CubeMove[]
): CubeState[][][] => {
  let state = cubes;
  for (const move of moves) {
    state = applyMove(state, move);
  }
  return state;
};
