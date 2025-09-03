import * as THREE from "three";
import type { CubeState, CubeMove, SwipeDirection } from "@/types/cube";
import type { AnimatedCubie } from "@utils/animationHelper";

export type HandlePreciseHoverType = React.BaseSyntheticEvent<
  React.PointerEvent & {
    target: {
      getBoundingClientRect: () => {
        [key: string]: number;
      };
    };
  }
>;

export interface DragState {
  isActive: boolean;
  startPosition: THREE.Vector2;
  currentPosition: THREE.Vector2;
  cubiePosition: [number, number, number];
  clickedFace: string; // The actual face that was clicked (front, back, left, right, top, bottom)
  moveAxis: string; // The axis to rotate (x, y, z)
  moveDirection: number; // 1 or -1 for direction
  rotationAxis: THREE.Vector3;
  affectedCubies: AnimatedCubie[];
  dragGroup: THREE.Group | null;
  currentRotation: number;
  lockedMoveType: string; // The move type that was locked in (F, R, U, etc.)
  lockedIsPrime: boolean; // Whether the locked move is prime or not
  hasLockedDirection: boolean; // Whether direction has been locked
  _snapCompleted?: boolean; // Guard to prevent duplicate snap completion
}

export interface TrackingStateRef {
  isTracking: boolean;
  startPosition: THREE.Vector2;
  currentPosition: THREE.Vector2;
  cubiePosition: [number, number, number];
  clickedFace: string;
  uniquePieceId: string;
  // Drag state
  isDragging: boolean;
  _pointerId?: number;
  lockedMoveType: string;
  lockedDirection: SwipeDirection;
  initialSwipeDirection: SwipeDirection;
  dragGroup: THREE.Group | null;
  affectedCubies: AnimatedCubie[];
  rotationAxis: THREE.Vector3;
  currentRotation: number;
  hasStartedDrag: boolean;
  // Snapping animation state
  isSnapping: boolean;
  snapAnimationStartTime: number;
  snapAnimationDuration: number;
  snapStartRotation: number;
  snapTargetRotation: number;
  finalMove: CubeMove | "";
  _axisLock?: "vertical" | "horizontal";
  _initialDragDirection?: SwipeDirection;
  _allowedMoves?: string[];
  // Face-local axes in screen space, captured at pointer down
  _screenFaceRight?: THREE.Vector2;
  _screenFaceUp?: THREE.Vector2;
  _lockThresholdPx?: number;
  // Canonical base move and expected sign (from AnimationHelper) used to interpret rotation
  _baseMove?: string;
  _expectedBaseSign?: number;
  // Parity to fix sign per face/axis
  _dragSignParity?: number;
  // Guard: ensure snap completion runs once
  _snapCompleted?: boolean;
}

export interface CubePieceProps {
  position: [number, number, number];
  colors: CubeState["colors"];
  gridIndex?: [number, number, number]; // (x,y,z) in 0..2 for outer-face determination
  onPointerDown?: (
    e: any,
    pos: [number, number, number],
    intersectionPoint: THREE.Vector3
  ) => void;
  onMeshReady?: (mesh: THREE.Mesh, x: number, y: number, z: number) => void;
  onPointerMove?: (e: any) => void;
  touchCount?: number;
  cornerStyles?: string[];
  children?: React.ReactNode;
  trackingStateRef?: React.MutableRefObject<
    TrackingStateRef & { _pointerId?: number }
  >;
}

export interface RubiksCube3DProps {
  cubeState: CubeState[][][];
  pendingMove?: CubeMove | null;
  onMoveAnimationDone?: (move: CubeMove) => void;
  onStartAnimation?: () => void;
  isAnimating?: boolean;
  onOrbitControlsChange?: (enabled: boolean) => void;
  onDragMove?: (move: string) => void; // New prop for drag moves
  touchCount?: number; // number of active touches reported by parent App
  isTimerMode?: boolean; // Whether timer mode is active for faster animations
  moveSource?: "queue" | "manual" | "undo" | "redo" | null; // Source of the pending move for animation speed control
  queueFast?: boolean; // When true, make queued moves animate extra fast (for solve-during-transition effect)
  queueFastMs?: number | null; // Optional override for queued move duration in ms (takes precedence over queueFast)
  inputDisabled?: boolean; // When true, block all cube interactions (orbit, spins, drags)
}

export type RubiksCube3DHandle = {
  // Rotate the whole cube around the current camera view axis by angleRad.
  // Positive = CCW as seen by the viewer; negative = CW.
  spinAroundViewAxis: (angleRad: number) => void;
  // Abort any active face/slice drag immediately (used when entering two-finger spin mode)
  abortActiveDrag: () => void;
  // Whether a face/slice drag is currently active
  isDraggingSlice: () => boolean;
  // Get the current rotation quaternion of the cube (for auto-orient functionality)
  getCurrentRotation: () => THREE.Quaternion | null;
  // Dramatic spinning animation for solve completion
  celebratorySpin: (onComplete?: () => void) => void;
  // Smoothly animate the cube back to its initial position
  resetToInitialPosition: (
    orbitControlsRef?: React.RefObject<any>,
    cubeRef?: React.RefObject<any>,
    onComplete?: () => void
  ) => void;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerUp: () => void;
};
