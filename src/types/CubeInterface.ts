export interface CubeInterface {
  reset(): void;
  getState(): string;
  move(move: string): void;
  applyMoves(moves: string[]): void;
  scramble(): void;
  generateScramble(length?: number): string[];
  solve(): string[];
  isSolved(): boolean;
  getCube(): unknown;
}
