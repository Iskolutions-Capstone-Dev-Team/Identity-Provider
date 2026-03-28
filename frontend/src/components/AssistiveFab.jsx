import { useEffect, useState } from "react";
import {
  ACCESSIBILITY_READY_EVENT,
  ACCESSIBILITY_UNAVAILABLE_EVENT,
  isAccessibilityWidgetReady,
  toggleAccessibilityMenu,
} from "./AccessibilityWidget";
import { FloatingSpeechInputAction } from "./SpeechInputButton";

const FAB_CONTAINER_CLASS_NAME =
  "pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom,0px)+7rem)] right-4 z-[140] flex flex-col items-end gap-3 lg:bottom-6 lg:right-6";
const FAB_BUTTON_CLASS_NAME =
  "inline-flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f8d24e] bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)] text-[#fff8f3] shadow-[0_20px_48px_-24px_rgba(43,3,7,0.82)] ring-[4px] ring-[#f8d24e] transition-[transform,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_24px_56px_-24px_rgba(43,3,7,0.9)] focus:outline-none focus:ring-[6px] focus:ring-[#f8d24e]/35 disabled:cursor-not-allowed disabled:opacity-60";
const FAB_ACTION_COUNT = 2;
const FAB_ACTION_STAGGER_MS = 55;
const FAB_ACTION_TRANSITION_MS = 320;
const FAB_ACTION_HIDE_DELAY_MS =
  FAB_ACTION_TRANSITION_MS + FAB_ACTION_STAGGER_MS * (FAB_ACTION_COUNT - 1);
const FAB_ACTION_WRAP_BASE_CLASS =
  "origin-bottom-right will-change-transform transition-[opacity,transform] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

function getHiddenActionTransformClassName(distanceFromToggle) {
  return distanceFromToggle === 0
    ? "translate-y-4 scale-95"
    : "translate-y-7 scale-[0.9]";
}

function getActionVisibilityClassName(isOpen, isVisible, distanceFromToggle) {
  const hiddenTransformClassName =
    getHiddenActionTransformClassName(distanceFromToggle);

  if (isOpen) {
    return `${FAB_ACTION_WRAP_BASE_CLASS} pointer-events-auto translate-y-0 scale-100 opacity-100`;
  }

  if (isVisible) {
    return `${FAB_ACTION_WRAP_BASE_CLASS} pointer-events-none ${hiddenTransformClassName} opacity-0`;
  }

  return `${FAB_ACTION_WRAP_BASE_CLASS} pointer-events-none invisible ${hiddenTransformClassName} opacity-0`;
}

function getActionTransitionStyle(actionIndex, actionCount) {
  const delay = (actionCount - actionIndex - 1) * FAB_ACTION_STAGGER_MS;

  return {
    transitionDelay: `${delay}ms`,
  };
}

export default function AssistiveFab({ colorMode = "light" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [areActionsVisible, setAreActionsVisible] = useState(false);
  const [isAccessibilityReady, setIsAccessibilityReady] = useState(() =>
    isAccessibilityWidgetReady(),
  );
  const toggleButtonClassName = `${FAB_BUTTON_CLASS_NAME} pointer-events-auto`;

  const handleAccessibilityClick = () => {
    toggleAccessibilityMenu();
  };

  const fabActions = [
    {
      key: "speech",
      content: (
        <FloatingSpeechInputAction
          className={FAB_BUTTON_CLASS_NAME}
          colorMode={colorMode}
        />
      ),
    },
    {
      key: "accessibility",
      content: (
        <button
          type="button"
          aria-label="Open web accessibility"
          title="Open web accessibility"
          className={FAB_BUTTON_CLASS_NAME}
          disabled={!isAccessibilityReady}
          onClick={handleAccessibilityClick}
        >
          <AccessibilityIcon />
        </button>
      ),
    },
  ];

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

  useEffect(() => {
    if (isOpen) {
      setAreActionsVisible(true);
      return undefined;
    }

    if (!areActionsVisible) {
      return undefined;
    }

    const closeTimer = window.setTimeout(() => {
      setAreActionsVisible(false);
    }, FAB_ACTION_HIDE_DELAY_MS);

    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [areActionsVisible, isOpen]);

  return (
    <div className={FAB_CONTAINER_CLASS_NAME}>
      {fabActions.map((action, actionIndex) => {
        const distanceFromToggle = fabActions.length - actionIndex - 1;
        const actionVisibilityClassName = getActionVisibilityClassName(
          isOpen,
          areActionsVisible,
          distanceFromToggle,
        );
        const actionTransitionStyle = getActionTransitionStyle(
          actionIndex,
          fabActions.length,
        );

        return (
          <div
            key={action.key}
            aria-hidden={!isOpen}
            className={actionVisibilityClassName}
            style={actionTransitionStyle}
          >
            {action.content}
          </div>
        );
      })}

      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close assistive tools" : "Open assistive tools"}
        title={isOpen ? "Close assistive tools" : "Open assistive tools"}
        className={toggleButtonClassName}
        onClick={() => setIsOpen((current) => !current)}
      >
        <ToggleIcon isOpen={isOpen} />
      </button>
    </div>
  );
}

function ToggleIcon({ isOpen }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`h-7 w-7 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen ? "rotate-45" : "rotate-0"
      }`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

function AccessibilityIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7"
    >
      <path d="M12 2.25a1.875 1.875 0 1 0 0 3.75 1.875 1.875 0 0 0 0-3.75Z" />
      <path d="M7.5 8.25a.75.75 0 0 0 0 1.5h2.977l-.733 10.634a.75.75 0 1 0 1.496.103L12 13.42l.76 7.067a.75.75 0 1 0 1.493-.103L13.52 9.75H16.5a.75.75 0 0 0 0-1.5h-9Z" />
    </svg>
  );
}
