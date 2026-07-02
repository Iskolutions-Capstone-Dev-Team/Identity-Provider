import { describe, it, expect } from 'vitest';
import { 
  getPasswordRequirementChecks, 
  isTemporaryPasswordValid, 
  getTemporaryPasswordValidationMessage,
  generateTemporaryPassword
} from '../passwordRules';

describe('passwordRules', () => {
  describe('getPasswordRequirementChecks', () => {
    it('validates a strong password', () => {
      const checks = getPasswordRequirementChecks('Strong123!');
      expect(checks).toEqual({ length: true, uppercase: true, number: true, special: true });
    });

    it('detects missing requirements', () => {
      const checks = getPasswordRequirementChecks('weak');
      expect(checks).toEqual({ length: false, uppercase: false, number: false, special: false });
    });
  });

  describe('isTemporaryPasswordValid', () => {
    it('returns true for valid password', () => {
      expect(isTemporaryPasswordValid('Valid123!')).toBe(true);
    });

    it('returns false for invalid password', () => {
      expect(isTemporaryPasswordValid('invalid')).toBe(false);
    });
  });

  describe('getTemporaryPasswordValidationMessage', () => {
    it('returns empty string for valid password', () => {
      expect(getTemporaryPasswordValidationMessage('Valid123!')).toBe('');
    });

    it('returns error message for invalid password', () => {
      expect(getTemporaryPasswordValidationMessage('weak')).toContain('must be at least 8 characters');
    });
  });

  describe('generateTemporaryPassword', () => {
    it('generates a valid password', () => {
      const pwd = generateTemporaryPassword();
      expect(pwd.length).toBeGreaterThanOrEqual(12);
      expect(isTemporaryPasswordValid(pwd)).toBe(true);
    });
  });
});
