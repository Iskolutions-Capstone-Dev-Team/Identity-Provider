import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESSIBILITY_READY_EVENT, ACCESSIBILITY_UNAVAILABLE_EVENT, isAccessibilityWidgetReady, toggleAccessibilityMenu } from "./AccessibilityWidget";
import OnePortalButton from "./OnePortalButton";
import { FloatingSpeechInputAction } from "./SpeechInputButton";
import { AccessibilityIcon, FaqIcon, ToggleIcon } from "./componentIcons";

const FAB_CONTAINER_CLASS_NAME =
  "pointer-events-none fixed bottom-[1.65rem] left-1/2 -translate-x-1/2 z-[140] flex h-16 w-16 items-center justify-center lg:bottom-20 lg:left-auto lg:right-6 lg:-translate-x-0";
const FAB_BUTTON_CLASS_NAME =
  "inline-flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f8d24e] bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)] text-[#fff8f3] shadow-[0_20px_48px_-24px_rgba(43,3,7,0.82)] ring-[4px] ring-[#f8d24e] transition-[transform,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_24px_56px_-24px_rgba(43,3,7,0.9)] focus:outline-none focus:ring-[6px] focus:ring-[#f8d24e]/35 disabled:cursor-not-allowed disabled:opacity-60";
const FAB_TOOLTIP_CLASS_NAME =
  "whitespace-nowrap rounded-2xl border border-[#f8d24e] bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)] px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#fff8f3] shadow-[0_20px_42px_-24px_rgba(43,3,7,0.82)] backdrop-blur-xl";
const FAB_TOOLTIP_ARROW_CLASS_NAME =
  "h-3 w-3 rotate-45 rounded-[0.2rem] border-r border-t border-[#f8d24e] bg-[rgb(75,7,13)]";
const FAB_ACTION_STAGGER_MS = 55;
const FAB_ACTION_TRANSITION_MS = 320;
const FAB_ACTION_WRAP_BASE_CLASS =
  "absolute inset-0 flex items-center justify-center will-change-transform transition-all duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

const ACTION_POSITIONS = [
  "max-lg:-translate-x-[113px] max-lg:-translate-y-[41px] lg:-translate-x-[150px] lg:translate-y-0",
  "max-lg:-translate-x-[50px] max-lg:-translate-y-[108px] lg:-translate-x-[130px] lg:-translate-y-[75px]",
  "max-lg:translate-x-[50px] max-lg:-translate-y-[108px] lg:-translate-x-[75px] lg:-translate-y-[130px]",
  "max-lg:translate-x-[113px] max-lg:-translate-y-[41px] lg:translate-x-0 lg:-translate-y-[150px]"
];

function getActionVisibilityClassName(isOpen, isVisible, actionIndex) {
  if (isOpen) {
    return `${FAB_ACTION_WRAP_BASE_CLASS} pointer-events-auto scale-100 opacity-100 ${ACTION_POSITIONS[actionIndex]}`;
  }

  if (isVisible) {
    return `${FAB_ACTION_WRAP_BASE_CLASS} pointer-events-none scale-[0.3] opacity-0 translate-x-0 translate-y-0`;
  }

  return `${FAB_ACTION_WRAP_BASE_CLASS} pointer-events-none invisible scale-[0.3] opacity-0 translate-x-0 translate-y-0`;
}

function getActionTransitionStyle(actionIndex, actionCount) {
  const delay = actionIndex * FAB_ACTION_STAGGER_MS;

  return {
    transitionDelay: `${delay}ms`,
  };
}

export default function AssistiveFab({ colorMode = "light" }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [areActionsVisible, setAreActionsVisible] = useState(false);
  const [isAccessibilityReady, setIsAccessibilityReady] = useState(() =>
    isAccessibilityWidgetReady(),
  );
  const toggleButtonClassName = `${FAB_BUTTON_CLASS_NAME} pointer-events-auto`;

  const handleAccessibilityClick = () => {
    toggleAccessibilityMenu();
  };

  const handleFaqClick = () => {
    navigate("/faq");
    setIsOpen(false);
  };

  const fabActions = [
    {
      key: "one-portal",
      tooltipLabel: "One Portal",
      content: (
        <OnePortalButton className={FAB_BUTTON_CLASS_NAME} />
      ),
    },
    {
      key: "speech",
      tooltipLabel: "Voice Input",
      content: (
        <FloatingSpeechInputAction
          className={FAB_BUTTON_CLASS_NAME}
          colorMode={colorMode}
        />
      ),
    },
    {
      key: "accessibility",
      tooltipLabel: "Web Accessibility",
      content: (
        <button type="button" aria-label="Open web accessibility" title="Open web accessibility" className={FAB_BUTTON_CLASS_NAME} disabled={!isAccessibilityReady} onClick={handleAccessibilityClick}>
          <AccessibilityIcon />
        </button>
      ),
    },
    {
      key: "faq",
      tooltipLabel: "FAQ",
      content: (
        <button type="button" aria-label="Open FAQ" title="Open FAQ" className={FAB_BUTTON_CLASS_NAME} onClick={handleFaqClick}>
          <FaqIcon />
        </button>
      ),
    },
  ];
  const fabActionHideDelayMs =
    FAB_ACTION_TRANSITION_MS +
    FAB_ACTION_STAGGER_MS * (fabActions.length - 1);

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
    }, fabActionHideDelayMs);

    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [areActionsVisible, fabActionHideDelayMs, isOpen]);

  return (
    <>
      <div className={FAB_CONTAINER_CLASS_NAME}>
        {fabActions.map((action, actionIndex) => {
          const actionVisibilityClassName = getActionVisibilityClassName(
            isOpen,
            areActionsVisible,
            actionIndex,
          );
          const actionTransitionStyle = getActionTransitionStyle(
            actionIndex,
            fabActions.length,
          );

          return (
            <div key={action.key} aria-hidden={!isOpen} className={actionVisibilityClassName} style={actionTransitionStyle}>
              <FabActionTooltip
                label={action.tooltipLabel}
              >
                {action.content}
              </FabActionTooltip>
            </div>
          );
        })}

        <button type="button" aria-expanded={isOpen} aria-label={isOpen ? "Close assistive tools" : "Open assistive tools"} title={isOpen ? "Close assistive tools" : "Open assistive tools"} className={toggleButtonClassName}
          onClick={() => setIsOpen((current) => !current)}
        >
          <ToggleIcon isOpen={isOpen} />
        </button>
      </div>
    </>
  );
}

function FabActionTooltip({ label, children }) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipVisibilityClassName = isTooltipVisible
    ? "visible translate-x-0 opacity-100"
    : "invisible translate-x-2 opacity-0";

  const handleFocus = (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    setIsTooltipVisible(event.target.matches(":focus-visible"));
  };

  return (
    <div className="relative flex items-center justify-end" onMouseEnter={() => setIsTooltipVisible(true)} onMouseLeave={() => setIsTooltipVisible(false)} onFocusCapture={handleFocus} onBlurCapture={() => setIsTooltipVisible(false)}>
      <div className={`pointer-events-none absolute right-[calc(100%+0.9rem)] top-1/2 z-[1] flex -translate-y-1/2 items-center gap-2 transition-[opacity,transform,visibility] duration-200 ease-out ${tooltipVisibilityClassName}`}>
        <span className={FAB_TOOLTIP_CLASS_NAME}>{label}</span>
        <span
          aria-hidden="true"
          className={FAB_TOOLTIP_ARROW_CLASS_NAME}
        />
      </div>

      {children}
    </div>
  );
}