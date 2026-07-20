import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import Breadcrumbs from "../../../components/Breadcrumbs";
import RegistrationConfigModal from "../components/RegistrationConfigModal";
import RegistrationSyncConfirmModal from "../components/RegistrationSyncConfirmModal";
import RegistrationListCard from "../components/RegistrationListCard";
import { RegistrationIcon } from "../components/registrationIcons";
import { Plus, FileText, FileCheckCorner } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAllAppClients } from "../../app-clients/hooks/useAllAppClients";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";
import { registrationService } from "../../../services/registrationService";
import { mergeAccountTypeOptions } from "../../../utils/accountTypes";
import { PERMISSIONS } from "../../../utils/permissionAccess";
import { getAllAppClientSelectOptions } from "../../../utils/userPoolAccess";
import MetricsCard from "../../../components/MetricsCard";
import { metricsService } from "../../../services/metricsService";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

function getClientSummary(clients = []) {
  const normalizedClients = Array.isArray(clients) ? clients : [];

  return {
    clientIds: normalizedClients.map((client) => client.id).filter(Boolean),
    clientNames: normalizedClients.map((client) => client.name).filter(Boolean),
    totalClientCount: normalizedClients.length,
  };
}

function buildRegistrationRows(registrationConfigs = [], accountTypeOptions = []) {
  const registrationConfigMap = new Map(
    registrationConfigs.map((config) => [config.accountTypeValue, config]),
  );

  return accountTypeOptions.map((option) => {
    const matchedConfig = registrationConfigMap.get(option.value);
    const clients = Array.isArray(matchedConfig?.clients)
      ? matchedConfig.clients
      : [];
    const { clientIds, clientNames, totalClientCount } = getClientSummary(clients);
    const backendId = option.backendId ?? matchedConfig?.backendId ?? null;

    return {
      accountType: option.id,
      accountTypeValue: option.value,
      label: option.label,
      backendId,
      clientIds,
      clientNames,
      totalClientCount,
    };
  });
}

function getRegistrationActionError(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export default function Registration() {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorMode = "light" } = useOutletContext() || {};
  const { hasPermission } = usePermissionAccess();
  const canCreateRegistration = hasPermission(
    PERMISSIONS.CREATE_REGISTRATION_CONFIG,
  );
  const canEditRegistration = hasPermission(
    PERMISSIONS.EDIT_REGISTRATION_CONFIG,
  );
  const canDeleteRegistration = hasPermission(
    PERMISSIONS.DELETE_REGISTRATION_CONFIG,
  );
  const [registrationMetrics, setRegistrationMetrics] = useState(null);

  useEffect(() => {
    metricsService.getRegistrationMetrics().then(setRegistrationMetrics).catch(() => {});
  }, []);
  const shouldLoadEditableAppClients =
    canCreateRegistration || canEditRegistration;
  const { appClients, appClientsError, isLoadingAppClients } = useAllAppClients({
    enabled: shouldLoadEditableAppClients,
  });
  const [registrationConfigs, setRegistrationConfigs] = useState([]);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(true);
  const [registrationError, setRegistrationError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [syncTarget, setSyncTarget] = useState(null);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);
  const showLoading = useDelayedLoading(isLoadingRegistration);
  const isDarkMode = colorMode === "dark";
  const searchKeyword = search.trim();
  const appClientOptions = useMemo(
    () => getAllAppClientSelectOptions(appClients),
    [appClients],
  );
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
  const errorBoxClassName = isDarkMode
    ? "rounded-[1.75rem] border border-[#f8d24e]/15 bg-[linear-gradient(180deg,rgba(48,18,24,0.96),rgba(27,16,21,0.96))] px-6 py-12 text-center text-sm font-medium text-[#f2dfe2] shadow-[0_22px_55px_-38px_rgba(2,6,23,0.75)]"
    : "rounded-[1.75rem] border border-[#b42318]/15 bg-[linear-gradient(180deg,rgba(255,247,247,0.98),rgba(255,255,255,0.94))] px-6 py-12 text-center text-sm font-medium text-[#991b1b] shadow-[0_22px_55px_-38px_rgba(43,3,7,0.35)]";
  const infoBoxClassName = isDarkMode
    ? "rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-[#d6c3c7]"
    : "rounded-[1.4rem] border border-[#7b0d15]/10 bg-white/75 px-5 py-4 text-sm text-[#6f4f56]";
  const warningBoxClassName = isDarkMode
    ? "rounded-[1.4rem] border border-[#f8d24e]/20 bg-[#f8d24e]/10 px-5 py-4 text-sm text-[#ffe28a]"
    : "rounded-[1.4rem] border border-[#f8d24e]/45 bg-[#fff4dc] px-5 py-4 text-sm text-[#7b0d15]";
  const setSearchKeyword = (value) => {
    const nextValue = typeof value === "string" ? value : "";

    setPage(1);
    setSearch(nextValue);
  };
  const loadRegistrationConfig = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setIsLoadingRegistration(true);
      }

      setRegistrationError("");

      const pageData = await registrationService.getRegistrationConfigPage({
        limit: ITEMS_PER_PAGE,
        page,
        keyword: searchKeyword,
      });
      const nextConfigs = Array.isArray(pageData?.configs)
        ? pageData.configs
        : [];
      const nextTotalPages =
        Number.isInteger(pageData?.lastPage) && pageData.lastPage > 0
          ? pageData.lastPage
          : 1;
      const nextTotalResults =
        Number.isInteger(pageData?.total) && pageData.total >= 0
          ? pageData.total
          : nextConfigs.length;

      if (page > nextTotalPages) {
        setPage(nextTotalPages);
        return;
      }

      setRegistrationConfigs(nextConfigs);
      setTotalPages(nextTotalPages);
      setTotalResults(nextTotalResults);
    } catch (error) {
      console.error("Failed to load registration config:", error);
      setRegistrationConfigs([]);
      setTotalPages(1);
      setTotalResults(0);
      setRegistrationError(
        getRegistrationActionError(
          error,
          "Failed to load registration settings. Check the backend connection.",
        ),
      );
    } finally {
      if (showLoading) {
        setIsLoadingRegistration(false);
      }
    }
  }, [page, searchKeyword]);

  useEffect(() => {
    loadRegistrationConfig();
  }, [loadRegistrationConfig]);

  useEffect(() => {
    const routeState = location.state || {};

    if (routeState.successMessage) {
      toast.success(routeState.successMessage, { 
        id: "registration-route-success", 
        style: { backgroundColor: "#22c55e", color: "white", borderColor: "#22c55e" } 
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    location.pathname,
    location.state,
    navigate,
  ]);

  const resolveAccountTypeId = useCallback(async (config) => {
    if (Number.isInteger(config?.backendId) && config.backendId > 0) {
      return config.backendId;
    }

    return registrationService.resolveAccountTypeIdByName(
      config?.accountTypeValue || config?.label || config?.name,
    );
  }, []);

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
      const fullConfig = await registrationService.getClientsByAccountTypeId(
        backendId,
        row.accountTypeValue,
      );
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
  }, [resolveAccountTypeId]);

  const handleOpenCreate = () => {
    if (!canCreateRegistration) {
      return;
    }

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
    if (!canEditRegistration) {
      return;
    }

    const fullConfig = await getFullRegistrationConfig(row);

    if (!fullConfig) {
      toast.error("Unable to edit this account type right now.", { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } });
      return;
    }

    setSelectedConfig(fullConfig);
    setModalMode("edit");
  };

  const handleDeleteClick = async (row) => {
    if (!canDeleteRegistration) {
      return;
    }

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

  const handleSave = async (nextConfig) => {
    const accountTypeName = nextConfig?.name || nextConfig?.label || "";
    const backendId = nextConfig?.backendId ?? (await resolveAccountTypeId(nextConfig));

    if (!backendId) {
      throw new Error("Unable to update this account type right now.");
    }

    try {
      await registrationService.updateAccountType({
        accountTypeId: backendId,
        name: accountTypeName,
        clientIds: nextConfig.clientIds,
      });
      await loadRegistrationConfig({ showLoading: false });
      setSyncTarget({
        backendId,
        label: accountTypeName,
      });
      toast.success(`Updated pre-approved clients for ${accountTypeName}.`, { style: { backgroundColor: "#22c55e", color: "white", borderColor: "#22c55e" } });
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
    if (isSyncingUsers) {
      return;
    }

    setSyncTarget(null);
  };

  const handleConfirmSync = async () => {
    if (!syncTarget) {
      return;
    }

    try {
      setIsSyncingUsers(true);
      await registrationService.syncAccountTypeUsers(syncTarget.backendId);
      toast.success(`Updated all ${syncTarget.label} users.`, { style: { backgroundColor: "#22c55e", color: "white", borderColor: "#22c55e" } });
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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await registrationService.deleteAccountType(deleteTarget.backendId);
      await loadRegistrationConfig({ showLoading: false });
      toast.success(`Deleted ${deleteTarget.label} account type.`, { style: { backgroundColor: "#22c55e", color: "white", borderColor: "#22c55e" } });
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

  let tableContent = null;
  let showTableFooter = true;

  if (showLoading) {
    tableContent = (
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 text-center">Account Type</TableHead>
                <TableHead className="w-1/3 text-center">Client List</TableHead>
                <TableHead className="w-1/3 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center p-5">
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center p-5">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full hidden sm:block" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center p-5">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
    showTableFooter = false;
  } else if (registrationError) {
    tableContent = <div className={errorBoxClassName}>{registrationError}</div>;
    showTableFooter = false;
  }

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-5 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        <Breadcrumbs
          colorMode={colorMode}
          items={[
            {
              label: "Registration",
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <FileCheckCorner className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Registration</h1>
              <p className="text-muted-foreground">Configure pre-approved app clients for each account type.</p>
            </div>
          </div>

          {canCreateRegistration && (
            <Button 
              className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:text-black h-11 px-6 rounded-lg font-bold text-[15px] transition-colors duration-200"
              onClick={handleOpenCreate}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account Type
            </Button>
          )}
        </div>

        <MetricsCard
          colorMode={colorMode}
          isLoading={showLoading}
          metrics={(Array.isArray(registrationMetrics) ? registrationMetrics : [])
            .filter((m) => m.title !== "Pending Invitations")
            .map((m) => ({
            title: m.title,
            value: m.value,
            Icon: FileText,
          }))}
        />

        <div className="relative">
          <RegistrationListCard
            loading={showLoading}
            rows={rows}
            totalResults={totalResults}
            itemsPerPage={ITEMS_PER_PAGE}
            search={search}
            setSearch={setSearchKeyword}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteClick}
            tableContent={tableContent}
            showFooter={showTableFooter}
            showEditAction={canEditRegistration}
            showDeleteAction={canDeleteRegistration}
            colorMode={colorMode}
          >
            {!showLoading && !registrationError && appClientsError && (
              shouldLoadEditableAppClients ? (
                <div className={warningBoxClassName}>{appClientsError}</div>
              ) : null
            )}

            {!showLoading &&
              !registrationError &&
              shouldLoadEditableAppClients &&
              !appClientsError &&
              appClientOptions.length === 0 && (
                <div className={infoBoxClassName}>
                  No app clients are available yet. Add app clients first to
                  configure registration access.
                </div>
              )}
          </RegistrationListCard>
        </div>
      </div>

      <RegistrationConfigModal
        open={Boolean(selectedConfig)}
        mode={modalMode}
        config={selectedConfig}
        appClientOptions={appClientOptions}
        isLoadingAppClients={isLoadingAppClients}
        appClientsError={appClientsError}
        onClose={handleCloseModal}
        onSave={handleSave}
        colorMode={colorMode}
      />

      <DeleteConfirmModal
        open={isDeleteConfirmOpen}
        message={`Delete ${deleteTarget?.label || "this"} account type?`}
        theme="glass"
        colorMode={colorMode}
        onCancel={() => {
          setDeleteTarget(null);
          setIsDeleteConfirmOpen(false);
        }}
        onConfirm={handleConfirmDelete}
      />

      <RegistrationSyncConfirmModal
        open={Boolean(syncTarget)}
        accountTypeLabel={syncTarget?.label || "this account type"}
        isSubmitting={isSyncingUsers}
        colorMode={colorMode}
        onCancel={handleCancelSync}
        onConfirm={handleConfirmSync}
      />
    </>
  );
}
