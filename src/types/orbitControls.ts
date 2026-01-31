import { Vector3, Camera } from "three";

type Vec2Setter = { set: (x: number, y: number) => void };
type Vec3Setter = { set: (x: number, y: number, z: number) => void };
type Quaternion = { x: number; y: number; z: number; w: number };
type Vec3Tuple = [number, number, number];

export interface OrbitControlsInstance {
  enabled: boolean;
  noRotate: boolean;
  staticMoving?: boolean;
  dynamicDampingFactor?: number;
  rotateSpeed?: number;
  update?: () => void;
  target: Vector3;
  object: Camera;
  movePrev?: Vec2Setter;
  moveCurr?: Vec2Setter;
  lastAxis?: Vec3Setter;
  lastAngle?: number;
  touchZoomDistanceStart?: number;
  touchZoomDistanceEnd?: number;
  panStart?: Vec2Setter;
  panEnd?: Vec2Setter;
  zoomStart?: Vec2Setter;
  zoomEnd?: Vec2Setter;
  rotateStart?: Vec2Setter;
  rotateEnd?: Vec2Setter;
  lastPosition?: { copy: (pos: Vector3) => void };
  lastQuaternion?: { copy: (quat: Quaternion) => void };
  state?: number;
  __resetOpts?: {
    target?: Vec3Tuple;
    position?: Vec3Tuple;
    extraYawRad?: number;
    flipUpsideDown?: boolean;
    extraERotationDeg?: number;
    extraPitchDeg?: number;
    slideId: string;
  };
}
