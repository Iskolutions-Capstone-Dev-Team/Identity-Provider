import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSidebarState from '../useSidebarState';

describe('useSidebarState hook', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
      writable: true
    });
  });

  it('initializes from localStorage', () => {
    window.localStorage.getItem.mockReturnValue('true');
    const { result } = renderHook(() => useSidebarState());
    
    expect(result.current.sidebarOpen).toBe(true);
    expect(window.localStorage.getItem).toHaveBeenCalledWith('idp.sidebar.open');
  });

  it('toggles sidebar state and updates localStorage', () => {
    window.localStorage.getItem.mockReturnValue('false');
    const { result } = renderHook(() => useSidebarState());
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.sidebarOpen).toBe(true);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('idp.sidebar.open', 'true');
  });

  it('closes sidebar state', () => {
    window.localStorage.getItem.mockReturnValue('true');
    const { result } = renderHook(() => useSidebarState());
    
    act(() => {
      result.current.closeSidebar();
    });
    
    expect(result.current.sidebarOpen).toBe(false);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('idp.sidebar.open', 'false');
  });
});
