import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface ViewerDirectionalLightProps {
  intensity?: number;
}

/**
 * A directional light that follows the camera position, so the cube
 * is always lit from the viewer's perspective—the bright side is
 * always the side facing the user.
 */
export function ViewerDirectionalLight({
  intensity = 2.3,
}: ViewerDirectionalLightProps) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);
    }
  });

  return <directionalLight ref={lightRef} intensity={intensity} />;
}
