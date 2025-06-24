import { useRef, useEffect } from "react";

const useLongClick = (onLongClick, { ms = 500 } = {}) => {
  const timerRef = useRef();

  useEffect(() => {
    const start = () => {
      timerRef.current = setTimeout(() => {
        onLongClick();
      }, ms);
    };

    const clear = () => {
      clearTimeout(timerRef.current);
    };

    window.addEventListener("pointerdown", start);
    window.addEventListener("pointerup", clear);
    window.addEventListener("pointerleave", clear);
    window.addEventListener("pointercancel", clear);

    return () => {
      clear();
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("pointerup", clear);
      window.removeEventListener("pointerleave", clear);
      window.removeEventListener("pointercancel", clear);
    };
  }, [onLongClick, ms]);
};

export default useLongClick;