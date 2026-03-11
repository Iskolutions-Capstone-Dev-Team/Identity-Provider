import { useEffect, useState } from "react";
import { userService } from "../services/userService";

export const EMPTY_CURRENT_USER = {
  id: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  roles: [],
};

function mapCurrentUser(user = {}) {
  return {
    id: user.id || "",
    firstName: user.first_name || "",
    middleName: user.middle_name || "",
    lastName: user.last_name || "",
    email: user.email || "",
    roles: Array.isArray(user.roles) ? user.roles : [],
  };
}

export function formatCurrentUserName(currentUser = EMPTY_CURRENT_USER) {
  const fullName = [
    currentUser.firstName,
    currentUser.middleName,
    currentUser.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Profile";
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
