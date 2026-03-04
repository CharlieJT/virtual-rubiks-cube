import { useCallback } from "react";
import * as THREE from "three";

const _normal = new THREE.Vector3();
const _globalUp = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _forward = new THREE.Vector3();

const _originWorld = new THREE.Vector3();
const _dirWorld = new THREE.Vector3();
const _endWorld = new THREE.Vector3();
const _originNdc = new THREE.Vector3();
const _endNdc = new THREE.Vector3();
const _ndcDelta = new THREE.Vector2();
const _screenResult = new THREE.Vector2();

const useFaceDetection = (
  camera: THREE.Camera,
  gl: THREE.WebGLRenderer,
  groupRef: React.RefObject<THREE.Group | null>
) => {
  const getFaceBasisLocal = useCallback((face: string) => {
    if (face === "front") _normal.set(0, 0, 1);
    else if (face === "back") _normal.set(0, 0, -1);
    else if (face === "right") _normal.set(1, 0, 0);
    else if (face === "left") _normal.set(-1, 0, 0);
    else if (face === "top") _normal.set(0, 1, 0);
    else _normal.set(0, -1, 0);

    _globalUp.set(0, 1, 0);
    _right.crossVectors(_globalUp, _normal);
    if (_right.lengthSq() < 1e-6) {
      _forward.set(0, 0, 1);
      _right.crossVectors(_forward, _normal);
    }
    _right.normalize();
    _up.crossVectors(_normal, _right).normalize();
    return { normal: _normal, right: _right, up: _up };
  }, []);

  const projectLocalDirToScreen = useCallback(
    (dirLocal: THREE.Vector3) => {
      if (!groupRef.current) return _screenResult.set(0, 0);
      groupRef.current.getWorldPosition(_originWorld);
      _dirWorld.copy(dirLocal).applyQuaternion(groupRef.current.quaternion);
      _endWorld.copy(_originWorld).add(_dirWorld);
      _originNdc.copy(_originWorld).project(camera);
      _endNdc.copy(_endWorld).project(camera);
      _ndcDelta.set(
        _endNdc.x - _originNdc.x,
        _endNdc.y - _originNdc.y
      );
      const rect = gl.domElement.getBoundingClientRect();
      return _screenResult.set(
        _ndcDelta.x * (rect.width / 2),
        -_ndcDelta.y * (rect.height / 2)
      );
    },
    [camera, gl, groupRef]
  );

  const baseMoveToAxis = (baseMove: string): "x" | "y" | "z" => {
    const b = baseMove.toUpperCase();
    if (b === "R" || b === "L" || b === "M" || b === "X") return "x";
    if (b === "U" || b === "D" || b === "E" || b === "Y") return "y";
    return "z"; // F, B, S, Z
  };

  const getDragParity = (face: string, axis: "x" | "y" | "z"): number => {
    let parity = 1;

    switch (face) {
      case "front":
        if (axis === "x") parity = -1;
        break;
      case "left":
        if (axis === "z") parity = -1;
        break;
      case "bottom":
        if (axis === "y" || axis === "x") parity = -1;
        break;
      default:
        break;
    }

    return parity;
  };

  return { getFaceBasisLocal, projectLocalDirToScreen, baseMoveToAxis, getDragParity };
};

export default useFaceDetection;
