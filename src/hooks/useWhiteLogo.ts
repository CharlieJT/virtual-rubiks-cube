import { useState, useCallback, useRef, useEffect } from "react";
import * as THREE from "three";
import type { CubeState, CubeMove, SliceKey } from "@/types/cube";
import { AnimationHelper } from "@utils/animationHelper";
import {
  getWhiteLogoDeltaByBucketDeg,
  getWhiteLogoDeltaRad,
} from "@utils/whiteCenterOrientationMap";
import SAME_FACE_DELTA from "@/maps/sameFaceDelta";
import VIA_TRANSITION_DELTA from "@/maps/viaTransitionDelta";
import CUBE_COLORS from "@/consts/cubeColours";

const { WHITE } = CUBE_COLORS;

const useWhiteLogo = (cubeState: CubeState[][][]) => {
  // Track white logo rotation (in radians). Positive values rotate CCW in texture space.
  const [whiteLogoAngle, setWhiteLogoAngle] = useState<number>(0);
  const lastAppliedMoveRef = useRef<{ move: string; t: number } | null>(null);
  // Track the white center's logo orientation as a quaternion in cube-local space
  const whiteQuatRef = useRef<THREE.Quaternion>(new THREE.Quaternion());
  // Track the previous face holding the white center (pre-move)
  const prevWhiteFaceRef = useRef<keyof CubeState["colors"] | null>(null);
  // Keep a ref of the last displayed angle to accumulate face-turn deltas without projection jump
  const displayedAngleRef = useRef<number>(0);

  // Helper to normalize and check white color
  const isWhiteColor = useCallback((c: string) => {
    if (!c) return false;
    let s = c.toLowerCase();
    if (s[0] === "#" && s.length === 4) {
      s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
    }
    return s === WHITE || s === "white";
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
    (move: CubeMove, groupRef: React.RefObject<THREE.Group | null>) => {
      const moveStr = (move as string).toUpperCase();
      const now = Date.now();
      // Guard: avoid double-apply if the exact same move fires twice within 120ms
      if (
        lastAppliedMoveRef.current &&
        lastAppliedMoveRef.current.move === moveStr &&
        now - lastAppliedMoveRef.current.t < 120
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
        const q = new THREE.Quaternion().setFromAxisAngle(axis, totalRotation);
        whiteQuatRef.current.multiply(q);
      } else if (isSliceMove) {
        // For slice moves, apply visual rotation to show the coordinate system change
        // This physically rotates the entire cube group while keeping logical mapping unchanged
        // M → x visual rotation (cube rotates opposite to slice direction)
        // E → y visual rotation
        // S → z' visual rotation
        const coordinateRotationMap: Record<string, [THREE.Vector3, number]> = {
          M: [new THREE.Vector3(1, 0, 0), Math.PI / 2], // x rotation (opposite of slice direction)
          "M'": [new THREE.Vector3(1, 0, 0), -Math.PI / 2], // x' rotation
          M2: [new THREE.Vector3(1, 0, 0), Math.PI], // x2 rotation
          E: [new THREE.Vector3(0, 1, 0), Math.PI / 2], // y rotation
          "E'": [new THREE.Vector3(0, 1, 0), -Math.PI / 2], // y' rotation
          E2: [new THREE.Vector3(0, 1, 0), Math.PI], // y2 rotation
          S: [new THREE.Vector3(0, 0, 1), -Math.PI / 2], // z' rotation
          "S'": [new THREE.Vector3(0, 0, 1), Math.PI / 2], // z rotation
          S2: [new THREE.Vector3(0, 0, 1), Math.PI], // z2 rotation
        };

        const rotation = coordinateRotationMap[moveStr];
        if (rotation && groupRef.current) {
          const [axis, angle] = rotation;
          const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);

          // Apply rotation to the actual cube group to physically move it
          groupRef.current.quaternion.multiply(q);

          // Also update white quaternion tracking for consistency
          whiteQuatRef.current.multiply(q);
        }
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
          const q = new THREE.Quaternion().setFromAxisAngle(faceNormal, delta);
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
            const bucketDeg = ((((k % 4) + 4) % 4) * 90) as 0 | 90 | 180 | 270;
            // Determine slice parameter for slice-aware orientation mapping
            const sliceParam: SliceKey = isSliceMove
              ? (base as SliceKey)
              : "none";

            // Use enhanced function that includes E move specific logic
            if (isSliceMove) {
              // For slice moves, use the enhanced function with cube state and move string
              const additionalDelta = getWhiteLogoDeltaRad(
                prevWhiteFaceRef.current,
                resolvedAfter,
                displayedAngleRef.current || 0,
                sliceParam,
                cubeState,
                moveStr
              );
              thetaDesired += additionalDelta;
            } else {
              // For regular moves, use the bucket-based function
              thetaDesired += getWhiteLogoDeltaByBucketDeg(
                prevWhiteFaceRef.current,
                resolvedAfter,
                bucketDeg,
                sliceParam
              );
            }
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
            const qFix = new THREE.Quaternion().setFromAxisAngle(faceN, delta);
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
    [getWhiteCenterFaceFromState, cubeState]
  );

  return {
    whiteLogoAngle,
    setWhiteLogoAngle,
    applyMoveToWhiteLogoAngle,
  };
};

export default useWhiteLogo;
