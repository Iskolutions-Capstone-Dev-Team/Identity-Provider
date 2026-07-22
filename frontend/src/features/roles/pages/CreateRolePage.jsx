import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import RoleCreateForm from "../components/RoleCreateForm";
import { usePermissions } from "../hooks/usePermissions";
import { useRoles } from "../hooks/useRoles";
import { CreateRoleIcon } from "../components/roleIcons";

export default function CreateRolePage() {
  const navigate = useNavigate();
  const { colorMode = "light" } = useOutletContext() || {};
  const { createRole } = useRoles();
  const {
    permissions: permissionOptions,
    loading: isPermissionOptionsLoading,
  } = usePermissions();
  const handleClose = () => {
    navigate("/roles");
  };

  const handleSubmit = async (data) => {
    try {
      await createRole(data);
      navigate("/roles", {
        state: { successMessage: "Role successfully created!" },
      });
    } catch (error) {
      toast.error("Failed to create role", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
    }
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
      <Breadcrumbs
        colorMode={colorMode}
        items={[
          {
            label: "Role",
            to: "/roles",
          },
          {
            label: "New Role",
          },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-primary/10 dark:text-primary rounded-xl flex items-center justify-center">
            <CreateRoleIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">New Role</h1>
            <p className="text-muted-foreground mt-1">Add a new role and assign the appropriate permissions.</p>
          </div>
        </div>
      </div>

      <RoleCreateForm
        permissionOptions={permissionOptions}
        isPermissionOptionsLoading={isPermissionOptionsLoading}
        onClose={handleClose}
        onSubmit={handleSubmit}
        colorMode={colorMode}
      />
    </div>
  );
}