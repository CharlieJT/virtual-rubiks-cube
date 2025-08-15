import {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useState,
  useImperativeHandle,
} from "react";
import React from "react";
import { useThree } from "@react-three/fiber";
import { activeTouches } from "../utils/touchState";
// Removed unused cubeScreenAxes import
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CubeState, CubeMove } from "../types/cube";
import { AnimationHelper, type AnimatedCubie } from "../utils/animationHelper";
import { RoundedBoxGeometry } from "three-stdlib";
import { getWhiteLogoDeltaByBucketDeg } from "../utils/whiteCenterOrientationMap";

// Enable cache so TextureLoader reuses the same image
THREE.Cache.enabled = true;

// Centralized drag sensitivity (radians per pixel)
const DRAG_SENSITIVITY = 0.006;
// Minimum primary-axis projection (px) required to lock a drag and start a twist
const LOCK_PRIMARY_PX = 5;

// Optional per-face orientation deltas when a slice move (M/E/S) does NOT move the white center to a new face.
// Angles are in radians; positive = CCW in that face's UV frame. Adjust as desired.
// The sample below targets the top face to satisfy: M, E, S' => +90; M, E', S => -90; M, E2, S => 180.
// Rationale:
// - Assign S': +90 and S: -90 on top; M/E/E' default to 0; E2: 180 for top.
// - This way those three sequences produce the expected totals while leaving single M/E/S mostly neutral.
const SAME_FACE_DELTA: Partial<
  Record<
    keyof import("../types/cube").CubeState["colors"],
    Partial<Record<string, number>>
  >
> = {
  top: {
    S: -Math.PI / 2,
    "S'": Math.PI / 2,
    S2: Math.PI, // optional; can be set to 0 if undesired
    E2: Math.PI,
    // M/E/E' default to 0 when not specified
  },
  // Other faces default to no-op; add entries here if you want specific slice behavior while staying on the same face.
};

// Extra via-path deltas for transitions where the white center changes faces during a slice move.
// Keyed by from face -> to face -> via move (e.g., "M", "M'", "M2", "S2").
// Example: differentiate top->bottom via M2 vs via S2.
export const VIA_TRANSITION_DELTA: Partial<
  Record<
    keyof import("../types/cube").CubeState["colors"],
    Partial<
      Record<
        keyof import("../types/cube").CubeState["colors"],
        Partial<Record<string, number>>
      >
    >
  >
> = {
  top: {
    bottom: {
      M2: 0, // keep baseline for M2 path
      S2: Math.PI, // make S2 path distinct (180° difference)
    },
  },
  bottom: {
    top: {
      M2: 0,
      S2: Math.PI,
    },
  },
};

// Position-based move mapping - static mapping for each piece position + face + swipe direction
const POSITION_MOVE_MAPPING = {
  // Corner pieces - 8 corners × 3 visible faces each = 24 entries
  corner_RUF_right: { up: "F'", down: "F", left: "U", right: "U'" },
  corner_RUF_top: { up: "R", down: "R'", left: "F'", right: "F" },
  corner_RUF_front: { up: "R", down: "R'", left: "U", right: "U'" },

  corner_LUF_left: { up: "F", down: "F'", left: "U", right: "U'" },
  corner_LUF_top: { up: "L'", down: "L", left: "F'", right: "F" },
  corner_LUF_front: { up: "L'", down: "L", left: "U", right: "U'" },

  corner_RUB_right: { up: "B", down: "B'", left: "U", right: "U'" },
  corner_RUB_top: { up: "R", down: "R'", left: "B", right: "B'" },
  corner_RUB_back: { up: "R'", down: "R", left: "U", right: "U'" },

  corner_LUB_left: { up: "B'", down: "B", left: "U", right: "U'" },
  corner_LUB_top: { up: "L'", down: "L", left: "B", right: "B'" },
  corner_LUB_back: { up: "L", down: "L'", left: "U", right: "U'" },

  corner_RDF_right: { up: "F'", down: "F", left: "D'", right: "D" },
  corner_RDF_bottom: { up: "R", down: "R'", left: "F", right: "F'" },
  corner_RDF_front: { up: "R", down: "R'", left: "D'", right: "D" },

  corner_LDF_left: { up: "F", down: "F'", left: "D'", right: "D" },
  corner_LDF_bottom: { up: "L'", down: "L", left: "F", right: "F'" },
  corner_LDF_front: { up: "L'", down: "L", left: "D'", right: "D" },

  corner_RDB_right: { up: "B", down: "B'", left: "D'", right: "D" },
  corner_RDB_bottom: { up: "R", down: "R'", left: "B'", right: "B" },
  corner_RDB_back: { up: "R'", down: "R", left: "D'", right: "D" },

  corner_LDB_left: { up: "B'", down: "B", left: "D'", right: "D" },
  corner_LDB_bottom: { up: "L'", down: "L", left: "B'", right: "B" },
  corner_LDB_back: { up: "L", down: "L'", left: "D'", right: "D" },

  // Edge pieces - 12 edges × 2 visible faces each = 24 entries
  edge_MUF_top: { up: "M'", down: "M", left: "F'", right: "F" },
  edge_MUF_front: { up: "M'", down: "M", left: "U", right: "U'" },

  edge_MUB_top: { up: "M'", down: "M", left: "B", right: "B'" },
  edge_MUB_back: { up: "M", down: "M'", left: "U", right: "U'" },

  edge_REF_right: { up: "F'", down: "F", left: "E'", right: "E" },
  edge_REF_front: { up: "R", down: "R'", left: "E'", right: "E" },

  edge_REB_right: { up: "B", down: "B'", left: "E'", right: "E" },
  edge_REB_back: { up: "R'", down: "R", left: "E'", right: "E" },

  edge_LEF_left: { up: "F", down: "F'", left: "E'", right: "E" },
  edge_LEF_front: { up: "L'", down: "L", left: "E'", right: "E" },

  edge_LEB_left: { up: "B'", down: "B", left: "E'", right: "E" },
  edge_LEB_back: { up: "L", down: "L'", left: "E'", right: "E" },

  edge_MDF_bottom: { up: "M'", down: "M", left: "F", right: "F'" },
  edge_MDF_front: { up: "M'", down: "M", left: "D'", right: "D" },

  edge_RDS_right: { up: "S'", down: "S", left: "D'", right: "D" },
  edge_RDS_bottom: { up: "R", down: "R'", left: "S", right: "S'" },

  edge_MDB_bottom: { up: "M'", down: "M", left: "B'", right: "B" },
  edge_MDB_back: { up: "M", down: "M'", left: "D'", right: "D" },

  edge_LDS_left: { up: "S", down: "S'", left: "D'", right: "D" },
  edge_LDS_bottom: { up: "L'", down: "L", left: "S", right: "S'" },

  edge_LUS_top: { up: "L'", down: "L", left: "S'", right: "S" },
  edge_LUS_left: { up: "S", down: "S'", left: "U", right: "U'" },

  edge_RUS_top: { up: "R", down: "R'", left: "S'", right: "S" },
  edge_RUS_right: { up: "S'", down: "S", left: "U", right: "U'" },

  // Center pieces - 6 centers × 1 visible face each = 6 entries
  center_R_right: { up: "S'", down: "S", left: "E'", right: "E" },
  center_L_left: { up: "S", down: "S'", left: "E'", right: "E" },
  center_U_top: { up: "M'", down: "M", left: "S'", right: "S" },
  center_D_bottom: { up: "M'", down: "M", left: "S", right: "S'" },
  center_F_front: { up: "M'", down: "M", left: "E'", right: "E" },
  center_B_back: { up: "M", down: "M'", left: "E'", right: "E" },
} as const;

type PositionMoveKey = keyof typeof POSITION_MOVE_MAPPING;
type SwipeDirection = "up" | "down" | "left" | "right";

interface DragState {
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

interface CubePieceProps {
  position: [number, number, number];
  colors: CubeState["colors"];
  onPointerDown?: (
    e: any,
    pos: [number, number, number],
    intersectionPoint: THREE.Vector3
  ) => void;
  onMeshReady?: (mesh: THREE.Mesh, x: number, y: number, z: number) => void;
  onPointerMove?: (e: any) => void;
  touchCount?: number;
}

export interface RubiksCube3DProps {
  cubeState: CubeState[][][];
  pendingMove?: CubeMove | null;
  onMoveAnimationDone?: (move: CubeMove) => void;
  onStartAnimation?: () => void;
  isAnimating?: boolean;
  onOrbitControlsChange?: (enabled: boolean) => void;
  onDragMove?: (move: CubeMove) => void; // New prop for drag moves
  touchCount?: number; // number of active touches reported by parent App
}

export type RubiksCube3DHandle = {
  // Rotate the whole cube around the current camera view axis by angleRad.
  // Positive = CCW as seen by the viewer; negative = CW.
  spinAroundViewAxis: (angleRad: number) => void;
  // Abort any active face/slice drag immediately (used when entering two-finger spin mode)
  abortActiveDrag: () => void;
  // Whether a face/slice drag is currently active
  isDraggingSlice: () => boolean;
};

const CubePiece = React.memo(
  ({
    position,
    colors,
    onPointerDown,
    onMeshReady,
    onPointerMove,
    whiteLogoAngleRad = 0,
    touchCount = 0,
  }: CubePieceProps & { whiteLogoAngleRad?: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
      if (meshRef.current && onMeshReady) {
        const [x, y, z] = position;
        const gridX = Math.round(x / 1.05 + 1);
        const gridY = Math.round(y / 1.05 + 1);
        const gridZ = Math.round(z / 1.05 + 1);

        onMeshReady(meshRef.current, gridX, gridY, gridZ);
      }
    }, [position, onMeshReady]);

    // Load the Tipton's solver texture once
    const tiptonsTexture = useMemo(() => {
      const loader = new THREE.TextureLoader();
      const tex = loader.load("/assets/tiptons-solver.png");
      // Improve sampling and color space
      // @ts-ignore - colorSpace exists on newer three versions
      tex.colorSpace =
        (THREE as any).SRGBColorSpace || (THREE as any).sRGBEncoding;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.center.set(0.5, 0.5); // allow easy rotation tweaks later if needed
      return tex;
    }, []);

    // Helper to normalize and check white color
    const isWhite = (c: string) => {
      if (!c) return false;
      let s = c.toLowerCase();
      if (s[0] === "#" && s.length === 4) {
        s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
      }
      return s === "#ffffff" || s === "white";
    };

    // Determine if this cubie is a center piece (exactly two grid coordinates are the middle index=1)
    const [gx, gy, gz] = useMemo(() => {
      const [x, y, z] = position;
      return [
        Math.round(x / 1.05 + 1),
        Math.round(y / 1.05 + 1),
        Math.round(z / 1.05 + 1),
      ];
    }, [position]);
    const isCenter =
      (gx === 1 ? 1 : 0) + (gy === 1 ? 1 : 0) + (gz === 1 ? 1 : 0) === 2;

    // Keep a stable material set; update the shared logo texture's rotation via effect
    const materials = useMemo(() => {
      // Apply the logo texture only on the white center face
      const rightIsLogo = isCenter && isWhite(colors.right);
      const leftIsLogo = isCenter && isWhite(colors.left);
      const topIsLogo = isCenter && isWhite(colors.top);
      const bottomIsLogo = isCenter && isWhite(colors.bottom);
      const frontIsLogo = isCenter && isWhite(colors.front);
      const backIsLogo = isCenter && isWhite(colors.back);

      // Determine which single face shows the logo for this cubie
      let logoFace: keyof typeof colors | null = null;
      if (rightIsLogo) logoFace = "right";
      else if (leftIsLogo) logoFace = "left";
      else if (topIsLogo) logoFace = "top";
      else if (bottomIsLogo) logoFace = "bottom";
      else if (frontIsLogo) logoFace = "front";
      else if (backIsLogo) logoFace = "back";

      // Use the shared texture instance; we update its rotation in an effect
      const logoTex: THREE.Texture | null = logoFace ? tiptonsTexture : null;

      const mk = (opts: { color: string; useLogo: boolean }) => {
        const hasLogo = opts.useLogo;
        return new THREE.MeshPhongMaterial({
          // When using a texture, avoid tinting: set color to white
          color: hasLogo ? 0xffffff : opts.color,
          map: hasLogo ? logoTex : null,
          // Keep the logo image original by disabling emissive when map is present
          emissive: hasLogo
            ? new THREE.Color(0x000000)
            : new THREE.Color(opts.color).multiplyScalar(0.08),
          specular: hasLogo
            ? new THREE.Color(0x222222)
            : new THREE.Color(0xffffff),
          shininess: hasLogo ? 20 : 60,
        });
      };

      return [
        mk({ color: colors.right, useLogo: logoFace === "right" }),
        mk({ color: colors.left, useLogo: logoFace === "left" }),
        mk({ color: colors.top, useLogo: logoFace === "top" }),
        mk({ color: colors.bottom, useLogo: logoFace === "bottom" }),
        mk({ color: colors.front, useLogo: logoFace === "front" }),
        mk({ color: colors.back, useLogo: logoFace === "back" }),
      ];
    }, [
      colors.right,
      colors.left,
      colors.top,
      colors.bottom,
      colors.front,
      colors.back,
      isCenter,
      tiptonsTexture,
      touchCount,
    ]);

    // Update the rotation of the shared logo texture without recreating materials
    useEffect(() => {
      if (!tiptonsTexture) return;
      tiptonsTexture.rotation = whiteLogoAngleRad;
      tiptonsTexture.needsUpdate = true;
    }, [whiteLogoAngleRad, tiptonsTexture]);

    const EDGE_GEOMETRIES = [
      ...[0.5, -0.5].flatMap((y) =>
        [0.5, -0.5].map((z) => ({
          pos: [0, y, z],
          args: [1.08, 0.094, 0.094],
        }))
      ),
      ...[0.5, -0.5].flatMap((y) =>
        [0.5, -0.5].map((x) => ({
          pos: [x, y, 0],
          args: [0.094, 0.094, 1.08],
        }))
      ),
      ...[0.5, -0.5].flatMap((x) =>
        [0.5, -0.5].map((z) => ({
          pos: [x, 0, z],
          args: [0.094, 1.08, 0.094],
        }))
      ),
    ];

    return (
      <mesh
        ref={meshRef}
        position={position}
        material={materials}
        onPointerDown={(e) => {
          // Only intercept primary button without precision modifier.
          // Allow right/middle click or Shift+click to pass through for OrbitControls.
          const isPrimary = (e.button ?? 0) === 0;
          const shiftHeld = !!e.shiftKey;
          // Prevent a secondary touch/pointer from starting a drag while another pointer is active.
          // If touches are active, ignore extra pointers (two-finger gestures handled elsewhere).
          if (isPrimary && !shiftHeld) {
            // For touch devices, ensure only the first active pointer initiates interaction.
            // Use pointerType if available to detect touch vs mouse.
            const pointerType =
              (e.nativeEvent && (e.nativeEvent as any).pointerType) || null;
            if (pointerType === "touch") {
              // If parent reports more than one active touch, don't start a cubie drag here.
              if ((touchCount || 0) > 1) return;
              // Also consult the shared synchronous state in case the second finger is placed off-canvas
              if (activeTouches.count > 1) return;
              // As a final defensive check, fallback to native TouchList if available
              const touches = (e.nativeEvent &&
                (e.nativeEvent as any).touches) as TouchList | undefined;
              if (touches && touches.length > 1) return;
            }
            e.stopPropagation();
            const intersectionPoint = e.point || new THREE.Vector3();
            onPointerDown?.(e, position, intersectionPoint);
          }
        }}
        onPointerMove={(e) => {
          // Only stop propagation if we previously started a primary-button drag without Shift.
          const isPrimary = (e.button ?? 0) === 0;
          const shiftHeld = !!e.shiftKey;
          if (isPrimary && !shiftHeld) {
            e.stopPropagation();
            onPointerMove?.(e);
          }
        }}
        onPointerUp={(e) => {
          const isPrimary = (e.button ?? 0) === 0;
          const shiftHeld = !!e.shiftKey;
          if (isPrimary && !shiftHeld) {
            e.stopPropagation();
          }
        }}
      >
        {/* Use RoundedBoxGeometry for rounded corners */}
        <primitive object={new RoundedBoxGeometry(1.11, 1.11, 1.11, 4, 0.13)} />

        {EDGE_GEOMETRIES.map((edge, i) => (
          <mesh key={i} position={edge.pos as [number, number, number]}>
            <boxGeometry args={edge.args as [number, number, number]} />
            <meshPhongMaterial
              color="#111111"
              emissive="#111111"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
      </mesh>
    );
  }
);

const RubiksCube3D = React.forwardRef<RubiksCube3DHandle, RubiksCube3DProps>(
  (
    {
      cubeState,
      pendingMove,
      onMoveAnimationDone,
      onStartAnimation,
      isAnimating,
      onOrbitControlsChange,
      touchCount = 0,
    }: RubiksCube3DProps,
    ref
  ) => {
    const groupRef = useRef<THREE.Group>(null);
    const cubiesRef = useRef<AnimatedCubie[]>([]);
    const currentTweenRef = useRef<any>(null);
    const meshesReadyRef = useRef(false);
    const lastHoveredPieceRef = useRef<string | null>(null);
    const dragStateRef = useRef<DragState>({
      isActive: false,
      startPosition: new THREE.Vector2(),
      currentPosition: new THREE.Vector2(),
      cubiePosition: [0, 0, 0],
      clickedFace: "",
      moveAxis: "",
      moveDirection: 1,
      rotationAxis: new THREE.Vector3(),
      affectedCubies: [],
      dragGroup: null,
      currentRotation: 0,
      lockedMoveType: "",
      lockedIsPrime: false,
      hasLockedDirection: false,
    });

    // Track white logo rotation (in radians). Positive values rotate CCW in texture space.
    const [whiteLogoAngle, setWhiteLogoAngle] = useState<number>(0);
    const lastAppliedMoveRef = useRef<{ move: string; t: number } | null>(null);
    // Track the white center's logo orientation as a quaternion in cube-local space
    const whiteQuatRef = useRef<THREE.Quaternion>(new THREE.Quaternion());
    // Track the previous face holding the white center (pre-move)
    const prevWhiteFaceRef = useRef<keyof CubeState["colors"] | null>(null);
    // Keep a ref of the last displayed angle to accumulate face-turn deltas without projection jump
    const displayedAngleRef = useRef<number>(0);

    // Helper to normalize and check white color (duplicate of child helper, kept here for state derivation)
    const isWhiteColor = useCallback((c: string) => {
      if (!c) return false;
      let s = c.toLowerCase();
      if (s[0] === "#" && s.length === 4) {
        s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
      }
      return s === "#ffffff" || s === "white";
    }, []);

    // Determine which face currently has the white center
    const getWhiteCenterFaceFromState = useCallback(():
      | keyof CubeState["colors"]
      | null => {
      // Indices: 0..2. Visible faces for centers: right(2,1,1), left(0,1,1), top(1,2,1), bottom(1,0,1), front(1,1,2), back(1,1,0)
      const candidates: Array<{
        idx: [number, number, number];
        face: keyof CubeState["colors"];
      }> = [
        { idx: [2, 1, 1], face: "right" },
        { idx: [0, 1, 1], face: "left" },
        { idx: [1, 2, 1], face: "top" },
        { idx: [1, 0, 1], face: "bottom" },
        { idx: [1, 1, 2], face: "front" },
        { idx: [1, 1, 0], face: "back" },
      ];
      for (const c of candidates) {
        const cubie = cubeState[c.idx[0]]?.[c.idx[1]]?.[c.idx[2]];
        if (cubie && isWhiteColor(cubie.colors[c.face])) return c.face;
      }
      return null;
    }, [cubeState, isWhiteColor]);

    // (removed unused moveToFaceKey)

    // (removed old whiteFaceToCoords helper; no longer needed with rule-based rotation)

    // Canonical face basis used to compute in-plane texture angle (must match UV orientation)
    const getLogoFaceBasis = (
      face: keyof CubeState["colors"]
    ): { normal: THREE.Vector3; up: THREE.Vector3; right: THREE.Vector3 } => {
      const normal =
        face === "front"
          ? new THREE.Vector3(0, 0, 1)
          : face === "back"
          ? new THREE.Vector3(0, 0, -1)
          : face === "right"
          ? new THREE.Vector3(1, 0, 0)
          : face === "left"
          ? new THREE.Vector3(-1, 0, 0)
          : face === "top"
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(0, -1, 0);

      let up: THREE.Vector3;
      let right: THREE.Vector3;
      switch (face) {
        case "front":
          up = new THREE.Vector3(0, 1, 0);
          right = new THREE.Vector3(-1, 0, 0);
          break;
        case "back":
          up = new THREE.Vector3(0, 1, 0);
          right = new THREE.Vector3(1, 0, 0);
          break;
        case "right":
          up = new THREE.Vector3(0, 1, 0);
          right = new THREE.Vector3(0, 0, 1);
          break;
        case "left":
          up = new THREE.Vector3(0, 1, 0);
          right = new THREE.Vector3(0, 0, -1);
          break;
        case "top":
          up = new THREE.Vector3(0, 0, 1);
          right = new THREE.Vector3(1, 0, 0);
          break;
        case "bottom":
          up = new THREE.Vector3(0, 0, -1);
          right = new THREE.Vector3(1, 0, 0);
          break;
      }
      return { normal, up, right };
    };

    // Helper: pick the nearest canonical face for a given direction vector
    const getNearestFaceFromVector = (
      v: THREE.Vector3
    ): keyof CubeState["colors"] => {
      const faces: Array<keyof CubeState["colors"]> = [
        "front",
        "back",
        "right",
        "left",
        "top",
        "bottom",
      ];
      let bestFace: keyof CubeState["colors"] = "front";
      let bestDot = -Infinity;
      for (const f of faces) {
        const n = getLogoFaceBasis(f).normal;
        const d = v.dot(n);
        if (d > bestDot) {
          bestDot = d;
          bestFace = f;
        }
      }
      return bestFace;
    };

    // Discrete transfer of 0/90/180/270 angle buckets from one face frame to another.
    // prevAngleRad must be a multiple of 90 degrees.
    const transferAngleBetweenFaces = (
      from: keyof CubeState["colors"],
      to: keyof CubeState["colors"],
      prevAngleRad: number
    ): number => {
      // Map prevAngle bucket to a direction vector v expressed in cube local axes
      const { up: upF, right: rightF } = getLogoFaceBasis(from);
      const quarter = Math.PI / 2;
      const k = Math.round(prevAngleRad / quarter) % 4; // -2..2 -> clamp to 0..3
      const kk = ((k % 4) + 4) % 4;
      let v = new THREE.Vector3();
      switch (kk) {
        case 0: // 0° => up
          v = upF.clone();
          break;
        case 1: // +90° (CCW) => left = -right
          v = rightF.clone().multiplyScalar(-1);
          break;
        case 2: // 180° => -up
          v = upF.clone().multiplyScalar(-1);
          break;
        case 3: // 270° => right
          v = rightF.clone();
          break;
      }
      // Determine which of to-face's cardinal directions best matches v
      const { up: upT, right: rightT } = getLogoFaceBasis(to);
      const candidates = [
        { angle: 0, dir: upT.clone() },
        { angle: quarter, dir: rightT.clone().multiplyScalar(-1) }, // left
        { angle: Math.PI, dir: upT.clone().multiplyScalar(-1) },
        { angle: -quarter, dir: rightT.clone() }, // 270° == -90°
      ];
      let best = candidates[0].angle;
      let bestDot = -Infinity;
      for (const c of candidates) {
        const d = v.dot(c.dir);
        if (d > bestDot) {
          bestDot = d;
          best = c.angle;
        }
      }
      // Normalize to [-π, π]
      const twoPi = Math.PI * 2;
      let n = best % twoPi;
      if (n > Math.PI) n -= twoPi;
      if (n < -Math.PI) n += twoPi;
      return n;
    };

    // Initialize prev face and quaternion once
    useEffect(() => {
      if (prevWhiteFaceRef.current == null) {
        const face = getWhiteCenterFaceFromState();
        if (face) {
          prevWhiteFaceRef.current = face;
          whiteQuatRef.current.identity();
          setWhiteLogoAngle(0);
          displayedAngleRef.current = 0;
        }
      }
    }, [getWhiteCenterFaceFromState]);

    // Update white logo angle based on a completed move (quaternion-based, consistent with animation)
    const applyMoveToWhiteLogoAngle = useCallback(
      (move: CubeMove) => {
        const moveStr = (move as string).toUpperCase();
        const now = Date.now();
        // Guard: avoid double-apply if the exact same move fires twice within 200ms
        if (
          lastAppliedMoveRef.current &&
          lastAppliedMoveRef.current.move === moveStr &&
          now - lastAppliedMoveRef.current.t < 200
        ) {
          return;
        }
        lastAppliedMoveRef.current = { move: moveStr, t: now };
        // Determine rotation according to explicit rule:
        // - If rotating the current white face (U/D/L/R/F/B), rotate the logo 90° CW for non-prime, CCW for prime, 180° for "2".
        // - For slice moves (M/E/S), preserve orientation (no rotation), just re-project after the move.
        // - Whole-cube rotations (X/Y/Z) rotate orientation normally.
        // Use the current white face from state (post-logical-move) to avoid race conditions
        const currentWhiteFace = getWhiteCenterFaceFromState();
        const base = moveStr[0];
        const isWhole = base === "X" || base === "Y" || base === "Z";
        const isSliceMove = base === "M" || base === "E" || base === "S";

        // Map base face letter to face key used in state/colors
        const baseToFaceKey: Record<string, keyof CubeState["colors"]> = {
          R: "right",
          L: "left",
          U: "top",
          D: "bottom",
          F: "front",
          B: "back",
        } as const;

        if (isWhole) {
          const [axis, totalRotation] = AnimationHelper.getMoveAxisAndDir(
            moveStr as CubeMove
          );
          const q = new THREE.Quaternion().setFromAxisAngle(
            axis,
            totalRotation
          );
          whiteQuatRef.current.multiply(q);
        } else if (currentWhiteFace && baseToFaceKey[base]) {
          // End-of-move update: if we rotated the face that currently holds the white center,
          // apply a discrete 90°/180° texture rotation to match the physical twist.
          const rotatingFace = baseToFaceKey[base];
          const isPrime = moveStr.includes("'");
          const isDouble = moveStr.includes("2");
          if (rotatingFace === currentWhiteFace) {
            const delta = isDouble
              ? Math.PI
              : isPrime
              ? Math.PI / 2
              : -Math.PI / 2;
            const faceNormal = getLogoFaceBasis(currentWhiteFace).normal;
            const q = new THREE.Quaternion().setFromAxisAngle(
              faceNormal,
              delta
            );
            whiteQuatRef.current.multiply(q);
            const twoPi = Math.PI * 2;
            const normalizeAngle = (a: number) => {
              let n = a % twoPi;
              if (n > Math.PI) n -= twoPi;
              if (n < -Math.PI) n += twoPi;
              return n;
            };
            setWhiteLogoAngle((prev) => {
              const next = normalizeAngle((prev || 0) + delta);
              displayedAngleRef.current = next;
              return next;
            });
            if (currentWhiteFace) prevWhiteFaceRef.current = currentWhiteFace;
            return; // handled; skip projection below
          }
          // If rotating some other face (not the white center's), leave the logo angle unchanged here.
          return;
        }

        // Slice moves: don't rotate orientation here; we'll transfer angle discretely and align quaternion below.

        // Compute angle relative to current (post-move) white face
        const whiteFaceAfter = getWhiteCenterFaceFromState();
        if (whiteFaceAfter || (isSliceMove && prevWhiteFaceRef.current)) {
          const quarter = Math.PI / 2;
          // Resolve the target face for mapping:
          // - Prefer computed face for slices (rotate previous face normal by move axis)
          // - Otherwise, use state-derived face
          let resolvedAfter: keyof CubeState["colors"] | null = whiteFaceAfter;
          if (isSliceMove && prevWhiteFaceRef.current) {
            const [axis, totalRotation] = AnimationHelper.getMoveAxisAndDir(
              moveStr as CubeMove
            );
            const q = new THREE.Quaternion().setFromAxisAngle(
              axis,
              totalRotation
            );
            const prevN = getLogoFaceBasis(prevWhiteFaceRef.current).normal;
            const rotatedN = prevN.clone().applyQuaternion(q).normalize();
            resolvedAfter = getNearestFaceFromVector(rotatedN);
          }
          if (!resolvedAfter) return;

          const {
            normal: faceN,
            up: faceUp,
            right: faceRight,
          } = getLogoFaceBasis(resolvedAfter);
          let thetaDesired: number | null = null;
          if (isSliceMove && prevWhiteFaceRef.current) {
            // Discrete transfer for slices to avoid unwanted flips
            thetaDesired = transferAngleBetweenFaces(
              prevWhiteFaceRef.current,
              resolvedAfter,
              displayedAngleRef.current || 0
            );
            // Apply user-refinable mapping delta on top using the PRE-MOVE bucket on the FROM face
            {
              const quarter = Math.PI / 2;
              const k = Math.round((displayedAngleRef.current || 0) / quarter);
              const bucketDeg = ((((k % 4) + 4) % 4) * 90) as
                | 0
                | 90
                | 180
                | 270;
              thetaDesired += getWhiteLogoDeltaByBucketDeg(
                prevWhiteFaceRef.current,
                resolvedAfter,
                bucketDeg
              );
            }
            // If the white center stayed on the same face, apply any configured SAME_FACE_DELTA for this move.
            const stayedOnSameFace = prevWhiteFaceRef.current === resolvedAfter;
            if (stayedOnSameFace) {
              const faceRules = SAME_FACE_DELTA[resolvedAfter];
              const moveKey = moveStr.includes("2")
                ? `${base}2`
                : moveStr.includes("'")
                ? `${base}'`
                : base;
              const extra = faceRules?.[moveKey] || 0;
              if (extra) {
                thetaDesired = ((thetaDesired || 0) + extra) as number;
              }
            } else {
              // If face changed, consider VIA_TRANSITION_DELTA overrides
              const from = prevWhiteFaceRef.current;
              const to = resolvedAfter;
              const viaKey = moveStr.includes("2")
                ? `${base}2`
                : moveStr.includes("'")
                ? `${base}'`
                : base;
              const viaExtra = VIA_TRANSITION_DELTA[from]?.[to]?.[viaKey] || 0;
              if (viaExtra) {
                thetaDesired = ((thetaDesired || 0) + viaExtra) as number;
              }
            }
            // Compute current projected angle and align quaternion to desired bucket
            const logoUp0 = faceUp.clone();
            const logoUpNow = logoUp0
              .applyQuaternion(whiteQuatRef.current)
              .normalize();
            const upProj = logoUpNow
              .clone()
              .sub(faceN.clone().multiplyScalar(logoUpNow.dot(faceN)))
              .normalize();
            const x = upProj.dot(faceRight);
            const y = upProj.dot(faceUp);
            let thetaProj = Math.atan2(x, y);
            thetaProj = Math.round(thetaProj / quarter) * quarter; // snap to 90°
            // Smallest correction around face normal to realize thetaDesired
            const twoPi = Math.PI * 2;
            const normalize = (a: number) => {
              let m = a % twoPi;
              if (m > Math.PI) m -= twoPi;
              if (m < -Math.PI) m += twoPi;
              return m;
            };
            const delta = normalize(thetaDesired - thetaProj);
            if (Math.abs(delta) > 1e-6) {
              const qFix = new THREE.Quaternion().setFromAxisAngle(
                faceN,
                delta
              );
              whiteQuatRef.current.multiply(qFix);
            }
          }

          // Final angle to display: desired (for slice) or projected from quaternion
          let theta: number;
          if (thetaDesired != null) {
            theta = thetaDesired;
          } else {
            const logoUp0 = faceUp.clone();
            const logoUpNow = logoUp0
              .applyQuaternion(whiteQuatRef.current)
              .normalize();
            const upProj = logoUpNow
              .clone()
              .sub(faceN.clone().multiplyScalar(logoUpNow.dot(faceN)))
              .normalize();
            const x = upProj.dot(faceRight);
            const y = upProj.dot(faceUp);
            theta = Math.atan2(x, y);
            theta = Math.round(theta / quarter) * quarter; // snap to 90°
          }
          const twoPi = Math.PI * 2;
          let n = theta % twoPi;
          if (n > Math.PI) n -= twoPi;
          if (n < -Math.PI) n += twoPi;
          setWhiteLogoAngle(n);
          displayedAngleRef.current = n;
          prevWhiteFaceRef.current = resolvedAfter;
        }
      },
      [getWhiteCenterFaceFromState]
    );

    // Pending move animation effect (robust start even if set while locked)
    useEffect(() => {
      if (!pendingMove) return;
      if (!groupRef.current) return;
      if (cubiesRef.current.length !== 27 || !meshesReadyRef.current) return;

      let cancelled = false;
      const tryStart = () => {
        if (cancelled) return;
        if (AnimationHelper.isLocked()) {
          // Defer until unlock, then retry
          setTimeout(tryStart, 0);
          return;
        }
        onStartAnimation && onStartAnimation();
        currentTweenRef.current = AnimationHelper.animate(
          cubiesRef.current,
          groupRef.current!,
          pendingMove,
          () => {
            if (cancelled) return;
            onMoveAnimationDone && onMoveAnimationDone(pendingMove);
            // Update the logo angle exactly after the geometry completes to avoid flicker
            // Use rAF to occur after React state updates have applied colors
            requestAnimationFrame(() => applyMoveToWhiteLogoAngle(pendingMove));
            currentTweenRef.current = null;
          }
        );
      };
      tryStart();

      return () => {
        cancelled = true;
      };
    }, [
      pendingMove,
      onStartAnimation,
      onMoveAnimationDone,
      isAnimating,
      applyMoveToWhiteLogoAngle,
    ]);

    const { camera, gl } = useThree();

    // Expose a minimal imperative handle for external orientation refinement
    useImperativeHandle(
      ref,
      () => ({
        spinAroundViewAxis: (angleRad: number) => {
          if (!groupRef.current) return;
          // Don't interfere with active slice drags or snapping animations
          if (
            trackingStateRef.current.isDragging ||
            trackingStateRef.current.isSnapping
          )
            return;
          if (AnimationHelper.isLocked()) return;
          // World-space axis along camera's forward direction (viewer -> scene)
          const axisWorld = camera
            .getWorldDirection(new THREE.Vector3())
            .normalize();
          const q = new THREE.Quaternion().setFromAxisAngle(
            axisWorld,
            angleRad
          );
          // Apply as a world rotation so it truly spins around the view axis
          groupRef.current.quaternion.premultiply(q);
          groupRef.current.updateMatrixWorld(true);
        },
        abortActiveDrag: () => {
          // Remove drag listeners first
          window.removeEventListener("pointermove", handlePointerMove);
          window.removeEventListener("pointerup", handlePointerUp);
          // If dragging, snap back to 0 without issuing a move
          if (
            trackingStateRef.current.isDragging ||
            trackingStateRef.current.dragGroup
          ) {
            const current = trackingStateRef.current.currentRotation || 0;
            trackingStateRef.current.isDragging = false;
            trackingStateRef.current.isSnapping = true;
            trackingStateRef.current.snapAnimationStartTime = Date.now();
            trackingStateRef.current.snapAnimationDuration = 120;
            trackingStateRef.current.snapStartRotation = current;
            trackingStateRef.current.snapTargetRotation = 0;
            trackingStateRef.current.finalMove = "" as any;
          } else {
            // Nothing to snap; ensure state is clean and orbits enabled
            cleanupDragState();
            trackingStateRef.current.isTracking = false;
          }
        },
        isDraggingSlice: () => {
          return !!trackingStateRef.current.isDragging;
        },
      }),
      [camera]
    );

    // Build a face-local basis (right/up) in cube local space
    const getFaceBasisLocal = useCallback((face: string) => {
      const normal =
        face === "front"
          ? new THREE.Vector3(0, 0, 1)
          : face === "back"
          ? new THREE.Vector3(0, 0, -1)
          : face === "right"
          ? new THREE.Vector3(1, 0, 0)
          : face === "left"
          ? new THREE.Vector3(-1, 0, 0)
          : face === "top"
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(0, -1, 0);

      const globalUp = new THREE.Vector3(0, 1, 0);
      let right = new THREE.Vector3().crossVectors(globalUp, normal);
      if (right.lengthSq() < 1e-6) {
        // normal nearly collinear with up, use forward as fallback
        const forward = new THREE.Vector3(0, 0, 1);
        right = new THREE.Vector3().crossVectors(forward, normal);
      }
      right.normalize();
      const up = new THREE.Vector3().crossVectors(normal, right).normalize();
      return { normal, right, up };
    }, []);

    // Project a local-space direction to a 2D screen-space vector
    const projectLocalDirToScreen = useCallback(
      (dirLocal: THREE.Vector3) => {
        if (!groupRef.current) return new THREE.Vector2(0, 0);
        const originWorld = groupRef.current.getWorldPosition(
          new THREE.Vector3()
        );
        const dirWorld = dirLocal
          .clone()
          .applyQuaternion(groupRef.current.quaternion);
        const endWorld = originWorld.clone().add(dirWorld);
        const originNdc = originWorld.clone().project(camera);
        const endNdc = endWorld.clone().project(camera);
        const ndcDelta = new THREE.Vector2(
          endNdc.x - originNdc.x,
          endNdc.y - originNdc.y
        );
        // Convert NDC to pixel space and invert Y to match browser coordinates
        const rect = gl.domElement.getBoundingClientRect();
        return new THREE.Vector2(
          ndcDelta.x * (rect.width / 2),
          -ndcDelta.y * (rect.height / 2)
        );
      },
      [camera, gl]
    );

    useFrame(() => {
      AnimationHelper.update();

      // Update drag rotation if active
      if (
        trackingStateRef.current.isDragging &&
        trackingStateRef.current.dragGroup
      ) {
        const dragState = trackingStateRef.current;
        const rotation = dragState.currentRotation;

        // Apply rotation to the drag group
        if (dragState.dragGroup) {
          dragState.dragGroup.setRotationFromAxisAngle(
            dragState.rotationAxis,
            rotation
          );
        }
      }

      // Update snapping animation if active
      if (
        trackingStateRef.current.isSnapping &&
        trackingStateRef.current.dragGroup
      ) {
        const dragState = trackingStateRef.current;
        const elapsed = Date.now() - dragState.snapAnimationStartTime;
        const progress = Math.min(elapsed / dragState.snapAnimationDuration, 1);

        // Quadratic easing out for smooth feel
        const easedProgress = 1 - Math.pow(1 - progress, 2);

        // Calculate current rotation based on progress
        const currentRotation =
          dragState.snapStartRotation +
          (dragState.snapTargetRotation - dragState.snapStartRotation) *
            easedProgress;

        // Update the current rotation
        dragState.currentRotation = currentRotation;

        // Apply rotation to the drag group
        if (dragState.dragGroup) {
          dragState.dragGroup.setRotationFromAxisAngle(
            dragState.rotationAxis,
            currentRotation
          );
        }

        // Animation complete - execute the final move
        if (progress >= 1) {
          if (dragState.finalMove && onMoveAnimationDone) {
            // Store the move to be executed
            const moveToExecute = dragState.finalMove as CubeMove;

            // First call onMoveAnimationDone to update the logical cube state (colors)
            onMoveAnimationDone(moveToExecute);

            // Then clean up visual state and finally apply the logo rotation to avoid overlap
            setTimeout(() => {
              cleanupDragState();
              applyMoveToWhiteLogoAngle(moveToExecute);
              // Reset snapping state
              trackingStateRef.current.isSnapping = false;
            }, 0);
          } else {
            // No final move, just cleanup
            cleanupDragState();
            // Reset snapping state
            trackingStateRef.current.isSnapping = false;
          }
        }
      }
    });

    // All your sophisticated drag and hover logic goes here...
    const handlePreciseHover = useCallback(
      (e: any) => {
        if (!groupRef.current || dragStateRef.current.isActive) return;

        const mouse = new THREE.Vector2();
        const rect = e.nativeEvent.target.getBoundingClientRect();
        mouse.x = ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        const camera = new THREE.PerspectiveCamera();
        raycaster.setFromCamera(mouse, camera);

        const allMeshes: THREE.Mesh[] = [];
        groupRef.current.traverse((child) => {
          if (
            child instanceof THREE.Mesh &&
            child.parent === groupRef.current
          ) {
            allMeshes.push(child);
          }
        });

        const intersects = raycaster.intersectObjects(allMeshes);
        if (intersects.length === 0) {
          lastHoveredPieceRef.current = null;
          return;
        }

        const intersectedMesh = intersects[0].object as THREE.Mesh;
        const intersectionPoint = intersects[0].point;

        // Find the corresponding cubie
        const cubie = cubiesRef.current.find((c) => c.mesh === intersectedMesh);
        if (!cubie) return;

        const cubieCenter = new THREE.Vector3(
          (cubie.x - 1) * 1.05,
          (cubie.y - 1) * 1.05,
          (cubie.z - 1) * 1.05
        );

        const halfSize = 0.475;
        const relative = intersectionPoint.clone().sub(cubieCenter);
        const withinBounds =
          Math.abs(relative.x) <= halfSize &&
          Math.abs(relative.y) <= halfSize &&
          Math.abs(relative.z) <= halfSize;

        if (!withinBounds) return;

        const absX = Math.abs(relative.x);
        const absY = Math.abs(relative.y);
        const absZ = Math.abs(relative.z);
        const faceThreshold = 0.4;

        let faceName = "";
        if (absX > faceThreshold && absX >= absY && absX >= absZ) {
          faceName = relative.x > 0 ? "right" : "left";
        } else if (absY > faceThreshold && absY >= absX && absY >= absZ) {
          faceName = relative.y > 0 ? "top" : "bottom";
        } else if (absZ > faceThreshold && absZ >= absX && absZ >= absY) {
          faceName = relative.z > 0 ? "front" : "back";
        }

        if (!faceName) return;

        const gridPos: [number, number, number] = [
          cubie.x - 1,
          cubie.y - 1,
          cubie.z - 1,
        ];

        const isOuterFace =
          (faceName === "right" && gridPos[0] === 1) ||
          (faceName === "left" && gridPos[0] === -1) ||
          (faceName === "top" && gridPos[1] === 1) ||
          (faceName === "bottom" && gridPos[1] === -1) ||
          (faceName === "front" && gridPos[2] === 1) ||
          (faceName === "back" && gridPos[2] === -1);

        if (!isOuterFace) return;

        const cubieState = cubeState[cubie.x]?.[cubie.y]?.[cubie.z];
        if (!cubieState) return;

        const faceColors = {
          right: cubieState.colors.right,
          left: cubieState.colors.left,
          top: cubieState.colors.top,
          bottom: cubieState.colors.bottom,
          front: cubieState.colors.front,
          back: cubieState.colors.back,
        };
        const faceColor = faceColors[faceName as keyof typeof faceColors];

        if (faceColor === "#808080" || faceColor === "#1a1a1a") return;

        const pieceId = `${gridPos[0]},${gridPos[1]},${gridPos[2]}|${faceName}`;

        if (lastHoveredPieceRef.current === pieceId) return;

        lastHoveredPieceRef.current = pieceId;

        // Don't need to use these anymore since we removed the console.log
        // const pieceType = getPieceType(gridPos);
        // const visibleColors = getVisibleColors(cubieState.colors, gridPos);
      },
      [cubeState]
    );

    const handleLeaveCube = useCallback(() => {
      lastHoveredPieceRef.current = null;
    }, []);

    // Detect which face of the cubie was clicked and determine move parameters
    const detectFaceAndMove = (
      position: [number, number, number],
      intersectionPointWorld: THREE.Vector3
    ) => {
      const [x, y, z] = position;
      const gridX = Math.round(x / 1.05 + 1);
      const gridY = Math.round(y / 1.05 + 1);
      const gridZ = Math.round(z / 1.05 + 1);

      // Convert the world intersection point to cube-local coordinates to be rotation invariant
      let pointInCubeLocal = intersectionPointWorld.clone();
      if (groupRef.current) {
        pointInCubeLocal = groupRef.current.worldToLocal(pointInCubeLocal);
      }
      // Now compute local offset from the cubie's static local center (position is cube-local)
      const localPoint = pointInCubeLocal.sub(new THREE.Vector3(x, y, z));

      // Determine which face was clicked based on the dominant local axis
      const absX = Math.abs(localPoint.x);
      const absY = Math.abs(localPoint.y);
      const absZ = Math.abs(localPoint.z);

      let clickedFace = "front";
      if (absX > absY && absX > absZ) {
        clickedFace = localPoint.x > 0 ? "right" : "left";
      } else if (absY > absX && absY > absZ) {
        clickedFace = localPoint.y > 0 ? "top" : "bottom";
      } else {
        clickedFace = localPoint.z > 0 ? "front" : "back";
      }

      return { clickedFace, gridX, gridY, gridZ };
    };

    // Get affected cubies based on the face and move type - using AnimationHelper logic
    const getAffectedCubiesForMove = (moveType: string) => {
      return cubiesRef.current.filter((cubie) => {
        // Use the exact same logic as AnimationHelper.isCubieInMove
        switch (moveType) {
          case "F":
            return cubie.z === 2; // Front face
          case "B":
            return cubie.z === 0; // Back face
          case "R":
            return cubie.x === 2; // Right face
          case "L":
            return cubie.x === 0; // Left face
          case "U":
            return cubie.y === 2; // Top face
          case "D":
            return cubie.y === 0; // Bottom face
          case "M": // Middle slice (between L and R)
            return cubie.x === 1;
          case "E": // Equatorial slice (between U and D)
            return cubie.y === 1;
          case "S": // Standing slice (between F and B)
            return cubie.z === 1;
          default:
            return false;
        }
      });
    };

    // Enhanced position tracking with drag mechanics
    const trackingStateRef = useRef<
      TrackingStateRef & {
        dragTimestamps?: number[];
        dragPositions?: THREE.Vector2[];
        dragVelocity?: number;
      }
    >({
      isTracking: false,
      startPosition: new THREE.Vector2(),
      currentPosition: new THREE.Vector2(),
      cubiePosition: [0, 0, 0],
      clickedFace: "",
      uniquePieceId: "",
      isDragging: false,
      lockedMoveType: "",
      lockedDirection: "up",
      initialSwipeDirection: "up",
      dragGroup: null,
      affectedCubies: [],
      rotationAxis: new THREE.Vector3(),
      currentRotation: 0,
      hasStartedDrag: false,
      // Snapping animation state
      isSnapping: false,
      snapAnimationStartTime: 0,
      snapAnimationDuration: 200, // Default 200ms for the animation
      snapStartRotation: 0,
      snapTargetRotation: 0,
      finalMove: "",
      _axisLock: undefined,
      _initialDragDirection: undefined,
      _allowedMoves: [],
      // Face-local axes in screen space, captured at pointer down
      _screenFaceRight: undefined,
      _screenFaceUp: undefined,
      _lockThresholdPx: 0,
      // Canonical base move and expected sign (from AnimationHelper) used to interpret rotation
      _baseMove: undefined,
      _expectedBaseSign: undefined,
      // Parity to fix sign per face/axis
      _dragSignParity: 1,
      // Guard
      _snapCompleted: false,
    });

    // Helper: base move to axis char
    const baseMoveToAxis = (baseMove: string): "x" | "y" | "z" => {
      const b = baseMove.toUpperCase();
      if (b === "R" || b === "L" || b === "M" || b === "X") return "x";
      if (b === "U" || b === "D" || b === "E" || b === "Y") return "y";
      return "z"; // F, B, S, Z
    };

    // Helper: determine drag sign parity by face and axis to align visual drag with move direction
    const getDragParity = (face: string, axis: "x" | "y" | "z"): number => {
      // Default: no parity flip
      let parity = 1;

      switch (face) {
        case "front":
          // Horizontal drags on the front face tend to feel reversed relative to rotation sign
          if (axis === "x") parity = -1;
          break;
        case "left":
          // Z-axis rotations initiated from the left face need inversion
          if (axis === "z") parity = -1;
          break;
        case "bottom":
          // Bottom face: vertical and horizontal gestures often read inverted
          if (axis === "y" || axis === "x") parity = -1;
          break;
        // Intentionally leave top/right/back with default parity to avoid regressions
        default:
          break;
      }

      return parity;
    };

    // Generate unique piece identifier based on grid position and face
    const generateUniquePieceId = (
      gridPos: [number, number, number],
      face: string
    ) => {
      const [x, y, z] = gridPos;

      // Create a unique identifier that represents the physical position on the cube
      // This will never change regardless of cube state/colors
      let pieceType = "";
      let positionId = "";

      // Determine piece type and position
      const numNonZero = [x, y, z].filter((coord) => coord !== 0).length;

      if (numNonZero === 3) {
        // Corner piece
        pieceType = "corner";
        positionId = `${x > 0 ? "R" : "L"}${y > 0 ? "U" : "D"}${
          z > 0 ? "F" : "B"
        }`;
      } else if (numNonZero === 2) {
        // Edge piece
        pieceType = "edge";
        if (x === 0) positionId = `M${y > 0 ? "U" : "D"}${z > 0 ? "F" : "B"}`;
        else if (y === 0)
          positionId = `${x > 0 ? "R" : "L"}E${z > 0 ? "F" : "B"}`;
        else if (z === 0)
          positionId = `${x > 0 ? "R" : "L"}${y > 0 ? "U" : "D"}S`;
      } else if (numNonZero === 1) {
        // Center piece
        pieceType = "center";
        if (x !== 0) positionId = x > 0 ? "R" : "L";
        else if (y !== 0) positionId = y > 0 ? "U" : "D";
        else if (z !== 0) positionId = z > 0 ? "F" : "B";
      }

      return `${pieceType}_${positionId}_${face}`;
    };

    const handlePointerDown = (
      e: any,
      pos: [number, number, number],
      intersectionPoint: THREE.Vector3
    ) => {
      if (AnimationHelper.isLocked() || !meshesReadyRef.current) {
        return;
      }

      e.stopPropagation();

      // Disable orbit controls immediately when clicking on a cube piece
      onOrbitControlsChange?.(false);

      // Detect which face was clicked
      const { clickedFace } = detectFaceAndMove(pos, intersectionPoint);

      // Convert position to grid coordinates
      const [x, y, z] = pos;
      const gridX = Math.round(x / 1.05 + 1);
      const gridY = Math.round(y / 1.05 + 1);
      const gridZ = Math.round(z / 1.05 + 1);
      const gridPos: [number, number, number] = [
        gridX - 1,
        gridY - 1,
        gridZ - 1,
      ];

      // Generate unique piece identifier
      const uniquePieceId = generateUniquePieceId(gridPos, clickedFace);

      const startPos = new THREE.Vector2(e.clientX, e.clientY);
      const now = Date.now();

      // Compute and cache face-local screen axes
      let screenFaceRight: THREE.Vector2 | undefined;
      let screenFaceUp: THREE.Vector2 | undefined;
      if (groupRef.current) {
        const { right, up } = getFaceBasisLocal(clickedFace);
        const right2D = projectLocalDirToScreen(right);
        const up2D = projectLocalDirToScreen(up);
        screenFaceRight =
          right2D.lengthSq() > 1e-6 ? right2D.clone().normalize() : undefined;
        screenFaceUp =
          up2D.lengthSq() > 1e-6 ? up2D.clone().normalize() : undefined;
      }

      trackingStateRef.current = {
        isTracking: true,
        startPosition: startPos,
        currentPosition: startPos.clone(),
        cubiePosition: pos,
        clickedFace,
        uniquePieceId,
        isDragging: false,
        _pointerId:
          (e && (e.pointerId ?? e?.nativeEvent?.pointerId)) || undefined,
        lockedMoveType: "",
        lockedDirection: "up",
        initialSwipeDirection: "up",
        dragGroup: null,
        affectedCubies: [],
        rotationAxis: new THREE.Vector3(),
        currentRotation: 0,
        hasStartedDrag: false,
        isSnapping: false,
        snapAnimationStartTime: 0,
        snapAnimationDuration: 200,
        snapStartRotation: 0,
        snapTargetRotation: 0,
        finalMove: "",
        dragTimestamps: [now],
        dragPositions: [startPos.clone()],
        dragVelocity: 0,
        _axisLock: undefined,
        _initialDragDirection: undefined,
        _allowedMoves: [],
        _screenFaceRight: screenFaceRight,
        _screenFaceUp: screenFaceUp,
        _lockThresholdPx: 0,
        _dragSignParity: 1,
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    };

    // Helper function to clean up drag state
    const cleanupDragState = () => {
      // Clean up drag group if it exists
      const dragGroup = trackingStateRef.current.dragGroup;
      if (dragGroup && groupRef.current) {
        const tempGroup = dragGroup;
        trackingStateRef.current.dragGroup = null;
        const meshesToMove: THREE.Mesh[] = [];
        tempGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshesToMove.push(child);
          }
        });

        meshesToMove.forEach((mesh) => {
          const cubie = trackingStateRef.current.affectedCubies.find(
            (c) => c.mesh === mesh
          );
          if (cubie) {
            tempGroup.remove(mesh);
            groupRef.current!.add(mesh);
            mesh.position.copy(cubie.originalPosition);
            mesh.rotation.set(0, 0, 0);
          }
        });

        groupRef.current.remove(tempGroup);
      }

      // Reset animation state properties
      trackingStateRef.current.isSnapping = false;
      trackingStateRef.current.snapAnimationStartTime = 0;
      trackingStateRef.current.snapStartRotation = 0;
      trackingStateRef.current.snapTargetRotation = 0;

      // Re-enable orbit controls
      onOrbitControlsChange?.(true);
      AnimationHelper.unlock();
    };

    // Helper function to start drag animation
    const startDragAnimation = (
      suggestedMove: string,
      swipeDirection: SwipeDirection
    ) => {
      if (!groupRef.current || trackingStateRef.current.hasStartedDrag) return;

      // Determine canonical base move (strip prime/2)
      const baseMove = suggestedMove.replace(/['2]/g, "");
      trackingStateRef.current._baseMove = baseMove;

      // Use the base move’s axis and expected sign
      const [axis, totalRotation] = AnimationHelper.getMoveAxisAndDir(
        baseMove as CubeMove
      );
      trackingStateRef.current.rotationAxis = axis.clone();
      trackingStateRef.current._expectedBaseSign =
        Math.sign(totalRotation) || 1;

      // Determine parity from face/axis to align drag with expected visual direction
      const baseAxis = baseMoveToAxis(baseMove);
      trackingStateRef.current._dragSignParity = getDragParity(
        trackingStateRef.current.clickedFace,
        baseAxis
      );

      // Lock base move type (non-prime) – prime will be resolved by drag sign at release
      trackingStateRef.current.lockedMoveType = baseMove;
      trackingStateRef.current.lockedDirection = swipeDirection;
      trackingStateRef.current.initialSwipeDirection = swipeDirection;
      trackingStateRef.current.isDragging = true;
      trackingStateRef.current.hasStartedDrag = true;

      // Get affected cubies based on the base move type
      const affectedCubies = getAffectedCubiesForMove(baseMove);
      trackingStateRef.current.affectedCubies = affectedCubies;

      // Create a new group for dragging
      const dragGroup = new THREE.Group();

      // Add affected cubie meshes to the drag group
      affectedCubies.forEach((cubie) => {
        if (cubie.mesh.parent === groupRef.current) {
          const originalPosition = cubie.mesh.position.clone();
          groupRef.current!.remove(cubie.mesh);
          dragGroup.add(cubie.mesh);
          cubie.mesh.position.copy(originalPosition);
        }
      });

      // Add drag group to main group
      groupRef.current.add(dragGroup);
      trackingStateRef.current.dragGroup = dragGroup;

      // Lock animations during drag
      AnimationHelper.lock();
    };

    // Replace drag rotation to be based on signed projection along locked axis
    const updateDragRotation = (dragVector: THREE.Vector2) => {
      if (!trackingStateRef.current.isDragging) return;

      // Signed projection onto locked axis
      const axisLock = trackingStateRef.current._axisLock;
      const faceRight = trackingStateRef.current._screenFaceRight;
      const faceUp = trackingStateRef.current._screenFaceUp;

      let signedProjection = 0;
      if (axisLock === "horizontal" && faceRight) {
        signedProjection = dragVector.dot(faceRight);
      } else if (axisLock === "vertical" && faceUp) {
        signedProjection = dragVector.dot(faceUp);
      } else {
        // Fallback to dominant axis of drag
        signedProjection =
          Math.abs(dragVector.x) > Math.abs(dragVector.y)
            ? Math.sign(dragVector.x) * dragVector.length()
            : Math.sign(dragVector.y) * dragVector.length();
      }

      // Parity: re-evaluate based on the face and base move axis for consistency
      const parity =
        trackingStateRef.current._dragSignParity ??
        getDragParity(
          trackingStateRef.current.clickedFace,
          baseMoveToAxis(trackingStateRef.current._baseMove || "F")
        );

      // Rotation is from drag projection with parity fix; axis sign stays fixed to base move
      trackingStateRef.current.currentRotation =
        DRAG_SENSITIVITY * signedProjection * parity;

      // Apply immediately to avoid one-frame delay waiting for useFrame
      const dg = trackingStateRef.current.dragGroup;
      if (dg) {
        dg.setRotationFromAxisAngle(
          trackingStateRef.current.rotationAxis,
          trackingStateRef.current.currentRotation
        );
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!trackingStateRef.current.isTracking) return;
      // Ignore moves from non-initiating pointers (e.g., a second finger)
      if (
        trackingStateRef.current._pointerId != null &&
        e.pointerId !== trackingStateRef.current._pointerId
      ) {
        return;
      }

      const currentPos = new THREE.Vector2(e.clientX, e.clientY);
      trackingStateRef.current.currentPosition = currentPos;

      // Flick sampling
      if (
        trackingStateRef.current.dragTimestamps &&
        trackingStateRef.current.dragPositions
      ) {
        trackingStateRef.current.dragTimestamps.push(Date.now());
        trackingStateRef.current.dragPositions.push(currentPos.clone());
        if (trackingStateRef.current.dragTimestamps.length > 5) {
          trackingStateRef.current.dragTimestamps.shift();
          trackingStateRef.current.dragPositions.shift();
        }
      }

      const dragVector = currentPos
        .clone()
        .sub(trackingStateRef.current.startPosition);

      // Always keep face-aligned screen axes up-to-date to account for whole-cube spins mid-gesture
      if (groupRef.current) {
        const { right, up } = getFaceBasisLocal(
          trackingStateRef.current.clickedFace
        );
        const r2 = projectLocalDirToScreen(right);
        const u2 = projectLocalDirToScreen(up);
        if (r2.lengthSq() > 1e-6)
          trackingStateRef.current._screenFaceRight = r2.clone().normalize();
        if (u2.lengthSq() > 1e-6)
          trackingStateRef.current._screenFaceUp = u2.clone().normalize();
      }

      if (!trackingStateRef.current.hasStartedDrag) {
        // Use cached face axes; if missing, compute now
        let faceRight = trackingStateRef.current._screenFaceRight;
        let faceUp = trackingStateRef.current._screenFaceUp;
        if ((!faceRight || !faceUp) && groupRef.current) {
          const { right, up } = getFaceBasisLocal(
            trackingStateRef.current.clickedFace
          );
          faceRight = projectLocalDirToScreen(right).normalize();
          faceUp = projectLocalDirToScreen(up).normalize();
        }

        const rDot = faceRight ? dragVector.dot(faceRight) : dragVector.x;
        const uDot = faceUp ? dragVector.dot(faceUp) : dragVector.y;

        const axisLock =
          Math.abs(rDot) >= Math.abs(uDot) ? "horizontal" : "vertical";
        const moveDirection: SwipeDirection =
          axisLock === "horizontal"
            ? rDot >= 0
              ? "right"
              : "left"
            : uDot >= 0
            ? "up"
            : "down";

        const positionKey = trackingStateRef.current
          .uniquePieceId as PositionMoveKey;
        const suggestedMove =
          POSITION_MOVE_MAPPING[positionKey]?.[moveDirection];

        // Start only when we have a mapping and the primary-axis projected movement exceeds threshold
        if (!suggestedMove) {
          return;
        }
        // Compute primary-axis projected movement (px) to avoid tiny accidental drags
        const primaryProjPx = Math.abs(axisLock === "horizontal" ? rDot : uDot);
        if (primaryProjPx < LOCK_PRIMARY_PX) {
          // not moved enough yet
          return;
        }

        trackingStateRef.current._axisLock = axisLock;
        trackingStateRef.current.lockedDirection = moveDirection;
        trackingStateRef.current._initialDragDirection = moveDirection;
        trackingStateRef.current._allowedMoves = [
          suggestedMove,
          suggestedMove.endsWith("'")
            ? suggestedMove.replace("'", "")
            : suggestedMove + "'",
        ];
        startDragAnimation(suggestedMove, moveDirection);
        // Apply initial rotation immediately to avoid 1-frame delay
        updateDragRotation(dragVector);
        return;
      }

      // After lock, we no longer switch move types mid-drag; rotation sign determines prime vs non-prime
      updateDragRotation(dragVector);
    };

    const handlePointerUp = (e: PointerEvent) => {
      // Only respond to the initiating pointer's up event
      if (
        trackingStateRef.current._pointerId != null &&
        e.pointerId !== trackingStateRef.current._pointerId
      ) {
        return;
      }
      // Now safe to remove listeners
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      if (!trackingStateRef.current.isTracking) {
        return;
      }

      // Flick gesture: calculate drag velocity on release
      if (
        trackingStateRef.current.dragTimestamps &&
        trackingStateRef.current.dragPositions
      ) {
        const times = trackingStateRef.current.dragTimestamps;
        const positions = trackingStateRef.current.dragPositions;
        if (times.length >= 2 && positions.length >= 2) {
          const dt = (times[times.length - 1] - times[0]) / 800; // seconds (restore previous scaling)
          const dp = positions[times.length - 1].clone().sub(positions[0]);
          const velocity = dt > 0 ? dp.length() / dt : 0; // px/sec
          trackingStateRef.current.dragVelocity = velocity;
        } else {
          trackingStateRef.current.dragVelocity = 0;
        }
      }

      if (trackingStateRef.current.isDragging) {
        finalizeDragWithSnapping();
      } else {
        if (trackingStateRef.current.dragGroup) {
          cleanupDragState();
        } else {
          onOrbitControlsChange?.(true);
        }
      }

      if (!trackingStateRef.current.isSnapping) {
        trackingStateRef.current = {
          isTracking: false,
          startPosition: new THREE.Vector2(),
          currentPosition: new THREE.Vector2(),
          cubiePosition: [0, 0, 0],
          clickedFace: "",
          uniquePieceId: "",
          isDragging: false,
          lockedMoveType: "",
          lockedDirection: "up",
          initialSwipeDirection: "up",
          dragGroup: null,
          affectedCubies: [],
          rotationAxis: new THREE.Vector3(),
          currentRotation: 0,
          hasStartedDrag: false,
          isSnapping: false,
          snapAnimationStartTime: 0,
          snapAnimationDuration: 100,
          snapStartRotation: 0,
          snapTargetRotation: 0,
          finalMove: "",
          dragTimestamps: [],
          dragPositions: [],
          dragVelocity: 0,
        };
      }
    };

    // Simplify finalize snapping: rely on accumulated rotation/sign
    const finalizeDragWithSnapping = () => {
      if (!trackingStateRef.current.isDragging || !groupRef.current) return;

      const baseMove =
        trackingStateRef.current._baseMove ||
        trackingStateRef.current.lockedMoveType.replace(/['2]/g, "");
      const expectedSign = trackingStateRef.current._expectedBaseSign || 1;

      // Wrap current rotation to [-π, π] to avoid long spins
      const twoPi = Math.PI * 2;
      const normalizeAngle = (a: number) => {
        const m = (((a + Math.PI) % twoPi) + twoPi) % twoPi; // [0, 2π)
        return m - Math.PI; // (-π, π]
      };

      let currentRotation = normalizeAngle(
        trackingStateRef.current.currentRotation
      );
      // Update stored rotation and group to the wrapped angle (visually identical)
      trackingStateRef.current.currentRotation = currentRotation;
      if (trackingStateRef.current.dragGroup) {
        trackingStateRef.current.dragGroup.setRotationFromAxisAngle(
          trackingStateRef.current.rotationAxis,
          currentRotation
        );
      }

      const snapIncrement = Math.PI / 2;

      // Base rounding to nearest step
      const stepsFloat = currentRotation / snapIncrement;
      const baseSteps = Math.round(stepsFloat); // -2..2

      // Distance-based control for 180°: require a long drag; flick can only add a single quarter step
      const velocity = trackingStateRef.current.dragVelocity || 0;
      const velocityThreshold = 100; // keep prior feel

      // Compute axis-projected drag distance in pixels
      const startPos = trackingStateRef.current.startPosition;
      const curPos = trackingStateRef.current.currentPosition;
      const dragVecPx = curPos.clone().sub(startPos);
      let axisProjPx = 0;
      const axisLock = trackingStateRef.current._axisLock;
      const faceRight = trackingStateRef.current._screenFaceRight;
      const faceUp = trackingStateRef.current._screenFaceUp;
      if (axisLock === "horizontal" && faceRight) {
        axisProjPx = dragVecPx.dot(faceRight);
      } else if (axisLock === "vertical" && faceUp) {
        axisProjPx = dragVecPx.dot(faceUp);
      } else {
        axisProjPx =
          Math.abs(dragVecPx.x) >= Math.abs(dragVecPx.y)
            ? Math.sign(dragVecPx.x) * dragVecPx.length()
            : Math.sign(dragVecPx.y) * dragVecPx.length();
      }
      const axisProjAbsPx = Math.abs(axisProjPx);

      // Only allow 180° if user dragged a long distance (or angle clearly near 180°)
      const TWO_TURN_STEPS_MIN = 1.5; // at least 135° in angle
      const TWO_TURN_PX_MIN = 180; // or ~180px along the locked axis
      const allowTwoTurn =
        Math.abs(stepsFloat) >= TWO_TURN_STEPS_MIN ||
        axisProjAbsPx >= TWO_TURN_PX_MIN;

      // Start from base rounding
      let targetSteps = baseSteps;
      let flickInfluenced = false;

      // Compute instantaneous axis-projected velocity near release (px/sec)
      let axisVelPxPerSec = 0;
      const times = trackingStateRef.current.dragTimestamps;
      const positions = trackingStateRef.current.dragPositions;
      if (times && positions && times.length >= 2) {
        const i2 = times.length - 1;
        // Find a sample ~40-70ms back to estimate instantaneous speed
        let j2 = i2 - 1;
        for (let k = i2 - 1; k >= 0; k--) {
          const dtMs = times[i2] - times[k];
          if (dtMs >= 40) {
            j2 = k;
            break;
          }
        }
        const dtMs = Math.max(1, times[i2] - times[j2]);
        const dp = positions[i2].clone().sub(positions[j2]);
        const axisDir =
          axisLock === "horizontal" && faceRight
            ? faceRight
            : axisLock === "vertical" && faceUp
            ? faceUp
            : undefined;
        const proj = axisDir
          ? dp.dot(axisDir)
          : Math.abs(dp.x) >= Math.abs(dp.y)
          ? Math.sign(dp.x) * dp.length()
          : Math.sign(dp.y) * dp.length();
        axisVelPxPerSec = (proj * 1000) / dtMs;
      }

      // Apply drag parity to flick direction so it matches drag orientation per face/axis
      let flickParity = trackingStateRef.current._dragSignParity ?? 1;
      const axisVelSigned = axisVelPxPerSec * flickParity;

      // Short, sharp flick: if base is 0, allow a single 90° purely from fast axis velocity, even with small distance
      const SINGLE_FLICK_VEL_MIN = 100; // easier to trigger a single move
      const SINGLE_FLICK_MIN_PX = 6; // avoid micro jitters
      if (
        targetSteps === 0 &&
        Math.abs(axisVelSigned) > SINGLE_FLICK_VEL_MIN &&
        axisProjAbsPx > SINGLE_FLICK_MIN_PX
      ) {
        targetSteps = Math.sign(axisVelSigned) || 1; // ±1
        flickInfluenced = true;
      }

      // If not already at a half turn, allow flick to add at most one quarter step (use axis velocity for direction)
      if (Math.abs(targetSteps) < 2 && Math.abs(velocity) > velocityThreshold) {
        const biasSign =
          Math.sign(axisVelSigned) || Math.sign(currentRotation) || 1;
        const newSteps = targetSteps + biasSign;
        // Never escalate to 180° purely from flick
        targetSteps = Math.abs(newSteps) > 1 ? Math.sign(newSteps) : newSteps;
        if (biasSign !== 0) flickInfluenced = true;
      }

      // If base rounding produced a 180° but drag wasn't long enough, demote to 90°
      if (Math.abs(targetSteps) === 2 && !allowTwoTurn) {
        targetSteps = Math.sign(targetSteps); // ±1
      }

      // If flick influenced and we are at a quarter turn, force sign to match axis flick direction
      if (flickInfluenced && Math.abs(targetSteps) === 1) {
        targetSteps = Math.sign(axisVelSigned) || 1;
      }

      // Clamp to valid range (allow half-turns again when thresholds permit)
      targetSteps = Math.max(-2, Math.min(2, targetSteps));

      const signedSteps = targetSteps; // -2,-1,0,1,2

      let finalMove = "";
      let targetAngle = 0;
      if (signedSteps === 0) {
        // No move, snap back
        trackingStateRef.current.isDragging = false;
        trackingStateRef.current.isSnapping = true;
        trackingStateRef.current.snapAnimationStartTime = Date.now();
        trackingStateRef.current.snapAnimationDuration = 150;
        trackingStateRef.current.snapStartRotation =
          trackingStateRef.current.currentRotation;
        trackingStateRef.current.snapTargetRotation = 0;
        trackingStateRef.current.finalMove = "";
        return;
      }

      if (Math.abs(signedSteps) === 2) {
        // Half turn
        finalMove = baseMove + "2";
        const baseTarget = Math.sign(currentRotation) * Math.PI || Math.PI;
        const k = Math.round((currentRotation - baseTarget) / twoPi);
        targetAngle = baseTarget + k * twoPi;
      } else {
        // Quarter turn
        const quarterSign = flickInfluenced
          ? Math.sign(axisVelSigned) || 1
          : Math.sign(signedSteps) || 1;
        finalMove = quarterSign === expectedSign ? baseMove : baseMove + "'";
        const baseTarget = signedSteps * snapIncrement; // -π/2 or +π/2
        const k = Math.round((currentRotation - baseTarget) / twoPi);
        targetAngle = baseTarget + k * twoPi;
      }

      trackingStateRef.current.isDragging = false;
      trackingStateRef.current.isSnapping = true;
      trackingStateRef.current.snapAnimationStartTime = Date.now();
      trackingStateRef.current.snapAnimationDuration = 200;
      trackingStateRef.current.snapStartRotation =
        trackingStateRef.current.currentRotation;
      trackingStateRef.current.snapTargetRotation = targetAngle;
      trackingStateRef.current.finalMove = finalMove as CubeMove;
    };

    return (
      <group
        ref={groupRef}
        onPointerLeave={handleLeaveCube}
        onPointerMove={handlePreciseHover}
      >
        {(() => {
          const nodes: React.ReactNode[] = [];
          cubeState.forEach((plane, x) => {
            plane.forEach((row, y) => {
              row.forEach((cubie, z) => {
                nodes.push(
                  <CubePiece
                    key={`${x},${y},${z}`}
                    position={[(x - 1) * 1.05, (y - 1) * 1.05, (z - 1) * 1.05]}
                    colors={cubie.colors}
                    whiteLogoAngleRad={whiteLogoAngle}
                    touchCount={touchCount}
                    onPointerDown={(e, pos, intersectionPoint) =>
                      handlePointerDown(e, pos, intersectionPoint)
                    }
                    onMeshReady={(mesh, gridX, gridY, gridZ) => {
                      // Register cubie mesh for animation
                      if (!cubiesRef.current.some((c) => c.mesh === mesh)) {
                        cubiesRef.current.push({
                          mesh,
                          x: gridX,
                          y: gridY,
                          z: gridZ,
                          originalPosition: mesh.position.clone(),
                        });
                      }
                      // Mark meshes as ready when all are registered
                      if (cubiesRef.current.length === 27) {
                        meshesReadyRef.current = true;
                      }
                    }}
                    onPointerMove={undefined}
                  />
                );
              });
            });
          });
          return nodes;
        })()}
      </group>
    );
  }
);

export default RubiksCube3D;
