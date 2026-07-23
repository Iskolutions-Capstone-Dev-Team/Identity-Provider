import { useEffect } from "react";

export const ACCESSIBILITY_READY_EVENT = "idp-accessibility-ready";
export const ACCESSIBILITY_UNAVAILABLE_EVENT = "idp-accessibility-unavailable";

const ACCESSIBILITY_SCRIPT_ID = "idp-accessibility-script";
const ACCESSIBILITY_MANAGED_ATTR = "data-idp-accessibility-managed";
const ACCESSIBILITY_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/sienna-accessibility@latest/dist/sienna-accessibility.umd.js";
const ACCESSIBILITY_RUNTIME_SELECTORS = [
  ".asw-container",
  "[class^='asw-']",
  "[class*=' asw-']",
];
const ACCESSIBILITY_POSITION = "bottom-right";

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