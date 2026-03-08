import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { roleService } from "../services/roleService";

const EDITABLE_STATUS_VALUES = new Set(["active", "suspended"]);

function normalizeRoleNames(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }

  return Array.from(
    new Set(
      roles
        .map((role) => {
          if (typeof role === "string") {
            return role.trim();
          }

          return role?.role_name?.trim() || "";
        })
        .filter(Boolean),
    ),
  );
}

function normalizeRoleIds(roleIds) {
  return Array.from(
    new Set(
      (Array.isArray(roleIds) ? roleIds : [])
        .map((roleId) => Number.parseInt(roleId, 10))
        .filter((roleId) => Number.isInteger(roleId) && roleId > 0),
    ),
  );
}

function normalizeStatus(status) {
  if (typeof status !== "string") {
    return "";
  }

  const normalizedStatus = status.trim().toLowerCase();
  return EDITABLE_STATUS_VALUES.has(normalizedStatus) ? normalizedStatus : "";
}

function isStatusRequestError(error) {
  return error?.response?.data?.error === "invalid status request";
}

function areSameStringArrays(first = [], second = []) {
  const normalizedFirst = [...first].sort();
  const normalizedSecond = [...second].sort();

  if (normalizedFirst.length !== normalizedSecond.length) {
    return false;
  }

  return normalizedFirst.every((value, index) => value === normalizedSecond[index]);
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [fetchError, setFetchError] = useState("");

  // =========================
  // FETCH ROLES
  // =========================
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.getRoles(1);
        setAllRoles(data.roles || []);
      } catch (error) {
        console.error("Fetch roles error:", error);
      }
    };

    fetchRoles();
  }, []);

  // =========================
  // FETCH USERS
  // =========================
  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (pageNumber) => {
    try {
      const data = await userService.getUsers(pageNumber);

      const mappedUsers = (data.users || []).map((u) => ({
        id: u.id,
        username: u.user_name,
        email: u.email,
        givenName: u.first_name,
        middleName: u.middle_name,
        surname: u.last_name,
        status: u.status,
        createdAt: u.created_at,
        roles: normalizeRoleNames(u.roles),
      }));

      setUsers(mappedUsers);
      setTotalPages(data.last_page || 1);
      setTotalResults(data.total_count || 0);
      setFetchError("");
    } catch (error) {
      console.error("Fetch users error:", error);
      setUsers([]);
      setTotalPages(1);
      setTotalResults(0);
      setFetchError("Failed to load users. Check the backend connection.");
    }
  };

  // =========================
  // CREATE USER
  // =========================
  const createUser = async (newUser) => {
    try {
      const userName = (newUser.username || newUser.email || "").trim();
      const payload = {
        email: newUser.email,
        first_name: newUser.givenName,
        middle_name: newUser.middleName,
        last_name: newUser.surname,
        user_name: userName,
        password: newUser.tempPassword || "TempPass123!",
        roles: newUser.roles,
        status: newUser.status,
      };

      await userService.createUser(payload);

      setSuccessMessage("User successfully created!");
      fetchUsers(page);
    } catch (error) {
      console.error("Create user error:", error);
    }
  };

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (userId, username) => {
    try {
      await userService.deleteUser(userId);
      setSuccessMessage(`User ${username} deleted successfully`);
      fetchUsers(page);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // =========================
  // UPDATE USER
  // =========================
  const updateUser = async (updatedUser, originalUser = {}) => {
    const nextStatus = normalizeStatus(updatedUser?.status);
    const previousStatus = normalizeStatus(originalUser?.status);
    const nextRoles = normalizeRoleNames(updatedUser?.roles);
    const previousRoles = normalizeRoleNames(originalUser?.roles);
    const nextRoleIds = normalizeRoleIds(updatedUser?.roleIds);
    const shouldUpdateStatus = Boolean(nextStatus) && nextStatus !== previousStatus;
    const shouldUpdateRoles = !areSameStringArrays(nextRoles, previousRoles);
    let rolesWereUpdated = false;

    try {
      if (!shouldUpdateStatus && !shouldUpdateRoles) {
        return;
      }

      if (shouldUpdateRoles) {
        await userService.updateUserRoles(updatedUser.id, nextRoleIds);
        rolesWereUpdated = true;
      }

      if (shouldUpdateStatus) {
        await userService.updateUserStatus(updatedUser.id, nextStatus);
      }

      setSuccessMessage("User successfully updated!");
      fetchUsers(page);
    } catch (error) {
      if (rolesWereUpdated) {
        fetchUsers(page);
      }

      if (rolesWereUpdated && isStatusRequestError(error)) {
        throw new Error(
          "Roles were updated, but the backend rejected the status update request.",
        );
      }

      console.error("Update user error:", error);
      throw error;
    }
  };

  // =========================
  // FILTER USERS
  // =========================
  const filteredUsers = users.map((u) => ({
    ...u,
    roles:
      allRoles.length > 0
        ? u.roles.filter((roleName) =>
            allRoles.some((r) => r.role_name === roleName)
          )
        : u.roles,
  })).filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${u.givenName} ${u.surname}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus = status ? u.status === status : true;

    return matchesSearch && matchesStatus;
  });

  return {
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    paginatedUsers: filteredUsers,
    totalPages,
    totalResults,
    successMessage,
    setSuccessMessage,
    fetchError,
    setFetchError,
    createUser,
    updateUser,
    deleteUser,
  };
}
