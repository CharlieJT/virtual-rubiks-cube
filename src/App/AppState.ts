import useCubeState from "./CubeState";
import useSessionState from "./SessionState";
import useUIState from "./UIState";

const useAppState = () => {
  const cubeState = useCubeState();
  const sessionState = useSessionState();
  const uiState = useUIState();

  return {
    ...cubeState,
    ...sessionState,
    ...uiState,
  };
};

export default useAppState;
