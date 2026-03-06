import { useEffect, useState } from "react";
import { roleService } from "../services/roleService";

export function useAllRoles() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const firstPage = await roleService.getRoles(1);
        const collectedRoles = Array.isArray(firstPage?.roles) ? [...firstPage.roles] : [];
        const lastPage =
          Number.isInteger(firstPage?.last_page) && firstPage.last_page > 1
            ? firstPage.last_page
            : 1;

        if (lastPage > 1) {
          const pageRequests = [];
          for (let page = 2; page <= lastPage; page += 1) {
            pageRequests.push(roleService.getRoles(page));
          }

          const pageResults = await Promise.all(pageRequests);
          pageResults.forEach((pagePayload) => {
            if (Array.isArray(pagePayload?.roles)) {
              collectedRoles.push(...pagePayload.roles);
            }
          });
        }

        const roleMap = new Map();
        collectedRoles.forEach((role) => {
          if (!role?.id) return;
          roleMap.set(role.id, role);
        });

        if (!cancelled) {
          setRoles(Array.from(roleMap.values()));
        }
      } catch (err) {
        console.error("Failed fetching roles:", err);
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return roles;
}
