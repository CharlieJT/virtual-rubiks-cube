interface CubieBorderDescriptor {
  // relative position inside cubie local space (x,y,z)
  position: [number, number, number];
  // rotation Euler in radians (x,y,z)
  rotation?: [number, number, number];
  // cylinder length (height) and radius (uniform) plus segments
  cylinder?: { radius: number; length: number; segments?: number };
  // optional color override
  color?: string;
}

const CUBIE_STYLE_MAP: {
  [key: string]: {
    cornerBuilder: string[];
    borderMeshes: CubieBorderDescriptor[];
  };
} = {
  "0,0,0": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "0,0,1": {
    cornerBuilder: [
      "pointed",
      "rounded",
      "rounded",
      "pointed",
      "pointed",
      "rounded",
      "rounded",
      "pointed",
    ],
    borderMeshes: [],
  },
  "0,0,2": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "0,1,0": {
    cornerBuilder: [
      "pointed",
      "rounded",
      "pointed",
      "rounded",
      "rounded",
      "pointed",
      "rounded",
      "pointed",
    ],
    borderMeshes: [],
  },
  "0,1,1": {
    cornerBuilder: [
      "pointed",
      "rounded",
      "pointed",
      "rounded",
      "pointed",
      "rounded",
      "pointed",
      "rounded",
    ],
    borderMeshes: [],
  },
  "0,1,2": {
    cornerBuilder: [
      "rounded",
      "pointed",
      "rounded",
      "pointed",
      "pointed",
      "rounded",
      "pointed",
      "rounded",
    ],
    borderMeshes: [],
  },
  "0,2,0": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "0,2,1": {
    cornerBuilder: [
      "rounded",
      "pointed",
      "pointed",
      "rounded",
      "rounded",
      "pointed",
      "pointed",
      "rounded",
    ],
    borderMeshes: [],
  },
  "0,2,2": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "1,0,0": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "rounded",
      "rounded",
      "rounded",
      "rounded",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "1,0,1": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "rounded",
      "rounded",
      "rounded",
      "rounded",
      "rounded",
      "rounded",
    ],
    borderMeshes: [],
  },
  "1,0,2": {
    cornerBuilder: [
      "rounded",
      "rounded",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "rounded",
      "rounded",
    ],
    borderMeshes: [],
  },
  "1,1,0": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "rounded",
      "rounded",
      "rounded",
      "rounded",
    ],
    borderMeshes: [],
  },
  "1,1,1": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "1,1,2": {
    cornerBuilder: [
      "rounded",
      "rounded",
      "rounded",
      "rounded",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "1,2,0": {
    cornerBuilder: [
      "rounded",
      "rounded",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "rounded",
      "rounded",
    ],
    borderMeshes: [],
  },
  "1,2,1": {
    cornerBuilder: [
      "rounded",
      "rounded",
      "pointed",
      "pointed",
      "rounded",
      "rounded",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "1,2,2": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "rounded",
      "rounded",
      "rounded",
      "rounded",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "2,0,0": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "2,0,1": {
    cornerBuilder: [
      "rounded",
      "pointed",
      "pointed",
      "rounded",
      "rounded",
      "pointed",
      "pointed",
      "rounded",
    ],
    borderMeshes: [],
  },
  "2,0,2": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "2,1,0": {
    cornerBuilder: [
      "rounded",
      "pointed",
      "rounded",
      "pointed",
      "pointed",
      "rounded",
      "pointed",
      "rounded",
    ],
    borderMeshes: [],
  },
  "2,1,1": {
    cornerBuilder: [
      "rounded",
      "pointed",
      "rounded",
      "pointed",
      "rounded",
      "pointed",
      "rounded",
      "pointed",
    ],
    borderMeshes: [],
  },
  "2,1,2": {
    cornerBuilder: [
      "pointed",
      "rounded",
      "pointed",
      "rounded",
      "rounded",
      "pointed",
      "rounded",
      "pointed",
    ],
    borderMeshes: [],
  },
  "2,2,0": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
  "2,2,1": {
    cornerBuilder: [
      "pointed",
      "rounded",
      "rounded",
      "pointed",
      "pointed",
      "rounded",
      "rounded",
      "pointed",
    ],
    borderMeshes: [],
  },
  "2,2,2": {
    cornerBuilder: [
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
      "pointed",
    ],
    borderMeshes: [],
  },
};

export default CUBIE_STYLE_MAP;
