import { useEffect, useState } from "react";
import { userService } from "../services/userService";

export const EMPTY_CURRENT_USER = {
  id: "",
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  email: "",
  roles: [],
};

function normalizeRoleNames(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }

  return Array.from(
    new Set(
      roles
        .map((role) => {
          if (typeof role === "string") {
            return role.trim();
          }

          return (
            role?.role_name?.trim() ||
            role?.roleName?.trim() ||
            role?.name?.trim() ||
            role?.label?.trim() ||
            ""
          );
        })
        .filter(Boolean),
    ),
  );
}

function mapCurrentUser(user = {}) {
  return {
    id: user.id || "",
    firstName: user.first_name || "",
    middleName: user.middle_name || "",
    lastName: user.last_name || "",
    suffix:
      user.name_suffix ||
      user.suffix ||
      user.suffix_name ||
      user.suffixName ||
      "",
    email: user.email || "",
    roles: normalizeRoleNames(user.roles),
  };
}

export function formatCurrentUserName(currentUser = EMPTY_CURRENT_USER) {
  const fullName = [
    currentUser.firstName,
    currentUser.middleName,
    currentUser.lastName,
    currentUser.suffix,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Profile";
}

export function hasCurrentUserRole(
  currentUser = EMPTY_CURRENT_USER,
  requiredRole = "",
) {
  const normalizedRequiredRole =
    typeof requiredRole === "string" ? requiredRole.trim().toLowerCase() : "";

  if (!normalizedRequiredRole) {
    return false;
  }

  return currentUser.roles.some(
    (role) => role.toLowerCase() === normalizedRequiredRole,
  );
}

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(EMPTY_CURRENT_USER);
  const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getMe();

        if (!isMounted) {
          return;
        }

        setCurrentUser(mapCurrentUser(user));
      } catch (error) {
        console.error("Failed to load current user:", error);

        if (!isMounted) {
          return;
        }

        setCurrentUser(EMPTY_CURRENT_USER);
      } finally {
        if (isMounted) {
          setIsLoadingCurrentUser(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    currentUser,
    isLoadingCurrentUser,
  };
}