import { useEffect } from "react";

export const ACCESSIBILITY_READY_EVENT = "idp-accessibility-ready";
export const ACCESSIBILITY_UNAVAILABLE_EVENT = "idp-accessibility-unavailable";

const ACCESSIBILITY_SCRIPT_ID = "idp-accessibility-script";
const ACCESSIBILITY_MANAGED_ATTR = "data-idp-accessibility-managed";
const ACCESSIBILITY_THEME_STYLE_ID = "idp-accessibility-theme";
const ACCESSIBILITY_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/sienna-accessibility@latest/dist/sienna-accessibility.umd.js";
const ACCESSIBILITY_RUNTIME_SELECTORS = [
  ".asw-container",
  "[class^='asw-']",
  "[class*=' asw-']",
];
const ACCESSIBILITY_POSITION = "bottom-right";
const ACCESSIBILITY_MOBILE_BREAKPOINT = 1024;
const ACCESSIBILITY_HIDDEN_BUTTON_MOBILE_BOTTOM_OFFSET = "calc(env(safe-area-inset-bottom, 0px) + 11.75rem)";
const ACCESSIBILITY_HIDDEN_BUTTON_MOBILE_RIGHT_OFFSET = "1rem";
const ACCESSIBILITY_HIDDEN_BUTTON_DESKTOP_BOTTOM_OFFSET = "6.25rem";
const ACCESSIBILITY_HIDDEN_BUTTON_DESKTOP_RIGHT_OFFSET = "1.5rem";
const ACCESSIBILITY_THEME_CSS = `
  .asw-container .asw-menu-btn {
    background: linear-gradient(135deg, #7b0d15 0%, #2b0307 100%) !important;
    border: 3px solid #f8d24e !important;
    outline: 4px solid #f8d24e !important;
    outline-offset: 0 !important;
    box-shadow: 0 20px 48px -24px rgba(43, 3, 7, 0.82) !important;
  }

  .asw-container .asw-menu-btn:hover,
  .asw-container .asw-menu-btn:focus {
    box-shadow: 0 24px 56px -24px rgba(43, 3, 7, 0.9) !important;
  }

  .asw-container .asw-menu-btn svg {
    fill: #fff8f3 !important;
    color: #fff8f3 !important;
    stroke: #fff8f3 !important;
  }

  .asw-container .asw-menu-btn svg [fill="none"] {
    fill: none !important;
    stroke: none !important;
  }

  .asw-container .asw-menu-btn svg path:not([fill="none"]) {
    fill: #fff8f3 !important;
    stroke: none !important;
  }

  .asw-container .asw-menu {
    background: linear-gradient(180deg, rgba(255, 250, 244, 0.98), rgba(255, 255, 255, 0.96)) !important;
    box-shadow: 0 24px 70px -30px rgba(43, 3, 7, 0.65) !important;
  }

  .asw-container .asw-menu * {
    color: #351018 !important;
  }

  .asw-container .asw-menu-header {
    background: linear-gradient(135deg, #7b0d15 0%, #2b0307 100%) !important;
  }

  .asw-container .asw-menu-title {
    color: #ffffff !important;
    letter-spacing: 0.04em !important;
  }

  .asw-container .asw-menu-header svg,
  .asw-container .asw-menu-header svg *,
  .asw-container .asw-menu-reset svg,
  .asw-container .asw-menu-reset svg *,
  .asw-container .asw-menu-close svg,
  .asw-container .asw-menu-close svg * {
    fill: #7b0d15 !important;
    color: #7b0d15 !important;
    stroke: #7b0d15 !important;
  }

  .asw-container .asw-menu-reset,
  .asw-container .asw-menu-close {
    background: #fff4dc !important;
    box-shadow: none !important;
  }

  .asw-container .asw-menu-reset:hover,
  .asw-container .asw-menu-reset:focus,
  .asw-container .asw-menu-close:hover,
  .asw-container .asw-menu-close:focus {
    outline: 3px solid rgba(248, 210, 78, 0.35) !important;
  }

  .asw-container .asw-card-title {
    color: #7b0d15 !important;
    opacity: 1 !important;
  }

  .asw-container .asw-menu .asw-select {
    border: 1px solid rgba(123, 13, 21, 0.12) !important;
    background: rgba(255, 255, 255, 0.96) !important;
    color: #4a1921 !important;
  }

  .asw-container .asw-adjust-font {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 243, 0.92)) !important;
    border-top: 1px solid rgba(123, 13, 21, 0.08) !important;
    border-bottom: 1px solid rgba(123, 13, 21, 0.08) !important;
  }

  .asw-container .asw-btn {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 243, 0.92)) !important;
    border: 1px solid rgba(123, 13, 21, 0.1) !important;
    color: #4a1921 !important;
    box-shadow: 0 18px 40px -34px rgba(43, 3, 7, 0.45) !important;
  }

  .asw-container .asw-btn svg,
  .asw-container .asw-btn svg *,
  .asw-container .asw-adjust-font svg,
  .asw-container .asw-adjust-font svg * {
    fill: #7b0d15 !important;
    color: #7b0d15 !important;
    stroke: #7b0d15 !important;
  }

  .asw-container .asw-btn:hover,
  .asw-container .asw-btn.asw-selected {
    border-color: #f8d24e !important;
    background: #fff4dc !important;
  }

  .asw-container .asw-btn.asw-selected span,
  .asw-container .asw-btn.asw-selected svg,
  .asw-container .asw-btn.asw-selected svg * {
    color: #7b0d15 !important;
    fill: #7b0d15 !important;
    stroke: #7b0d15 !important;
  }

  .asw-container .asw-btn.asw-selected:after {
    background-color: #7b0d15 !important;
  }

  .asw-container .asw-adjust-font div[role="button"],
  .asw-container .asw-plus,
  .asw-container .asw-minus {
    background: #fff4dc !important;
    border-color: rgba(123, 13, 21, 0.12) !important;
    color: #7b0d15 !important;
  }

  .asw-container .asw-plus:hover,
  .asw-container .asw-minus:hover {
    border-color: #f8d24e !important;
  }

  .asw-container .asw-footer {
    background: rgba(255, 255, 255, 0.92) !important;
    border-top: 1px solid rgba(123, 13, 21, 0.1) !important;
  }

  .asw-container .asw-menu-reset-footer-btn {
    border: 1px solid #7b0d15 !important;
    background: linear-gradient(135deg, #7b0d15 0%, #2b0307 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 18px 40px -26px rgba(123, 13, 21, 0.6) !important;
  }

  .asw-container .asw-menu-reset-footer-btn,
  .asw-container .asw-menu-reset-footer-btn span,
  .asw-container .asw-menu-reset-footer-btn.asw-translate {
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
  }

  .asw-container .asw-menu-reset-footer-btn:hover,
  .asw-container .asw-menu-reset-footer-btn:focus {
    background: #f8d24e !important;
    border-color: #f8d24e !important;
    color: #7b0d15 !important;
    outline: 3px solid rgba(248, 210, 78, 0.2) !important;
  }

  .asw-container .asw-menu-reset-footer-btn.asw-translate,
  .asw-container .asw-menu-reset-footer-btn.asw-translate:hover,
  .asw-container .asw-menu-reset-footer-btn.asw-translate:focus {
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
  }

  .asw-container .asw-menu-reset-footer-btn:hover,
  .asw-container .asw-menu-reset-footer-btn:hover span,
  .asw-container .asw-menu-reset-footer-btn:focus,
  .asw-container .asw-menu-reset-footer-btn:focus span,
  .asw-container .asw-menu-reset-footer-btn.asw-translate:hover,
  .asw-container .asw-menu-reset-footer-btn.asw-translate:focus {
    color: #7b0d15 !important;
    -webkit-text-fill-color: #7b0d15 !important;
  }

  .asw-container .asw-footer a,
  .asw-container .asw-footer a span {
    color: #7b0d15 !important;
  }

  @media (max-width: ${ACCESSIBILITY_MOBILE_BREAKPOINT - 0.02}px) {
    .asw-menu-btn {
      bottom: ${ACCESSIBILITY_HIDDEN_BUTTON_MOBILE_BOTTOM_OFFSET} !important;
      right: ${ACCESSIBILITY_HIDDEN_BUTTON_MOBILE_RIGHT_OFFSET} !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  }

  @media (min-width: ${ACCESSIBILITY_MOBILE_BREAKPOINT}px) {
    .asw-menu-btn {
      bottom: ${ACCESSIBILITY_HIDDEN_BUTTON_DESKTOP_BOTTOM_OFFSET} !important;
      right: ${ACCESSIBILITY_HIDDEN_BUTTON_DESKTOP_RIGHT_OFFSET} !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  }
`;

function dispatchAccessibilityEvent(eventName) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(eventName));
}

export function isAccessibilityWidgetReady() {
  if (typeof document === "undefined") {
    return false;
  }

  return Boolean(document.querySelector(".asw-menu-btn"));
}

export function toggleAccessibilityMenu() {
  if (typeof document === "undefined") {
    return;
  }

  document.querySelector(".asw-menu-btn")?.click();
}

function removeManagedAccessibilityAssets() {
  if (typeof document === "undefined") {
    return;
  }

  document
    .querySelectorAll(`[${ACCESSIBILITY_MANAGED_ATTR}="true"]`)
    .forEach((node) => node.remove());

  document.getElementById(ACCESSIBILITY_SCRIPT_ID)?.remove();
  document.getElementById(ACCESSIBILITY_THEME_STYLE_ID)?.remove();

  const runtimeNodes = new Set(
    ACCESSIBILITY_RUNTIME_SELECTORS.flatMap((selector) =>
      Array.from(document.querySelectorAll(selector)),
    ),
  );

  runtimeNodes.forEach((node) => node.remove());
}

function markManagedNodes(nodes) {
  nodes.forEach((node) => {
    if (node instanceof Element) {
      node.setAttribute(ACCESSIBILITY_MANAGED_ATTR, "true");
    }
  });
}

function applyAccessibilityTheme() {
  if (typeof document === "undefined") {
    return;
  }

  document.getElementById(ACCESSIBILITY_THEME_STYLE_ID)?.remove();

  const style = document.createElement("style");
  style.id = ACCESSIBILITY_THEME_STYLE_ID;
  style.textContent = ACCESSIBILITY_THEME_CSS;
  document.head.appendChild(style);
}

export default function AccessibilityWidget() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    clearAccessibilityWidget();

    const headSnapshot = new Set(Array.from(document.head.children));
    const bodySnapshot = new Set(Array.from(document.body.children));

    const script = document.createElement("script");
    script.id = ACCESSIBILITY_SCRIPT_ID;
    script.src = ACCESSIBILITY_SCRIPT_SRC;
    script.defer = true;
    script.setAttribute("data-asw-position", ACCESSIBILITY_POSITION);

    const handleLoad = () => {
      const injectedHeadNodes = Array.from(document.head.children).filter(
        (node) => !headSnapshot.has(node),
      );
      const injectedBodyNodes = Array.from(document.body.children).filter(
        (node) => !bodySnapshot.has(node) && node !== script,
      );

      markManagedNodes([...injectedHeadNodes, ...injectedBodyNodes]);
      applyAccessibilityTheme();
      dispatchAccessibilityEvent(ACCESSIBILITY_READY_EVENT);
    };

    script.addEventListener("load", handleLoad);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      clearAccessibilityWidget();
    };
  }, []);

  return null;
}

export function clearAccessibilityWidget() {
  removeManagedAccessibilityAssets();
  dispatchAccessibilityEvent(ACCESSIBILITY_UNAVAILABLE_EVENT);
}