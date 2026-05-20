import { useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import PageHeader from "../components/PageHeader";
import RoleCreateForm from "../components/role/RoleCreateForm";
import { usePermissions } from "../hooks/usePermissions";
import { useRoles } from "../hooks/useRoles";

function RolesBreadcrumbIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-6">
      <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CreateRoleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function CreateRoleHeaderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-14 w-14 sm:h-16 sm:w-16">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

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
            label: "Roles",
            to: "/roles",
            icon: <RolesBreadcrumbIcon />,
          },
          {
            label: "Create Role",
            icon: <CreateRoleIcon />,
          },
        ]}
      />

      <PageHeader
        title="Create Role"
        description="Add a new role and assign the appropriate permissions."
        icon={<CreateRoleHeaderIcon />}
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