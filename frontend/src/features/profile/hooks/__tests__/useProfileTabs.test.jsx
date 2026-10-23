import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import {
  useProfileTabs,
  PROFILE_TAB_AUTHENTICATORS,
  PROFILE_TAB_DEVICES,
} from "../useProfileTabs";

const STORAGE_KEY = "test:idp:profile:tab";

function createWrapper(initialUrl = "/profile") {
  return function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[initialUrl]}>
        {children}
      </MemoryRouter>
    );
  };
}

describe("useProfileTabs Hook (Identity-Provider)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to authenticators tab when no param or stored value exists", () => {
    const { result } = renderHook(() => useProfileTabs(STORAGE_KEY), {
      wrapper: createWrapper("/profile"),
    });

    expect(result.current.activeTab).toBe(PROFILE_TAB_AUTHENTICATORS);
  });

  it("initializes with tab from URL search parameters", () => {
    const { result } = renderHook(() => useProfileTabs(STORAGE_KEY), {
      wrapper: createWrapper("/profile?tab=devices"),
    });

    expect(result.current.activeTab).toBe(PROFILE_TAB_DEVICES);
  });

  it("initializes with tab from localStorage when URL param is missing", () => {
    window.localStorage.setItem(STORAGE_KEY, PROFILE_TAB_DEVICES);

    const { result } = renderHook(() => useProfileTabs(STORAGE_KEY), {
      wrapper: createWrapper("/profile"),
    });

    expect(result.current.activeTab).toBe(PROFILE_TAB_DEVICES);
  });

  it("updates activeTab, localStorage, and URL search param on tab change", () => {
    const { result } = renderHook(
      () => {
        const tabs = useProfileTabs(STORAGE_KEY);
        const [searchParams] = useSearchParams();
        return { ...tabs, searchParams };
      },
      {
        wrapper: createWrapper("/profile"),
      }
    );

    expect(result.current.activeTab).toBe(PROFILE_TAB_AUTHENTICATORS);

    act(() => {
      result.current.handleTabChange(PROFILE_TAB_DEVICES);
    });

    expect(result.current.activeTab).toBe(PROFILE_TAB_DEVICES);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(PROFILE_TAB_DEVICES);
    expect(result.current.searchParams.get("tab")).toBe(PROFILE_TAB_DEVICES);
  });

  it("ignores invalid tab names", () => {
    const { result } = renderHook(() => useProfileTabs(STORAGE_KEY), {
      wrapper: createWrapper("/profile"),
    });

    act(() => {
      result.current.handleTabChange("invalid-tab");
    });

    expect(result.current.activeTab).toBe(PROFILE_TAB_AUTHENTICATORS);
  });
});
