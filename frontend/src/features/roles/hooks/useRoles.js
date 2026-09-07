import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../../../services/roleService";
import { formatTimestamp } from "../../../utils/formatTimestamp";

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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sort, setSort] = useState("desc");
  const [viewType, setViewType] = useState(() => {
    return localStorage.getItem("rolesViewType") || "table";
  });
  const searchKeyword = search.trim();

  useEffect(() => {
    localStorage.setItem("rolesViewType", viewType);
  }, [viewType]);

  const fetchRolesFn = async () => {
    const data = await roleService.getRoles({
      page,
      limit,
      keyword: searchKeyword,
      sortBy,
      order: sort
    });
    
    const nextRoles = normalizeRoles(data?.roles);
    const nextTotalPages = Number.isInteger(data?.last_page) && data.last_page > 0 ? data.last_page : 1;
    const nextTotalResults = Number.isInteger(data?.total_count) && data.total_count >= 0 ? data.total_count : nextRoles.length;
    
    if (page > nextTotalPages) {
      setPage(nextTotalPages);
    }
    
    return {
      roles: nextRoles,
      totalPages: nextTotalPages,
      totalResults: nextTotalResults,
    };
  };

  const { data, isLoading } = useQuery({
    queryKey: ['roles', page, limit, searchKeyword, sortBy, sort],
    queryFn: fetchRolesFn,
  });

  const roles = data?.roles || [];
  const totalPages = data?.totalPages || 1;
  const totalResults = data?.totalResults || 0;

  const setSearchKeyword = (value) => {
    const nextValue = typeof value === "string" ? value : "";
    setPage(1);
    setSearch(nextValue);
  };

  const refreshRoles = async () => {
    await queryClient.invalidateQueries({ queryKey: ['roles'] });
    await queryClient.invalidateQueries({ queryKey: ['allRoles'] });
  };

  const createRoleMutation = useMutation({
    mutationFn: async (data) => roleService.createRole(data),
    onSuccess: () => refreshRoles(),
    onError: (error) => console.error("Create failed:", error),
  });

  const createRole = async (data) => createRoleMutation.mutateAsync(data);

  const updateRoleMutation = useMutation({
    mutationFn: async (data) => roleService.updateRole(data.id, data),
    onSuccess: () => refreshRoles(),
    onError: (error) => console.error("Update failed:", error),
  });

  const updateRole = async (data) => updateRoleMutation.mutateAsync(data);

  const deleteRoleMutation = useMutation({
    mutationFn: async (id) => roleService.deleteRole(id),
    onSuccess: () => refreshRoles(),
    onError: (error) => console.error("Delete failed:", error),
  });

  const deleteRole = async (id) => deleteRoleMutation.mutateAsync(id);



  return {
    search,
    setSearch: setSearchKeyword,
    page,
    setPage,
    limit,
    setLimit,
    sortBy,
    setSortBy,
    sort,
    setSort,
    viewType,
    setViewType,
    totalPages,
    totalResults,
    paginatedRoles: roles,
    successMessage: "",
    setSuccessMessage: () => {},
    createRole,
    updateRole,
    deleteRole,
    loading: isLoading,
  };
}