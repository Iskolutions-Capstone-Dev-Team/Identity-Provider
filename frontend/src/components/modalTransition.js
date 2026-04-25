import { useEffect, useState } from "react";

export const MODAL_EXIT_DURATION_MS = 180;

export function useModalTransition(isOpen) {
  const [shouldRender, setShouldRender] = useState(Boolean(isOpen));

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setShouldRender(false);
    }, MODAL_EXIT_DURATION_MS);

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  return {
    shouldRender,
    isClosing: shouldRender && !isOpen,
  };
}

export function getModalTransitionClassName(className, isClosing) {
  return [className, isClosing ? "idp-modal-closing" : ""]
    .filter(Boolean)
    .join(" ");
}
