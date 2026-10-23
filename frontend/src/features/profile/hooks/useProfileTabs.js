import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const PROFILE_TAB_AUTHENTICATORS = "authenticators";
export const PROFILE_TAB_DEVICES = "devices";

const VALID_TABS = [PROFILE_TAB_AUTHENTICATORS, PROFILE_TAB_DEVICES];

export function useProfileTabs(storageKey = "idp:profile:tab") {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = () => {
    const urlTab = searchParams.get("tab");
    if (urlTab && VALID_TABS.includes(urlTab)) {
      return urlTab;
    }
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const storedTab = window.localStorage.getItem(storageKey);
        if (storedTab && VALID_TABS.includes(storedTab)) {
          return storedTab;
        }
      }
    } catch {
      // Storage access may be restricted
    }
    return PROFILE_TAB_AUTHENTICATORS;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const handleTabChange = useCallback(
    (nextTab) => {
      if (!VALID_TABS.includes(nextTab)) return;

      setActiveTab(nextTab);

      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(storageKey, nextTab);
        }
      } catch {
        // Ignore storage errors
      }

      setSearchParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          updated.set("tab", nextTab);
          return updated;
        },
        { replace: true }
      );
    },
    [setSearchParams, storageKey]
  );

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && VALID_TABS.includes(urlTab)) {
      if (urlTab !== activeTab) {
        setActiveTab(urlTab);
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(storageKey, urlTab);
          }
        } catch {
          // Ignore
        }
      }
    } else {
      setSearchParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          updated.set("tab", activeTab);
          return updated;
        },
        { replace: true }
      );
    }
  }, [searchParams, activeTab, setSearchParams, storageKey]);

  return {
    activeTab,
    handleTabChange,
  };
}
