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
        const tmp: any = new (Cube as any)();
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
    this.cube.move(move);
  }

  applyMoves(moves: string[]) {
    this.cube.move(moves.join(" "));
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
    // Cheap check against canonical solved string; we never apply whole-cube x/y/z to the logical cube
    const solved = CubeJSWrapper.solvedString;
    if (!solved) return false;
    try {
      return this.cube.asString() === solved;
    } catch {
      return false;
    }
  }

  getCube() {
    return this.cube;
  }
}
