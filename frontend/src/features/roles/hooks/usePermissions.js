import { useQuery } from "@tanstack/react-query";
import { permissionService } from "../../../services/permissionService";

const toPositiveInt = (value) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

function normalizePermission(permission = {}) {
  const id = toPositiveInt(
    permission?.id ??
      permission?.permission_id ??
      permission?.permissionId ??
      permission?.ID,
  );
  const name =
    permission?.permission ??
    permission?.permission_name ??
    permission?.name ??
    permission?.PermissionName ??
    "";
  const label = typeof name === "string" ? name.trim() : "";

  if (id === null || !label) {
    return null;
  }

  return {
    id,
    permission: label,
  };
}

export function usePermissions({ enabled = true } = {}) {
  const fetchPermissionsFn = async () => {
    const data = await permissionService.getPermissions();
    return data.map(normalizePermission).filter(Boolean);
  };

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissionsFn,
    enabled,
  });

  return { permissions, loading: isLoading };
}