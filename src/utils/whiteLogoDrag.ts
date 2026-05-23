import type { CubeState } from "@/types/cube";

const FACE_MOVE_TO_FACE_KEY: Record<string, keyof CubeState["colors"]> = {
  R: "right",
  L: "left",
  U: "top",
  D: "bottom",
  F: "front",
  B: "back",
};

/** Face turn twists the sticker that currently shows the white center. */
export function doesFaceMoveRotateWhiteLogo(
  move: string,
  whiteFace: keyof CubeState["colors"] | null,
): boolean {
  if (!whiteFace) return false;
  const base = move.replace(/['2]/g, "")[0]?.toUpperCase();
  if (!base) return false;
  return FACE_MOVE_TO_FACE_KEY[base] === whiteFace;
}

/** Matches applyMoveToWhiteLogoAngle for face turns on the white-center face. */
export function getFaceTurnLogoDelta(move: string): number {
  const moveStr = move.toUpperCase();
  const isPrime = moveStr.includes("'");
  const isDouble = moveStr.includes("2");
  if (isDouble) return Math.PI;
  if (isPrime) return Math.PI / 2;
  return -Math.PI / 2;
}

export function normalizeLogoAngle(a: number): number {
  const twoPi = Math.PI * 2;
  let n = a % twoPi;
  if (n > Math.PI) n -= twoPi;
  if (n < -Math.PI) n += twoPi;
  return n;
}
