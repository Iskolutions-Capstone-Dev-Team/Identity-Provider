import { useEffect, useState } from "react";
import { permissionService } from "../services/permissionService";

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
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setPermissions([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const data = await permissionService.getPermissions();
        const nextPermissions = data
          .map((permission) => normalizePermission(permission))
          .filter(Boolean);

        if (!cancelled) {
          setPermissions(nextPermissions);
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);

        if (!cancelled) {
          setPermissions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPermissions();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { permissions, loading };
}