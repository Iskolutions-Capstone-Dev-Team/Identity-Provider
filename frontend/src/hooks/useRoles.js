import { useEffect, useState } from "react";
import { roleService } from "../services/roleService";
import { formatTimestamp } from "../utils/formatTimestamp";

function toPositiveInt(value) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function resolveRoleFlag(...candidates) {
  const matchedFlag = candidates.find((value) => typeof value === "boolean");
  return matchedFlag ?? true;
}

const normalizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

function normalizeTimestamp(value) {
  const normalizedValue = normalizeTextValue(value);

  if (!normalizedValue) {
    return "";
  }

  const parsedDate = new Date(normalizedValue);
  return Number.isNaN(parsedDate.getTime())
    ? normalizedValue
    : formatTimestamp(normalizedValue);
}

function normalizePermissionLabel(permission) {
  if (typeof permission === "string") {
    return permission.trim();
  }

  if (!permission || typeof permission !== "object") {
    return "";
  }

  const label =
    permission.permission ??
    permission.permission_name ??
    permission.name ??
    permission.PermissionName;

  return typeof label === "string" ? label.trim() : "";
}

function normalizePermissionId(permission) {
  if (permission && typeof permission === "object") {
    return toPositiveInt(
      permission.id ??
      permission.permission_id ??
      permission.permissionId ??
      permission.ID,
    );
  }

  return toPositiveInt(permission);
}

function normalizeRolePermissions(role = {}) {
  const rawPermissions = Array.isArray(role.permissions)
    ? role.permissions
    : Array.isArray(role.permission_names)
      ? role.permission_names
      : Array.isArray(role.permissionNames)
        ? role.permissionNames
        : [];
  const rawPermissionIds = Array.isArray(role.permission_ids)
    ? role.permission_ids
    : Array.isArray(role.permissionIds)
      ? role.permissionIds
      : [];

  const permissionLabels = Array.from(
    new Set(
      rawPermissions
        .map((permission) => normalizePermissionLabel(permission))
        .filter(Boolean),
    ),
  );
  const permissionIds = Array.from(
    new Set(
      [...rawPermissionIds, ...rawPermissions]
        .map((permission) => normalizePermissionId(permission))
        .filter((permissionId) => permissionId !== null),
    ),
  );

  return {
    permissionIds,
    permissionLabels,
  };
}

function normalizeRole(role = {}) {
  const { permissionIds, permissionLabels } = normalizeRolePermissions(role);

  return {
    id: toPositiveInt(role.id),
    role_name: normalizeTextValue(role.role_name ?? role.roleName),
    description: normalizeTextValue(role.description),
    created_at: normalizeTimestamp(role.created_at ?? role.createdAt),
    updated_at: normalizeTimestamp(role.updated_at ?? role.updatedAt),
    canEdit: resolveRoleFlag(
      role.can_edit,
      role.canEdit,
      role.can_update,
      role.canUpdate,
    ),
    canDelete: resolveRoleFlag(
      role.can_delete,
      role.canDelete,
    ),
    permissionIds,
    permissionLabels,
  };
}

function normalizeRoles(roles = []) {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles.map((role) => normalizeRole(role));
}

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const searchKeyword = search.trim();

  const fetchRoles = async (pageNumber = page, { showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const data = await roleService.getRoles(pageNumber, {
        keyword: searchKeyword,
      });
      const nextRoles = normalizeRoles(data?.roles);
      const nextTotalPages =
        Number.isInteger(data?.last_page) && data.last_page > 0
          ? data.last_page
          : 1;
      const nextTotalResults =
        Number.isInteger(data?.total_count) && data.total_count >= 0
          ? data.total_count
          : nextRoles.length;

      if (pageNumber > nextTotalPages) {
        setPage(nextTotalPages);
        return;
      }

      setRoles(nextRoles);
      setTotalPages(nextTotalPages);
      setTotalResults(nextTotalResults);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRoles(page);
  }, [page, searchKeyword]);

  const setSearchKeyword = (value) => {
    const nextValue = typeof value === "string" ? value : "";
    setPage(1);
    setSearch(nextValue);
  };

  const createRole = async (data) => {
    try {
      await roleService.createRole(data);
      setSuccessMessage("Role successfully created!");
      fetchRoles(page, { showLoading: false });
    } catch (error) {
      console.error("Create failed:", error);
    }
  };

  const updateRole = async (data) => {
    try {
      await roleService.updateRole(data.id, data);
      setSuccessMessage("Role successfully updated!");
      fetchRoles(page, { showLoading: false });
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const deleteRole = async (id) => {
    try {
      await roleService.deleteRole(id);
      setSuccessMessage("Role successfully deleted!");
      fetchRoles(page, { showLoading: false });
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  return {
    search,
    setSearch: setSearchKeyword,
    page,
    setPage,
    totalPages,
    totalResults,
    paginatedRoles: roles,
    successMessage,
    setSuccessMessage,
    createRole,
    updateRole,
    deleteRole,
    loading,
  };
}