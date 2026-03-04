import { useCallback } from "react";
import cubejsTo3D from "@utils/cubejsTo3D";
import type { CubeMove, CubeState, Solution } from "@/types/cube";
import CUBE_COLORS from "@/consts/cubeColours";
import type { CubeJSWrapper } from "@utils/cubejsWrapper";
import type { RubiksCube3DHandle } from "@components/RubiksCube3D/types";
import type { OrbitControlsInstance } from "@/types/orbitControls";

interface UseFadeToSolvedParams {
  cube3D: CubeState[][][];
  cubeRef: React.MutableRefObject<CubeJSWrapper>;
  cubeViewRef: React.RefObject<RubiksCube3DHandle | null>;
  orbitControlsRef: React.RefObject<OrbitControlsInstance | null>;
  moveQueueRef: React.MutableRefObject<CubeMove[]>;
  currentRunRef: React.MutableRefObject<null | "scramble" | "solve" | "auto-orient">;
  scrambleRemainingRef: React.MutableRefObject<number>;
  solutionOverlaySourceRef: React.MutableRefObject<"generate" | "solve" | null>;
  lastMoveSourceRef: React.MutableRefObject<"queue" | "manual" | "undo" | "redo" | null>;
  isAnimatingRef: React.MutableRefObject<boolean>;
  pendingMoveRef: React.MutableRefObject<CubeMove | null>;
  sessionPhaseRef: React.MutableRefObject<"idle" | "transition" | "scramble">;
  clearMoveHistory: () => void;
  setCube3D: React.Dispatch<React.SetStateAction<CubeState[][][]>>;
  setPreviousCube3D: React.Dispatch<React.SetStateAction<CubeState[][][] | null>>;
  setBaselineCube3D: React.Dispatch<React.SetStateAction<CubeState[][][] | null>>;
  setStickerGreyMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  setColorFadeProgress: React.Dispatch<React.SetStateAction<number>>;
  setScrambleMoves: React.Dispatch<React.SetStateAction<string[] | null>>;
  setShowScrambleOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setScrambleIndex: React.Dispatch<React.SetStateAction<number>>;
  setSolution: React.Dispatch<React.SetStateAction<Solution | null>>;
  setShowSolutionOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setSolutionIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsSolving: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAutoOrienting: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingMove: React.Dispatch<React.SetStateAction<CubeMove | null>>;
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
  setInputDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setIsScrambled: React.Dispatch<React.SetStateAction<boolean>>;
  setLastSolvedState: React.Dispatch<React.SetStateAction<string | null>>;
  setOrbitControlsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const useFadeToSolved = ({
  cube3D,
  cubeRef,
  cubeViewRef,
  orbitControlsRef,
  moveQueueRef,
  currentRunRef,
  scrambleRemainingRef,
  solutionOverlaySourceRef,
  lastMoveSourceRef,
  isAnimatingRef,
  pendingMoveRef,
  sessionPhaseRef,
  clearMoveHistory,
  setCube3D,
  setPreviousCube3D,
  setBaselineCube3D,
  setStickerGreyMap,
  setColorFadeProgress,
  setScrambleMoves,
  setShowScrambleOverlay,
  setScrambleIndex,
  setSolution,
  setShowSolutionOverlay,
  setSolutionIndex,
  setIsSolving,
  setIsAutoOrienting,
  setPendingMove,
  setIsAnimating,
  setInputDisabled,
  setIsScrambled,
  setLastSolvedState,
  setOrbitControlsEnabled,
}: UseFadeToSolvedParams) => {
  const fadeToSolvedState = useCallback(
    (onComplete?: () => void) => {
      moveQueueRef.current = [];
      currentRunRef.current = null;
      scrambleRemainingRef.current = 0;
      setScrambleMoves(null);
      setShowScrambleOverlay(false);
      setScrambleIndex(-1);
      setSolution(null);
      setShowSolutionOverlay(false);
      setSolutionIndex(-1);
      solutionOverlaySourceRef.current = null;
      setIsSolving(false);
      setIsAutoOrienting(false);
      setPendingMove(null);
      pendingMoveRef.current = null;
      setIsAnimating(false);
      isAnimatingRef.current = false;
      lastMoveSourceRef.current = null;
      clearMoveHistory();
      setInputDisabled(true);
      sessionPhaseRef.current = "transition";

      const currentCube3D = cube3D;
      setPreviousCube3D(currentCube3D);

      const solvedCube = new (cubeRef.current
        .constructor as typeof import("@utils/cubejsWrapper").CubeJSWrapper)();
      const solvedCube3D = cubejsTo3D(solvedCube.getCube());
      setBaselineCube3D(solvedCube3D);

      const greyMap = new Map<string, boolean>();
      const faceKeys: Array<keyof CubeState["colors"]> = [
        "front",
        "back",
        "left",
        "right",
        "top",
        "bottom",
      ];

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < 3; z++) {
            const currentPiece = currentCube3D[x]?.[y]?.[z];
            const solvedPiece = solvedCube3D[x]?.[y]?.[z];
            if (currentPiece && solvedPiece) {
              for (const face of faceKeys) {
                const currentColor =
                  currentPiece.colors[face] || CUBE_COLORS.BLACK;
                const solvedColor =
                  solvedPiece.colors[face] || CUBE_COLORS.BLACK;
                const key = `${x},${y},${z},${face}`;
                if (
                  currentColor !== CUBE_COLORS.BLACK &&
                  currentColor !== solvedColor
                ) {
                  greyMap.set(key, true);
                }
              }
            }
          }
        }
      }

      setStickerGreyMap(greyMap);
      setColorFadeProgress(0);

      if (cubeViewRef.current) {
        cubeViewRef.current.resetToInitialPosition(
          orbitControlsRef as unknown as React.RefObject<OrbitControlsInstance>,
          cubeRef,
          undefined,
        );
      }

      const phase1Duration = 120;
      const phase2Delay = 120;
      const phase2Duration = 120;
      const totalFadeDuration = phase1Duration + phase2Delay + phase2Duration;
      let startTime: number | null = null;

      const animateFade = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;

        let progress = 0;
        if (elapsed < phase1Duration) {
          progress = (elapsed / phase1Duration) * 0.5;
        } else if (elapsed < phase1Duration + phase2Delay) {
          progress = 0.5;
        } else {
          const phase2Elapsed = elapsed - (phase1Duration + phase2Delay);
          progress = 0.5 + (phase2Elapsed / phase2Duration) * 0.5;
        }

        setColorFadeProgress(Math.min(1, progress));

        if (elapsed < totalFadeDuration) {
          requestAnimationFrame(animateFade);
        } else {
          cubeRef.current.reset();
          setCube3D(cubejsTo3D(cubeRef.current.getCube()));
          setPreviousCube3D(null);
          setBaselineCube3D(null);
          setStickerGreyMap(new Map());
          setColorFadeProgress(0);
          setIsScrambled(false);
          setLastSolvedState(cubeRef.current.getState());

          if (onComplete) {
            onComplete();
          } else {
            setInputDisabled(false);
            setOrbitControlsEnabled(true);
            if (orbitControlsRef.current) {
              orbitControlsRef.current.enabled = true;
              if (typeof orbitControlsRef.current.update === "function")
                orbitControlsRef.current.update();
            }
            sessionPhaseRef.current = "idle";
          }
        }
      };
      requestAnimationFrame(animateFade);
    },
    [cube3D, clearMoveHistory],
  );

  return { fadeToSolvedState };
};

export default useFadeToSolved;
