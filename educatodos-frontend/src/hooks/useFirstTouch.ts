import { useEffect } from "react";

export const useFirstTouch = (onFirstTouch) => {
  useEffect(() => {
    const handleFirstTouch = () => {
      onFirstTouch();
      window.removeEventListener("pointerdown", handleFirstTouch);
    };

    window.addEventListener("pointerdown", handleFirstTouch);

    return () => {
      window.removeEventListener("pointerdown", handleFirstTouch);
    };
  }, [onFirstTouch]);
};