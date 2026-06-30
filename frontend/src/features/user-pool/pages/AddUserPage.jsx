import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useAllAppClients } from "../../app-clients/hooks/useAllAppClients";
import { useUsers } from "../hooks/useUsers";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PageHeader from "../../../components/PageHeader";
import AddUserForm from "../components/AddUserForm";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE, hasSuperAdminRole } from "../../../utils/userPoolAccess";
import { PERMISSIONS, USER_ACCESS_EDIT_PERMISSIONS, USER_ROLE_EDIT_PERMISSIONS } from "../../../utils/permissionAccess";
import { UserPoolIcon, CreateUserIcon } from "../components/userpoolIcons";

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
            label: "User",
            to: "/user-pool",
          },
          {
            label: "New User",
          },
        ]}
      />

      <PageHeader
        title="New User"
        description="Add a new user and fill in the details and set the appropriate access."
        icon={<CreateUserIcon className="h-14 w-14 sm:h-16 sm:w-16" />}
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
