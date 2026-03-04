/** Face moves supported by the ghost piece indicator */
const VALID_GHOST_MOVES = [
  "R",
  "R'",
  "R2",
  "F",
  "F'",
  "F2",
  "L",
  "L'",
  "L2",
  "U",
  "U'",
  "U2",
  "D",
  "D'",
  "D2",
  "B",
  "B'",
  "B2",
] as const;

type GhostPieceMove = (typeof VALID_GHOST_MOVES)[number];

const isValidGhostMove = (m: string): m is GhostPieceMove =>
  (VALID_GHOST_MOVES as readonly string[]).includes(m);

/**
 * Determines which move the ghost piece indicator should show
 * based on the current slide, fix sequence state, and double-move direction.
 */
export const getGhostPieceMove = (
  activeSlideId: string | undefined,
  fixSequence: string[],
  fixIndex: number,
  fixDoublePartialDir: 0 | 1 | -1,
): GhostPieceMove => {
  const slideToMove: Record<string, GhostPieceMove> = {
    "notation-clockwise-f": "F",
    "notation-prime-f": "F'",
    "notation-clockwise-r": "R",
    "notation-prime-r": "R'",
    "notation-clockwise-l": "L",
    "notation-prime-l": "L'",
    "notation-clockwise-u": "U",
    "notation-prime-u": "U'",
    "notation-clockwise-d": "D",
    "notation-prime-d": "D'",
    "notation-clockwise-b": "B",
    "notation-prime-b": "B'",
  };

  if (activeSlideId && slideToMove[activeSlideId]) {
    return slideToMove[activeSlideId];
  }

  const doubleMoveMap: Record<string, "F" | "L" | "D"> = {
    "notation-double": "F",
    "notation-double-l": "L",
    "notation-double-d": "D",
  };

  if (activeSlideId && doubleMoveMap[activeSlideId]) {
    const base = doubleMoveMap[activeSlideId];
    if (fixDoublePartialDir === 1) return base;
    if (fixDoublePartialDir === -1) return `${base}'`;
    return `${base}2`;
  }

  if (
    activeSlideId === "notation-sequences" ||
    activeSlideId === "notation-sequences-longer"
  ) {
    const nextMove = fixSequence[fixIndex];
    if (!nextMove) return "F";

    if (nextMove.includes("2") && fixDoublePartialDir !== 0) {
      const baseMove = nextMove.replace("2", "");
      const partial = fixDoublePartialDir === 1 ? baseMove : `${baseMove}'`;
      return isValidGhostMove(partial) ? partial : "F";
    }

    return isValidGhostMove(nextMove) ? nextMove : "F";
  }

  return "F";
};

/**
 * Determines whether a specific cube face should be hidden for the ghost piece effect.
 * A face is hidden when the ghost piece indicator is showing a move on that face.
 */
export const shouldHideFace = (
  face: "right" | "front" | "left" | "back" | "top" | "bottom",
  activeSlideId: string | undefined,
  fixSequence: string[],
  fixIndex: number,
  ghostOpacity: number,
  ghostIsAnimatingMove: boolean,
): boolean => {
  if (ghostOpacity <= 0.9 || !ghostIsAnimatingMove) return false;

  const faceToLetters: Record<string, string[]> = {
    right: ["R", "R'", "R2"],
    front: ["F", "F'", "F2"],
    left: ["L", "L'", "L2"],
    back: ["B", "B'", "B2"],
    top: ["U", "U'", "U2"],
    bottom: ["D", "D'", "D2"],
  };

  const faceToClockwiseSlides: Record<string, string[]> = {
    right: ["notation-clockwise-r", "notation-prime-r"],
    front: ["notation-clockwise-f", "notation-prime-f", "notation-double"],
    left: ["notation-clockwise-l", "notation-prime-l", "notation-double-l"],
    back: ["notation-clockwise-b", "notation-prime-b"],
    top: ["notation-clockwise-u", "notation-prime-u"],
    bottom: ["notation-clockwise-d", "notation-prime-d", "notation-double-d"],
  };

  const slideIds = faceToClockwiseSlides[face] || [];
  if (activeSlideId && slideIds.includes(activeSlideId)) return true;

  if (
    activeSlideId === "notation-sequences" ||
    activeSlideId === "notation-sequences-longer"
  ) {
    const currentMove = fixSequence[fixIndex];
    if (currentMove && faceToLetters[face]?.includes(currentMove)) return true;
  }

  return false;
};

/** Slide IDs that show the ghost piece indicator */
export const GHOST_PIECE_SLIDE_IDS = [
  "notation-clockwise-f",
  "notation-prime-f",
  "notation-clockwise-r",
  "notation-prime-r",
  "notation-clockwise-l",
  "notation-prime-l",
  "notation-clockwise-u",
  "notation-prime-u",
  "notation-clockwise-d",
  "notation-prime-d",
  "notation-clockwise-b",
  "notation-prime-b",
  "notation-double",
  "notation-double-l",
  "notation-double-d",
  "notation-sequences",
  "notation-sequences-longer",
];

/** Slide IDs that show the hint button */
export const HINT_BUTTON_SLIDE_IDS = GHOST_PIECE_SLIDE_IDS;
