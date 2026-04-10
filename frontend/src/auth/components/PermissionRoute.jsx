import { Navigate, useLocation } from "react-router-dom";
import { usePermissionAccess } from "../../context/PermissionContext";
import { getFirstAccessiblePath } from "../../utils/permissionAccess";

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

  const fallbackPath = getFirstAccessiblePath(permissionLookup);

  return (
    <Navigate to={fallbackPath === location.pathname ? "/profile" : fallbackPath} replace/>
  );
}