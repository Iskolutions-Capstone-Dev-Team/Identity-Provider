import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showForbiddenAlert, getForbiddenAlertMessage, DEFAULT_FORBIDDEN_ALERT_MESSAGE, IDP_FORBIDDEN_ALERT_EVENT } from '../forbiddenAlert';

describe('forbiddenAlert', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getForbiddenAlertMessage', () => {
    it('returns default message if empty or invalid', () => {
      expect(getForbiddenAlertMessage()).toBe(DEFAULT_FORBIDDEN_ALERT_MESSAGE);
      expect(getForbiddenAlertMessage('   ')).toBe(DEFAULT_FORBIDDEN_ALERT_MESSAGE);
      expect(getForbiddenAlertMessage(null)).toBe(DEFAULT_FORBIDDEN_ALERT_MESSAGE);
    });

    it('returns provided message', () => {
      expect(getForbiddenAlertMessage('Custom error')).toBe('Custom error');
    });
  });

  describe('showForbiddenAlert', () => {
    it('dispatches custom event', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      
      // We must mock Date.now so cooldown works predictably across tests
      vi.setSystemTime(new Date(10000));
      
      showForbiddenAlert('Test Alert');
      
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      const eventArg = dispatchEventSpy.mock.calls[0][0];
      expect(eventArg.type).toBe(IDP_FORBIDDEN_ALERT_EVENT);
      expect(eventArg.detail.message).toBe('Test Alert');
      
      dispatchEventSpy.mockRestore();
    });

    it('throttles duplicate alerts within cooldown', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      
      vi.setSystemTime(new Date(20000));
      showForbiddenAlert('Throttled');
      showForbiddenAlert('Throttled');
      
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1); // Only called once
      dispatchEventSpy.mockRestore();
    });
  });
});
