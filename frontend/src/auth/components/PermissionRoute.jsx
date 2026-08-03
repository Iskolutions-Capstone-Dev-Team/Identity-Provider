import { Navigate, useLocation } from "react-router-dom";
import { usePermissionAccess } from "../../providers/PermissionProvider";

export default function PermissionRoute({ children, requiredPermissions = [] }) {
  const location = useLocation();
  const {
    isLoadingPermissions,
    permissionLookup,
    hasAnyPermission,
  } = usePermissionAccess();

  if (isLoadingPermissions) {
    return null;
  }

  if (hasAnyPermission(requiredPermissions)) {
    return children;
  }

  return (
    <Navigate to="/not-found" replace/>
  );
}
