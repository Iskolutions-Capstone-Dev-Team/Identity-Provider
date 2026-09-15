import { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { permissionService } from "../services/permissionService";
import {
  createPermissionLookup,
  hasAnyPermission,
  hasPermission,
} from "../utils/permissionAccess";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['currentUserPermissions'],
    queryFn: async () => {
      try {
        return await permissionService.getCurrentUserPermissions();
      } catch (error) {
        console.error("Failed to load current user permissions:", error);
        return [];
      }
    },
    retry: false,
  });

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