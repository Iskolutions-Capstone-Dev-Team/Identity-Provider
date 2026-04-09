import { useEffect, useRef, useState } from "react";
import { mailService } from "../services/mailService";
import { userService } from "../services/userService";
import { generateHiddenInvitationPassword } from "../utils/passwordRules";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE, normalizeRoleNames } from "../utils/userPoolAccess";
import { normalizeAccountType } from "../utils/accountTypes";

const EDITABLE_STATUS_VALUES = new Set(["active", "suspended"]);
const FETCH_LIMIT = 100;
const ITEMS_PER_PAGE = 10;
const INVITATION_ACCOUNT_SETUP = "invitation";
const ADMIN_ACCOUNT_CATEGORY = "admin";

function normalizeClientIds(clientIds = []) {
  return Array.from(
    new Set(
      (Array.isArray(clientIds) ? clientIds : [])
        .map((clientId) => (typeof clientId === "string" ? clientId.trim() : ""))
        .filter(Boolean),
    ),
  );
}

function normalizeClientNames(clientNames = []) {
  return Array.from(
    new Set(
      (Array.isArray(clientNames) ? clientNames : [])
        .map((clientName) =>
          typeof clientName === "string" ? clientName.trim() : "",
        )
        .filter(Boolean),
    ),
  );
}

function normalizeEmailAddress(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function getAccessibleClientIds(user = {}) {
  const directClientIds = normalizeClientIds(
    user?.accessibleClientIds ??
      user?.accessible_client_ids ??
      user?.clientIds ??
      user?.client_ids,
  );

  if (directClientIds.length > 0) {
    return directClientIds;
  }

  return normalizeClientIds(
    (Array.isArray(user?.clients) ? user.clients : []).map(
      (client) => client?.id ?? client?.client_id ?? client?.clientId ?? "",
    ),
  );
}

function getAccessibleClientNames(user = {}) {
  const directClientNames = normalizeClientNames(
    user?.accessibleClientNames ??
      user?.accessible_client_names ??
      user?.clientNames ??
      user?.client_names,
  );

  if (directClientNames.length > 0) {
    return directClientNames;
  }

  return normalizeClientNames(
    (Array.isArray(user?.clients) ? user.clients : []).map(
      (client) =>
        client?.name ?? client?.client_name ?? client?.clientName ?? "",
    ),
  );
}

function areSameArrays(first = [], second = []) {
  const normalizedFirst = [...first].sort();
  const normalizedSecond = [...second].sort();

  if (normalizedFirst.length !== normalizedSecond.length) {
    return false;
  }

  return normalizedFirst.every((value, index) => value === normalizedSecond[index]);
}

function normalizeStatus(status) {
  if (typeof status !== "string") {
    return "";
  }

  const normalizedStatus = status.trim().toLowerCase();
  return EDITABLE_STATUS_VALUES.has(normalizedStatus) ? normalizedStatus : "";
}

function normalizeRoleId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalizedValue = Number.parseInt(value, 10);
  return Number.isInteger(normalizedValue) && normalizedValue > 0
    ? normalizedValue
    : null;
}

function getUserRoleId(user = {}) {
  const roleSource = Array.isArray(user?.roles) ? user.roles[0] : user?.roles;
  const roleCandidates = [
    user?.role_id,
    user?.roleId,
    roleSource?.id,
    user?.role?.id,
  ];

  for (const roleCandidate of roleCandidates) {
    const normalizedRoleId = normalizeRoleId(roleCandidate);

    if (normalizedRoleId !== null) {
      return normalizedRoleId;
    }
  }

  return null;
}

function getUserIdKey(user = {}) {
  if (typeof user?.id !== "string") {
    return "";
  }

  const normalizedId = user.id.trim();
  return normalizedId ? `id:${normalizedId}` : "";
}

function getUserEmailKey(user = {}) {
  if (typeof user?.email !== "string") {
    return "";
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  return normalizedEmail ? `email:${normalizedEmail}` : "";
}

function isStatusRequestError(error) {
  const errorMessage = error?.response?.data?.error || error?.message || "";
  return (
    typeof errorMessage === "string" &&
    errorMessage.toLowerCase().includes("status")
  );
}

function mapUserResponse(user = {}, { isAdmin = false } = {}) {
  const givenName = user.first_name ?? "";
  const middleName = user.middle_name ?? "";
  const surname = user.last_name ?? "";
  const suffix =
    user.name_suffix ??
    user.suffix ??
    user.suffix_name ??
    user.suffixName ??
    "";
  const fullName = [givenName, middleName, surname, suffix]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: user.id,
    email: user.email,
    givenName,
    middleName,
    surname,
    suffix,
    displayName: fullName || user.email || "User",
    status: user.status,
    createdAt: user.created_at,
    roleId: getUserRoleId(user),
    roles: normalizeRoleNames(user.roles),
    accessibleClientIds: getAccessibleClientIds(user),
    accessibleClientNames: getAccessibleClientNames(user),
    isAdmin,
  };
}

function applyRegularUserAccessSelections(users, accessSelections = {}) {
  return users.map((user) => {
    const userIdKey = getUserIdKey(user);
    const userEmailKey = getUserEmailKey(user);
    const accessibleClientIds =
      accessSelections[userIdKey] ??
      accessSelections[userEmailKey] ??
      user.accessibleClientIds ??
      [];

    return {
      ...user,
      accessibleClientIds: normalizeClientIds(accessibleClientIds),
    };
  });
}

function matchesUserSearch(user, searchValue) {
  const normalizedSearch =
    typeof searchValue === "string" ? searchValue.trim().toLowerCase() : "";

  if (!normalizedSearch) {
    return true;
  }

  const fullName = [user.givenName, user.middleName, user.surname, user.suffix]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    user.displayName?.toLowerCase().includes(normalizedSearch) ||
    user.email?.toLowerCase().includes(normalizedSearch) ||
    fullName.includes(normalizedSearch)
  );
}

async function getAllUsersFromEndpoint(fetchPage) {
  const firstPage = await fetchPage(1);
  const collectedUsers = Array.isArray(firstPage?.users) ? [...firstPage.users] : [];
  const lastPage =
    Number.isInteger(firstPage?.last_page) && firstPage.last_page > 1
      ? firstPage.last_page
      : 1;

  if (lastPage > 1) {
    const pageRequests = [];

    for (let nextPage = 2; nextPage <= lastPage; nextPage += 1) {
      pageRequests.push(fetchPage(nextPage));
    }

    const pageResults = await Promise.all(pageRequests);
    pageResults.forEach((pagePayload) => {
      if (Array.isArray(pagePayload?.users)) {
        collectedUsers.push(...pagePayload.users);
      }
    });
  }

  return collectedUsers;
}

async function getRegularUsers() {
  const allUsers = await getAllUsersFromEndpoint((page) =>
    userService.getUsers({ page, limit: FETCH_LIMIT }),
  );

  return allUsers.map((user) => mapUserResponse(user, { isAdmin: false }));
}

async function getAdminUsers() {
  const adminUsers = await getAllUsersFromEndpoint((page) =>
    userService.getAdminUsers({ page, limit: FETCH_LIMIT }),
  );

  const detailedAdminUsers = await Promise.all(
    adminUsers.map(async (user) => {
      try {
        const detailedUser = await userService.getUser(user.id);
        return mapUserResponse(detailedUser, { isAdmin: true });
      } catch (error) {
        console.error(`Failed to load admin user details for ${user.id}:`, error);
        return mapUserResponse(user, { isAdmin: true });
      }
    }),
  );

  return detailedAdminUsers;
}

async function getUsersByType(userType) {
  if (userType === ADMIN_USER_TYPE) {
    return getAdminUsers();
  }

  return getRegularUsers();
}

async function findRegularUserByEmail(email) {
  const normalizedEmail = normalizeEmailAddress(email);

  if (!normalizedEmail) {
    return null;
  }

  const regularUsers = await getRegularUsers();

  return (
    regularUsers.find(
      (user) => normalizeEmailAddress(user?.email) === normalizedEmail,
    ) ?? null
  );
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState(REGULAR_USER_TYPE);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);
  const latestFetchRef = useRef(0);
  const regularUserAccessSelectionsRef = useRef({});

  const saveRegularUserAccessSelection = (user, accessibleClientIds = []) => {
    const nextSelections = { ...regularUserAccessSelectionsRef.current };
    const normalizedAccessibleClientIds = normalizeClientIds(accessibleClientIds);
    const userIdKey = getUserIdKey(user);
    const userEmailKey = getUserEmailKey(user);

    if (normalizedAccessibleClientIds.length === 0) {
      if (userIdKey) {
        delete nextSelections[userIdKey];
      }

      if (userEmailKey) {
        delete nextSelections[userEmailKey];
      }
    } else {
      if (userIdKey) {
        nextSelections[userIdKey] = normalizedAccessibleClientIds;
      }

      if (userEmailKey) {
        nextSelections[userEmailKey] = normalizedAccessibleClientIds;
      }
    }

    regularUserAccessSelectionsRef.current = nextSelections;
  };

  const fetchUsers = async (
    selectedUserType = userType,
    { showLoading = true } = {},
  ) => {
    const fetchId = latestFetchRef.current + 1;
    latestFetchRef.current = fetchId;

    try {
      if (showLoading) {
        setLoading(true);
      }

      const nextUsers = await getUsersByType(selectedUserType);
      const usersWithLocalSelections =
        selectedUserType === REGULAR_USER_TYPE
          ? applyRegularUserAccessSelections(
              nextUsers,
              regularUserAccessSelectionsRef.current,
            )
          : nextUsers;

      if (latestFetchRef.current !== fetchId) {
        return;
      }

      setUsers(usersWithLocalSelections);
      setFetchError("");
      return usersWithLocalSelections;
    } catch (error) {
      console.error("Fetch users error:", error);

      if (latestFetchRef.current !== fetchId) {
        return;
      }

      setUsers([]);
      setFetchError("Unable to load users right now.");
      return [];
    } finally {
      if (showLoading && latestFetchRef.current === fetchId) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUsers(userType);
  }, [userType]);

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

  const setUserTypeFilter = (value) => {
    const nextValue = value === ADMIN_USER_TYPE ? ADMIN_USER_TYPE : REGULAR_USER_TYPE;
    setPage(1);
    setUserType(nextValue);
  };

  const createUser = async (newUser) => {
    const isAdminUser = newUser.userType === ADMIN_USER_TYPE;
    const accountType = !isAdminUser
      ? normalizeAccountType(newUser.accountType)
      : "";
    const isInvitationFlow =
      !isAdminUser && newUser.accountSetupType === INVITATION_ACCOUNT_SETUP;
    const isAdminAccountType = accountType === ADMIN_ACCOUNT_CATEGORY;
    const shouldAssignAdminRole =
      isAdminUser || isAdminAccountType;
    const nextAccessibleClientIds = normalizeClientIds(newUser.accessibleClientIds);
    const nextAllowedAppClientIds = normalizeClientIds(newUser.allowedAppClientIds);
    const shouldSyncRegularUserAccess =
      !isAdminUser &&
      !isAdminAccountType &&
      nextAccessibleClientIds.length > 0;
    const submissionPassword = isInvitationFlow
      // Invitation-created users still need a backend password, but it stays hidden from the UI.
      ? generateHiddenInvitationPassword()
      : newUser.tempPassword;
    let userWasCreated = false;
    let followUpStep = "create_user";

    if (!isAdminUser && !accountType) {
      throw new Error("Select an account type.");
    }

    try {
      const payload = {
        email: newUser.email,
        first_name: newUser.givenName,
        middle_name: newUser.middleName,
        last_name: newUser.surname,
        name_suffix: newUser.suffix,
        password: submissionPassword,
        status: newUser.status,
        account_type: accountType,
        allowed_appclients: shouldAssignAdminRole ? nextAllowedAppClientIds : [],
        role_id:
          shouldAssignAdminRole
            ? normalizeRoleId(newUser.roleId)
            : null,
      };

      const createdUserResponse = await userService.createUser(payload);
      userWasCreated = true;
      followUpStep = shouldSyncRegularUserAccess ? "sync_access" : "complete";

      if (shouldSyncRegularUserAccess) {
        const createdUserId =
          createdUserResponse?.createdUserId ||
          (await findRegularUserByEmail(newUser.email))?.id;

        if (!createdUserId) {
          throw new Error(
            "The user was created, but app-client access could not be saved. Please edit the user and try again.",
          );
        }

        await userService.updateUserAccess(createdUserId, nextAccessibleClientIds);
        saveRegularUserAccessSelection(
          {
            id: createdUserId,
            email: newUser.email,
          },
          nextAccessibleClientIds,
        );
      }

      if (isInvitationFlow) {
        followUpStep = "send_invitation";
        await mailService.sendInvitation({
          email: newUser.email,
          invitationType: accountType,
        });
      }

      followUpStep = "complete";
      setSuccessMessage(
        isInvitationFlow
          ? "User created and invitation sent!"
          : "User successfully created!",
      );
      await fetchUsers(userType, { showLoading: false });
    } catch (error) {
      console.error("Create user error:", error);

      if (userWasCreated) {
        await fetchUsers(userType, { showLoading: false });
        const fallbackMessage =
          followUpStep === "sync_access"
            ? "The user was created, but app-client access could not be completed."
            : followUpStep === "send_invitation"
              ? "The user was created, but the invitation could not be sent."
              : "The user was created, but follow-up setup could not be completed.";

        throw new Error(error?.message || fallbackMessage);
      }

      throw error;
    }
  };

  const deleteUser = async (userId, label) => {
    try {
      setFetchError("");
      await userService.deleteUser(userId);
      setSuccessMessage(`User ${label} deleted successfully`);
      await fetchUsers(userType, { showLoading: false });
    } catch (error) {
      console.error("Delete error:", error);
      setFetchError(`Failed to delete ${label}.`);
    }
  };

  const updateUser = async (updatedUser, originalUser = {}) => {
    const isAdminUserUpdate = updatedUser?.userType === ADMIN_USER_TYPE;
    const nextStatus = normalizeStatus(updatedUser?.status);
    const previousStatus = normalizeStatus(originalUser?.status);
    const nextAccessibleClientIds = normalizeClientIds(updatedUser?.accessibleClientIds);
    const previousAccessibleClientIds = normalizeClientIds(originalUser?.accessibleClientIds);
    const nextRoleId = isAdminUserUpdate ? normalizeRoleId(updatedUser?.roleId) : null;
    const previousRoleId = isAdminUserUpdate
      ? normalizeRoleId(originalUser?.roleId)
      : null;
    const shouldUpdateStatus = Boolean(nextStatus) && nextStatus !== previousStatus;
    const shouldUpdateRole = isAdminUserUpdate && nextRoleId !== previousRoleId;
    const shouldUpdateAccessibleClients =
      !isAdminUserUpdate &&
      !areSameArrays(nextAccessibleClientIds, previousAccessibleClientIds);
    let accessWasUpdated = false;
    let roleWasUpdated = false;

    try {
      if (!shouldUpdateStatus && !shouldUpdateRole && !shouldUpdateAccessibleClients) {
        return;
      }

      if (shouldUpdateAccessibleClients) {
        await userService.updateUserAccess(updatedUser.id, nextAccessibleClientIds);
        saveRegularUserAccessSelection(updatedUser, nextAccessibleClientIds);
        accessWasUpdated = true;
      }

      if (shouldUpdateRole) {
        await userService.updateUserRole(updatedUser.id, nextRoleId);
        roleWasUpdated = true;
      }

      if (shouldUpdateStatus) {
        await userService.updateUserStatus(updatedUser.id, nextStatus);
      }

      setSuccessMessage(
        shouldUpdateAccessibleClients && !shouldUpdateStatus && !shouldUpdateRole
          ? "App client access updated."
          : "User successfully updated!",
      );

      if (shouldUpdateStatus || shouldUpdateRole || shouldUpdateAccessibleClients) {
        await fetchUsers(userType, { showLoading: false });
        return;
      }
    } catch (error) {
      if (accessWasUpdated || roleWasUpdated) {
        await fetchUsers(userType, { showLoading: false });
      }

      if (accessWasUpdated && isStatusRequestError(error)) {
        throw new Error(
          "App-client access was updated, but the status could not be saved.",
        );
      }

      if (roleWasUpdated && isStatusRequestError(error)) {
        throw new Error(
          "The role was updated, but the status could not be saved.",
        );
      }

      console.error("Update user error:", error);
      throw error;
    }
  };

  const filteredUsers = users.filter((user) => {
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
    userType,
    setUserType: setUserTypeFilter,
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