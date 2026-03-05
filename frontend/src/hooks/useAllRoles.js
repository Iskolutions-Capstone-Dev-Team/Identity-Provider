import { useEffect, useState } from "react";
import { roleService } from "../services/roleService";

export function useAllRoles() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await roleService.getRoles(1);
        setRoles(data.roles || []);
      } catch (err) {
        console.error("Failed fetching roles:", err);
      }
    };

    fetchAll();
  }, []);

  return roles;
}