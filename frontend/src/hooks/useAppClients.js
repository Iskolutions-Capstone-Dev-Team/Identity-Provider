import { useState, useEffect, useCallback } from "react";
import { clientService } from "../services/clientService";

const ITEMS_PER_PAGE = 10;

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

const getMatchingClients = async (keyword) => {
  const matchedClients = [];
  let nextPage = 1;

  while (true) {
    const { items } = await clientService.getClients({
      limit: ITEMS_PER_PAGE,
      page: nextPage,
      keyword,
    });

    if (!Array.isArray(items) || items.length === 0) {
      break;
    }

    matchedClients.push(...items);

    if (items.length < ITEMS_PER_PAGE) {
      break;
    }

    nextPage += 1;
  }

  return matchedClients;
};

export function useAppClients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [secretModal, setSecretModal] = useState({
    open: false,
    clientId: "",
    clientName: "",
    secret: "",
    title: "",
    loading: false,
    hasError: false,
  });

  const searchKeyword = search.trim();

  // =========================
  // FETCH CURRENT PAGE
  // =========================
  const fetchPageClients = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const { items, total, lastPage } = await clientService.getClients({
        limit: ITEMS_PER_PAGE,
        page,
      });
      const nextClients = items.map(mapClientSummary);
      const nextTotalResults =
        Number.isInteger(total) && total >= 0 ? total : nextClients.length;
      const nextTotalPages =
        Number.isInteger(lastPage) && lastPage > 0
          ? lastPage
          : Math.max(1, Math.ceil(nextTotalResults / ITEMS_PER_PAGE));

      if (page > nextTotalPages) {
        setPage(nextTotalPages);
        return;
      }

      setClients(nextClients);
      setTotalResults(nextTotalResults);
    } catch (err) {
      console.error("Fetch clients error:", err);
      setClients([]);
      setTotalResults(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [page]);

  // =========================
  // FETCH SEARCH RESULTS
  // =========================
  const fetchMatchingClients = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const matchedClients = await getMatchingClients(searchKeyword);
      setClients(matchedClients.map(mapClientSummary));
      setTotalResults(matchedClients.length);
    } catch (err) {
      console.error("Fetch clients error:", err);
      setClients([]);
      setTotalResults(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [searchKeyword]);

  useEffect(() => {
    if (searchKeyword) {
      return;
    }

    fetchPageClients();
  }, [fetchPageClients, searchKeyword]);

  useEffect(() => {
    if (!searchKeyword) {
      return;
    }

    fetchMatchingClients();
  }, [fetchMatchingClients, searchKeyword]);

  const setSearchKeyword = useCallback((value) => {
    const nextValue = typeof value === "string" ? value : "";
    setPage(1);
    setSearch(nextValue);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const paginatedClients = searchKeyword
    ? clients.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : clients;

  const refreshClients = async ({ showLoading = true } = {}) => {
    if (searchKeyword) {
      await fetchMatchingClients({ showLoading });
      return;
    }

    await fetchPageClients({ showLoading });
  };

  // =========================
  // CREATE
  // =========================
  const createClient = async (payload) => {
    const res = await clientService.createClient(payload);
    setSuccessMessage("App client successfully created!");
    await refreshClients({ showLoading: false });
    return res;
  };

  // =========================
  // UPDATE
  // =========================
  const updateClient = async (payload) => {
    try {
      await clientService.updateClient(payload.id, payload);
      setSuccessMessage("App client successfully updated!");
      await refreshClients({ showLoading: false });
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
    setSuccessMessage("App client successfully deleted!");
    await refreshClients({ showLoading: false });
  };

  const getClientDetails = useCallback(async (id) => {
    const payload = await clientService.getClientById(id);
    return normalizeClientDetailPayload(payload);
  }, []);

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

  return {
    search,
    setSearch: setSearchKeyword,
    page: currentPage,
    setPage,
    paginatedClients,
    totalPages,
    totalResults,
    loading,
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