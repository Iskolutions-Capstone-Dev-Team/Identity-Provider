import { describe, it, expect } from 'vitest';
import { 
  normalizeRoleNames,
  isAdminRoleName,
  hasSuperAdminRole,
  resolveUserIsAdmin,
  getAccessibleAppClientNames,
  deriveRolesFromAppClients
} from '../userPoolAccess';

describe('userPoolAccess', () => {
  describe('normalizeRoleNames', () => {
    it('normalizes various role structures into a flat string array', () => {
      const roles = [
        'Admin',
        { role_name: ' User ' },
        { name: 'Guest' },
        null
      ];
      expect(normalizeRoleNames(roles)).toEqual(['Admin', 'User', 'Guest']);
    });
  });

  describe('isAdminRoleName', () => {
    it('returns true for idp:admin', () => {
      expect(isAdminRoleName('idp:admin')).toBe(true);
      expect(isAdminRoleName('IDP:SuperAdmin')).toBe(true);
    });

    it('returns false for other roles', () => {
      expect(isAdminRoleName('student')).toBe(false);
    });
  });

  describe('hasSuperAdminRole', () => {
    it('returns true if any role is superadmin', () => {
      expect(hasSuperAdminRole(['idp:admin', 'idp:superadmin'])).toBe(true);
    });

    it('returns false if no role is superadmin', () => {
      expect(hasSuperAdminRole(['idp:admin'])).toBe(false);
    });
  });

  describe('resolveUserIsAdmin', () => {
    it('resolves true if user is explicitly admin', () => {
      expect(resolveUserIsAdmin({ is_admin: 1 })).toBe(true);
      expect(resolveUserIsAdmin({ isAdmin: 'true' })).toBe(true);
    });

    it('resolves true if user has admin roles', () => {
      expect(resolveUserIsAdmin({ roles: ['idp:admin'] })).toBe(true);
    });

    it('resolves false if user is neither', () => {
      expect(resolveUserIsAdmin({ roles: ['student'] })).toBe(false);
    });
  });

  describe('getAccessibleAppClientNames', () => {
    it('returns names of app clients the user has roles for', () => {
      const roleNames = ['editor', 'viewer'];
      const appClients = [
        { name: 'App1', roleNames: ['editor'] },
        { name: 'App2', roleNames: ['admin'] }
      ];
      expect(getAccessibleAppClientNames(roleNames, appClients)).toEqual(['App1']);
    });
  });

  describe('deriveRolesFromAppClients', () => {
    it('matches selected app clients to available roles', () => {
      const selectedClientIds = [1];
      const appClients = [
        { id: 1, roleNames: ['editor'] },
        { id: 2, roleNames: ['viewer'] }
      ];
      const availableRoles = [
        { id: 101, role_name: 'editor' },
        { id: 102, role_name: 'viewer' }
      ];
      
      const result = deriveRolesFromAppClients(selectedClientIds, appClients, availableRoles);
      expect(result.roleIds).toEqual([101]);
      expect(result.roleNames).toEqual(['editor']);
    });
  });
});
