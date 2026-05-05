import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../context/PermissionContext";
import { useUsers } from "../hooks/useUsers";
import UserPoolCard from "../components/user-pool/UserPoolCard";
import UserPoolFilters from "../components/user-pool/UserPoolFilters";
import UserPoolTable from "../components/user-pool/UserPoolTable";
import Pagination from "../components/Pagination";
import UserPoolModal from "../components/user-pool/UserPoolModal";
import AddUserModal from "../components/user-pool/AddUserModal";
import SuccessAlert from "../components/SuccessAlert";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ResultsCount from "../components/ResultsCount";
import PageHeader from "../components/PageHeader";
import PageHeaderActionButton from "../components/PageHeaderActionButton";
import ErrorAlert from "../components/ErrorAlert";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { useAllAppClients } from "../hooks/useAllAppClients";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE, hasSuperAdminRole } from "../utils/userPoolAccess";
import { PERMISSIONS, USER_ACCESS_EDIT_PERMISSIONS, USER_ROLE_EDIT_PERMISSIONS, USER_STATUS_EDIT_PERMISSIONS } from "../utils/permissionAccess";

const ITEMS_PER_PAGE = 10;

function getUserLabel(user) {
  return user?.displayName || user?.email || "User";
}

export default function UserPool() {
  const outletContext = useOutletContext() || {};
  const colorMode = outletContext.colorMode || "light";
  const currentUser = outletContext.currentUser || {};
  const isLoadingCurrentUser = Boolean(outletContext.isLoadingCurrentUser);
  const { hasAnyPermission, hasPermission } = usePermissionAccess();
  const isDarkMode = colorMode === "dark";
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
    createUser,
    updateUser,
    deleteUser,
  } = useUsers({
    visibleClientIds,
  });
  const [openViewEditModal, setOpenViewEditModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingSelectedUser, setIsLoadingSelectedUser] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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
  const footerClassName = `flex flex-col gap-4 border-t pt-5 lg:flex-row lg:items-center lg:justify-between ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;

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

  const handleConfirmDelete = () => {
    if (!userToDelete) {
      return;
    }

    deleteUser(userToDelete.id, getUserLabel(userToDelete));
    setOpenDelete(false);
    setUserToDelete(null);
  };

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <PageHeader
              title="Users"
              description="Manage user accounts"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-14 w-14 sm:h-16 sm:w-16">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd"/>
                </svg>
              }
              colorMode={colorMode}
            />
          </div>

          {canAddUsers && (
            <div className="self-end sm:self-center">
              <PageHeaderActionButton
                colorMode={colorMode}
                onClick={() => setOpenAddModal(true)}
              >
                + Add User
              </PageHeaderActionButton>
            </div>
          )}
        </div>

        <div className="relative">
          <UserPoolCard colorMode={colorMode}>
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
                <ResultsCount
                  page={page}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalResults={totalResults}
                  currentResultsCount={paginatedUsers.length}
                  variant="glass"
                  colorMode={colorMode}
                />
                <Pagination
                  totalPages={totalPages}
                  currentPage={page}
                  onPageChange={setPage}
                  variant="glass"
                  colorMode={colorMode}
                />
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
              onClose={() => {
                selectedUserRequestRef.current += 1;
                setIsLoadingSelectedUser(false);
                setOpenViewEditModal(false);
              }}
              canEditStatus={canEditUserStatus}
              canEditRole={canEditUserRole}
              canEditAccess={canEditUserAccess}
              includeSuperAdminRoleOptions={isCurrentUserSuperAdmin}
              colorMode={colorMode}
            />
            {canAddUsers && (
              <AddUserModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSubmit={createUser}
                userType={userType}
                canAssignRoles={canEditUserRole}
                canManageUserAccess={canEditUserAccess}
                appClientOptions={appClientOptions}
                isLoadingAppClients={isLoadingAppClients}
                includeSuperAdminRoleOptions={isCurrentUserSuperAdmin}
                colorMode={colorMode}
              />
            )}
          </UserPoolCard>
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
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </>
  );
}