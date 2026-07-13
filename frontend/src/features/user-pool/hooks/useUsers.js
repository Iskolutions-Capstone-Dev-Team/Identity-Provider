import { useEffect, useRef, useState } from "react";
import { mailService } from "../../../services/mailService";
import { userService } from "../../../services/userService";
import { generateHiddenInvitationPassword } from "../../../utils/passwordRules";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE } from "../../../utils/userPoolAccess";
import { getAccountTypeBackendId, getAccountTypeValue, normalizeAccountType } from "../../../utils/accountTypes";
import { ADMIN_ACCOUNT_CATEGORY, FETCH_LIMIT, FILTER_LOADING_MS, INVITATION_ACCOUNT_SETUP, ITEMS_PER_PAGE, SYSTEM_ADMINISTRATOR_ACCOUNT_TYPE } from "../constants/userPoolConstants";
import { applyUserClientSelections, areSameArrays, getUserDetailPayload, getUserEmailKey, getUserIdKey, isStatusRequestError, mapUserResponse, normalizeAccountTypeId, normalizeClientIds, normalizeEmailAddress, normalizeRoleId, normalizeStatus } from "../utils/userPoolMappers";
import { matchesUserSearch, userHasVisibleClient } from "../utils/userPoolFilters";

const userListRequests = new Map();
const userDetailRequests = new Map();

async function getUserDetailsById(userId, { isAdmin = false } = {}) {
  const normalizedUserId = typeof userId === "string" ? userId.trim() : "";

  if (!normalizedUserId) {
    throw new Error("User ID is required.");
  }

  const requestKey = `${isAdmin ? ADMIN_USER_TYPE : REGULAR_USER_TYPE}:${normalizedUserId}`;
  const currentRequest = userDetailRequests.get(requestKey);

  if (currentRequest) {
    return currentRequest;
  }

  const nextRequest = userService
    .getUser(normalizedUserId)
    .then((response) =>
      mapUserResponse(getUserDetailPayload(response), { isAdmin }),
    )
    .finally(() => {
      userDetailRequests.delete(requestKey);
    });

  userDetailRequests.set(requestKey, nextRequest);
  return nextRequest;
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

  return adminUsers.map((user) => mapUserResponse(user, { isAdmin: true }));
}

async function getUsersByType(userType) {
  const normalizedUserType =
    userType === ADMIN_USER_TYPE ? ADMIN_USER_TYPE : REGULAR_USER_TYPE;
  const currentRequest = userListRequests.get(normalizedUserType);

  if (currentRequest) {
    return currentRequest;
  }

  const nextRequest = (
    normalizedUserType === ADMIN_USER_TYPE ? getAdminUsers() : getRegularUsers()
  ).finally(() => {
    userListRequests.delete(normalizedUserType);
  });

  userListRequests.set(normalizedUserType, nextRequest);
  return nextRequest;
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

export function useUsers({ visibleClientIds = [] } = {}) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState(REGULAR_USER_TYPE);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const latestFetchRef = useRef(0);
  const filterLoadingTimeoutRef = useRef(null);
  const userAccessSelectionsRef = useRef({});
  const userManageableSelectionsRef = useRef({});
  const visibleClientLookup = new Set(normalizeClientIds(visibleClientIds));

  const showFilterLoading = () => {
    if (filterLoadingTimeoutRef.current) {
      window.clearTimeout(filterLoadingTimeoutRef.current);
    }

    setFilterLoading(true);
    filterLoadingTimeoutRef.current = window.setTimeout(() => {
      setFilterLoading(false);
      filterLoadingTimeoutRef.current = null;
    }, FILTER_LOADING_MS);
  };

  const saveClientSelection = (selectionRef, user, clientIds = []) => {
    const nextSelections = { ...selectionRef.current };
    const normalizedClientIds = normalizeClientIds(clientIds);
    const userIdKey = getUserIdKey(user);
    const userEmailKey = getUserEmailKey(user);

    if (normalizedClientIds.length === 0) {
      if (userIdKey) {
        delete nextSelections[userIdKey];
      }

      if (userEmailKey) {
        delete nextSelections[userEmailKey];
      }
    } else {
      if (userIdKey) {
        nextSelections[userIdKey] = normalizedClientIds;
      }

      if (userEmailKey) {
        nextSelections[userEmailKey] = normalizedClientIds;
      }
    }

    selectionRef.current = nextSelections;
  };

  const saveUserAccessSelection = (user, accessibleClientIds = []) => {
    saveClientSelection(userAccessSelectionsRef, user, accessibleClientIds);
  };

  const saveUserManageableSelection = (user, manageableClientIds = []) => {
    saveClientSelection(
      userManageableSelectionsRef,
      user,
      manageableClientIds,
    );
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
      const usersWithLocalSelections = applyUserClientSelections(
        nextUsers,
        userAccessSelectionsRef.current,
        userManageableSelectionsRef.current,
      );

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

    showFilterLoading();
    setPage(1);
    setSearch(nextValue);
  };

  const setStatusFilter = (value) => {
    const nextValue = typeof value === "string" ? value : "";

    showFilterLoading();
    setPage(1);
    setStatus(nextValue);
  };

  const setUserTypeFilter = (value) => {
    const nextValue = value === ADMIN_USER_TYPE ? ADMIN_USER_TYPE : REGULAR_USER_TYPE;
    setPage(1);
    setUserType(nextValue);
  };

  const getUserDetails = async (user) => {
    const isAdminUser = userType === ADMIN_USER_TYPE || user?.isAdmin === true;
    const detailedUser = await getUserDetailsById(user?.id, {
      isAdmin: isAdminUser,
    });
    const [userWithLocalSelections] = applyUserClientSelections(
      [
        {
          ...user,
          ...detailedUser,
          isAdmin: isAdminUser,
        },
      ],
      userAccessSelectionsRef.current,
      userManageableSelectionsRef.current,
    );

    return userWithLocalSelections;
  };

  const createUser = async (newUser) => {
    const isAdminUser = newUser.userType === ADMIN_USER_TYPE;
    const accountType = isAdminUser
      ? getAccountTypeValue(SYSTEM_ADMINISTRATOR_ACCOUNT_TYPE)
      : getAccountTypeValue(newUser.accountType);
    const accountTypeId = isAdminUser
      ? normalizeAccountTypeId(newUser.accountTypeId) ??
        getAccountTypeBackendId(SYSTEM_ADMINISTRATOR_ACCOUNT_TYPE)
      : normalizeAccountTypeId(newUser.accountTypeId);
    const normalizedAccountType = normalizeAccountType(accountType);
    const isInvitationFlow =
      newUser.accountSetupType === INVITATION_ACCOUNT_SETUP;
    const isAdminAccountType = normalizedAccountType === ADMIN_ACCOUNT_CATEGORY;
    const shouldAssignAdminRole =
      isAdminUser || isAdminAccountType;
    const nextAccessibleClientIds = normalizeClientIds(newUser.accessibleClientIds);
    const nextAllowedAppClientIds = normalizeClientIds(newUser.allowedAppClientIds);
    const nextAdminAccessibleClientIds =
      nextAllowedAppClientIds.length > 0
        ? nextAllowedAppClientIds
        : nextAccessibleClientIds;
    const nextManageableClientIds = normalizeClientIds(newUser.manageableClientIds);
    const shouldSyncRegularUserAccess =
      !isAdminUser &&
      !isAdminAccountType &&
      nextAccessibleClientIds.length > 0;
    const shouldSyncAdminManagedClients =
      shouldAssignAdminRole && nextManageableClientIds.length > 0;
    const submissionPassword = isInvitationFlow
      // Invitation-created users still need a backend password, but it stays hidden from the UI.
      ? generateHiddenInvitationPassword()
      : newUser.tempPassword;
    let userWasCreated = false;
    let followUpStep = "create_user";

    if (!normalizedAccountType || !accountTypeId) {
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
        account_type_id: accountTypeId,
        allowed_appclients: shouldAssignAdminRole ? nextAdminAccessibleClientIds : [],
        role_id:
          shouldAssignAdminRole
            ? normalizeRoleId(newUser.roleId)
            : null,
      };

      const createdUserResponse = await userService.createUser(payload);
      userWasCreated = true;
      followUpStep =
        shouldSyncRegularUserAccess || shouldSyncAdminManagedClients
          ? "sync_access"
          : "complete";

      if (shouldSyncRegularUserAccess || shouldSyncAdminManagedClients) {
        const createdUserId =
          createdUserResponse?.createdUserId ||
          (!isAdminUser
            ? (await findRegularUserByEmail(newUser.email))?.id
            : "");

        if (!createdUserId) {
          throw new Error(
            "The user was created, but app-client access could not be saved. Please edit the user and try again.",
          );
        }

        if (shouldSyncRegularUserAccess) {
          await userService.updateUserAccess(createdUserId, nextAccessibleClientIds);
          saveUserAccessSelection(
            {
              id: createdUserId,
              email: newUser.email,
            },
            nextAccessibleClientIds,
          );
        }

        if (shouldSyncAdminManagedClients) {
          await userService.updateAdminManagedClients(
            createdUserId,
            nextManageableClientIds,
          );
          saveUserManageableSelection(
            {
              id: createdUserId,
              email: newUser.email,
            },
            nextManageableClientIds,
          );
        }
      }

      if (isInvitationFlow) {
        followUpStep = "send_invitation";
        await mailService.sendInvitation({
          email: newUser.email,
          accountTypeId: accountTypeId,
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
      await fetchUsers(userType, { showLoading: false });
    } catch (error) {
      console.error("Delete error:", error);
      setFetchError(`Failed to delete ${label}.`);
      throw error;
    }
  };

  const updateUser = async (updatedUser, originalUser = {}) => {
    const isAdminUserUpdate = updatedUser?.userType === ADMIN_USER_TYPE;
    const nextStatus = normalizeStatus(updatedUser?.status);
    const previousStatus = normalizeStatus(originalUser?.status);
    const nextAccessibleClientIds = normalizeClientIds(updatedUser?.accessibleClientIds);
    const previousAccessibleClientIds = normalizeClientIds(originalUser?.accessibleClientIds);
    const nextManageableClientIds = normalizeClientIds(updatedUser?.manageableClientIds);
    const previousManageableClientIds = normalizeClientIds(originalUser?.manageableClientIds);
    const nextRoleId = isAdminUserUpdate ? normalizeRoleId(updatedUser?.roleId) : null;
    const previousRoleId = isAdminUserUpdate
      ? normalizeRoleId(originalUser?.roleId)
      : null;
    const shouldUpdateStatus = Boolean(nextStatus) && nextStatus !== previousStatus;
    const shouldUpdateRole = isAdminUserUpdate && nextRoleId !== previousRoleId;
    const shouldUpdateAccessibleClients = !areSameArrays(
      nextAccessibleClientIds,
      previousAccessibleClientIds,
    );
    const shouldUpdateManageableClients =
      isAdminUserUpdate &&
      !areSameArrays(nextManageableClientIds, previousManageableClientIds);
    let accessWasUpdated = false;
    let manageableClientsWereUpdated = false;
    let roleWasUpdated = false;

    try {
      if (
        !shouldUpdateStatus &&
        !shouldUpdateRole &&
        !shouldUpdateAccessibleClients &&
        !shouldUpdateManageableClients
      ) {
        return;
      }

      if (shouldUpdateAccessibleClients) {
        await userService.updateUserAccess(
          updatedUser.id,
          nextAccessibleClientIds,
        );

        saveUserAccessSelection(updatedUser, nextAccessibleClientIds);
        accessWasUpdated = true;
      }

      if (shouldUpdateManageableClients) {
        await userService.updateAdminManagedClients(
          updatedUser.id,
          nextManageableClientIds,
        );
        saveUserManageableSelection(updatedUser, nextManageableClientIds);
        manageableClientsWereUpdated = true;
      }

      if (shouldUpdateRole) {
        await userService.updateUserRole(updatedUser.id, nextRoleId);
        roleWasUpdated = true;
      }

      if (shouldUpdateStatus) {
        await userService.updateUserStatus(updatedUser.id, nextStatus);
      }

      setSuccessMessage(
        (shouldUpdateAccessibleClients || shouldUpdateManageableClients) &&
          !shouldUpdateStatus &&
          !shouldUpdateRole
          ? shouldUpdateManageableClients && !shouldUpdateAccessibleClients
            ? "Manageable app clients updated."
            : "App client access updated."
          : "User successfully updated!",
      );

      if (
        shouldUpdateStatus ||
        shouldUpdateRole ||
        shouldUpdateAccessibleClients ||
        shouldUpdateManageableClients
      ) {
        await fetchUsers(userType, { showLoading: false });
        return;
      }
    } catch (error) {
      if (accessWasUpdated || manageableClientsWereUpdated || roleWasUpdated) {
        await fetchUsers(userType, { showLoading: false });
      }

      if (accessWasUpdated && isStatusRequestError(error)) {
        throw new Error(
          "App-client access was updated, but the status could not be saved.",
        );
      }

      if (manageableClientsWereUpdated && isStatusRequestError(error)) {
        throw new Error(
          "Manageable app clients were updated, but the status could not be saved.",
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
    const matchesVisibleClients =
      userType !== REGULAR_USER_TYPE ||
      userHasVisibleClient(user, visibleClientLookup);

    return matchesSearch && matchesStatus && matchesVisibleClients;
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

  useEffect(() => {
    return () => {
      if (filterLoadingTimeoutRef.current) {
        window.clearTimeout(filterLoadingTimeoutRef.current);
      }
    };
  }, []);

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
    loading: loading || filterLoading,
    fetchError,
    setFetchError,
    getUserDetails,
    createUser,
    updateUser,
    deleteUser,
  };
}