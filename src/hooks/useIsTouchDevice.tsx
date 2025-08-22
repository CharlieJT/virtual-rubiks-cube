import { useEffect, useState } from "react";

// Custom hook to detect touch devices
const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const hasTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window ||
        (typeof navigator.maxTouchPoints === "number" &&
          navigator.maxTouchPoints > 0));
    setIsTouch(Boolean(hasTouch));
  }, []);

  return isTouch;
};

export default useIsTouchDevice;
