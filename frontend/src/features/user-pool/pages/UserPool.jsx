import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useUsers } from "../hooks/useUsers";
import UserPoolFilters from "../components/UserPoolFilters";
import UserPoolTable from "../components/UserPoolTable";
import UserPoolCards from "../components/UserPoolCards";
import Pagination from "../../../components/Pagination";
import UserPoolModal from "../components/UserPoolModal";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import InvitationConfirmModal from "../components/InvitationConfirmModal";
import ResultsCount from "../../../components/ResultsCount";
import ErrorAlert from "../../../components/ErrorAlert";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { useAllAppClients } from "../../app-clients/hooks/useAllAppClients";
import { mailService } from "../../../services/mailService";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE, hasSuperAdminRole } from "../../../utils/userPoolAccess";
import { PERMISSIONS, USER_ACCESS_EDIT_PERMISSIONS, USER_ROLE_EDIT_PERMISSIONS, USER_STATUS_EDIT_PERMISSIONS } from "../../../utils/permissionAccess";
import { resolveReinviteAccountTypeId } from "../utils/reinviteAccountType";
import { getUserLabel } from "../utils/userLabels";
import MetricsCard from "../../../components/MetricsCard";
import { metricsService } from "../../../services/metricsService";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Users, Plus, User } from "lucide-react";
import { createPortal } from "react-dom";

const ITEMS_PER_PAGE = 10;

function getRequestErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallbackMessage;
}

export default function UserPool() {
  const location = useLocation();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const colorMode = outletContext.colorMode || "light";
  const currentUser = outletContext.currentUser || {};
  const isLoadingCurrentUser = Boolean(outletContext.isLoadingCurrentUser);
  const globalViewType = outletContext.globalViewType;
  const { hasAnyPermission, hasPermission } = usePermissionAccess();
  const [userMetrics, setUserMetrics] = useState(null);
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  useEffect(() => {
    metricsService.getUserMetrics().then(setUserMetrics).catch(() => {});
  }, []);

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
  } = useUsers({ visibleClientIds });

  const [openViewEditModal, setOpenViewEditModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingSelectedUser, setIsLoadingSelectedUser] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openReinvite, setOpenReinvite] = useState(false);
  const [userToReinvite, setUserToReinvite] = useState(null);
  const [isSendingReinvite, setIsSendingReinvite] = useState(false);
  const [viewType, setViewType] = useState(() => {
    return localStorage.getItem("userPoolViewType") || globalViewType || "table";
  });
  
  useEffect(() => {
    if (globalViewType) {
      setViewType(globalViewType);
    }
  }, [globalViewType]);

  useEffect(() => {
    localStorage.setItem("userPoolViewType", viewType);
  }, [viewType]);
  
  const selectedUserRequestRef = useRef(0);
  
  const showLoading = useDelayedLoading(
    loading || (userType === REGULAR_USER_TYPE && (isLoadingAppClients || isLoadingCurrentUser)),
  );
  
  const canAddUsers = hasPermission(PERMISSIONS.ADD_USER);
  const canDeleteUsers = hasPermission(PERMISSIONS.DELETE_USER);
  const canViewAdminUsers = hasPermission(PERMISSIONS.VIEW_ALL_USERS);
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

  useEffect(() => {
    const routeState = location.state || {};
    if (routeState.userType) setUserType(routeState.userType);
    if (routeState.successMessage) {
      toast.success(routeState.successMessage);
    }
    if (routeState.userType || routeState.successMessage) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate, setUserType]);

  const openUserModal = async (user, mode) => {
    const canOpenModal = mode === "edit" ? canEditCurrentUserType : canViewCurrentUserType;
    if (!canOpenModal) return;

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

  const handleView = (user) => openUserModal(user, "view");
  const handleEdit = (user) => openUserModal(user, "edit");
  
  const handleDeleteClick = (user) => {
    if (!canDeleteCurrentUserType) return;
    setUserToDelete(user);
    setOpenDelete(true);
  };

  const handleReinviteClick = (user) => {
    if (!canReinviteCurrentUserType) return;
    setUserToReinvite(user);
    setOpenReinvite(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id, getUserLabel(userToDelete));
      toast.success(`${userToDelete?.email} deleted successfully`);
    } catch (e) {
      toast.error(`Failed to delete user`, { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    } finally {
      setOpenDelete(false);
      setUserToDelete(null);
    }
  };

  const handleConfirmReinvite = async () => {
    if (!userToReinvite || isSendingReinvite) return;
    const reinviteUserLabel = getUserLabel(userToReinvite);
    try {
      setIsSendingReinvite(true);
      setFetchError("");
      const userDetails = await getUserDetails(userToReinvite);
      const accountTypeId = await resolveReinviteAccountTypeId(userDetails);
      if (!accountTypeId) throw new Error("The user's account type is unavailable.");
      await mailService.sendInvitation({ email: userDetails.email, accountTypeId });
      setSuccessMessage(`Invitation resent to ${userDetails.email}.`);
      setOpenReinvite(false);
      setUserToReinvite(null);
      setOpenViewEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Reinvitation error:", error);
      setFetchError(getRequestErrorMessage(error, `Unable to resend invitation to ${reinviteUserLabel}.`));
      setOpenReinvite(false);
      setUserToReinvite(null);
      setOpenViewEditModal(false);
      setSelectedUser(null);
    } finally {
      setIsSendingReinvite(false);
    }
  };

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
          <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-primary/10 dark:text-primary rounded-xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Pool</h1>
            <p className="text-muted-foreground">Manage user accounts and roles.</p>
          </div>
        </div>

        {canAddUsers && (
          <Button className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:text-black h-11 px-6 rounded-lg font-bold text-[15px] transition-colors duration-200" onClick={() => navigate(`/user-pool/create?type=${userType}`, { state: { userType } })}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
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
          />
        )}

        {!showLoading && (
          <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-4">
            <div className="flex justify-start w-full order-2 sm:order-1">
              <ResultsCount
                page={page}
                itemsPerPage={ITEMS_PER_PAGE}
                totalResults={totalResults}
                currentResultsCount={paginatedUsers.length}
                colorMode={colorMode}
              />
            </div>
            <div className="flex justify-center w-full order-1 sm:order-2">
              <Pagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setPage}
                colorMode={colorMode}
              />
            </div>
            <div className="hidden sm:block order-3"></div>
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

      <DeleteConfirmModal
        open={openDelete}
        message={`Delete ${userToDelete?.email}?`}
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