import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useRoles } from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";
import RolesListCard from "../components/RolesListCard";
import RoleModal from "../components/RoleModal";
import SuccessAlert from "../../../components/SuccessAlert";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PageHeader from "../../../components/PageHeader";
import PageHeaderActionButton from "../../../components/PageHeaderActionButton";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { PERMISSIONS } from "../../../utils/permissionAccess";
import { RolesIcon } from "../components/roleIcons";
import MetricsCard from "../../../components/MetricsCard";
import { RoleIcon, PermissionIcon } from "../../../components/Icons";
import { metricsService } from "../../../services/metricsService";

const ITEMS_PER_PAGE = 10;

export default function Roles() {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorMode = "light" } = useOutletContext() || {};
  const { hasPermission } = usePermissionAccess();
  const [roleMetrics, setRoleMetrics] = useState(null);
  const [permissionMetrics, setPermissionMetrics] = useState(null);

  useEffect(() => {
    metricsService.getRoleMetrics().then(setRoleMetrics).catch(() => {});
    metricsService.getPermissionMetrics().then(setPermissionMetrics).catch(() => {});
  }, []);
  const {
    search,
    setSearch,
    page,
    setPage,
    paginatedRoles,
    totalPages,
    totalResults,
    loading,
    successMessage,
    setSuccessMessage,
    updateRole,
    deleteRole,
  } = useRoles();
  const canCreateRole = hasPermission(PERMISSIONS.ADD_ROLES);
  const canEditRole = hasPermission(PERMISSIONS.EDIT_ROLES);
  const canDeleteRole = hasPermission(PERMISSIONS.DELETE_ROLES);
  const {
    permissions: permissionOptions,
    loading: isPermissionOptionsLoading,
  } = usePermissions();

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [activeRole, setActiveRole] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const showLoading = useDelayedLoading(loading);
  const closeSuccessAlert = useCallback(() => {
    setSuccessMessage("");
  }, [setSuccessMessage]);
  const visibleRoles = paginatedRoles.map((role) => ({
    ...role,
    canEdit: canEditRole && role.canEdit,
    canDelete: canDeleteRole && role.canDelete,
  }));

  const openCreate = () => {
    if (!canCreateRole) {
      return;
    }

    navigate("/roles/create");
  };

  const openView = (role) => {
    setMode("view");
    setActiveRole(role);
    setModalOpen(true);
  };

  const openEdit = (role) => {
    if (!canEditRole) {
      return;
    }

    setMode("edit");
    setActiveRole(role);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (!canDeleteRole) {
      return;
    }

    setDeleteTarget(id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    deleteRole(deleteTarget);
    setShowDeleteAlert(false);
    setDeleteTarget(null);
  };

  const handleSubmit = (data) => {
    if (mode === "edit") {
      updateRole(data);
    }

    setModalOpen(false);
  };

  useEffect(() => {
    const routeState = location.state || {};

    if (routeState.successMessage) {
      setSuccessMessage(routeState.successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    location.pathname,
    location.state,
    navigate,
    setSuccessMessage,
  ]);

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        <Breadcrumbs
          colorMode={colorMode}
          items={[
            {
              label: "Roles",
              icon: <RolesIcon />,
            },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <PageHeader
              title="Roles"
              description="Manage roles and permissions"
              icon={<RolesIcon className="h-14 w-14 sm:h-16 sm:w-16" />}
              colorMode={colorMode}
            />
          </div>

          {canCreateRole && (
            <div className="self-end sm:self-center">
              <PageHeaderActionButton colorMode={colorMode} onClick={openCreate}>
                + Add Role
              </PageHeaderActionButton>
            </div>
          )}
        </div>

        <MetricsCard
          colorMode={colorMode}
          isLoading={showLoading}
          metrics={[
            ...(Array.isArray(roleMetrics) ? roleMetrics : [])
              .filter((m) => m.title !== "Active Roles")
              .map((m) => ({
              title: m.title,
              value: m.value,
              Icon: RoleIcon,
            })),
            ...(Array.isArray(permissionMetrics) ? permissionMetrics : [])
              .filter((m) => m.title !== "Assigned Permissions")
              .map((m) => ({
              title: m.title,
              value: m.value,
              Icon: PermissionIcon,
            })),
          ]}
        />

        <div className="relative">
          <RolesListCard
            loading={showLoading}
            roles={visibleRoles}
            totalResults={totalResults}
            itemsPerPage={ITEMS_PER_PAGE}
            search={search}
            setSearch={setSearch}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDeleteClick}
            colorMode={colorMode}
          />
        </div>

        <RoleModal
          open={modalOpen}
          mode={mode}
          role={activeRole}
          permissionOptions={permissionOptions}
          isPermissionOptionsLoading={isPermissionOptionsLoading}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          colorMode={colorMode}
        />
      </div>

      <DeleteConfirmModal
        open={showDeleteAlert}
        message="Delete this role?"
        theme="glass"
        colorMode={colorMode}
        onCancel={() => {
          setShowDeleteAlert(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      <SuccessAlert
        message={successMessage}
        onClose={closeSuccessAlert}
      />
    </>
  );
}
