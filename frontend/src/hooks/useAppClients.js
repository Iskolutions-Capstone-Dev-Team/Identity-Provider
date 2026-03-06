import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { clientService } from "../services/clientService";

const ITEMS_PER_PAGE = 10;
const ROLE_CACHE_KEY = "idp_app_client_role_cache_v1";

const toPositiveInt = (value) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeRoleArrayInput = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return trimmed.split(",").map((entry) => entry.trim()).filter(Boolean);
      }
    }

    return trimmed.split(",").map((entry) => entry.trim()).filter(Boolean);
  }

  return [];
};

const collectRoleLikeSources = (source) => {
  if (!source || typeof source !== "object") return [];

  return Object.entries(source)
    .filter(([key, value]) => /role/i.test(key) && (Array.isArray(value) || typeof value === "string"))
    .map(([, value]) => value);
};

const flattenRoleSources = (...sources) =>
  sources.flatMap((source) => normalizeRoleArrayInput(source));

const normalizeStringList = (values = []) =>
  Array.from(
    new Set(
      normalizeRoleArrayInput(values)
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0),
    ),
  );

const getRoleId = (role) => {
  if (role && typeof role === "object") {
    return toPositiveInt(role.id ?? role.role_id ?? role.roleId ?? role.value);
  }

  return toPositiveInt(role);
};

const getRoleName = (role) => {
  if (role && typeof role === "object") {
    const rawName = role.role_name ?? role.roleName ?? role.name ?? role.label ?? "";
    return typeof rawName === "string" ? rawName.trim() : "";
  }

  if (typeof role === "string") {
    const trimmed = role.trim();
    return trimmed && toPositiveInt(trimmed) === null ? trimmed : "";
  }

  return "";
};

const normalizeRoleIds = (values = []) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => getRoleId(value))
        .filter((value) => value !== null),
    ),
  );

const isPlaceholderRoleName = (roleName, roleId) => `${roleId}` === `${roleName}`;

const mergeRoleOptions = (...collections) => {
  const roleOptionMap = new Map();

  collections.flat().forEach((role) => {
    if (!role || typeof role !== "object") return;

    const roleId = getRoleId(role);
    if (roleId === null) return;

    const candidateName = getRoleName(role) || `${roleId}`;
    const existing = roleOptionMap.get(roleId);

    if (!existing) {
      roleOptionMap.set(roleId, { id: roleId, role_name: candidateName });
      return;
    }

    if (isPlaceholderRoleName(existing.role_name, roleId) && !isPlaceholderRoleName(candidateName, roleId)) {
      roleOptionMap.set(roleId, { id: roleId, role_name: candidateName });
    }
  });

  return Array.from(roleOptionMap.values());
};

const normalizeClientRoles = (rawRoles = []) => {
  if (!Array.isArray(rawRoles)) {
    return { roles: [], roleNames: [], roleOptions: [] };
  }

  const roleIds = normalizeRoleIds(rawRoles);
  const roleNames = normalizeStringList(rawRoles.map((role) => getRoleName(role)));
  const roleOptions = mergeRoleOptions(
    rawRoles
      .map((role) => {
        const roleId = getRoleId(role);
        if (roleId === null) return null;

        return {
          id: roleId,
          role_name: getRoleName(role) || `${roleId}`,
        };
      })
      .filter(Boolean),
  );

  return { roles: roleIds, roleNames, roleOptions };
};

const normalizeRolePayload = (payload = {}) => {
  const roleValues = flattenRoleSources(
    payload.roles,
    payload.ids,
    payload.roleIds,
    payload.role_ids,
  );
  const parsedFromRoles = normalizeClientRoles(roleValues);

  const explicitRoleNames = normalizeStringList(payload.roleNames ?? payload.role_names ?? payload.names);
  const explicitRoleOptions = mergeRoleOptions(
    flattenRoleSources(payload.roleOptions, payload.role_options).filter(
      (entry) => entry && typeof entry === "object",
    ),
  );

  const roleIds = normalizeRoleIds([
    ...parsedFromRoles.roles,
    ...flattenRoleSources(payload.ids, payload.roleIds, payload.role_ids),
  ]);

  const roleOptions = mergeRoleOptions(
    parsedFromRoles.roleOptions,
    explicitRoleOptions,
    roleIds.map((id) => ({ id, role_name: `${id}` })),
  );

  const roleNames = normalizeStringList([
    ...parsedFromRoles.roleNames,
    ...explicitRoleNames,
    ...roleOptions
      .map((role) => role?.role_name || "")
      .filter((name, index, all) => !isPlaceholderRoleName(name, roleOptions[index]?.id) || all.length === 1),
  ]);

  return {
    roles: roleIds,
    roleNames,
    roleOptions,
  };
};

const hasRoleData = (payload = {}) =>
  (Array.isArray(payload.roles) && payload.roles.length > 0) ||
  (Array.isArray(payload.roleNames) && payload.roleNames.length > 0) ||
  (Array.isArray(payload.roleOptions) && payload.roleOptions.length > 0);

const mergeRoleData = (primary = {}, fallback = {}) => {
  const normalizedPrimary = normalizeRolePayload(primary);
  const normalizedFallback = normalizeRolePayload(fallback);

  const roles =
    normalizedPrimary.roles.length > 0 ? normalizedPrimary.roles : normalizedFallback.roles;
  const roleNames =
    normalizedPrimary.roleNames.length > 0
      ? normalizedPrimary.roleNames
      : normalizedFallback.roleNames;
  const roleOptions = mergeRoleOptions(
    normalizedPrimary.roleOptions,
    normalizedFallback.roleOptions,
    roles.map((id) => ({ id, role_name: `${id}` })),
  );

  return { roles, roleNames, roleOptions };
};

const normalizeRoleDataForCompare = (payload = {}) => {
  const normalized = normalizeRolePayload(payload);

  return {
    roles: [...normalized.roles].sort((a, b) => a - b),
    roleNames: [...normalized.roleNames].sort((a, b) => a.localeCompare(b)),
    roleOptions: [...normalized.roleOptions]
      .map((role) => ({
        id: getRoleId(role),
        role_name: getRoleName(role) || `${getRoleId(role) ?? ""}`,
      }))
      .filter((role) => role.id !== null)
      .sort((a, b) => (a.id === b.id ? a.role_name.localeCompare(b.role_name) : a.id - b.id)),
  };
};

const areRoleDataEqual = (left = {}, right = {}) => {
  const normalizedLeft = normalizeRoleDataForCompare(left);
  const normalizedRight = normalizeRoleDataForCompare(right);

  return JSON.stringify(normalizedLeft) === JSON.stringify(normalizedRight);
};

const readRoleCache = () => {
  if (typeof window === "undefined") return {};

  try {
    const rawCache = window.localStorage.getItem(ROLE_CACHE_KEY);
    if (!rawCache) return {};

    const parsed = JSON.parse(rawCache);
    if (!parsed || typeof parsed !== "object") return {};

    return Object.entries(parsed).reduce((acc, [clientId, roleData]) => {
      const normalized = normalizeRolePayload(roleData || {});
      if (hasRoleData(normalized)) {
        acc[clientId] = normalized;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const writeRoleCache = (roleCache) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(roleCache));
  } catch {
    // Ignore localStorage write failures (private mode, quota, etc.).
  }
};

const mapClientSummary = (client = {}) => {
  const id = client.id ?? client.client_id ?? client.clientId ?? "";
  const rawRoleValues = flattenRoleSources(
    client.roles,
    client.allowed_roles,
    client.allowedRoles,
    client.role_ids,
    client.roleIds,
    ...collectRoleLikeSources(client),
  );

  const normalizedRoles = normalizeRolePayload({
    roles: rawRoleValues,
    roleNames: client.roleNames ?? client.role_names ?? client.allowed_role_names,
    roleOptions: client.roleOptions ?? client.role_options ?? client.allowed_roles ?? client.allowedRoles,
  });

  return {
    id,
    clientId: id,
    name: client.name ?? "",
    tag: client.tag ?? "",
    description: client.description || "",
    created: (client.created_at || client.createdAt || "").slice(0, 10) || "-",
    image: client.image_location || client.imageLocation || client.image || null,
    base_url: client.base_url || client.baseURL || "",
    redirect_uri: client.redirect_uri || client.redirectURI || "",
    logout_uri: client.logout_uri || client.logoutURI || "",
    grants: Array.isArray(client.grants) ? client.grants : [],
    roles: normalizedRoles.roles,
    roleNames: normalizedRoles.roleNames,
    roleOptions: normalizedRoles.roleOptions,
  };
};

const normalizeClientDetailPayload = (payload = {}) => {
  const client = payload?.client ?? payload?.data?.client ?? payload?.data ?? payload;
  const grants =
    payload?.allowed_grants ??
    payload?.allowedGrants ??
    client?.allowed_grants ??
    client?.allowedGrants ??
    client?.grants ??
    [];

  const detailRoleValues = flattenRoleSources(
    payload?.roles,
    payload?.allowed_roles,
    payload?.role_ids,
    payload?.roleIds,
    payload?.data?.roles,
    payload?.data?.allowed_roles,
    payload?.data?.role_ids,
    payload?.data?.roleIds,
    client?.roles,
    client?.allowed_roles,
    client?.allowedRoles,
    client?.role_ids,
    client?.roleIds,
    payload?.data?.client?.roles,
    payload?.data?.client?.allowed_roles,
    payload?.data?.client?.allowedRoles,
    ...collectRoleLikeSources(payload),
    ...collectRoleLikeSources(payload?.data),
    ...collectRoleLikeSources(payload?.client),
    ...collectRoleLikeSources(payload?.data?.client),
    ...collectRoleLikeSources(client),
  );

  const normalizedRoles = normalizeRolePayload({
    roles: detailRoleValues,
    roleNames: [
      ...normalizeRoleArrayInput(payload?.role_names),
      ...normalizeRoleArrayInput(payload?.data?.role_names),
      ...normalizeRoleArrayInput(client?.role_names),
      ...normalizeRoleArrayInput(client?.allowed_role_names),
    ],
    roleOptions: [
      ...(Array.isArray(payload?.allowed_roles) ? payload.allowed_roles : []),
      ...(Array.isArray(payload?.data?.allowed_roles) ? payload.data.allowed_roles : []),
      ...(Array.isArray(client?.allowed_roles) ? client.allowed_roles : []),
      ...(Array.isArray(client?.allowedRoles) ? client.allowedRoles : []),
    ],
  });

  return mapClientSummary({
    ...(client || {}),
    grants: Array.isArray(grants) ? grants : [],
    roles: normalizedRoles.roles,
    roleNames: normalizedRoles.roleNames,
    roleOptions: normalizedRoles.roleOptions,
  });
};

export function useAppClients() {
  const [clients, setClients] = useState([]);
  const [roleCache, setRoleCache] = useState(() => readRoleCache());
  const roleCacheRef = useRef(roleCache);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [secretModal, setSecretModal] = useState({
    open: false,
    clientId: "",
    clientName: "",
    secret: "",
    title: "",
    loading: false,
    hasError: false,
  });

  const offset = (page - 1) * ITEMS_PER_PAGE;
  const keyword = search.trim();

  const upsertRoleCache = useCallback((clientId, rolePayload = {}) => {
    const normalizedClientId = typeof clientId === "string" ? clientId.trim() : "";
    if (!normalizedClientId) return;

    const normalizedRoleData = normalizeRolePayload(rolePayload);
    if (!hasRoleData(normalizedRoleData)) return;

    setRoleCache((previous) => {
      const existingRoleData = previous[normalizedClientId] || {};
      const mergedRoleData = mergeRoleData(normalizedRoleData, existingRoleData);

      if (areRoleDataEqual(existingRoleData, mergedRoleData)) {
        return previous;
      }

      return {
        ...previous,
        [normalizedClientId]: mergedRoleData,
      };
    });
  }, []);

  const removeRoleCacheEntry = useCallback((clientId) => {
    const normalizedClientId = typeof clientId === "string" ? clientId.trim() : "";
    if (!normalizedClientId) return;

    setRoleCache((previous) => {
      if (!previous[normalizedClientId]) return previous;

      const next = { ...previous };
      delete next[normalizedClientId];
      return next;
    });
  }, []);

  useEffect(() => {
    roleCacheRef.current = roleCache;
    writeRoleCache(roleCache);
  }, [roleCache]);

  // =========================
  // FETCH CLIENTS
  // =========================
  const fetchClients = useCallback(async () => {
    try {
      const { items, total } = await clientService.getClients(
        ITEMS_PER_PAGE,
        offset,
        keyword,
      );
      const mapped = items.map(mapClientSummary);

      mapped.forEach((client) => {
        if (hasRoleData(client)) {
          upsertRoleCache(client.id, client);
        }
      });

      setClients(mapped);
      setTotalResults(total);
    } catch (err) {
      console.error("Fetch clients error:", err);
      setClients([]);
      setTotalResults(0);
    }
  }, [keyword, offset, upsertRoleCache]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const setSearchKeyword = useCallback((value) => {
    const nextValue = typeof value === "string" ? value : "";
    setPage(1);
    setSearch(nextValue);
  }, []);

  // =========================
  // CREATE
  // =========================
  const createClient = async (payload) => {
    const res = await clientService.createClient(payload);
    const createdClientId = res?.client_id ?? res?.clientId ?? "";
    if (createdClientId) {
      upsertRoleCache(createdClientId, payload);
    }

    setSuccessMessage("App client successfully created!");
    await fetchClients();
    return res;
  };

  // =========================
  // UPDATE
  // =========================
  const updateClient = async (payload) => {
    try {
      await clientService.updateClient(payload.id, payload);
      if (payload?.id) {
        upsertRoleCache(payload.id, payload);
      }

      setSuccessMessage("App client successfully updated!");
      await fetchClients();
    } catch (err) {
      console.error("Update failed:", err);
      throw err;
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteClient = async (id) => {
    await clientService.deleteClient(id);
    removeRoleCacheEntry(id);
    setSuccessMessage("App client successfully deleted!");
    await fetchClients();
  };

  const getClientDetails = useCallback(
    async (id) => {
      const payload = await clientService.getClientById(id);
      const normalized = normalizeClientDetailPayload(payload);
      const mergedRoleData = mergeRoleData(
        normalized,
        roleCacheRef.current?.[id] || {},
      );

      if (hasRoleData(mergedRoleData)) {
        upsertRoleCache(id, mergedRoleData);
      }

      return {
        ...normalized,
        ...mergedRoleData,
      };
    },
    [upsertRoleCache],
  );

  const rotateClientSecret = async (client) => {
    const id = typeof client === "string" ? client : client?.id;
    const name = typeof client === "string" ? "" : client?.name || "";

    if (!id) {
      setSecretModal({
        open: true,
        clientId: "",
        clientName: "",
        secret: "",
        title: "Unable to rotate client secret",
        loading: false,
        hasError: true,
      });
      return;
    }

    setSecretModal({
      open: true,
      clientId: id,
      clientName: name,
      secret: "",
      title: "Rotating client secret...",
      loading: true,
      hasError: false,
    });

    try {
      const res = await clientService.rotateClientSecret(id);
      const rotatedSecret = res?.client_secret || "";

      setSecretModal({
        open: true,
        clientId: res?.client_id || id,
        clientName: name,
        secret: rotatedSecret,
        title: "Client secret rotated",
        loading: false,
        hasError: !rotatedSecret,
      });
    } catch {
      setSecretModal({
        open: true,
        clientId: id,
        clientName: name,
        secret: "",
        title: "Unable to rotate client secret",
        loading: false,
        hasError: true,
      });
    }
  };

  const hydratedClients = useMemo(
    () =>
      clients.map((client) => ({
        ...client,
        ...mergeRoleData(client, roleCache[client.id] || {}),
      })),
    [clients, roleCache],
  );

  return {
    search,
    setSearch: setSearchKeyword,
    page,
    setPage,
    paginatedClients: hydratedClients,
    totalPages: Math.ceil(totalResults / ITEMS_PER_PAGE),
    totalResults,
    successMessage,
    setSuccessMessage,
    createClient,
    updateClient,
    deleteClient,
    getClientDetails,
    rotateClientSecret,
    secretModal,
    setSecretModal,
  };
}
