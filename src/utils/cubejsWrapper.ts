import Cube from "cubejs";

export type CubejsMove = string;

export class CubeJSWrapper {
  private cube: any;
  private static solvedString: string | null = null;

  constructor() {
    this.cube = new Cube();
    this.cube.move("");
    if (!CubeJSWrapper.solvedString) {
      try {
        const tmp = new Cube();
        tmp.move("");
        CubeJSWrapper.solvedString = tmp.asString();
      } catch {
        CubeJSWrapper.solvedString = null;
      }
    }
  }

  reset() {
    this.cube = new Cube();
    this.cube.move("");
  }

  getState() {
    return this.cube.asString();
  }

  move(move: string) {
    // For slice moves, apply them as face moves + rotation to maintain white top/green front
    const transformedMove = this.transformSliceMove(move);
    this.cube.move(transformedMove);
  }

  applyMoves(moves: string[]) {
    // Transform each move before applying
    const transformedMoves = moves.map((move) => this.transformSliceMove(move));
    this.cube.move(transformedMoves.join(" "));
  }

  private transformSliceMove(move: string): string {
    // For slice moves, we want to keep the center orientations unchanged
    // We apply the slice move plus a counter-rotation to maintain orientation
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const baseMove = move.replace(/['2]/g, "").toUpperCase();

    switch (baseMove) {
      case "M":
        // M + x counter-rotation maintains orientation
        if (isDouble) return `M2 x2`;
        if (isPrime) return `M' x'`;
        return `M x`;
      case "E":
        // E + y counter-rotation maintains orientation
        if (isDouble) return `E2 y2`;
        if (isPrime) return `E' y'`;
        return `E y`;
      case "S":
        // S + z' counter-rotation maintains orientation
        if (isDouble) return `S2 z2`;
        if (isPrime) return `S' z`;
        return `S z'`;
      default:
        // Not a slice move, return as-is
        return move;
    }
  }

  scramble() {
    this.cube.random();
  }

  generateScramble(length = 20): string[] {
    // Offline scramble generator: avoid consecutive moves on same axis and immediate inverses
    const faces = ["U", "D", "L", "R", "F", "B"] as const;
    const axisOf: Record<string, string> = {
      U: "y",
      D: "y",
      L: "x",
      R: "x",
      F: "z",
      B: "z",
    };
    const modifiers = ["", "'", "2"]; // quarter/prime/double
    const moves: string[] = [];
    let prevAxis: string | null = null;
    let prevFace: string | null = null;
    for (let i = 0; i < length; i++) {
      let face = faces[Math.floor(Math.random() * faces.length)] as string;
      // avoid repeating same axis as previous
      let guard = 0;
      while (
        (prevAxis && axisOf[face] === prevAxis) ||
        (prevFace && face === prevFace)
      ) {
        face = faces[Math.floor(Math.random() * faces.length)] as string;
        if (++guard > 20) break;
      }
      const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      moves.push(face + mod);
      prevAxis = axisOf[face];
      prevFace = face;
    }
    return moves;
  }

  solve(): string[] {
    // Optionally initialize pruning tables if available
    try {
      const anyCube: any = Cube as any;
      if (typeof anyCube.initSolver === "function") {
        // Some versions accept callback or run sync; call and ignore the result
        anyCube.initSolver();
      }
    } catch {}
    try {
      const solStr: string =
        typeof this.cube.solve === "function" ? this.cube.solve() : "";
      return solStr.trim().split(/\s+/).filter(Boolean);
    } catch {
      return [];
    }
  }

  isSolved(): boolean {
    // Orientation-agnostic solved check: each face must be uniform (all 9 stickers equal to the center)
    try {
      const s: string = this.cube.asString();
      if (!s || s.length < 54) return false;
      const blocks: Array<[number, number]> = [
        [0, 8], // U
        [9, 17], // R
        [18, 26], // F
        [27, 35], // D
        [36, 44], // L
        [45, 53], // B
      ];
      for (const [start, end] of blocks) {
        const center = s[start + 4];
        for (let i = start; i <= end; i++) {
          if (s[i] !== center) return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  getCube() {
    return this.cube;
  }
}
