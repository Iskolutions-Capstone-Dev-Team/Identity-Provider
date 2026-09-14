import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const normalizedRoles = Array.isArray(roles)
    ? roles
    : roles === null || roles === undefined
      ? []
      : [roles];

  return Array.from(
    new Set(
      normalizedRoles
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
  const queryClient = useQueryClient();

  const { data: currentUser = EMPTY_CURRENT_USER, isLoading: isLoadingCurrentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const user = await userService.getMe();
        return mapCurrentUser(user);
      } catch (error) {
        console.error("Failed to load current user:", error);
        return EMPTY_CURRENT_USER;
      }
    },
    retry: false,
  });

  const updateCurrentUser = (updates = {}) => {
    queryClient.setQueryData(['currentUser'], (oldData) => {
      const current = oldData || EMPTY_CURRENT_USER;
      return {
        ...current,
        id: updates.id || current.id,
        firstName: updates.firstName ?? current.firstName,
        middleName: updates.middleName ?? current.middleName,
        lastName: updates.lastName ?? current.lastName,
        suffix: updates.suffix ?? current.suffix,
        email: updates.email ?? current.email,
      };
    });
  };

  return {
    currentUser,
    isLoadingCurrentUser,
    updateCurrentUser,
  };
}