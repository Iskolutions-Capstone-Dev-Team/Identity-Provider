import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { useAllAppClients } from "../../app-clients/hooks/useAllAppClients";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { registrationService } from "../../../services/registrationService";
import { mergeAccountTypeOptions } from "../../../utils/accountTypes";
import { PERMISSIONS } from "../../../utils/permissionAccess";
import { getAllAppClientSelectOptions } from "../../../utils/userPoolAccess";
import { metricsService } from "../../../services/metricsService";

export function getClientSummary(clients = []) {
  const normalizedClients = Array.isArray(clients) ? clients : [];

  return {
    clientIds: normalizedClients.map((client) => client.id).filter(Boolean),
    clientNames: normalizedClients.map((client) => client.name).filter(Boolean),
    totalClientCount: normalizedClients.length,
  };
}

export function buildRegistrationRows(registrationConfigs = [], accountTypeOptions = []) {
  const accountTypeOptionMap = new Map(
    accountTypeOptions.map((option) => [option.value, option]),
  );

  return registrationConfigs.map((config) => {
    const matchedOption = accountTypeOptionMap.get(config.accountTypeValue);
    const clients = Array.isArray(config?.clients)
      ? config.clients
      : [];
    const { clientIds, clientNames, totalClientCount } = getClientSummary(clients);
    const backendId = matchedOption?.backendId ?? config?.backendId ?? null;

    return {
      accountType: matchedOption?.id ?? config.accountType,
      accountTypeValue: config.accountTypeValue,
      label: matchedOption?.label ?? config.label,
      backendId,
      isSelectable: config.isSelectable ?? true,
      clientIds,
      clientNames,
      totalClientCount,
    };
  });
}

export function getRegistrationActionError(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export function useRegistrationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorMode = "light", globalViewType, setGlobalViewType } = useOutletContext() || {};
  const { hasPermission } = usePermissionAccess();
  
  const canCreateRegistration = hasPermission(PERMISSIONS.CREATE_REGISTRATION_CONFIG);
  const canEditRegistration = hasPermission(PERMISSIONS.EDIT_REGISTRATION_CONFIG);
  const canDeleteRegistration = hasPermission(PERMISSIONS.DELETE_REGISTRATION_CONFIG);
  
  const queryClient = useQueryClient();

  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);
  
  const shouldLoadEditableAppClients = canCreateRegistration || canEditRegistration;
  const { appClients, appClientsError, isLoadingAppClients } = useAllAppClients({
    enabled: shouldLoadEditableAppClients,
  });


  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("account_type_name");
  const [sort, setSort] = useState("desc");
  const [viewType, setViewType] = useState(() => {
    return globalViewType || "card";
  });

  const handleSetViewType = (newViewType) => {
    setViewType(newViewType);
    if (setGlobalViewType) {
      setGlobalViewType(newViewType);
    }
  };

  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [syncTarget, setSyncTarget] = useState(null);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);
  const isDarkMode = colorMode === "dark";
  const searchKeyword = search.trim();

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  const { data: registrationMetrics = null } = useQuery({
    queryKey: ['registrationMetrics'],
    queryFn: () => metricsService.getRegistrationMetrics()
  });

  useEffect(() => {
    if (globalViewType) {
      setViewType(globalViewType);
    }
  }, [globalViewType]);

  const appClientOptions = useMemo(
    () => getAllAppClientSelectOptions(appClients),
    [appClients],
  );



  const setSearchKeyword = (value) => {
    const nextValue = typeof value === "string" ? value : "";
    setPage(1);
    setSearch(nextValue);
  };

  const fetchConfigsFn = async () => {
    const pageData = await registrationService.getRegistrationConfigPage({
      limit,
      page,
      keyword: searchKeyword,
      sortBy,
      order: sort,
    });
    
    const nextConfigs = Array.isArray(pageData?.configs) ? pageData.configs : [];
    
    if (page > 1 && nextConfigs.length === 0) {
      setPage(1);
    }
    
    return {
      configs: nextConfigs,
      totalPages: pageData?.lastPage ?? 1,
      totalResults: pageData?.total ?? 0,
    };
  };

  const { data: configData, isLoading: isLoadingRegistration, error: queryError } = useQuery({
    queryKey: ['registrationConfigs', page, limit, searchKeyword, sortBy, sort],
    queryFn: fetchConfigsFn,
    placeholderData: keepPreviousData,
  });

  const registrationConfigs = configData?.configs || [];
  const registrationError = queryError ? getRegistrationActionError(queryError, "Failed to load registration settings.") : "";
  const showLoading = useDelayedLoading(isLoadingRegistration);

  useEffect(() => {
    if (configData) {
      setTotalPages(configData.totalPages);
      setTotalResults(configData.totalResults);
    }
  }, [configData]);

  const registrationAccountTypeOptions = useMemo(
    () => {
      const configOptions = registrationConfigs.map((config) => ({
        value: config.accountTypeValue,
        label: config.label,
        backendId: config.backendId,
      }));
      const visibleAccountTypes = new Set(
        configOptions.map((option) => option.value).filter(Boolean),
      );

      return mergeAccountTypeOptions(configOptions).filter((option) =>
        visibleAccountTypes.has(option.value),
      );
    },
    [registrationConfigs],
  );

  const rows = useMemo(
    () => buildRegistrationRows(registrationConfigs, registrationAccountTypeOptions),
    [registrationAccountTypeOptions, registrationConfigs],
  );

  useEffect(() => {
    const routeState = location.state || {};
    if (routeState.successMessage) {
      toast.success(routeState.successMessage, { 
        id: "registration-route-success" 
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const resolveAccountTypeId = useCallback(async (config) => {
    if (Number.isInteger(config?.backendId) && config.backendId > 0) {
      return config.backendId;
    }
    const name = config?.accountTypeValue || config?.label || config?.name;
    return queryClient.fetchQuery({
      queryKey: ['resolveAccountTypeId', name],
      queryFn: () => registrationService.resolveAccountTypeIdByName(name)
    });
  }, [queryClient]);

  const getFullRegistrationConfig = useCallback(async (row) => {
    const backendId = await resolveAccountTypeId(row);
    if (!backendId) {
      return null;
    }

    let nextConfig = {
      ...row,
      backendId,
    };

    try {
      const fullConfig = await queryClient.fetchQuery({
        queryKey: ['registrationConfigDetails', backendId, row.accountTypeValue],
        queryFn: () => registrationService.getClientsByAccountTypeId(
          backendId,
          row.accountTypeValue,
        )
      });
      const { clientIds, clientNames, totalClientCount } = getClientSummary(
        fullConfig.clients,
      );

      nextConfig = {
        ...row,
        accountType: fullConfig.accountType || row.accountType,
        accountTypeValue: fullConfig.accountTypeValue || row.accountTypeValue,
        backendId,
        clientIds,
        clientNames,
        totalClientCount,
        created_at: fullConfig.created_at,
        updated_at: fullConfig.updated_at,
      };
    } catch (error) {
      console.error("Failed to load full registration config:", error);
    }

    return nextConfig;
  }, [queryClient, resolveAccountTypeId]);

  const handleOpenCreate = () => {
    if (!canCreateRegistration) return;
    navigate("/registration/create");
  };

  const handleOpenView = async (row) => {
    const fullConfig = await getFullRegistrationConfig(row);
    if (!fullConfig) {
      toast.error("Unable to view this account type right now.", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
      return;
    }
    setSelectedConfig(fullConfig);
    setModalMode("view");
  };

  const handleOpenEdit = async (row) => {
    if (!canEditRegistration) return;
    const fullConfig = await getFullRegistrationConfig(row);
    if (!fullConfig) {
      toast.error("Unable to edit this account type right now.", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
      return;
    }
    setSelectedConfig(fullConfig);
    setModalMode("edit");
  };

  const handleDeleteClick = async (row) => {
    if (!canDeleteRegistration) return;
    const backendId = await resolveAccountTypeId(row);
    if (!backendId) {
      toast.error("Unable to delete this account type right now.", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
      return;
    }
    setDeleteTarget({
      ...row,
      backendId,
    });
    setIsDeleteConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedConfig(null);
    setModalMode("view");
  };

  const updateMutation = useMutation({
    mutationFn: async (payload) => registrationService.updateAccountType(payload),
    onSuccess: (data, payload) => {
      queryClient.invalidateQueries({ queryKey: ['registrationConfigs'] });
      queryClient.invalidateQueries({ queryKey: ['registrationAccountTypes'] });
    }
  });

  const handleSave = async (nextConfig) => {
    const accountTypeName = nextConfig?.name || nextConfig?.label || "";
    const backendId = nextConfig?.backendId ?? (await resolveAccountTypeId(nextConfig));

    if (!backendId) {
      throw new Error("Unable to update this account type right now.");
    }

    try {
      await updateMutation.mutateAsync({
        accountTypeId: backendId,
        name: accountTypeName,
        isSelectable: nextConfig.isSelectable,
        clientIds: nextConfig.clientIds,
      });
      
      setSyncTarget({
        backendId,
        label: accountTypeName,
      });
      toast.success(`Updated pre-approved clients for ${accountTypeName}.`);
    } catch (error) {
      console.error("Failed to update account type:", error);
      toast.error(
        getRegistrationActionError(
          error,
          "Unable to update this account type.",
        ),
        { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } }
      );
    }
  };

  const handleCancelSync = () => {
    if (isSyncingUsers) return;
    setSyncTarget(null);
  };

  const syncMutation = useMutation({
    mutationFn: async (backendId) => registrationService.syncAccountTypeUsers(backendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrationConfigs'] });
    }
  });

  const handleConfirmSync = async () => {
    if (!syncTarget) return;

    try {
      setIsSyncingUsers(true);
      await syncMutation.mutateAsync(syncTarget.backendId);
      toast.success(`Updated all ${syncTarget.label} users.`);
    } catch (error) {
      console.error("Failed to sync account type users:", error);
      toast.error(
        getRegistrationActionError(
          error,
          "Unable to update users for this account type.",
        ),
        { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } }
      );
    } finally {
      setIsSyncingUsers(false);
      setSyncTarget(null);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (backendId) => registrationService.deleteAccountType(backendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrationConfigs'] });
      queryClient.invalidateQueries({ queryKey: ['registrationAccountTypes'] });
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.backendId);
      toast.success(`Deleted ${deleteTarget.label} account type.`);
    } catch (error) {
      console.error("Failed to delete account type:", error);
      toast.error(
        getRegistrationActionError(
          error,
          "Unable to delete this account type.",
        ),
        { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } }
      );
    } finally {
      setDeleteTarget(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  return {
    breadcrumbsContainer,
    colorMode,
    canCreateRegistration,
    canEditRegistration,
    canDeleteRegistration,
    registrationMetrics,
    shouldLoadEditableAppClients,
    isLoadingAppClients,
    appClientsError,
    registrationError,
    search,
    setSearchKeyword,
    page,
    setPage,
    limit,
    setLimit,
    sortBy,
    setSortBy,
    sort,
    setSort,
    viewType,
    setViewType: handleSetViewType,
    totalPages,
    totalResults,
    selectedConfig,
    modalMode,
    deleteTarget,
    setDeleteTarget,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    syncTarget,
    isSyncingUsers,
    showLoading,
    isDarkMode,
    appClientOptions,
    rows,
    handleOpenCreate,
    handleOpenView,
    handleOpenEdit,
    handleDeleteClick,
    handleCloseModal,
    handleSave,
    handleCancelSync,
    handleConfirmSync,
    handleConfirmDelete
  };
}
