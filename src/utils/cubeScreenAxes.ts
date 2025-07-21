import * as THREE from "three";

export function logFaceOrientation(
  faceNormal: THREE.Vector3,
  group: THREE.Group,
  camera: THREE.Camera,
  opts?: { domElement?: HTMLElement }
) {
  // Example: log the orientation of a face normal in screen space
  const worldPos = group.getWorldPosition(new THREE.Vector3());
  const normalWorld = faceNormal.clone().applyQuaternion(group.quaternion);
  const faceWorld = worldPos.clone().add(normalWorld);
  const ndcWorld = faceWorld.clone().project(camera);
  const ndcOrigin = worldPos.clone().project(camera);
  const screenVec = new THREE.Vector2(
    ndcWorld.x - ndcOrigin.x,
    ndcWorld.y - ndcOrigin.y
  );
  // if (opts?.domElement) {
  //   // Optionally log pixel coordinates
  //   const width = opts.domElement.clientWidth;
  //   const height = opts.domElement.clientHeight;
  //   const px = ((ndcWorld.x + 1) / 2) * width;
  //   const py = ((-ndcWorld.y + 1) / 2) * height;
  //   console.log("Face normal screen px:", px, py, "screenVec:", screenVec);
  // } else {
  //   console.log("Face normal screenVec:", screenVec);
  // }
}

export function cubeScreenAxes(group: THREE.Group, camera: THREE.Camera) {
  // Returns { x: Vector2, y: Vector2, z: Vector2 } in screen space
  const worldPos = group.getWorldPosition(new THREE.Vector3());
  const axes = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1),
  };
  const screenAxes: Record<string, THREE.Vector2> = {};
  for (const key of Object.keys(axes)) {
    const axisWorld = worldPos
      .clone()
      .add(axes[key as keyof typeof axes].applyQuaternion(group.quaternion));
    const ndcWorld = axisWorld.clone().project(camera);
    const ndcOrigin = worldPos.clone().project(camera);
    screenAxes[key] = new THREE.Vector2(
      ndcWorld.x - ndcOrigin.x,
      ndcWorld.y - ndcOrigin.y
    ).normalize();
  }
  return screenAxes;
}
/**
 * Given a drag vector and a clicked face normal, returns the move direction relative to the face (U, D, L, R, F, B).
 * This interprets drag from the face's perspective, regardless of cube orientation.
 */
export function getFaceRelativeMove(
  dragVec: THREE.Vector2,
  faceNormal: THREE.Vector3,
  cubeMesh: THREE.Object3D,
  camera: THREE.Camera,
  renderer: { domElement: HTMLCanvasElement }
): "left" | "right" | "up" | "down" {
  // Get face axes in screen space
  const { screenX, screenY } = getFaceScreenAxes(
    faceNormal,
    cubeMesh,
    camera,
    renderer
  );
  // Get drag direction relative to face as seen on the screen
  return getDragDirection(dragVec, screenX, screenY);
}
/**
 * Given a drag vector in screen space, projects it into the cube's local space and returns the closest canonical axis.
 * Returns 'x', 'y', or 'z' and the sign (+/-) for direction.
 */
export function getCubeCanonicalDrag(
  dragVec: THREE.Vector2,
  cubeMesh: THREE.Object3D,
  camera: THREE.Camera,
  renderer: { domElement: HTMLCanvasElement }
): { axis: "x" | "y" | "z"; sign: 1 | -1 } {
  // Get cube center in world space
  const worldPos = cubeMesh.getWorldPosition(new THREE.Vector3());
  // Project canonical axes to screen space
  const axes = [
    new THREE.Vector3(1, 0, 0), // X
    new THREE.Vector3(0, 1, 0), // Y
    new THREE.Vector3(0, 0, 1), // Z
  ];
  const screenAxes = axes.map((axis) => {
    const worldAxis = axis.clone().applyQuaternion(cubeMesh.quaternion);
    const end = worldPos.clone().add(worldAxis);
    const startScreen = worldPos.clone().project(camera);
    const endScreen = end.clone().project(camera);
    const width = renderer.domElement.width;
    const height = renderer.domElement.height;
    const sx = (startScreen.x * 0.5 + 0.5) * width;
    const sy = (1 - (startScreen.y * 0.5 + 0.5)) * height;
    const ex = (endScreen.x * 0.5 + 0.5) * width;
    const ey = (1 - (endScreen.y * 0.5 + 0.5)) * height;
    return new THREE.Vector2(ex - sx, ey - sy).normalize();
  });
  // Compare dragVec to each axis
  let bestAxis: "x" | "y" | "z" = "x";
  let bestSign: 1 | -1 = 1;
  let bestDot = -Infinity;
  for (let i = 0; i < 3; i++) {
    const dot = dragVec.dot(screenAxes[i]);
    if (Math.abs(dot) > Math.abs(bestDot)) {
      bestAxis = i === 0 ? "x" : i === 1 ? "y" : "z";
      bestSign = dot > 0 ? 1 : -1;
      bestDot = dot;
    }
  }
  return { axis: bestAxis, sign: bestSign };
}
// Remove duplicate import

/**
 * Given a face normal (local), cube mesh, and camera, returns the screen-space axes for that face.
 * This lets you map drag directions to cube moves based on orientation.
 */
export function getFaceScreenAxes(
  faceNormal: THREE.Vector3,
  cubeMesh: THREE.Object3D,
  camera: THREE.Camera,
  renderer: { domElement: HTMLCanvasElement }
) {
  // Transform face normal to world space
  const worldNormal = faceNormal.clone().applyQuaternion(cubeMesh.quaternion);

  // Build a tangent basis for the face normal
  // Pick an arbitrary vector not parallel to the normal
  let tangent = new THREE.Vector3(0, 1, 0);
  if (Math.abs(faceNormal.y) > 0.99) tangent = new THREE.Vector3(1, 0, 0);
  // Right = normal x tangent
  const right = new THREE.Vector3()
    .crossVectors(faceNormal, tangent)
    .normalize();
  // Up = right x normal
  const up = new THREE.Vector3().crossVectors(right, faceNormal).normalize();
  // Transform to world space
  const worldRight = right.clone().applyQuaternion(cubeMesh.quaternion);
  const worldUp = up.clone().applyQuaternion(cubeMesh.quaternion);

  // Project to screen space
  function projectToScreen(vec: THREE.Vector3) {
    const worldPos = cubeMesh.getWorldPosition(new THREE.Vector3());
    const end = worldPos.clone().add(vec);
    // Project start and end
    const startScreen = worldPos.clone().project(camera);
    const endScreen = end.clone().project(camera);
    // Convert to pixel coordinates
    const width = renderer.domElement.width;
    const height = renderer.domElement.height;
    const sx = (startScreen.x * 0.5 + 0.5) * width;
    const sy = (1 - (startScreen.y * 0.5 + 0.5)) * height;
    const ex = (endScreen.x * 0.5 + 0.5) * width;
    const ey = (1 - (endScreen.y * 0.5 + 0.5)) * height;
    return new THREE.Vector2(ex - sx, ey - sy).normalize();
  }

  const screenX = projectToScreen(worldRight);
  const screenY = projectToScreen(worldUp);

  // Print orientation values for debugging
  console.log("screenX:", screenX);
  console.log("screenY:", screenY);
  console.log("worldNormal:", worldNormal);

  return { screenX, screenY, worldNormal };
}

/**
 * Given a drag vector (screen space) and the screen axes, returns the best matching move direction.
 * Returns 'up', 'down', 'left', 'right' relative to the face.
 */
export function getDragDirection(
  dragVec: THREE.Vector2,
  screenX: THREE.Vector2,
  screenY: THREE.Vector2
): "up" | "down" | "left" | "right" {
  // Project drag onto axes
  const xDot = dragVec.dot(screenX);
  const yDot = dragVec.dot(screenY);
  if (Math.abs(xDot) > Math.abs(yDot)) {
    return xDot > 0 ? "right" : "left";
  } else {
    return yDot > 0 ? "down" : "up";
  }
}
