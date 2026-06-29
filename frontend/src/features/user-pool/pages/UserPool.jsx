import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useUsers } from "../hooks/useUsers";
import UserPoolFilters from "../components/UserPoolFilters";
import UserPoolTable from "../components/UserPoolTable";
import Pagination from "../../../components/Pagination";
import UserPoolModal from "../components/UserPoolModal";
import SuccessAlert from "../../../components/SuccessAlert";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import InvitationConfirmModal from "../components/InvitationConfirmModal";
import ResultsCount from "../../../components/ResultsCount";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PageHeader from "../../../components/PageHeader";
import PageHeaderActionButton from "../../../components/PageHeaderActionButton";
import ErrorAlert from "../../../components/ErrorAlert";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { useAllAppClients } from "../../app-clients/hooks/useAllAppClients";
import { mailService } from "../../../services/mailService";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE, hasSuperAdminRole } from "../../../utils/userPoolAccess";
import { PERMISSIONS, USER_ACCESS_EDIT_PERMISSIONS, USER_ROLE_EDIT_PERMISSIONS, USER_STATUS_EDIT_PERMISSIONS } from "../../../utils/permissionAccess";
import { resolveReinviteAccountTypeId } from "../utils/reinviteAccountType";
import { getUserLabel } from "../utils/userLabels";
import { UserPoolIcon } from "../components/userpoolIcons";
import MetricsCard from "../../../components/MetricsCard";
import { UserIcon } from "../../../components/Icons";
import { metricsService } from "../../../services/metricsService";

const ITEMS_PER_PAGE = 10;

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export default function UserPool() {
  const location = useLocation();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const colorMode = outletContext.colorMode || "light";
  const currentUser = outletContext.currentUser || {};
  const isLoadingCurrentUser = Boolean(outletContext.isLoadingCurrentUser);
  const { hasAnyPermission, hasPermission } = usePermissionAccess();
  const isDarkMode = colorMode === "dark";
  const [userMetrics, setUserMetrics] = useState(null);

  useEffect(() => {
    metricsService.getUserMetrics().then(setUserMetrics).catch(() => {});
  }, []);
  const isCurrentUserSuperAdmin = hasSuperAdminRole(currentUser?.roles);
  const {
    appClients: appClientOptions,
    isLoadingAppClients,
  } = useAllAppClients({
    enabled: !isLoadingCurrentUser,
  });
  const shouldShowAllRegularUsers = isCurrentUserSuperAdmin;
  const visibleClientIds = shouldShowAllRegularUsers
    ? []
    : appClientOptions.map((client) => client?.id).filter(Boolean);
  const {
    search,
    setSearch,
    userType,
    setUserType,
    status,
    setStatus,
    page,
    setPage,
    paginatedUsers,
    totalPages,
    totalResults,
    successMessage,
    setSuccessMessage,
    fetchError,
    setFetchError,
    loading,
    getUserDetails,
    updateUser,
    deleteUser,
  } = useUsers({
    visibleClientIds,
  });
  const [openViewEditModal, setOpenViewEditModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingSelectedUser, setIsLoadingSelectedUser] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openReinvite, setOpenReinvite] = useState(false);
  const [userToReinvite, setUserToReinvite] = useState(null);
  const [isSendingReinvite, setIsSendingReinvite] = useState(false);
  const selectedUserRequestRef = useRef(0);
  const showLoading = useDelayedLoading(
    loading ||
      (userType === REGULAR_USER_TYPE &&
        (isLoadingAppClients || isLoadingCurrentUser)),
  );
  const canAddUsers = hasPermission(PERMISSIONS.ADD_USER);
  const canDeleteUsers = hasPermission(PERMISSIONS.DELETE_USER);
  const canViewAdminUsers = hasPermission(PERMISSIONS.VIEW_ALL_USERS);
  const canEditUserStatus = hasAnyPermission(USER_STATUS_EDIT_PERMISSIONS);
  const canEditUserRole = hasAnyPermission(USER_ROLE_EDIT_PERMISSIONS);
  const canEditUserAccess = hasAnyPermission(USER_ACCESS_EDIT_PERMISSIONS);
  const canEditAdminUsers =
    canEditUserStatus || canEditUserRole || canEditUserAccess;
  const canEditRegularUsers = canEditUserStatus || canEditUserAccess;
  const canManageAdminUsers = isCurrentUserSuperAdmin;
  const canViewCurrentUserType =
    userType === ADMIN_USER_TYPE ? canManageAdminUsers : true;
  const canEditCurrentUserType =
    userType === ADMIN_USER_TYPE
      ? canManageAdminUsers && canEditAdminUsers
      : canEditRegularUsers;
  const canDeleteCurrentUserType =
    userType === ADMIN_USER_TYPE
      ? canManageAdminUsers && canDeleteUsers
      : canDeleteUsers;
  const canReinviteCurrentUserType =
    userType === REGULAR_USER_TYPE && canAddUsers;
  const footerClassName = `flex flex-col items-center gap-4 pt-5 lg:grid lg:grid-cols-3 ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;

  useEffect(() => {
    const routeState = location.state || {};

    if (routeState.userType) {
      setUserType(routeState.userType);
    }

    if (routeState.successMessage) {
      setSuccessMessage(routeState.successMessage);
    }

    if (routeState.userType || routeState.successMessage) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    location.pathname,
    location.state,
    navigate,
    setSuccessMessage,
    setUserType,
  ]);

  const openUserModal = async (user, mode) => {
    const canOpenModal =
      mode === "edit" ? canEditCurrentUserType : canViewCurrentUserType;

    if (!canOpenModal) {
      return;
    }

    const requestId = selectedUserRequestRef.current + 1;
    selectedUserRequestRef.current = requestId;
    setSelectedUser(user);
    setModalMode(mode);
    setOpenViewEditModal(true);
    setIsLoadingSelectedUser(true);

    try {
      const detailedUser = await getUserDetails(user);

      if (selectedUserRequestRef.current === requestId) {
        setSelectedUser(detailedUser);
      }
    } catch (error) {
      console.error("Fetch user details error:", error);

      if (selectedUserRequestRef.current === requestId) {
        setFetchError("Unable to load the latest user details.");
      }
    } finally {
      if (selectedUserRequestRef.current === requestId) {
        setIsLoadingSelectedUser(false);
      }
    }
  };

  const handleView = (user) => {
    openUserModal(user, "view");
  };

  const handleEdit = (user) => {
    openUserModal(user, "edit");
  };

  const handleDeleteClick = (user) => {
    if (!canDeleteCurrentUserType) {
      return;
    }

    setUserToDelete(user);
    setOpenDelete(true);
  };

  const handleReinviteClick = (user) => {
    if (!canReinviteCurrentUserType) {
      return;
    }

    setUserToReinvite(user);
    setOpenReinvite(true);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) {
      return;
    }

    deleteUser(userToDelete.id, getUserLabel(userToDelete));
    setOpenDelete(false);
    setUserToDelete(null);
  };

  const handleConfirmReinvite = async () => {
    if (!userToReinvite || isSendingReinvite) {
      return;
    }

    const reinviteUserLabel = getUserLabel(userToReinvite);

    try {
      setIsSendingReinvite(true);
      setFetchError("");

      const userDetails = await getUserDetails(userToReinvite);
      const accountTypeId = await resolveReinviteAccountTypeId(userDetails);

      if (!accountTypeId) {
        throw new Error("The user's account type is unavailable.");
      }

      await mailService.sendInvitation({
        email: userDetails.email,
        accountTypeId,
      });

      setSuccessMessage(`Invitation resent to ${userDetails.email}.`);
      setOpenReinvite(false);
      setUserToReinvite(null);
      setOpenViewEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Reinvitation error:", error);
      setFetchError(
        getRequestErrorMessage(
          error,
          `Unable to resend invitation to ${reinviteUserLabel}.`,
        ),
      );
      setOpenReinvite(false);
      setUserToReinvite(null);
      setOpenViewEditModal(false);
      setSelectedUser(null);
    } finally {
      setIsSendingReinvite(false);
    }
  };

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-5 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        <Breadcrumbs
          colorMode={colorMode}
          items={[
            {
              label: "User",
            },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <PageHeader
              title="User"
              description="Manage user accounts"
              icon={<UserPoolIcon className="h-14 w-14 sm:h-16 sm:w-16" />}
              colorMode={colorMode}
            />
          </div>

          {canAddUsers && (
            <div className="w-full sm:w-auto sm:self-center">
              <PageHeaderActionButton
                colorMode={colorMode}
                onClick={() =>
                  navigate(`/user-pool/create?type=${userType}`, {
                    state: { userType },
                  })
                }
              >
                + Add User
              </PageHeaderActionButton>
            </div>
          )}
        </div>

        <MetricsCard
          colorMode={colorMode}
          isLoading={showLoading}
          metrics={(Array.isArray(userMetrics) ? userMetrics : []).map((m) => ({
            title: m.title,
            value: m.value,
            Icon: UserIcon,
          }))}
        />

        <div className="relative">
          <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">
            <ErrorAlert
              message={fetchError}
              onClose={() => setFetchError("")}
            />
            <UserPoolFilters
              search={search}
              setSearch={setSearch}
              userType={userType}
              setUserType={setUserType}
              status={status}
              setStatus={setStatus}
              showAdminUserType={canViewAdminUsers}
              colorMode={colorMode}
            />
            <UserPoolTable
              loading={showLoading}
              users={paginatedUsers}
              userType={userType}
              appClients={appClientOptions}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              showViewAction={canViewCurrentUserType}
              showEditAction={canEditCurrentUserType}
              showDeleteAction={canDeleteCurrentUserType}
              colorMode={colorMode}
            />
            {!showLoading && (
              <div className={footerClassName}>
                <div className="flex w-full justify-center lg:justify-start">
                  <ResultsCount
                    page={page}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalResults={totalResults}
                    currentResultsCount={paginatedUsers.length}
                    variant="glass"
                    colorMode={colorMode}
                  />
                </div>
                <div className="flex w-full justify-center">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={page}
                    onPageChange={setPage}
                    variant="glass"
                    colorMode={colorMode}
                  />
                </div>
                <div className="hidden lg:block"></div>
              </div>
            )}
            <UserPoolModal
              open={openViewEditModal}
              mode={modalMode}
              user={selectedUser}
              userType={userType}
              appClientOptions={appClientOptions}
              isLoadingAppClients={isLoadingAppClients}
              isLoadingUserDetails={isLoadingSelectedUser}
              onSubmit={updateUser}
              onReinvite={handleReinviteClick}
              onClose={() => {
                selectedUserRequestRef.current += 1;
                setIsLoadingSelectedUser(false);
                setOpenViewEditModal(false);
              }}
              canEditStatus={canEditUserStatus}
              canEditRole={canEditUserRole}
              canEditAccess={canEditUserAccess}
              canReinvite={canReinviteCurrentUserType}
              includeSuperAdminRoleOptions={isCurrentUserSuperAdmin}
              colorMode={colorMode}
            />
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        open={openDelete}
        message={`Delete user ${getUserLabel(userToDelete)}?`}
        theme="glass"
        colorMode={colorMode}
        onCancel={() => {
          setOpenDelete(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <InvitationConfirmModal
        open={openReinvite}
        title="Resend Invitation?"
        description={`Resend an account activation email to ${getUserLabel(userToReinvite)}?`}
        confirmLabel="Resend Invite"
        isSubmitting={isSendingReinvite}
        colorMode={colorMode}
        onCancel={() => {
          if (isSendingReinvite) {
            return;
          }

          setOpenReinvite(false);
          setUserToReinvite(null);
        }}
        onConfirm={handleConfirmReinvite}
      />
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </>
  );
}