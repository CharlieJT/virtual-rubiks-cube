import Cube from "cubejs";

export class CubeJSWrapper {
  private cube: any;

  constructor() {
    this.cube = new Cube();
    this.cube.move("");
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

  getCube() {
    return this.cube;
  }
}
