import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../context/PermissionContext";
import { useAllAppClients } from "../hooks/useAllAppClients";
import { useUsers } from "../hooks/useUsers";
import Breadcrumbs from "../components/Breadcrumbs";
import PageHeader from "../components/PageHeader";
import AddUserForm from "../components/user-pool/AddUserForm";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE, hasSuperAdminRole } from "../utils/userPoolAccess";
import { PERMISSIONS, USER_ACCESS_EDIT_PERMISSIONS, USER_ROLE_EDIT_PERMISSIONS } from "../utils/permissionAccess";

function UserPoolBreadcrumbIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-6">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
    </svg>
  );
}

function CreateUserBreadcrumbIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function CreateUserHeaderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-14 w-14 sm:h-16 sm:w-16">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function getRequestedUserType(location) {
  const searchParams = new URLSearchParams(location.search);
  const queryUserType = searchParams.get("type");
  const stateUserType = location.state?.userType;
  const requestedUserType = queryUserType || stateUserType;

  return requestedUserType === ADMIN_USER_TYPE
    ? ADMIN_USER_TYPE
    : REGULAR_USER_TYPE;
}

export default function AddUserPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const colorMode = outletContext.colorMode || "light";
  const currentUser = outletContext.currentUser || {};
  const isLoadingCurrentUser = Boolean(outletContext.isLoadingCurrentUser);
  const { hasAnyPermission, hasPermission } = usePermissionAccess();
  const requestedUserType = useMemo(
    () => getRequestedUserType(location),
    [location],
  );
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
  const { userType, setUserType, createUser } = useUsers({
    visibleClientIds,
  });
  const canAddUsers = hasPermission(PERMISSIONS.ADD_USER);
  const canViewAdminUsers = hasPermission(PERMISSIONS.VIEW_ALL_USERS);
  const canAssignRoles = hasAnyPermission(USER_ROLE_EDIT_PERMISSIONS);
  const canManageUserAccess = hasAnyPermission(USER_ACCESS_EDIT_PERMISSIONS);
  const allowedUserType =
    requestedUserType === ADMIN_USER_TYPE && canViewAdminUsers
      ? ADMIN_USER_TYPE
      : REGULAR_USER_TYPE;
  const successMessageRef = useRef("User successfully created!");
  const wasSubmittedRef = useRef(false);

  useEffect(() => {
    if (userType !== allowedUserType) {
      setUserType(allowedUserType);
    }
  }, [allowedUserType, setUserType, userType]);

  useEffect(() => {
    if (!canAddUsers) {
      navigate("/user-pool", { replace: true });
    }
  }, [canAddUsers, navigate]);

  const handleSubmit = async (newUser) => {
    await createUser(newUser);
    wasSubmittedRef.current = true;
    successMessageRef.current =
      newUser.accountSetupType === "invitation"
        ? "User created and invitation sent!"
        : "User successfully created!";
  };

  const handleClose = () => {
    navigate("/user-pool", {
      state: {
        userType: allowedUserType,
        successMessage: wasSubmittedRef.current
          ? successMessageRef.current
          : "",
      },
    });
  };

  if (!canAddUsers) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
      <Breadcrumbs
        colorMode={colorMode}
        items={[
          {
            label: "User Pool",
            to: "/user-pool",
            icon: <UserPoolBreadcrumbIcon />,
          },
          {
            label: "Create User",
            icon: <CreateUserBreadcrumbIcon />,
          },
        ]}
      />

      <PageHeader
        title="Create User"
        description="Add a new user to the system. Fill in the details and set the appropriate access."
        icon={<CreateUserHeaderIcon />}
        colorMode={colorMode}
      />

      <AddUserForm
        onClose={handleClose}
        onSubmit={handleSubmit}
        userType={allowedUserType}
        canAssignRoles={canAssignRoles}
        canManageUserAccess={canManageUserAccess}
        appClientOptions={appClientOptions}
        isLoadingAppClients={isLoadingAppClients}
        includeSuperAdminRoleOptions={isCurrentUserSuperAdmin}
        colorMode={colorMode}
      />
    </div>
  );
}