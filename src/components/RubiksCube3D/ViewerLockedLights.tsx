import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Camera-locked light rig: face-axis points plus hemisphere fill.
 * Edge/corner point lights were merged into hemisphere to cut GPU cost (~12 lights vs ~35).
 */
const FACE_LIGHT_DISTANCE = 5;
const FACE_LIGHT_INTENSITY = 0.92;
const FACE_LIGHT_RANGE = 22;

const TOP_FACE_LIGHT_INTENSITY = 1.1;
const SIDE_FACE_LIGHT_INTENSITY = 1.02;

const TOP_FILL_DISTANCE = 6.8;
const TOP_FILL_INTENSITY = 0.62;
const TOP_FILL_RANGE = 24;

const SIDE_FILL_DISTANCE = 5.8;
const SIDE_FILL_HEIGHT = 2;
const SIDE_FILL_DEPTH = 2.4;
const SIDE_FILL_INTENSITY = 0.55;
const SIDE_FILL_RANGE = 22;

const FACE_LIGHTS: ReadonlyArray<{
  position: [number, number, number];
  intensity: number;
}> = [
  {
    position: [FACE_LIGHT_DISTANCE, 0, 0],
    intensity: SIDE_FACE_LIGHT_INTENSITY,
  },
  {
    position: [-FACE_LIGHT_DISTANCE, 0, 0],
    intensity: SIDE_FACE_LIGHT_INTENSITY,
  },
  {
    position: [0, FACE_LIGHT_DISTANCE, 0],
    intensity: TOP_FACE_LIGHT_INTENSITY,
  },
  { position: [0, -FACE_LIGHT_DISTANCE, 0], intensity: FACE_LIGHT_INTENSITY },
  { position: [0, 0, FACE_LIGHT_DISTANCE], intensity: FACE_LIGHT_INTENSITY },
  { position: [0, 0, -FACE_LIGHT_DISTANCE], intensity: FACE_LIGHT_INTENSITY },
];

const TOP_FILL_POSITIONS: ReadonlyArray<[number, number, number]> = [
  [0, TOP_FILL_DISTANCE, 0],
  [0, TOP_FILL_DISTANCE * 0.85, TOP_FILL_DISTANCE * 0.25],
];

const SIDE_FILL_POSITIONS: ReadonlyArray<[number, number, number]> = [
  [SIDE_FILL_DISTANCE, SIDE_FILL_HEIGHT, 0],
  [-SIDE_FILL_DISTANCE, SIDE_FILL_HEIGHT, 0],
  [SIDE_FILL_DISTANCE, SIDE_FILL_HEIGHT * 0.55, SIDE_FILL_DEPTH],
  [-SIDE_FILL_DISTANCE, SIDE_FILL_HEIGHT * 0.55, -SIDE_FILL_DEPTH],
];

export const ViewerLockedLights = () => {
  const rigRef = useRef<Group | null>(null);
  const { camera } = useThree();

  useFrame(() => {
    const rig = rigRef.current;
    if (!rig) return;
    rig.position.copy(camera.position);
    rig.quaternion.copy(camera.quaternion);
  });

  return (
    <group ref={rigRef}>
      <ambientLight intensity={0.42} />
      <hemisphereLight
        color="#f0f4ff"
        groundColor="#2a2a32"
        intensity={0.58}
      />
      {FACE_LIGHTS.map(({ position, intensity }, index) => (
        <pointLight
          key={`face-${index}`}
          position={position}
          intensity={intensity}
          distance={FACE_LIGHT_RANGE}
          decay={1}
        />
      ))}
      {TOP_FILL_POSITIONS.map((position, index) => (
        <pointLight
          key={`top-${index}`}
          position={position}
          intensity={TOP_FILL_INTENSITY}
          distance={TOP_FILL_RANGE}
          decay={1}
        />
      ))}
      {SIDE_FILL_POSITIONS.map((position, index) => (
        <pointLight
          key={`side-${index}`}
          position={position}
          intensity={SIDE_FILL_INTENSITY}
          distance={SIDE_FILL_RANGE}
          decay={1}
        />
      ))}
    </group>
  );
};
