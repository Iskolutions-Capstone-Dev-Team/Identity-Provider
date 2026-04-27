import { useCallback, useEffect, useState } from "react";
import { clientService } from "../services/clientService";

const ITEMS_PER_PAGE = 10;

const normalizeRoleNames = (roles = []) =>
  Array.from(
    new Set(
      (Array.isArray(roles) ? roles : [])
        .map((role) => role?.role_name ?? role?.roleName ?? role?.name ?? "")
        .map((roleName) =>
          typeof roleName === "string" ? roleName.trim() : "",
        )
        .filter(Boolean),
    ),
  );

const getClientId = (client = {}) =>
  client.id ?? client.client_id ?? client.clientId ?? "";

const toPositiveInteger = (value, fallbackValue) => {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallbackValue;
};

const toNonNegativeInteger = (value, fallbackValue) => {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue >= 0
    ? parsedValue
    : fallbackValue;
};

const mapClientSummary = (client = {}) => {
  const clientId = getClientId(client);

  return {
    id: clientId,
    clientId,
    name: client.name ?? "",
    description: client.description ?? "",
    created: (client.created_at ?? client.createdAt ?? "").slice(0, 10) || "-",
    image:
      client.image_location ??
      client.imageLocation ??
      client.image ??
      null,
    base_url: client.base_url ?? client.baseURL ?? "",
    redirect_uri: client.redirect_uri ?? client.redirectURI ?? "",
    logout_uri: client.logout_uri ?? client.logoutURI ?? "",
    grants: Array.isArray(client.grants) ? client.grants : [],
    roleNames: normalizeRoleNames(
      client.allowed_roles ?? client.allowedRoles ?? client.roles,
    ),
  };
};

const normalizeClientDetailPayload = (payload = {}) => {
  const client =
    payload.client ??
    payload.data?.client ??
    payload.data ??
    payload;

  return mapClientSummary(client);
};

export function useAppClients({ enabled = true } = {}) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalClientCount, setTotalClientCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(enabled);
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

  const resetClients = useCallback(() => {
    setClients([]);
    setTotalClientCount(0);
    setLoading(false);
  }, []);

  const fetchClients = useCallback(async ({ showLoading = true } = {}) => {
    if (!enabled) {
      resetClients();
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }

      const { items, total, lastPage } = await clientService.getClients({
        limit: ITEMS_PER_PAGE,
        page,
        keyword: searchKeyword,
      });
      const nextClients = Array.isArray(items)
        ? items.map(mapClientSummary)
        : [];
      const nextTotalResults = toNonNegativeInteger(
        total,
        nextClients.length,
      );
      const nextTotalPages = toPositiveInteger(
        lastPage,
        Math.max(1, Math.ceil(nextTotalResults / ITEMS_PER_PAGE)),
      );

      if (page > nextTotalPages) {
        setPage(nextTotalPages);
        return;
      }

      setClients(nextClients);
      setTotalClientCount(nextTotalResults);
    } catch (error) {
      console.error("Fetch clients error:", error);
      setClients([]);
      setTotalClientCount(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [enabled, page, resetClients, searchKeyword]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const setSearchKeyword = useCallback((value) => {
    const nextValue = typeof value === "string" ? value : "";

    setPage(1);
    setSearch(nextValue);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalClientCount / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const refreshClients = async ({ showLoading = true } = {}) => {
    await fetchClients({ showLoading });
  };

  const createClient = async (payload) => {
    const response = await clientService.createClient(payload);

    setSuccessMessage("App client successfully created!");
    await refreshClients({ showLoading: false });
    return response;
  };

  const updateClient = async (payload) => {
    try {
      await clientService.updateClient(payload.id, payload);
      setSuccessMessage("App client successfully updated!");
      await refreshClients({ showLoading: false });
    } catch (error) {
      console.error("Update failed:", error);
      throw error;
    }
  };

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
      const response = await clientService.rotateClientSecret(id);
      const secret = response?.client_secret || "";

      setSecretModal({
        open: true,
        clientId: response?.client_id || id,
        clientName: name,
        secret,
        title: "Client secret rotated",
        loading: false,
        hasError: !secret,
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
    paginatedClients: clients,
    totalPages,
    totalResults: totalClientCount,
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