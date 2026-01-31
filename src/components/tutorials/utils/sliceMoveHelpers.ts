import type { CubeMove } from "@/types/cube";

/**
 * Detects if a move is a slice move (M, E, S)
 */
export const isSliceMove = (move: CubeMove | null): boolean => {
  if (!move) return false;
  const moveStr = move.toUpperCase();
  const baseMove = moveStr.replace(/['2]/g, "");
  return baseMove === "M" || baseMove === "E" || baseMove === "S";
};

/**
 * Gets the inverse of a slice move
 */
export const getSliceMoveInverse = (move: CubeMove): CubeMove | null => {
  if (!isSliceMove(move)) return null;
  const moveStr = move.toUpperCase();
  if (moveStr.includes("2")) {
    return move;
  } else if (moveStr.includes("'")) {
    return moveStr.replace("'", "") as CubeMove;
  } else {
    return `${moveStr}'` as CubeMove;
  }
};

/**
 * Gets the rotation move that corresponds to a slice move
 */
export const getSliceRotationMove = (move: CubeMove): CubeMove | null => {
  if (!isSliceMove(move)) return null;
  const moveStr = move.toUpperCase();
  const baseMove = moveStr.replace(/['2]/g, "");
  const isPrime = moveStr.includes("'");
  const isDouble = moveStr.includes("2");

  if (baseMove === "M") {
    if (isDouble) return "x2";
    else if (isPrime) return "x'";
    else return "x";
  } else if (baseMove === "E") {
    if (isDouble) return "y2";
    else if (isPrime) return "y'";
    else return "y";
  } else if (baseMove === "S") {
    if (isDouble) return "z2";
    else if (isPrime) return "z";
    else return "z'";
  }

  return null;
};

/**
 * Gets a function that checks if a piece is in a specific slice layer
 */
export const getSliceLayerChecker = (
  move: CubeMove
): ((x: number, y: number, z: number) => boolean) | null => {
  if (!isSliceMove(move)) return null;
  const baseMove = move.toUpperCase().replace(/['2]/g, "");

  switch (baseMove) {
    case "M":
      return (x) => x === 1;
    case "E":
      return (_x, y) => y === 1;
    case "S":
      return (_x, _y, z) => z === 1;
    default:
      return null;
  }
};
