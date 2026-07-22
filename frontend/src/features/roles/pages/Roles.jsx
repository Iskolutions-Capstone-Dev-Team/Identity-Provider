import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useRoles } from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";
import RolesListCard from "../components/RolesListCard";
import RoleModal from "../components/RoleModal";
import { toast } from "sonner";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { PERMISSIONS } from "../../../utils/permissionAccess";
import MetricsCard from "../../../components/MetricsCard";
import { metricsService } from "../../../services/metricsService";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Shield, Plus, ShieldCheck, Lock, ShieldUser } from "lucide-react";
import { createPortal } from "react-dom";

const ITEMS_PER_PAGE = 10;

export default function Roles() {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorMode = "light" } = useOutletContext() || {};
  const { hasPermission } = usePermissionAccess();
  const [roleMetrics, setRoleMetrics] = useState(null);
  const [permissionMetrics, setPermissionMetrics] = useState(null);
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

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

  const confirmDelete = async () => {
    try {
      await deleteRole(deleteTarget);
      toast.success("Role successfully deleted!");
    } catch (e) {
      toast.error("Failed to delete role", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    } finally {
      setShowDeleteAlert(false);
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (data) => {
    if (mode === "edit") {
      try {
        await updateRole(data);
        toast.success("Role successfully updated!");
        setModalOpen(false);
      } catch (e) {
        toast.error("Failed to update role", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
      }
    } else {
      setModalOpen(false);
    }
  };

  useEffect(() => {
    const routeState = location.state || {};

    if (routeState.successMessage) {
      toast.success(routeState.successMessage, { 
        id: "role-route-success"
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    location.pathname,
    location.state,
    navigate,
  ]);

  return (
    <>
      <div className="flex flex-col gap-6 w-full">
        {breadcrumbsContainer && createPortal(
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Role</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>,
          breadcrumbsContainer
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-primary/10 dark:text-primary rounded-xl">
              <ShieldUser className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Role</h1>
              <p className="text-muted-foreground">Manage roles and permissions</p>
            </div>
          </div>

          {canCreateRole && (
            <Button 
              className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:text-black h-11 px-6 rounded-lg font-bold text-[15px] transition-colors duration-200"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
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
                Icon: ShieldCheck,
              })),
            ...(Array.isArray(permissionMetrics) ? permissionMetrics : [])
              .filter((m) => m.title !== "Assigned Permissions")
              .map((m) => ({
                title: m.title,
                value: m.value,
                Icon: Lock,
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
        colorMode={colorMode}
        onCancel={() => {
          setShowDeleteAlert(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
