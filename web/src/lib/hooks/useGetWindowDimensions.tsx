import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";

export const useGetWindowDimension = () => {
  const { height } = useWindowSize();
  const [windowHeight, setWindowHeight] = useState(height);

  const updateHeight = () => {
    setWindowHeight(height);
  };

  useEffect(() => {
    window.addEventListener("resize", updateHeight);
    // Call updateHeight initially in case the window size changes before the event listener is added
    updateHeight();

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return { windowHeight };
};
