import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCurrentUser, formatCurrentUserName, hasCurrentUserRole, EMPTY_CURRENT_USER } from '../useCurrentUser';
import { userService } from '../../services/userService';

vi.mock('../../services/userService', () => ({
  userService: {
    getMe: vi.fn()
  }
}));

describe('useCurrentUser hook & utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatCurrentUserName', () => {
    it('formats a full name correctly', () => {
      const user = { firstName: 'John', middleName: 'A.', lastName: 'Doe', suffix: 'Jr.' };
      expect(formatCurrentUserName(user)).toBe('John A. Doe Jr.');
    });

    it('returns "Profile" if all fields are empty', () => {
      expect(formatCurrentUserName(EMPTY_CURRENT_USER)).toBe('Profile');
    });
  });

  describe('hasCurrentUserRole', () => {
    it('returns true if the user has the role', () => {
      const user = { ...EMPTY_CURRENT_USER, roles: ['Admin', 'User'] };
      expect(hasCurrentUserRole(user, 'admin')).toBe(true);
    });

    it('returns false if the user does not have the role', () => {
      const user = { ...EMPTY_CURRENT_USER, roles: ['User'] };
      expect(hasCurrentUserRole(user, 'admin')).toBe(false);
    });
  });

  describe('useCurrentUser hook', () => {
    it('fetches and maps the current user on mount', async () => {
      userService.getMe.mockResolvedValue({
        id: '123',
        first_name: 'Jane',
        roles: ['Admin']
      });

      const { result } = renderHook(() => useCurrentUser());
      
      expect(result.current.isLoadingCurrentUser).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoadingCurrentUser).toBe(false);
      });

      expect(result.current.currentUser.id).toBe('123');
      expect(result.current.currentUser.firstName).toBe('Jane');
      expect(result.current.currentUser.roles).toEqual(['Admin']);
    });

    it('handles fetch errors by setting empty user', async () => {
      userService.getMe.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useCurrentUser());

      await waitFor(() => {
        expect(result.current.isLoadingCurrentUser).toBe(false);
      });

      expect(result.current.currentUser).toEqual(EMPTY_CURRENT_USER);
    });
  });
});
