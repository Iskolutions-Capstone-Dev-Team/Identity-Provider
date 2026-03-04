import { useState, useMemo, useEffect } from "react";
import { roleService } from "../services/roleService";

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH ROLES
  // =========================
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getRoles(page);

      setRoles(data.roles);
      setTotalPages(data.last_page);
      setTotalResults(data.total_count);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page]);

  // =========================
  // CREATE
  // =========================
  const createRole = async (data) => {
    try {
      await roleService.createRole(data);
      setSuccessMessage("Role successfully created!");
      fetchRoles();
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
      fetchRoles();
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
      fetchRoles();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // =========================
  // SEARCH (frontend only)
  // =========================
  const filteredRoles = roles.filter((r) =>
    r.role_name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    totalResults,
    paginatedRoles: filteredRoles,
    successMessage,
    setSuccessMessage,
    createRole,
    updateRole,
    deleteRole,
    loading,
  };
}