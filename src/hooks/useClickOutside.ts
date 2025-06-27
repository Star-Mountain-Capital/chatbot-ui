import { RefObject, useEffect } from "react";

type ClickOutsideHandler = (event: MouseEvent) => void;

const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  handler: ClickOutsideHandler
): void => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        !ref.current ||
        !("contains" in ref.current)
      ) {
        return;
      }

      if (ref.current.contains(event.target as Node)) {
        return;
      }
      if (!ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    document.addEventListener("mousedown", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
};

export default useClickOutside;
