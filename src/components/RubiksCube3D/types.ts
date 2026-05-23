import * as THREE from "three";
import type { CubeState, CubeMove, SwipeDirection } from "@/types/cube";
import type { AnimatedCubie } from "@utils/animationHelper";
import type { OrbitControlsInstance } from "@/types/orbitControls";
import type { CubeJSWrapper } from "@/utils/cubejsWrapper";

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
  clickedFace: string;
  moveAxis: string;
  moveDirection: number;
  rotationAxis: THREE.Vector3;
  affectedCubies: AnimatedCubie[];
  dragGroup: THREE.Group | null;
  currentRotation: number;
  lockedMoveType: string;
  lockedIsPrime: boolean;
  hasLockedDirection: boolean;
  _snapCompleted?: boolean;
}

export interface TrackingStateRef {
  isTracking: boolean;
  startPosition: THREE.Vector2;
  currentPosition: THREE.Vector2;
  cubiePosition: [number, number, number];
  clickedFace: string;
  uniquePieceId: string;
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
  isSnapping: boolean;
  snapAnimationStartTime: number;
  snapAnimationDuration: number;
  snapStartRotation: number;
  snapTargetRotation: number;
  finalMove: CubeMove | "";
  _axisLock?: "vertical" | "horizontal";
  _initialDragDirection?: SwipeDirection;
  _allowedMoves?: string[];
  _screenFaceRight?: THREE.Vector2;
  _screenFaceUp?: THREE.Vector2;
  _lockThresholdPx?: number;
  _baseMove?: string;
  _expectedBaseSign?: number;
  _dragSignParity?: number;
  _snapCompleted?: boolean;
  /** Logo texture angle when this drag layer animation started. */
  _logoAngleAtDragStart?: number;
  /** True when this drag twists the face that shows the white-center logo. */
  _dragSyncsLogoTexture?: boolean;
}

// Data structure for centralized animation in parent
export type StickerMaterial =
  | THREE.MeshPhongMaterial
  | THREE.MeshPhysicalMaterial;

export interface PieceMaterialData {
  materials: Record<string, StickerMaterial>;
  baseColors: Record<string, THREE.Color>;
  gridIndex: [number, number, number];
}

export interface CubePieceProps {
  position: [number, number, number];
  colors: CubeState["colors"];
  previousColors?: CubeState["colors"] | null;
  baselineColors?: CubeState["colors"] | null;
  stickerGreyMap?: Map<string, boolean>;
  colorFadeProgress?: number;
  gridIndex?: [number, number, number];
  onPointerDown?: (
    e: React.PointerEvent,
    pos: [number, number, number],
    intersectionPoint: THREE.Vector3
  ) => void;
  onMeshReady?: (mesh: THREE.Mesh, x: number, y: number, z: number) => void;
  onMaterialsReady?: (key: string, data: PieceMaterialData) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  touchCount?: number;
  cornerStyles?: string[];
  children?: React.ReactNode;
  trackingStateRef?: React.RefObject<
    TrackingStateRef & { _pointerId?: number }
  >;
  highlightIntensity?: number;
  isHighlighted?: boolean;
  dullOthersIntensity?: number;
  stickerDoubleSide?: boolean;
  doubleSidedStickerKeysForEdges?: Set<string>;
  cubeOpacity?: number;
  innerStickerOpacity?: number;
  isColorFadeActive?: boolean;
  designVariant?: "legacy" | "modern";
  /** Scramble/solve: allow orbit on cubie press without starting slice drag */
  orbitOnlyOnPointer?: boolean;
}

export interface RubiksCube3DProps {
  cubeState: CubeState[][][];
  previousCube3D?: CubeState[][][] | null;
  baselineCube3D?: CubeState[][][] | null;
  stickerGreyMap?: Map<string, boolean>;
  colorFadeProgress?: number;
  pendingMove?: CubeMove | null;
  onMoveAnimationDone?: (move: CubeMove) => CubeState[][][] | void;
  onStartAnimation?: () => void;
  isAnimating?: boolean;
  onOrbitControlsChange?: (enabled: boolean) => void;
  onDragMove?: (move: string) => void;
  onDragMoveStart?: () => void;
  touchCount?: number;
  isTimerMode?: boolean;
  moveSource?: "queue" | "manual" | "undo" | "redo" | null;
  queueFast?: boolean;
  queueFastMs?: number | null;
  inputDisabled?: boolean;
  disableSliceDrag?: boolean;
  preventSliceMoves?: boolean;
  children?: React.ReactNode;
  highlightPositions?: Array<[number, number, number]>;
  highlightIntensity?: number;
  dullOthersIntensity?: number;
  doubleSidedStickerKeys?: Set<string>;
  doubleSidedStickerKeysForEdges?: Set<string>;
  cubeOpacity?: number;
  innerStickerOpacity?: number;
  pieceChildren?: (
    x: number,
    y: number,
    z: number,
    piece: CubeState
  ) => React.ReactNode;
  hideLogo?: boolean;
  hideRightFace?: boolean;
  hideFrontFace?: boolean;
  hideLeftFace?: boolean;
  hideBackFace?: boolean;
  hideTopFace?: boolean;
  hideBottomFace?: boolean;
  errorFlash?: boolean;
  designVariant?: "legacy" | "modern";
  cubeScale?: number;
}

export type RubiksCube3DHandle = {
  spinAroundViewAxis: (angleRad: number) => void;
  spinAroundYAxis: (angleRad: number) => void;
  abortActiveDrag: () => void;
  isDraggingSlice: () => boolean;
  getCurrentRotation: () => THREE.Quaternion | null;
  celebratorySpin: (onComplete?: () => void) => void;
  resetToInitialPosition: (
    orbitControlsRef?: React.RefObject<OrbitControlsInstance | null>,
    cubeRef?: React.RefObject<CubeJSWrapper | null>,
    onComplete?: () => void,
    instant?: boolean
  ) => void;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerUp: () => void;
  resetLogo: () => void;
  resetCubieMeshTransforms: () => void;
};
