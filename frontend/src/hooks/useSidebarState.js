import { useEffect, useState } from "react";

const SIDEBAR_STATE_KEY = "idp.sidebar.open";

const readSidebarState = () => {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(SIDEBAR_STATE_KEY) === "true";
  } catch {
    return false;
  }
};

const writeSidebarState = (isOpen) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SIDEBAR_STATE_KEY, String(isOpen));
  } catch {
    // Ignore localStorage write failures.
  }
};

export default function useSidebarState() {
  const [sidebarOpen, setSidebarOpen] = useState(() => readSidebarState());

  useEffect(() => {
    writeSidebarState(sidebarOpen);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
  };
}
