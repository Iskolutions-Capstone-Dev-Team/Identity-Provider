import { useEffect, useState } from "react";
import { ACCESSIBILITY_READY_EVENT, ACCESSIBILITY_UNAVAILABLE_EVENT, isAccessibilityWidgetReady, toggleAccessibilityMenu } from "./AccessibilityWidget";
import { AccessibilityIcon } from "./componentIcons";

const FAB_CONTAINER_CLASS_NAME =
  "pointer-events-none fixed bottom-[1.65rem] left-1/2 -translate-x-1/2 z-[100] flex h-16 w-16 items-center justify-center lg:bottom-5 lg:left-auto lg:right-6 lg:-translate-x-0";
const FAB_BUTTON_CLASS_NAME =
  "inline-flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f8d24e] bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)] text-[#fff8f3] shadow-[0_20px_48px_-24px_rgba(43,3,7,0.82)] ring-[4px] ring-[#f8d24e] transition-[transform,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_24px_56px_-24px_rgba(43,3,7,0.9)] focus:outline-none focus:ring-[6px] focus:ring-[#f8d24e]/35 disabled:cursor-not-allowed disabled:opacity-60";

export default function AssistiveFab() {
  const [isAccessibilityReady, setIsAccessibilityReady] = useState(() =>
    isAccessibilityWidgetReady(),
  );

  const handleAccessibilityClick = () => {
    toggleAccessibilityMenu();
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncAccessibilityState = () => {
      setIsAccessibilityReady(isAccessibilityWidgetReady());
    };

    syncAccessibilityState();
    window.addEventListener(
      ACCESSIBILITY_READY_EVENT,
      syncAccessibilityState,
    );
    window.addEventListener(
      ACCESSIBILITY_UNAVAILABLE_EVENT,
      syncAccessibilityState,
    );

    return () => {
      window.removeEventListener(
        ACCESSIBILITY_READY_EVENT,
        syncAccessibilityState,
      );
      window.removeEventListener(
        ACCESSIBILITY_UNAVAILABLE_EVENT,
        syncAccessibilityState,
      );
    };
  }, []);

  return (
    <div className={FAB_CONTAINER_CLASS_NAME}>
      <button type="button" aria-label="Open web accessibility" title="Open web accessibility" className={`${FAB_BUTTON_CLASS_NAME} pointer-events-auto`} disabled={!isAccessibilityReady} onClick={handleAccessibilityClick}>
        <AccessibilityIcon />
      </button>
    </div>
  );
}