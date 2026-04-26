import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { usePermissionAccess } from "../context/PermissionContext";
import { buildLogoutPath } from "../auth/utils/logoutRoute";
import { APP_CLIENT_PAGE_PERMISSIONS, PERMISSIONS, REGISTRATION_PAGE_PERMISSIONS, USER_POOL_PAGE_PERMISSIONS } from "../utils/permissionAccess";
import { AppClientOutlineIcon } from "./app-client/AppClientIconBox";

const menuSections = [
  {
    title: "IDENTITY MANAGEMENT",
    items: [
      {
        name: "User Pool",
        tooltipLabel: "User Pool",
        path: "/user-pool",
        requiredPermissions: USER_POOL_PAGE_PERMISSIONS,
        iconPath:
          "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
      },
      {
        name: "Roles",
        tooltipLabel: "Roles",
        path: "/roles",
        requiredPermissions: [PERMISSIONS.VIEW_ROLES],
        iconPath:
          "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
      },
      {
        name: "App Client",
        tooltipLabel: "App Client",
        path: "/app-client",
        requiredPermissions: APP_CLIENT_PAGE_PERMISSIONS,
        icon: ({ className }) => (
          <AppClientOutlineIcon className={className} />
        ),
      },
    ],
  },
  {
    title: "ACTIVITY",
    items: [
      {
        name: "Audit Logs",
        tooltipLabel: "Audit Logs",
        path: "/audit-logs",
        requiredPermissions: [PERMISSIONS.VIEW_AUDIT_LOGS],
        iconPath:
          "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
      },
      {
        name: "Registration",
        tooltipLabel: "Registration",
        path: "/registration",
        requiredPermissions: REGISTRATION_PAGE_PERMISSIONS,
        icon: ({ className }) => (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
          </svg>
        ),
      },
    ],
  },
];

const lightSidebarTheme = {
  desktopShell:
    "border-white/10 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] shadow-[0_32px_90px_-38px_rgba(15,23,42,0.95)]",
  desktopOverlay:
    "bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]",
  brandButton:
    "border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#f8d24e]/20 hover:bg-white/[0.1]",
  brandTitle: "text-white",
  sectionLabel: "text-[#f8d24e]/70",
  activeItem:
    "text-[#f8d24e]",
  inactiveItem:
    "text-white/80 hover:bg-white/[0.07] hover:text-white",
  activeIndicator:
    "bg-[linear-gradient(180deg,#ffe78f_0%,#ffd233_100%)] shadow-[0_0_10px_rgba(248,210,78,0.24)]",
  inactiveIndicator:
    "bg-white/30 shadow-[0_0_6px_rgba(255,255,255,0.08)]",
  tooltip:
    "border-white/10 bg-[linear-gradient(135deg,rgba(123,13,21,0.96),rgba(43,3,7,0.98))] text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.95)]",
  mobileShell:
    "border-white/10 bg-[linear-gradient(135deg,rgba(123,13,21,0.94),rgba(43,3,7,0.98))] shadow-[0_28px_60px_-28px_rgba(15,23,42,0.9)]",
  mobileOverlay:
    "bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_34%)]",
  mobileInactive: "text-white/70 hover:text-white",
  mobileActive: "text-[#f8d24e]",
  mobileIndicator: "bg-[#f8d24e]",
  logoShadow: "drop-shadow-[0_10px_18px_rgba(248,210,78,0.3)]",
};

const darkSidebarTheme = {
  desktopShell:
    "border-white/8 bg-[linear-gradient(180deg,rgba(26,38,54,0.97),rgba(15,22,34,0.98))] shadow-[0_32px_90px_-38px_rgba(2,6,23,0.92)]",
  desktopOverlay:
    "bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(123,13,21,0.18),transparent_30%),radial-gradient(circle_at_left,rgba(255,255,255,0.05),transparent_28%)]",
  brandButton:
    "border-white/8 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-[#f8d24e]/24 hover:bg-white/[0.08]",
  brandTitle: "text-slate-100",
  sectionLabel: "text-[#f8d24e]/72",
  activeItem:
    "text-[#f8d24e]",
  inactiveItem:
    "text-slate-200/78 hover:bg-white/[0.06] hover:text-slate-100",
  activeIndicator:
    "bg-[linear-gradient(180deg,#ffe58a_0%,#ffcf2a_100%)] shadow-[0_0_10px_rgba(248,210,78,0.22)]",
  inactiveIndicator:
    "bg-white/24 shadow-[0_0_6px_rgba(255,255,255,0.07)]",
  tooltip:
    "border-white/8 bg-[linear-gradient(135deg,rgba(27,39,56,0.98),rgba(16,24,37,0.99))] text-slate-100 shadow-[0_18px_40px_-24px_rgba(2,6,23,0.92)]",
  mobileShell:
    "border-white/8 bg-[linear-gradient(135deg,rgba(26,38,54,0.95),rgba(15,22,34,0.98))] shadow-[0_28px_60px_-28px_rgba(2,6,23,0.9)]",
  mobileOverlay:
    "bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.1),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(123,13,21,0.16),transparent_34%),radial-gradient(circle_at_left,rgba(255,255,255,0.05),transparent_30%)]",
  mobileInactive: "text-slate-300/75 hover:text-slate-100",
  mobileActive: "text-[#f8d24e]",
  mobileIndicator: "bg-[#f8d24e]",
  logoShadow: "drop-shadow-[0_10px_18px_rgba(248,210,78,0.22)]",
};

function renderSidebarMenuIcon(item, className) {
  if (typeof item.icon === "function") {
    return item.icon({ className });
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
    </svg>
  );
}

function SidebarIcon({ item, isActive }) {
  const iconClassName = `h-5 w-5 shrink-0 text-current transition duration-300 ${
    isActive ? "scale-[1.04]" : ""
  }`;

  return renderSidebarMenuIcon(item, iconClassName);
}

function SidebarTooltip({ tooltip, className }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {tooltip ? (
        <motion.span
          key={tooltip.label}
          initial={{ opacity: 0, x: -10, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={`pointer-events-none fixed z-[60] hidden -translate-y-1/2 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium lg:block ${className}`}
          role="tooltip"
          style={{
            top: `${tooltip.top}px`,
            left: `${tooltip.left}px`,
            transformOrigin: "left center",
          }}
        >
          {tooltip.label}
        </motion.span>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function getSidebarTooltipPosition(buttonElement) {
  const buttonRect = buttonElement.getBoundingClientRect();

  return {
    left: buttonRect.right + 12,
    top: buttonRect.top + buttonRect.height / 2,
  };
}

function SidebarMenuItem({ isOpen, item, isActive, onClick, theme, onTooltipChange }) {
  const alignmentClassName = isOpen ? "justify-start px-3" : "justify-center px-0";
  const surfaceClassName = isActive ? theme.activeItem : theme.inactiveItem;
  const indicatorClassName = isActive ? theme.activeIndicator : theme.inactiveIndicator;
  const indicatorVisibilityClassName = isActive
    ? "opacity-100"
    : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100";
  const tooltipLabel = item.tooltipLabel ?? item.name;
  const labelClassName = `min-w-0 overflow-hidden whitespace-nowrap text-left text-sm font-semibold tracking-[0.01em] transition-all duration-300 ${
    isOpen ? "ml-3 max-w-40 opacity-100" : "ml-0 max-w-0 opacity-0"
  }`;
  const handleShowTooltip = (buttonElement) => {
    if (isOpen || !onTooltipChange) {
      return;
    }

    onTooltipChange({
      label: tooltipLabel,
      ...getSidebarTooltipPosition(buttonElement),
    });
  };
  const handleHideTooltip = () => {
    onTooltipChange?.(null);
  };
  const handleClick = () => {
    handleHideTooltip();
    onClick();
  };

  return (
    <li className="group relative">
      <span aria-hidden="true" className={`pointer-events-none absolute -left-5 top-1/2 h-9 w-4 -translate-y-1/2 rounded-full transition-all duration-300 ${indicatorClassName} ${indicatorVisibilityClassName}`} />
      <span aria-hidden="true" className={`pointer-events-none absolute -left-[1.35rem] top-1/2 h-11 w-6 -translate-y-1/2 rounded-full blur-[7px] transition-all duration-300 ${
        isActive
          ? "bg-[#f8d24e]/12 opacity-100"
          : "bg-white/6 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
      }`} />
      <button type="button" onClick={handleClick} onMouseEnter={(event) => handleShowTooltip(event.currentTarget)} onMouseLeave={handleHideTooltip} onFocus={(event) => handleShowTooltip(event.currentTarget)} onBlur={handleHideTooltip} aria-label={item.name} className={`relative flex h-14 w-full items-center overflow-hidden rounded-[1.35rem] transition-all duration-300 focus-visible:bg-white/[0.08] ${alignmentClassName} ${surfaceClassName}`}>
        <SidebarIcon
          item={item}
          isActive={isActive}
        />
        <span className={labelClassName}>{item.name}</span>
      </button>
    </li>
  );
}

export default function Sidebar({ isOpen, toggleSidebar, activeColorMode = "light", currentUser = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAnyPermission, isLoadingPermissions } = usePermissionAccess();
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const isDarkMode = activeColorMode === "dark";
  const theme = isDarkMode ? darkSidebarTheme : lightSidebarTheme;
  const railWidthClassName = isOpen ? "w-80" : "w-32";
  const sidebarWidthClassName = isOpen ? "w-72" : "w-24";
  const visibleMenuSections = isLoadingPermissions
    ? []
    : menuSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            hasAnyPermission(item.requiredPermissions),
          ),
        }))
        .filter((section) => section.items.length > 0);
  const mobileMenuItems = visibleMenuSections.flatMap((section) => section.items);

  const handleLogout = () => {
    navigate(
      buildLogoutPath({
        userId: currentUser?.id,
      }),
      { replace: true },
    );
  };

  useEffect(() => {
    if (isOpen) {
      setHoveredTooltip(null);
    }
  }, [isOpen]);

  return (
    <>
      <div className={`hidden shrink-0 overflow-x-hidden transition-[width] duration-300 ease-out lg:block ${railWidthClassName}`}>
        <aside className={`fixed bottom-4 left-4 top-4 z-30 flex flex-col overflow-hidden rounded-[2rem] border backdrop-blur-2xl transition-[width] duration-300 ease-out ${sidebarWidthClassName} ${theme.desktopShell}`}>
          <div className={`pointer-events-none absolute inset-0 ${theme.desktopOverlay}`} />

          <div className="relative flex h-full flex-col">
            <div className="px-3 pt-3">
              <button type="button" onClick={toggleSidebar}
                className={`flex w-full items-center rounded-[1.6rem] border px-3 py-3 text-left transition duration-300 ${
                  isOpen ? "gap-3" : "justify-center"
                } ${theme.brandButton}`}
              >
                <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className={`h-12 w-12 shrink-0 object-contain transition duration-300 hover:scale-[1.03] ${theme.logoShadow}`}/>

                <div className={`min-w-0 overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? "max-w-44 translate-x-0 opacity-100"
                      : "max-w-0 -translate-x-2 opacity-0"
                  }`}
                >
                  <h1 className={`truncate text-2xl font-bold tracking-[0.05em] ${theme.brandTitle}`}>
                    PUPTIDP
                  </h1>
                  <span className="mt-1 inline-flex rounded-full border border-[#f8d24e]/30 bg-[#f8d24e]/15 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#f8d24e]">
                    ver.2026
                  </span>
                </div>
              </button>
            </div>

            <div className="idp-sidebar-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-4 pt-5">
              <div className="space-y-5">
                {visibleMenuSections.map((section) => (
                  <div key={section.title}>
                    <div className="mb-3 flex h-5 items-center overflow-hidden px-2">
                      <p
                        className={`whitespace-nowrap text-[0.65rem] font-semibold tracking-[0.28em] transition-all duration-300 ${
                          isOpen
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0"
                        } ${theme.sectionLabel}`}
                      >
                        {section.title}
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                          <SidebarMenuItem
                            key={item.path}
                            isOpen={isOpen}
                            item={item}
                            isActive={isActive}
                            onClick={() => navigate(item.path)}
                            theme={theme}
                            onTooltipChange={setHoveredTooltip}
                          />
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-3 pb-3 pt-2">
              <ul className="space-y-2">
                <SidebarMenuItem
                  isOpen={isOpen}
                  item={{
                    name: "Logout",
                    tooltipLabel: "Logout",
                    iconPath:
                      "M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15",
                  }}
                  isActive={false}
                  onClick={handleLogout}
                  theme={theme}
                  onTooltipChange={setHoveredTooltip}
                />
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <SidebarTooltip tooltip={!isOpen ? hoveredTooltip : null} className={theme.tooltip} />

      <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[28rem] -translate-x-1/2 lg:hidden">
        <div className={`relative overflow-hidden rounded-[2rem] border p-2 backdrop-blur-2xl ${theme.mobileShell}`}>
          <div className={`pointer-events-none absolute inset-0 ${theme.mobileOverlay}`} />

          <div className="relative flex items-center gap-2">
            {mobileMenuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button key={item.path} type="button" onClick={() => navigate(item.path)}
                  className={`relative flex flex-1 items-center justify-center py-3 transition-all duration-300 ${
                    isActive ? theme.mobileActive : theme.mobileInactive
                  }`}
                >
                  {renderSidebarMenuIcon(
                    item,
                    `h-5 w-5 transition-all duration-300 ${
                      isActive
                        ? "scale-110 drop-shadow-[0_0_14px_rgba(248,210,78,0.72)]"
                        : ""
                    }`,
                  )}
                  <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    } ${theme.mobileIndicator}`}
                  />
                </button>
              );
            })}

            <button type="button" onClick={handleLogout} className={`flex flex-1 items-center justify-center py-3 transition-all duration-300 ${theme.mobileInactive}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
