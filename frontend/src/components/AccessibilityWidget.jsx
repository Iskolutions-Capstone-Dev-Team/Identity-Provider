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
const ACCESSIBILITY_THEME_TOKENS = {
  light: {
    cardTitle: "#7b0d15",
    controlBackground: "#fff4dc",
    controlBorder: "rgba(123, 13, 21, 0.12)",
    footerBackground: "rgba(255, 255, 255, 0.92)",
    footerBorder: "rgba(123, 13, 21, 0.1)",
    footerLink: "#7b0d15",
    headerActionBackground: "#fff4dc",
    headerActionIcon: "#7b0d15",
    headerBackground:
      "linear-gradient(135deg, #7b0d15 0%, #3d0910 58%, #1f0205 100%)",
    highlight: "#f8d24e",
    menuBackground:
      "linear-gradient(180deg, rgba(255, 250, 244, 0.98), rgba(255, 255, 255, 0.96))",
    menuBorder: "rgba(123, 13, 21, 0.12)",
    menuShadow: "0 24px 70px -30px rgba(43, 3, 7, 0.65)",
    menuText: "#351018",
    primaryBackground: "linear-gradient(135deg, #7b0d15 0%, #2b0307 100%)",
    primaryHoverBackground: "#f8d24e",
    primaryHoverText: "#7b0d15",
    primaryShadow: "0 18px 40px -26px rgba(123, 13, 21, 0.6)",
    primaryText: "#ffffff",
    secondaryBackground:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 243, 0.92))",
    secondaryBorder: "rgba(123, 13, 21, 0.1)",
    secondaryHoverBackground: "#fff4dc",
    secondaryIcon: "#7b0d15",
    secondaryText: "#4a1921",
    selectedIndicator: "#7b0d15",
    selectBackground: "rgba(255, 255, 255, 0.96)",
    selectBorder: "rgba(123, 13, 21, 0.12)",
    selectText: "#4a1921",
    profileBackground:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 243, 0.94))",
    profileBorder: "rgba(123, 13, 21, 0.1)",
    profileDescription: "#8f6f76",
    profileHoverBackground: "#fffaf2",
    profileHoverBorder: "#f8d24e",
    profileIconBackground:
      "linear-gradient(135deg, rgba(248, 210, 78, 0.16), rgba(255, 238, 196, 0.96))",
    profileIconColor: "#7b0d15",
    profileSelectedBackground: "#fff4dc",
    profileShadow: "0 18px 40px -34px rgba(43, 3, 7, 0.35)",
    profileSelectedShadow: "0 20px 44px -34px rgba(123, 13, 21, 0.36)",
    profileTitle: "#4a1921",
    profileToggleOff: "#ead7bc",
    profileToggleOn: "linear-gradient(135deg, #7b0d15 0%, #4f1018 100%)",
    profileToggleThumb: "#ffffff",
    structureActionHoverBackground: "#fff4dc",
    structureActionHoverText: "#7b0d15",
    structureHeaderIcon: "#ffffff",
    structureItemBackground:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 243, 0.94))",
    structureItemHoverBackground: "#fffaf2",
    structureShadow: "0 20px 50px rgba(43, 3, 7, 0.28)",
    structureTagBackground: "#fff4dc",
    structureTagText: "#7b0d15",
    structureTabActiveBackground: "#ffffff",
    structureTabActiveText: "#7b0d15",
    structureTabHoverBackground: "rgba(248, 210, 78, 0.16)",
    structureTabHoverText: "#7b0d15",
    structureTabText: "#6c4a52",
    structureText: "#351018",
  },
  dark: {
    cardTitle: "#ffe28a",
    controlBackground: "rgba(248, 210, 78, 0.14)",
    controlBorder: "rgba(248, 210, 78, 0.24)",
    footerBackground:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(10, 14, 22, 0.28))",
    footerBorder: "rgba(255, 255, 255, 0.1)",
    footerLink: "#f7dadd",
    headerActionBackground: "rgba(255, 255, 255, 0.08)",
    headerActionIcon: "#ffe28a",
    headerBackground:
      "linear-gradient(135deg, #7b0d15 0%, #263345 55%, #1a121c 100%)",
    highlight: "#f8d24e",
    menuBackground:
      "linear-gradient(180deg, rgba(17, 24, 39, 0.98), rgba(31, 19, 27, 0.96))",
    menuBorder: "rgba(255, 255, 255, 0.1)",
    menuShadow: "0 28px 80px -34px rgba(2, 6, 23, 0.9)",
    menuText: "#f4eaea",
    primaryBackground: "linear-gradient(135deg, #7b0d15 0%, #4f1018 100%)",
    primaryHoverBackground: "#f8d24e",
    primaryHoverText: "#7b0d15",
    primaryShadow: "0 18px 40px -26px rgba(2, 6, 23, 0.82)",
    primaryText: "#ffffff",
    secondaryBackground:
      "linear-gradient(180deg, rgba(9, 14, 25, 0.76), rgba(22, 28, 40, 0.9))",
    secondaryBorder: "rgba(255, 255, 255, 0.1)",
    secondaryHoverBackground: "rgba(248, 210, 78, 0.14)",
    secondaryIcon: "#ffe28a",
    secondaryText: "#f4eaea",
    selectedIndicator: "#f8d24e",
    selectBackground:
      "linear-gradient(180deg, rgba(9, 14, 25, 0.8), rgba(22, 28, 40, 0.92))",
    selectBorder: "rgba(255, 255, 255, 0.12)",
    selectText: "#f4eaea",
    profileBackground:
      "linear-gradient(180deg, rgba(9, 14, 25, 0.84), rgba(22, 28, 40, 0.92))",
    profileBorder: "rgba(255, 255, 255, 0.1)",
    profileDescription: "#d3bcc1",
    profileHoverBackground: "rgba(248, 210, 78, 0.06)",
    profileHoverBorder: "#f8d24e",
    profileIconBackground:
      "linear-gradient(135deg, rgba(248, 210, 78, 0.18), rgba(123, 13, 21, 0.24))",
    profileIconColor: "#ffe28a",
    profileSelectedBackground:
      "linear-gradient(180deg, rgba(123, 13, 21, 0.22), rgba(27, 18, 28, 0.96))",
    profileShadow: "0 18px 42px -34px rgba(2, 6, 23, 0.82)",
    profileSelectedShadow: "0 22px 48px -34px rgba(123, 13, 21, 0.4)",
    profileTitle: "#f9ecee",
    profileToggleOff: "rgba(255, 255, 255, 0.14)",
    profileToggleOn: "linear-gradient(135deg, #7b0d15 0%, #a51f2a 100%)",
    profileToggleThumb: "#fff8f3",
    structureActionHoverBackground: "rgba(248, 210, 78, 0.14)",
    structureActionHoverText: "#ffe28a",
    structureHeaderIcon: "#ffffff",
    structureItemBackground:
      "linear-gradient(180deg, rgba(9, 14, 25, 0.8), rgba(22, 28, 40, 0.92))",
    structureItemHoverBackground: "rgba(248, 210, 78, 0.08)",
    structureShadow: "0 24px 60px rgba(2, 6, 23, 0.55)",
    structureTagBackground: "rgba(248, 210, 78, 0.14)",
    structureTagText: "#ffe28a",
    structureTabActiveBackground: "rgba(255, 255, 255, 0.06)",
    structureTabActiveText: "#ffe28a",
    structureTabHoverBackground: "rgba(248, 210, 78, 0.1)",
    structureTabHoverText: "#ffe28a",
    structureTabText: "#d6c3c7",
    structureText: "#f4eaea",
  },
};

function getAccessibilityThemeCss(colorMode = "light") {
  const theme =
    colorMode === "dark"
      ? ACCESSIBILITY_THEME_TOKENS.dark
      : ACCESSIBILITY_THEME_TOKENS.light;

  return `
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
      background: ${theme.menuBackground} !important;
      border: 1px solid ${theme.menuBorder} !important;
      border-radius: 1.75rem !important;
      box-shadow: ${theme.menuShadow} !important;
      backdrop-filter: blur(20px) !important;
    }

    .asw-container .asw-menu * {
      color: ${theme.menuText} !important;
    }

    .asw-container .asw-menu-header {
      background: ${theme.headerBackground} !important;
      border-bottom: 1px solid ${theme.menuBorder} !important;
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
      fill: ${theme.headerActionIcon} !important;
      color: ${theme.headerActionIcon} !important;
      stroke: ${theme.headerActionIcon} !important;
    }

    .asw-container .asw-menu-reset,
    .asw-container .asw-menu-close {
      background: ${theme.headerActionBackground} !important;
      border: 1px solid ${theme.controlBorder} !important;
      box-shadow: none !important;
    }

    .asw-container .asw-menu-reset:hover,
    .asw-container .asw-menu-reset:focus,
    .asw-container .asw-menu-close:hover,
    .asw-container .asw-menu-close:focus {
      background: ${theme.controlBackground} !important;
      outline: 3px solid rgba(248, 210, 78, 0.28) !important;
    }

    .asw-container .asw-card-title {
      color: ${theme.cardTitle} !important;
      opacity: 1 !important;
    }

    .asw-container .asw-profile-btn {
      background: ${theme.profileBackground} !important;
      border: 1px solid ${theme.profileBorder} !important;
      box-shadow: ${theme.profileShadow} !important;
      color: ${theme.profileTitle} !important;
    }

    .asw-container .asw-profile-btn:hover,
    .asw-container .asw-profile-btn:focus-visible,
    .asw-container .asw-profile-btn.asw-selected {
      background: ${theme.profileSelectedBackground} !important;
      border-color: ${theme.profileHoverBorder} !important;
      box-shadow: ${theme.profileSelectedShadow} !important;
      outline: none !important;
    }

    .asw-container .asw-profile-icon {
      background: ${theme.profileIconBackground} !important;
      color: ${theme.profileIconColor} !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
    }

    .asw-container .asw-profile-icon svg,
    .asw-container .asw-profile-icon svg * {
      fill: ${theme.profileIconColor} !important;
      color: ${theme.profileIconColor} !important;
      stroke: ${theme.profileIconColor} !important;
    }

    .asw-container .asw-profile-title {
      color: ${theme.profileTitle} !important;
    }

    .asw-container .asw-profile-desc {
      color: ${theme.profileDescription} !important;
    }

    .asw-container .asw-profile-toggle {
      background: ${theme.profileToggleOff} !important;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.12) !important;
    }

    .asw-container .asw-profile-btn.asw-selected .asw-profile-toggle {
      background: ${theme.profileToggleOn} !important;
    }

    .asw-container .asw-profile-toggle:after {
      background: ${theme.profileToggleThumb} !important;
    }

    .asw-container .asw-menu .asw-select {
      border: 1px solid ${theme.selectBorder} !important;
      background: ${theme.selectBackground} !important;
      color: ${theme.selectText} !important;
      box-shadow: none !important;
    }

    .asw-container .asw-adjust-font {
      background: ${theme.secondaryBackground} !important;
      border-top: 1px solid ${theme.secondaryBorder} !important;
      border-bottom: 1px solid ${theme.secondaryBorder} !important;
    }

    .asw-container .asw-btn {
      background: ${theme.secondaryBackground} !important;
      border: 1px solid ${theme.secondaryBorder} !important;
      color: ${theme.secondaryText} !important;
      box-shadow: 0 18px 40px -34px rgba(43, 3, 7, 0.35) !important;
    }

    .asw-container .asw-btn svg,
    .asw-container .asw-btn svg *,
    .asw-container .asw-adjust-font svg,
    .asw-container .asw-adjust-font svg * {
      fill: ${theme.secondaryIcon} !important;
      color: ${theme.secondaryIcon} !important;
      stroke: ${theme.secondaryIcon} !important;
    }

    .asw-container .asw-btn:hover,
    .asw-container .asw-btn.asw-selected {
      border-color: ${theme.highlight} !important;
      background: ${theme.secondaryHoverBackground} !important;
    }

    .asw-container .asw-btn.asw-selected span,
    .asw-container .asw-btn.asw-selected svg,
    .asw-container .asw-btn.asw-selected svg * {
      color: ${theme.secondaryIcon} !important;
      fill: ${theme.secondaryIcon} !important;
      stroke: ${theme.secondaryIcon} !important;
    }

    .asw-container .asw-btn.asw-selected:after {
      background-color: ${theme.selectedIndicator} !important;
    }

    .asw-container .asw-adjust-font div[role="button"],
    .asw-container .asw-plus,
    .asw-container .asw-minus {
      background: ${theme.controlBackground} !important;
      border-color: ${theme.controlBorder} !important;
      color: ${theme.secondaryIcon} !important;
    }

    .asw-container .asw-plus:hover,
    .asw-container .asw-minus:hover {
      border-color: ${theme.highlight} !important;
    }

    .asw-container .asw-footer {
      background: ${theme.footerBackground} !important;
      border-top: 1px solid ${theme.footerBorder} !important;
    }

    .asw-container .asw-menu-reset-footer-btn {
      border: 1px solid ${theme.highlight} !important;
      background: ${theme.primaryBackground} !important;
      color: ${theme.primaryText} !important;
      box-shadow: ${theme.primaryShadow} !important;
    }

    .asw-container .asw-menu-reset-footer-btn,
    .asw-container .asw-menu-reset-footer-btn span,
    .asw-container .asw-menu-reset-footer-btn.asw-translate {
      color: ${theme.primaryText} !important;
      -webkit-text-fill-color: ${theme.primaryText} !important;
    }

    .asw-container .asw-menu-reset-footer-btn:hover,
    .asw-container .asw-menu-reset-footer-btn:focus {
      background: ${theme.primaryHoverBackground} !important;
      border-color: ${theme.primaryHoverBackground} !important;
      color: ${theme.primaryHoverText} !important;
      outline: 3px solid rgba(248, 210, 78, 0.2) !important;
    }

    .asw-container .asw-menu-reset-footer-btn.asw-translate,
    .asw-container .asw-menu-reset-footer-btn.asw-translate:hover,
    .asw-container .asw-menu-reset-footer-btn.asw-translate:focus {
      color: ${theme.primaryText} !important;
      -webkit-text-fill-color: ${theme.primaryText} !important;
    }

    .asw-container .asw-menu-reset-footer-btn:hover,
    .asw-container .asw-menu-reset-footer-btn:hover span,
    .asw-container .asw-menu-reset-footer-btn:focus,
    .asw-container .asw-menu-reset-footer-btn:focus span,
    .asw-container .asw-menu-reset-footer-btn.asw-translate:hover,
    .asw-container .asw-menu-reset-footer-btn.asw-translate:focus {
      color: ${theme.primaryHoverText} !important;
      -webkit-text-fill-color: ${theme.primaryHoverText} !important;
    }

    .asw-container .asw-footer a,
    .asw-container .asw-footer a span {
      color: ${theme.footerLink} !important;
    }

    .asw-structure-modal {
      background: ${theme.menuBackground} !important;
      color: ${theme.structureText} !important;
      border: 1px solid ${theme.menuBorder} !important;
      box-shadow: ${theme.structureShadow} !important;
    }

    .asw-structure-header {
      background: ${theme.headerBackground} !important;
      color: #ffffff !important;
    }

    .asw-structure-close > svg {
      fill: ${theme.structureHeaderIcon} !important;
    }

    .asw-tabs-nav {
      background: ${theme.footerBackground} !important;
      border-bottom: 1px solid ${theme.footerBorder} !important;
    }

    .asw-tab-btn {
      color: ${theme.structureTabText} !important;
    }

    .asw-tab-btn:hover {
      color: ${theme.structureTabHoverText} !important;
      background: ${theme.structureTabHoverBackground} !important;
    }

    .asw-tab-btn.asw-active {
      color: ${theme.structureTabActiveText} !important;
      background: ${theme.structureTabActiveBackground} !important;
      box-shadow: none !important;
    }

    .asw-tab-btn.asw-active::after {
      background: ${theme.highlight} !important;
    }

    .asw-structure-nested-wrapper {
      border-left-color: ${theme.secondaryBorder} !important;
    }

    .asw-structure-nested-wrapper:hover {
      border-left-color: ${theme.highlight} !important;
    }

    .asw-structure-item {
      background: ${theme.structureItemBackground} !important;
      border: 1px solid ${theme.secondaryBorder} !important;
      box-shadow: none !important;
    }

    .asw-structure-item:hover,
    .asw-structure-item:focus-within {
      background: ${theme.structureItemHoverBackground} !important;
      border-color: ${theme.highlight} !important;
      box-shadow: ${theme.profileSelectedShadow} !important;
    }

    .asw-structure-tag {
      background: ${theme.structureTagBackground} !important;
      color: ${theme.structureTagText} !important;
    }

    .asw-structure-text {
      color: ${theme.structureText} !important;
    }

    .asw-action-btn:hover {
      background: ${theme.structureActionHoverBackground} !important;
      color: ${theme.structureActionHoverText} !important;
    }

    .asw-structure-overlay {
      background: rgba(9, 13, 20, 0.42) !important;
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
}

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

function applyAccessibilityTheme(colorMode = "light") {
  if (typeof document === "undefined") {
    return;
  }

  document.getElementById(ACCESSIBILITY_THEME_STYLE_ID)?.remove();

  const style = document.createElement("style");
  style.id = ACCESSIBILITY_THEME_STYLE_ID;
  style.textContent = getAccessibilityThemeCss(colorMode);
  document.head.appendChild(style);
}

function getStoredAccessibilityColorMode() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem("idpColorMode") === "dark"
    ? "dark"
    : "light";
}

export default function AccessibilityWidget({ colorMode = "light" }) {
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
      applyAccessibilityTheme(getStoredAccessibilityColorMode());
      dispatchAccessibilityEvent(ACCESSIBILITY_READY_EVENT);
    };

    script.addEventListener("load", handleLoad);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      clearAccessibilityWidget();
    };
  }, []);

  useEffect(() => {
    applyAccessibilityTheme(colorMode);
  }, [colorMode]);

  return null;
}

export function clearAccessibilityWidget() {
  removeManagedAccessibilityAssets();
  dispatchAccessibilityEvent(ACCESSIBILITY_UNAVAILABLE_EVENT);
}