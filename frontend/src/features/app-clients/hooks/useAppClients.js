import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientService } from "../../../services/clientService";
import { toast } from "sonner";

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

const toOptionalPositiveInteger = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : "";
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
    one_portal_redirect_link: client.one_portal_link ?? client.one_portal_redirect_link ?? client.onePortalRedirectLink ?? "",
    grants: Array.isArray(client.grants) ? client.grants : [],
    access_token_ttl: toOptionalPositiveInteger(
      client.access_token_ttl ?? client.accessTokenTTL,
    ),
    refresh_token_ttl: toOptionalPositiveInteger(
      client.refresh_token_ttl ?? client.refreshTokenTTL,
    ),
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sort, setSort] = useState("desc");
  const [viewType, setViewType] = useState(() => {
    return localStorage.getItem("appClientsViewType") || "table";
  });
  const [successMessage, setSuccessMessage] = useState("");
  const queryClient = useQueryClient();
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

  useEffect(() => {
    localStorage.setItem("appClientsViewType", viewType);
  }, [viewType]);

  const fetchAppClientsFn = async () => {
    const { items, total, lastPage } = await clientService.getClients({
      limit,
      page,
      keyword: searchKeyword,
      sortBy,
      order: sort,
    });
    const nextClients = Array.isArray(items) ? items.map(mapClientSummary) : [];
    const nextTotalResults = toNonNegativeInteger(total, nextClients.length);
    const nextTotalPages = toPositiveInteger(lastPage, Math.max(1, Math.ceil(nextTotalResults / limit)));
    
    if (page > nextTotalPages) {
      setPage(nextTotalPages);
    }
    
    return {
      clients: nextClients,
      totalClientCount: nextTotalResults,
    };
  };

  const { data, isLoading } = useQuery({
    queryKey: ['appClients', page, limit, searchKeyword, sortBy, sort],
    queryFn: fetchAppClientsFn,
    enabled,
  });

  const clients = data?.clients || [];
  const totalClientCount = data?.totalClientCount || 0;

  const setSearchKeyword = useCallback((value) => {
    const nextValue = typeof value === "string" ? value : "";

    setPage(1);
    setSearch(nextValue);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalClientCount / limit));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const refreshClients = async () => {
    await queryClient.invalidateQueries({ queryKey: ['appClients'] });
    await queryClient.invalidateQueries({ queryKey: ['allAppClients'] });
  };

  const createClientMutation = useMutation({
    mutationFn: async (payload) => clientService.createClient(payload),
    onSuccess: () => {
      toast.success("App client successfully created!", { style: { backgroundColor: "#22c55e", color: "white", borderColor: "#22c55e" } });
      refreshClients();
    }
  });

  const createClient = async (payload) => createClientMutation.mutateAsync(payload);

  const updateClientMutation = useMutation({
    mutationFn: async (payload) => clientService.updateClient(payload.id, payload),
    onSuccess: () => {
      toast.success("App client successfully updated!", { style: { backgroundColor: "#22c55e", color: "white", borderColor: "#22c55e" } });
      refreshClients();
    },
    onError: (error) => {
      console.error("Update failed:", error);
    }
  });

  const updateClient = async (payload) => updateClientMutation.mutateAsync(payload);

  const deleteClientMutation = useMutation({
    mutationFn: async (id) => clientService.deleteClient(id),
    onSuccess: () => {
      toast.success("App client successfully deleted!", { style: { backgroundColor: "#22c55e", color: "white", borderColor: "#22c55e" } });
      refreshClients();
    }
  });

  const deleteClient = async (id) => deleteClientMutation.mutateAsync(id);

  const getClientDetails = useCallback(async (id) => {
    const payload = await queryClient.fetchQuery({
      queryKey: ['appClient', id],
      queryFn: () => clientService.getClientById(id)
    });

    return normalizeClientDetailPayload(payload);
  }, [queryClient]);

  const rotateClientSecretInternal = async (client) => {
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

  const rotateClientSecretMutation = useMutation({
    mutationFn: rotateClientSecretInternal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appClients'] })
  });

  const rotateClientSecret = async (client) => rotateClientSecretMutation.mutateAsync(client);

  return {
    search,
    setSearch: setSearchKeyword,
    page: currentPage,
    setPage,
    limit,
    setLimit,
    sortBy,
    setSortBy,
    sort,
    setSort,
    viewType,
    setViewType,
    paginatedClients: clients,
    totalPages,
    totalResults: totalClientCount,
    loading: isLoading,
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