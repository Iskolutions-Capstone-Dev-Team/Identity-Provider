import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { permissionService } from "../services/permissionService";
import {
  createPermissionLookup,
  hasAnyPermission,
  hasPermission,
} from "../utils/permissionAccess";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchPermissions = async () => {
      try {
        setIsLoadingPermissions(true);
        const nextPermissions =
          await permissionService.getCurrentUserPermissions();

        if (!cancelled) {
          setPermissions(nextPermissions);
        }
      } catch (error) {
        console.error("Failed to load current user permissions:", error);

        if (!cancelled) {
          setPermissions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPermissions(false);
        }
      }
    };

    fetchPermissions();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const permissionLookup = createPermissionLookup(permissions);

    return {
      permissions,
      permissionLookup,
      isLoadingPermissions,
      hasPermission: (permission) =>
        hasPermission(permissionLookup, permission),
      hasAnyPermission: (requiredPermissions) =>
        hasAnyPermission(permissionLookup, requiredPermissions),
    };
  }, [isLoadingPermissions, permissions]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissionAccess() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error(
      "usePermissionAccess must be used inside a PermissionProvider.",
    );
  }

  return context;
}