import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useUsers } from "../hooks/useUsers";
import { useUserPoolPage } from "../hooks/useUserPoolPage";
import UserPoolFilters from "../components/UserPoolFilters";
import UserPoolTable from "../components/UserPoolTable";
import UserPoolCards from "../components/UserPoolCards";
import Pagination from "../../../components/Pagination";
import UserPoolModal from "../components/UserPoolModal";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import InvitationConfirmModal from "../components/InvitationConfirmModal";
import ErrorAlert from "../../../components/ErrorAlert";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { useAllAppClients } from "../../app-clients/hooks/useAllAppClients";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE, hasSuperAdminRole } from "../../../utils/userPoolAccess";
import { PERMISSIONS, USER_ACCESS_EDIT_PERMISSIONS, USER_ROLE_EDIT_PERMISSIONS, USER_STATUS_EDIT_PERMISSIONS } from "../../../utils/permissionAccess";
import { getUserLabel } from "../utils/userLabels";
import MetricsCard from "../../../components/MetricsCard";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Users, Plus, User, Archive } from "lucide-react";
import { createPortal } from "react-dom";

const ITEMS_PER_PAGE = 10;

export default function UserPool() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const colorMode = outletContext.colorMode || "light";
  const currentUser = outletContext.currentUser || {};
  const isLoadingCurrentUser = Boolean(outletContext.isLoadingCurrentUser);
  const { globalViewType, setGlobalViewType } = outletContext;
  const { hasAnyPermission, hasPermission } = usePermissionAccess();

  const isCurrentUserSuperAdmin = hasSuperAdminRole(currentUser?.roles);
  const { appClients: appClientOptions, isLoadingAppClients } = useAllAppClients({
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
    sortBy,
    setSortBy,
    sort,
    setSort,
    page,
    setPage,
    paginatedUsers,
    totalPages,
    totalResults,
    setSuccessMessage,
    fetchError,
    setFetchError,
    loading,
    getUserDetails,
    updateUser,
    deleteUser,
  } = useUsers({ visibleClientIds });

  const canAddUsers = hasPermission(PERMISSIONS.ADD_USER);
  const canDeleteUsers = hasPermission(PERMISSIONS.DELETE_USER);
  const canViewAdminUsers = hasPermission(PERMISSIONS.VIEW_ADMINS);
  const canEditUserStatus = hasAnyPermission(USER_STATUS_EDIT_PERMISSIONS);
  const canEditUserRole = hasAnyPermission(USER_ROLE_EDIT_PERMISSIONS);
  const canEditUserAccess = hasAnyPermission(USER_ACCESS_EDIT_PERMISSIONS);
  const canEditAdminUsers = canEditUserStatus || canEditUserRole || canEditUserAccess;
  const canEditRegularUsers = canEditUserStatus || canEditUserAccess;
  const canManageAdminUsers = isCurrentUserSuperAdmin;
  const canViewCurrentUserType = userType === ADMIN_USER_TYPE ? canManageAdminUsers : true;
  const canEditCurrentUserType = userType === ADMIN_USER_TYPE ? canManageAdminUsers && canEditAdminUsers : canEditRegularUsers;
  const canDeleteCurrentUserType = userType === ADMIN_USER_TYPE ? canManageAdminUsers && canDeleteUsers : canDeleteUsers;
  const canReinviteCurrentUserType = userType === REGULAR_USER_TYPE && canAddUsers;

  const pageState = useUserPoolPage({
    globalViewType,
    setGlobalViewType,
    userType,
    setUserType,
    getUserDetails,
    deleteUser,
    setSuccessMessage,
    setFetchError,
    canEditCurrentUserType,
    canViewCurrentUserType,
    canDeleteCurrentUserType,
    canReinviteCurrentUserType,
  });

  useEffect(() => {
    if (userType === ADMIN_USER_TYPE && !canViewAdminUsers) {
      setUserType(REGULAR_USER_TYPE);
    }
  }, [userType, canViewAdminUsers, setUserType]);

  const {
    userMetrics,
    breadcrumbsContainer,
    openViewEditModal,
    modalMode,
    selectedUser,
    isLoadingSelectedUser,
    openDelete,
    setOpenDelete,
    userToDelete,
    setUserToDelete,
    openReinvite,
    setOpenReinvite,
    userToReinvite,
    setUserToReinvite,
    isSendingReinvite,
    viewType,
    setViewType,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleReinviteClick,
    handleConfirmDelete,
    handleConfirmReinvite,
    closeViewEditModal,
  } = pageState;

  const showLoading = useDelayedLoading(
    loading || (userType === REGULAR_USER_TYPE && (isLoadingAppClients || isLoadingCurrentUser)),
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {breadcrumbsContainer && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>User</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        breadcrumbsContainer
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15] rounded-xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Pool</h1>
            <p className="text-muted-foreground">Manage user accounts and roles.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCurrentUserSuperAdmin && (
            <Button variant="outline" className="h-11 px-6 rounded-lg font-bold text-[15px] transition-colors duration-200" onClick={() => navigate("/user-pool/archived")}>
              <Archive className="w-4 h-4 mr-2" />
              Archived Users
            </Button>
          )}

          {canAddUsers && (
            <Button className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] h-11 px-6 rounded-lg font-bold text-[15px] transition-colors duration-200" onClick={() => navigate(`/user-pool/create?type=${userType}`, { state: { userType } })}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </div>

      <MetricsCard
        colorMode={colorMode}
        isLoading={showLoading}
        metrics={(Array.isArray(userMetrics) ? userMetrics : []).map((m) => ({
          title: m.title,
          value: m.value,
          Icon: User,
        }))}
      />

      <div className="flex flex-col gap-6">
        <ErrorAlert message={fetchError} onClose={() => setFetchError("")} />

        <UserPoolFilters
          search={search}
          setSearch={setSearch}
          userType={userType}
          setUserType={setUserType}
          status={status}
          setStatus={setStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sort={sort}
          setSort={setSort}
          viewType={viewType}
          setViewType={setViewType}
          showAdminUserType={canViewAdminUsers}
          colorMode={colorMode}
        />

        {viewType === "table" ? (
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
        ) : (
          <UserPoolCards
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
            search={search}
            setSearch={setSearch}
          />
        )}

        {!showLoading && (
          <div className="w-full">
            <Pagination
              totalPages={totalPages}
              currentPage={page}
              onPageChange={setPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalResults={totalResults}
              currentResultsCount={paginatedUsers.length}
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
          onReinvite={handleReinviteClick}
          onClose={closeViewEditModal}
          canEditStatus={canEditUserStatus}
          canEditRole={canEditUserRole}
          canEditAccess={canEditUserAccess}
          canReinvite={canReinviteCurrentUserType}
          includeSuperAdminRoleOptions={isCurrentUserSuperAdmin}
          colorMode={colorMode}
        />
      </div>

      <DeleteConfirmModal
        open={openDelete}
        message={`Remove ${userToDelete?.email}?`}
        confirmText="Remove"
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
          if (isSendingReinvite) return;
          setOpenReinvite(false);
          setUserToReinvite(null);
        }}
        onConfirm={handleConfirmReinvite}
      />
    </div>
  );
}