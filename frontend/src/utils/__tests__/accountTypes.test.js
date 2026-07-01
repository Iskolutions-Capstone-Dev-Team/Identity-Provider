import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  ACCOUNT_TYPE_OPTIONS,
  normalizeAccountType,
  getAccountTypeLabel,
  getAccountTypeValue,
  isAdminAccountType,
  rememberAccountTypeOption,
  getStoredAccountTypeOptions,
  forgetAccountTypeOption
} from '../accountTypes';

describe('accountTypes', () => {
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = (() => {
      let store = {};
      return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; }),
        removeItem: vi.fn(key => { delete store[key]; })
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  describe('normalizeAccountType', () => {
    it('normalizes to lowercase and trims', () => {
      expect(normalizeAccountType('   Admin  ')).toBe('admin');
    });
  });

  describe('getAccountTypeLabel', () => {
    it('returns label for known account type', () => {
      expect(getAccountTypeLabel('student')).toBe('Student');
    });
    
    it('returns empty string for unknown type', () => {
      expect(getAccountTypeLabel('unknown')).toBe('');
    });
  });

  describe('getAccountTypeValue', () => {
    it('returns value for known account type', () => {
      expect(getAccountTypeValue('Student')).toBe('student');
    });
    
    it('returns trimmed string for unknown type', () => {
      expect(getAccountTypeValue(' Unknown ')).toBe('Unknown');
    });
  });

  describe('isAdminAccountType', () => {
    it('returns true for admin type', () => {
      expect(isAdminAccountType('System Administrator')).toBe(true);
      expect(isAdminAccountType('Admin')).toBe(true);
    });

    it('returns false for non-admin type', () => {
      expect(isAdminAccountType('student')).toBe(false);
    });
  });

  describe('storage operations', () => {
    it('remembers a new account type option', () => {
      rememberAccountTypeOption('Custom Role');
      const stored = getStoredAccountTypeOptions();
      expect(stored.length).toBe(1);
      expect(stored[0].value).toBe('custom role');
      expect(stored[0].label).toBe('Custom Role');
    });

    it('forgets an account type option', () => {
      rememberAccountTypeOption('Custom Role');
      forgetAccountTypeOption('custom role');
      const stored = getStoredAccountTypeOptions();
      expect(stored.length).toBe(0);
    });

    it('does not store defaults', () => {
      rememberAccountTypeOption('student');
      const stored = getStoredAccountTypeOptions();
      expect(stored.length).toBe(0); // already in defaults
    });
  });
});
