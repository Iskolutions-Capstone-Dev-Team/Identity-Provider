import { useEffect, useState } from "react";
import { roleService } from "../services/roleService";

function resolveRolePermissionFlag(...candidates) {
  const matchedFlag = candidates.find((value) => typeof value === "boolean");
  return matchedFlag ?? true;
}

function normalizeRole(role = {}) {
  return {
    ...role,
    canUpdate: resolveRolePermissionFlag(
      role.can_update,
      role.canUpdate,
      role.can_edit,
      role.canEdit,
    ),
    canDelete: resolveRolePermissionFlag(
      role.can_delete,
      role.canDelete,
    ),
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

  // =========================
  // FETCH ROLES
  // =========================
  const fetchRoles = async (pageNumber = page, { showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      if (searchKeyword) {
        const data = await roleService.searchRoles(searchKeyword);
        const nextRoles = normalizeRoles(data?.roles);

        setRoles(nextRoles);
        setTotalPages(1);
        setTotalResults(nextRoles.length);
        return;
      }

      const data = await roleService.getRoles(pageNumber);
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

  // =========================
  // CREATE
  // =========================
  const createRole = async (data) => {
    try {
      await roleService.createRole(data);
      setSuccessMessage("Role successfully created!");
      fetchRoles(page, { showLoading: false });
    } catch (error) {
      console.error("Create failed:", error);
    }
  };

  // =========================
  // UPDATE
  // =========================
  const updateRole = async (data) => {
    try {
      await roleService.updateRole(data.id, data);
      setSuccessMessage("Role successfully updated!");
      fetchRoles(page, { showLoading: false });
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // =========================
  // DELETE
  // =========================
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