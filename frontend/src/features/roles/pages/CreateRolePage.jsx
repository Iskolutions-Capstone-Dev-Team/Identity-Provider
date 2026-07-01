import { useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PageHeader from "../../../components/PageHeader";
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
  const wasSubmittedRef = useRef(false);

  const handleClose = () => {
    navigate("/roles", {
      state: {
        successMessage: wasSubmittedRef.current
          ? "Role successfully created!"
          : "",
      },
    });
  };

  const handleSubmit = async (data) => {
    await createRole(data);
    wasSubmittedRef.current = true;
    handleClose();
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

      <PageHeader
        title="New Role"
        description="Add a new role and assign the appropriate permissions."
        icon={<CreateRoleIcon className="h-14 w-14 sm:h-16 sm:w-16" />}
        colorMode={colorMode}
      />

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