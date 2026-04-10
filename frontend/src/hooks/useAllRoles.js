import { useEffect, useState } from "react";
import { roleService } from "../services/roleService";

const normalizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const toPositiveInt = (value) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

function normalizeRole(role = {}) {
  return {
    ...role,
    id: toPositiveInt(role.id ?? role.role_id ?? role.roleId ?? role.ID),
    role_name: normalizeTextValue(
      role.role_name ?? role.roleName ?? role.name ?? role.label,
    ),
  };
}

function getRolePageFetcher(endpoint) {
  return endpoint === "all" ? roleService.getAllRolesPage : roleService.getRoles;
}

export function useAllRoles({ endpoint = "default" } = {}) {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchRolesByEndpoint = async (selectedEndpoint) => {
      const fetchRolePage = getRolePageFetcher(selectedEndpoint);
      const firstPage = await fetchRolePage(1);
      const collectedRoles = Array.isArray(firstPage?.roles) ? [...firstPage.roles] : [];
      const lastPage =
        Number.isInteger(firstPage?.last_page) && firstPage.last_page > 1
          ? firstPage.last_page
          : 1;

      if (lastPage > 1) {
        const pageRequests = [];
        for (let page = 2; page <= lastPage; page += 1) {
          pageRequests.push(fetchRolePage(page));
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
        const normalizedRole = normalizeRole(role);
        if (!normalizedRole.id || !normalizedRole.role_name) {
          return;
        }

        roleMap.set(normalizedRole.id, normalizedRole);
      });

      return Array.from(roleMap.values());
    };

    const fetchAll = async () => {
      try {
        let nextRoles = await fetchRolesByEndpoint(endpoint);

        if (endpoint === "all" && nextRoles.length === 0) {
          nextRoles = await fetchRolesByEndpoint("default");
        }

        if (!cancelled) {
          setRoles(nextRoles);
        }
      } catch (err) {
        console.error("Failed fetching roles:", err);
        if (!cancelled) {
          setRoles([]);
        }
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return roles;
}