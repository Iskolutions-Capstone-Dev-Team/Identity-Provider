import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { useAllRoles } from "./useAllRoles";

const EDITABLE_STATUS_VALUES = new Set(["active", "suspended"]);
const ITEMS_PER_PAGE = 10;

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

function mapUserResponse(user = {}) {
  return {
    id: user.id,
    username: user.user_name,
    email: user.email,
    givenName: user.first_name,
    middleName: user.middle_name,
    surname: user.last_name,
    status: user.status,
    createdAt: user.created_at,
    roles: normalizeRoleNames(user.roles),
  };
}

function matchesUserSearch(user, searchValue) {
  const normalizedSearch =
    typeof searchValue === "string" ? searchValue.trim().toLowerCase() : "";

  if (!normalizedSearch) {
    return true;
  }

  const fullName = [user.givenName, user.middleName, user.surname]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    user.username?.toLowerCase().includes(normalizedSearch) ||
    user.email?.toLowerCase().includes(normalizedSearch) ||
    fullName.includes(normalizedSearch)
  );
}

function normalizeVisibleRoles(userRoles, allRoles) {
  if (allRoles.length === 0) {
    return userRoles;
  }

  return userRoles.filter((roleName) =>
    allRoles.some((role) => role.role_name === roleName),
  );
}

async function getAllUsers() {
  const firstPage = await userService.getUsers(1);
  const collectedUsers = Array.isArray(firstPage?.users) ? [...firstPage.users] : [];
  const lastPage =
    Number.isInteger(firstPage?.last_page) && firstPage.last_page > 1
      ? firstPage.last_page
      : 1;

  if (lastPage > 1) {
    const pageRequests = [];

    for (let nextPage = 2; nextPage <= lastPage; nextPage += 1) {
      pageRequests.push(userService.getUsers(nextPage));
    }

    const pageResults = await Promise.all(pageRequests);
    pageResults.forEach((pagePayload) => {
      if (Array.isArray(pagePayload?.users)) {
        collectedUsers.push(...pagePayload.users);
      }
    });
  }

  return collectedUsers.map(mapUserResponse);
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  const allRoles = useAllRoles();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH USERS
  // =========================
  const fetchUsers = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setFetchError("");
    } catch (error) {
      console.error("Fetch users error:", error);
      setUsers([]);
      setFetchError("Failed to load users. Check the backend connection.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const setSearchKeyword = (value) => {
    const nextValue = typeof value === "string" ? value : "";
    setPage(1);
    setSearch(nextValue);
  };

  const setStatusFilter = (value) => {
    const nextValue = typeof value === "string" ? value : "";
    setPage(1);
    setStatus(nextValue);
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
      await fetchUsers({ showLoading: false });
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
      await fetchUsers({ showLoading: false });
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
      await fetchUsers({ showLoading: false });
    } catch (error) {
      if (rolesWereUpdated) {
        await fetchUsers({ showLoading: false });
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
  const filteredUsers = users
    .map((user) => ({
      ...user,
      roles: normalizeVisibleRoles(user.roles, allRoles),
    }))
    .filter((user) => {
      const matchesSearch = matchesUserSearch(user, search);
      const matchesStatus = status ? user.status === status : true;

      return matchesSearch && matchesStatus;
    });

  const totalResults = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  return {
    users,
    search,
    setSearch: setSearchKeyword,
    status,
    setStatus: setStatusFilter,
    page: currentPage,
    setPage,
    paginatedUsers,
    totalPages,
    totalResults,
    successMessage,
    setSuccessMessage,
    loading,
    fetchError,
    setFetchError,
    createUser,
    updateUser,
    deleteUser,
  };
}
