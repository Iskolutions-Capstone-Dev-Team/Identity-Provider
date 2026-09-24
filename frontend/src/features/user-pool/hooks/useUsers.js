import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { mailService } from "../../../services/mailService";
import { userService } from "../../../services/userService";
import { generateHiddenInvitationPassword } from "../../../utils/passwordRules";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE } from "../../../utils/userPoolAccess";
import { getAccountTypeBackendId, getAccountTypeValue, normalizeAccountType, isAdminAccountType } from "../../../utils/accountTypes";
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

async function fetchUsersPage(userType, page, limit, sortBy, order, keyword = "") {
  const normalizedKeyword = typeof keyword === "string" ? keyword.trim() : "";
  const fetchFn = userType === ADMIN_USER_TYPE ? userService.getAdminUsers : userService.getUsers;
  
  const response = await fetchFn({ page, limit, sortBy, order, keyword: normalizedKeyword });
  
  const mappedUsers = (response?.users || []).map((user) => 
    mapUserResponse(user, { isAdmin: userType === ADMIN_USER_TYPE })
  );
  
  return {
    users: mappedUsers,
    total: response?.total_count || 0,
    lastPage: response?.last_page || 1,
  };
}

async function findRegularUserByEmail(email) {
  const normalizedEmail = normalizeEmailAddress(email);

  if (!normalizedEmail) {
    return null;
  }

  const response = await userService.getUsers({ page: 1, limit: 10, keyword: normalizedEmail });
  const regularUsers = (response?.users || []).map((user) => mapUserResponse(user, { isAdmin: false }));

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
  const [sortBy, setSortBy] = useState("created_at");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const latestFetchRef = useRef(0);
  const filterLoadingTimeoutRef = useRef(null);
  const userAccessSelectionsRef = useRef({});
  const userManageableSelectionsRef = useRef({});

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

  const searchKeyword = typeof search === "string" ? search.trim() : "";

  const queryClient = useQueryClient();

  const { data: queryData, isLoading: isQueryLoading, error: queryError } = useQuery({
    queryKey: ['users', userType, page, sortBy, sort, searchKeyword],
    queryFn: async () => {
      const result = await fetchUsersPage(userType, page, ITEMS_PER_PAGE, sortBy, sort, searchKeyword);
      const updatedUsers = applyUserClientSelections(
        result.users,
        userAccessSelectionsRef.current,
        userManageableSelectionsRef.current,
      );
      return {
        ...result,
        users: updatedUsers
      };
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (queryData?.users) {
      setUsers(queryData.users);
      setFetchError("");
    }
  }, [queryData]);

  useEffect(() => {
    if (queryError) {
      console.error("Fetch users error:", queryError);
      setUsers([]);
      setFetchError("Unable to load users right now.");
    }
  }, [queryError]);

  useEffect(() => {
    setLoading(isQueryLoading);
  }, [isQueryLoading]);

  const fetchUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const setSearchKeyword = (value) => {
    const nextValue = typeof value === "string" ? value : "";

    showFilterLoading();
    setPage(1);
    setSearch(nextValue);
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

  const createUserInternal = async (newUser) => {
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
      await fetchUsers(userType, sortBy, sort, { showLoading: false });
    } catch (error) {
      console.error("Create user error:", error);

      if (userWasCreated) {
        await fetchUsers(userType, sortBy, sort, { showLoading: false });
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

  const createUserMutation = useMutation({
    mutationFn: createUserInternal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  const createUser = async (newUser) => {
    return createUserMutation.mutateAsync(newUser);
  };

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, label }) => {
      setFetchError("");
      await userService.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error, variables) => {
      console.error("Delete error:", error);
      setFetchError(`Failed to delete ${variables.label}.`);
    }
  });

  const deleteUser = async (userId, label) => {
    return deleteUserMutation.mutateAsync({ userId, label });
  };

  const updateUserInternal = async (updatedUser, originalUser = {}) => {
    const isAdminUserUpdate = updatedUser?.userType === ADMIN_USER_TYPE;
    const shouldUpdateName = updatedUser?.givenName !== originalUser?.givenName || 
                             updatedUser?.surname !== originalUser?.surname || 
                             updatedUser?.middleName !== originalUser?.middleName || 
                             updatedUser?.suffix !== originalUser?.suffix;
    const shouldUpdateEmail = updatedUser?.email !== originalUser?.email;
    const nextStatus = normalizeStatus(updatedUser?.status);
    const previousStatus = normalizeStatus(originalUser?.status);
    const nextAccessibleClientIds = normalizeClientIds(updatedUser?.accessibleClientIds);
    const previousAccessibleClientIds = normalizeClientIds(originalUser?.accessibleClientIds);
    const nextManageableClientIds = normalizeClientIds(updatedUser?.manageableClientIds);
    const previousManageableClientIds = normalizeClientIds(originalUser?.manageableClientIds);
    const nextAccountType = normalizeAccountType(updatedUser?.accountType);
    const previousAccountType = normalizeAccountType(originalUser?.accountType);
    const nextAccountTypeIsAdmin = isAdminAccountType(nextAccountType);
    const isAdminAccountSetup = isAdminUserUpdate || nextAccountTypeIsAdmin;
    const nextRoleId = isAdminAccountSetup ? normalizeRoleId(updatedUser?.roleId) : null;
    const previousRoleId = isAdminAccountSetup
      ? normalizeRoleId(originalUser?.roleId)
      : null;
    const shouldUpdateStatus = Boolean(nextStatus) && nextStatus !== previousStatus;
    const shouldUpdateRole = isAdminAccountSetup && nextRoleId !== previousRoleId;
    const shouldUpdateAccountType = nextAccountType && nextAccountType !== previousAccountType;
    const shouldUpdateAccessibleClients = !areSameArrays(
      nextAccessibleClientIds,
      previousAccessibleClientIds,
    );
    const shouldUpdateManageableClients =
      isAdminAccountSetup &&
      !areSameArrays(nextManageableClientIds, previousManageableClientIds);
    let accessWasUpdated = false;
    let manageableClientsWereUpdated = false;
    let roleWasUpdated = false;
    let accountTypeWasUpdated = false;
    let nameWasUpdated = false;
    let emailWasUpdated = false;

    try {
      if (
        !shouldUpdateStatus &&
        !shouldUpdateRole &&
        !shouldUpdateAccountType &&
        !shouldUpdateAccessibleClients &&
        !shouldUpdateManageableClients &&
        !shouldUpdateName &&
        !shouldUpdateEmail
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

      if (shouldUpdateRole || shouldUpdateAccountType) {
        
        const nextAccountTypeId = normalizeAccountTypeId(updatedUser?.accountTypeId) || getAccountTypeBackendId(nextAccountType);
        const finalRoleId = nextRoleId !== previousRoleId ? nextRoleId : previousRoleId;
        
        await userService.updateUserDetails(
          updatedUser.id, 
          nextAccountTypeId, 
          finalRoleId, 
          updatedUser.mfaCode
        );
        
        roleWasUpdated = shouldUpdateRole;
        accountTypeWasUpdated = shouldUpdateAccountType;
      }

      if (shouldUpdateName) {
        await userService.updateUserNameAdmin(updatedUser.id, {
          firstName: updatedUser.givenName,
          lastName: updatedUser.surname,
          middleName: updatedUser.middleName,
          suffix: updatedUser.suffix,
        });
        nameWasUpdated = true;
      }

      if (shouldUpdateEmail) {
        await userService.updateUserEmailAdmin(updatedUser.id, updatedUser.email);
        emailWasUpdated = true;
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
        shouldUpdateAccountType ||
        shouldUpdateAccessibleClients ||
        shouldUpdateManageableClients ||
        shouldUpdateName ||
        shouldUpdateEmail
      ) {
        await fetchUsers(userType, sortBy, sort, { showLoading: false });
        return;
      }
    } catch (error) {
      if (accessWasUpdated || manageableClientsWereUpdated || roleWasUpdated || nameWasUpdated || emailWasUpdated) {
        await fetchUsers(userType, sortBy, sort, { showLoading: false });
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

  const updateUserMutation = useMutation({
    mutationFn: async ({ updatedUser, originalUser }) => updateUserInternal(updatedUser, originalUser),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  const updateUser = async (updatedUser, originalUser = {}) => {
    return updateUserMutation.mutateAsync({ updatedUser, originalUser });
  };

  const totalResults = queryData?.total || 0;
  const totalPages = queryData?.lastPage || 1;
  const paginatedUsers = users;

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

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
    sortBy,
    setSortBy,
    sort,
    setSort,
    page,
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