import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CubeState } from "@/types/cube";
import { CUBIE_DISTANCE } from "@components/RubiksCube3D/geometry";
import CUBIE_STYLE_MAP from "@/config/cube/cubieStyleMap";
import GhostPiece from "./GhostPiece";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import useLogoTexture from "@/hooks/useLogoTexture";

interface GhostPieceIndicatorProps {
  cubeState: CubeState[][][];
  opacity: number;
  rotationProgress: number;
  isAnimatingMove: boolean;
  extraYawRad?: number;
  cubeViewRef?: React.RefObject<RubiksCube3DHandle | null>;
  move:
    | "R"
    | "R'"
    | "F"
    | "F'"
    | "L"
    | "L'"
    | "U"
    | "U'"
    | "D"
    | "D'"
    | "B"
    | "B'"
    | "F2"
    | "R2"
    | "L2"
    | "U2"
    | "D2"
    | "B2";
}

const GhostPieceIndicator: React.FC<GhostPieceIndicatorProps> = ({
  cubeState,
  opacity,
  rotationProgress,
  isAnimatingMove,
  cubeViewRef,
  move,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const rotationGroupRef = useRef<THREE.Group>(null);

  // Get logo texture for white center piece
  const { logoReady, tiptonsTexture } = useLogoTexture();

  // Sync rotation with cube group
  useFrame(() => {
    if (groupRef.current && cubeViewRef?.current) {
      const cubeRotation = cubeViewRef.current.getCurrentRotation();
      if (cubeRotation) {
        groupRef.current.quaternion.copy(cubeRotation);
      }
    }
  });

  const facePieces = useMemo(() => {
    const pieces: Array<{
      position: [number, number, number];
      colors: CubeState["colors"];
      cornerStyles: string[];
    }> = [];

    const moveBase = move.replace(/['2]/g, "").toUpperCase();
    let faceCoord: { axis: "x" | "y" | "z"; value: number };

    // Determine which face to show based on move
    switch (moveBase) {
      case "R":
        faceCoord = { axis: "x", value: 2 };
        break;
      case "L":
        faceCoord = { axis: "x", value: 0 };
        break;
      case "F":
        faceCoord = { axis: "z", value: 2 };
        break;
      case "B":
        faceCoord = { axis: "z", value: 0 };
        break;
      case "U":
        faceCoord = { axis: "y", value: 2 };
        break;
      case "D":
        faceCoord = { axis: "y", value: 0 };
        break;
      default:
        // Default to front face
        faceCoord = { axis: "z", value: 2 };
    }

    // Collect pieces for the target face
    if (faceCoord.axis === "x") {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const piece = cubeState[faceCoord.value]?.[y]?.[z];
          if (piece) {
            const styleKey = `${faceCoord.value},${y},${z}`;
            const cornerStyles = CUBIE_STYLE_MAP[styleKey]?.cornerBuilder || [];
            pieces.push({
              position: [faceCoord.value, y, z],
              colors: piece.colors,
              cornerStyles,
            });
          }
        }
      }
    } else if (faceCoord.axis === "y") {
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
          const piece = cubeState[x]?.[faceCoord.value]?.[z];
          if (piece) {
            const styleKey = `${x},${faceCoord.value},${z}`;
            const cornerStyles = CUBIE_STYLE_MAP[styleKey]?.cornerBuilder || [];
            pieces.push({
              position: [x, faceCoord.value, z],
              colors: piece.colors,
              cornerStyles,
            });
          }
        }
      }
    } else {
      // z axis
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          const piece = cubeState[x]?.[y]?.[faceCoord.value];
          if (piece) {
            const styleKey = `${x},${y},${faceCoord.value}`;
            const cornerStyles = CUBIE_STYLE_MAP[styleKey]?.cornerBuilder || [];
            pieces.push({
              position: [x, y, faceCoord.value],
              colors: piece.colors,
              cornerStyles,
            });
          }
        }
      }
    }

    return pieces;
  }, [cubeState, move]);

  useFrame(() => {
    if (rotationGroupRef.current && isAnimatingMove) {
      const isPrime = move.includes("'");
      const isDouble = move.includes("2");
      const moveBase = move.replace(/['2]/g, "").toUpperCase();
      let baseRotation: number;
      let rotationAxis: "x" | "y" | "z";

      // Determine rotation axis and base direction based on move
      switch (moveBase) {
        case "R":
          rotationAxis = "x";
          baseRotation = isDouble ? Math.PI : isPrime ? Math.PI / 2 : -Math.PI / 2;
          break;
        case "L":
          rotationAxis = "x";
          baseRotation = isDouble ? Math.PI : isPrime ? -Math.PI / 2 : Math.PI / 2; // Opposite of R
          break;
        case "F":
          rotationAxis = "z";
          baseRotation = isDouble ? -Math.PI : isPrime ? Math.PI / 2 : -Math.PI / 2;
          break;
        case "B":
          rotationAxis = "z";
          baseRotation = isDouble ? Math.PI : isPrime ? -Math.PI / 2 : Math.PI / 2; // Opposite of F
          break;
        case "U":
          rotationAxis = "y";
          baseRotation = isDouble ? Math.PI : isPrime ? Math.PI / 2 : -Math.PI / 2;
          break;
        case "D":
          rotationAxis = "y";
          baseRotation = isDouble ? Math.PI : isPrime ? -Math.PI / 2 : Math.PI / 2; // Opposite of U
          break;
        default:
          rotationAxis = "z";
          baseRotation = isDouble ? Math.PI : isPrime ? Math.PI / 2 : -Math.PI / 2;
      }

      const targetRotation = baseRotation * rotationProgress;

      // Apply rotation to the appropriate axis
      rotationGroupRef.current.rotation[rotationAxis] = targetRotation;
    } else if (
      rotationGroupRef.current &&
      !isAnimatingMove &&
      rotationProgress === 0
    ) {
      // Reset all rotations
      rotationGroupRef.current.rotation.x = 0;
      rotationGroupRef.current.rotation.y = 0;
      rotationGroupRef.current.rotation.z = 0;
    }
  });

  if (opacity === 0) return null;

  const moveBase = move.replace(/['2]/g, "").toUpperCase();
  let rotationCenter: [number, number, number];

  // Determine rotation center based on face
  switch (moveBase) {
    case "R":
      rotationCenter = [CUBIE_DISTANCE, 0, 0]; // Right face center (x = 1)
      break;
    case "L":
      rotationCenter = [-CUBIE_DISTANCE, 0, 0]; // Left face center (x = -1)
      break;
    case "F":
      rotationCenter = [0, 0, CUBIE_DISTANCE]; // Front face center (z = 1)
      break;
    case "B":
      rotationCenter = [0, 0, -CUBIE_DISTANCE]; // Back face center (z = -1)
      break;
    case "U":
      rotationCenter = [0, CUBIE_DISTANCE, 0]; // Top face center (y = 1)
      break;
    case "D":
      rotationCenter = [0, -CUBIE_DISTANCE, 0]; // Bottom face center (y = -1)
      break;
    default:
      rotationCenter = [0, 0, CUBIE_DISTANCE];
  }

  return (
    <group ref={groupRef} renderOrder={10}>
      <group ref={rotationGroupRef} position={rotationCenter} renderOrder={10}>
        {facePieces.map((piece, idx) => {
          const [x, y, z] = piece.position;
          // Position relative to rotation center based on face
          let position: [number, number, number];

          switch (moveBase) {
            case "R":
              position = [
                0, // All right face pieces are at x = 1, so relative to center = 0
                (y - 1) * CUBIE_DISTANCE,
                (z - 1) * CUBIE_DISTANCE,
              ];
              break;
            case "L":
              position = [
                0, // All left face pieces are at x = -1, so relative to center = 0
                (y - 1) * CUBIE_DISTANCE,
                (z - 1) * CUBIE_DISTANCE,
              ];
              break;
            case "F":
              position = [
                (x - 1) * CUBIE_DISTANCE,
                (y - 1) * CUBIE_DISTANCE,
                0, // All front face pieces are at z = 1, so relative to center = 0
              ];
              break;
            case "B":
              position = [
                (x - 1) * CUBIE_DISTANCE,
                (y - 1) * CUBIE_DISTANCE,
                0, // All back face pieces are at z = -1, so relative to center = 0
              ];
              break;
            case "U":
              position = [
                (x - 1) * CUBIE_DISTANCE,
                0, // All top face pieces are at y = 1, so relative to center = 0
                (z - 1) * CUBIE_DISTANCE,
              ];
              break;
            case "D":
              position = [
                (x - 1) * CUBIE_DISTANCE,
                0, // All bottom face pieces are at y = -1, so relative to center = 0
                (z - 1) * CUBIE_DISTANCE,
              ];
              break;
            default:
              position = [
                (x - 1) * CUBIE_DISTANCE,
                (y - 1) * CUBIE_DISTANCE,
                0,
              ];
          }

          return (
            <GhostPiece
              key={`${x}-${y}-${z}-${idx}`}
              position={position}
              colors={piece.colors}
              cornerStyles={piece.cornerStyles}
              opacity={opacity}
              gridPosition={piece.position}
              sharedLogoTexture={tiptonsTexture}
              logoReady={logoReady}
              move={move}
            />
          );
        })}
      </group>
    </group>
  );
};

export default GhostPieceIndicator;
