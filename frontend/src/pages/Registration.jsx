import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../context/PermissionContext";
import DataTableSkeleton from "../components/DataTableSkeleton";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ErrorAlert from "../components/ErrorAlert";
import PageHeader from "../components/PageHeader";
import PageHeaderActionButton from "../components/PageHeaderActionButton";
import SuccessAlert from "../components/SuccessAlert";
import RegistrationConfigModal from "../components/registration/RegistrationConfigModal";
import RegistrationSyncConfirmModal from "../components/registration/RegistrationSyncConfirmModal";
import RegistrationListCard from "../components/registration/RegistrationListCard";
import { useAllAppClients } from "../hooks/useAllAppClients";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { registrationService } from "../services/registrationService";
import { mergeAccountTypeOptions } from "../utils/accountTypes";
import { PERMISSIONS } from "../utils/permissionAccess";
import { getAllAppClientSelectOptions } from "../utils/userPoolAccess";

const ITEMS_PER_PAGE = 10;

function createEmptyConfig() {
  return {
    accountType: "",
    accountTypeValue: "",
    label: "",
    backendId: null,
    clientIds: [],
    clientNames: [],
    totalClientCount: 0,
  };
}

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
  const [actionError, setActionError] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [successMessage, setSuccessMessage] = useState("");
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

  const resolveAccountTypeId = useCallback(async (config) => {
    if (Number.isInteger(config?.backendId) && config.backendId > 0) {
      return config.backendId;
    }

    return registrationService.resolveAccountTypeIdByName(
      config?.accountTypeValue || config?.label || config?.name,
    );
  }, []);

  const handleOpenCreate = () => {
    if (!canCreateRegistration) {
      return;
    }

    setActionError("");
    setSelectedConfig(createEmptyConfig());
    setModalMode("create");
  };

  const handleOpenView = (row) => {
    setActionError("");
    setSelectedConfig(row);
    setModalMode("view");
  };

  const handleOpenEdit = async (row) => {
    if (!canEditRegistration) {
      return;
    }

    setActionError("");

    const backendId = await resolveAccountTypeId(row);

    if (!backendId) {
      setActionError("Unable to edit this account type right now.");
      return;
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
      };
    } catch (error) {
      console.error("Failed to load full registration config:", error);
    }

    setSelectedConfig(nextConfig);
    setModalMode("edit");
  };

  const handleDeleteClick = async (row) => {
    if (!canDeleteRegistration) {
      return;
    }

    setActionError("");

    const backendId = await resolveAccountTypeId(row);

    if (!backendId) {
      setActionError("Unable to delete this account type right now.");
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

    if (modalMode === "create") {
      await registrationService.createAccountType({
        name: accountTypeName,
        clientIds: nextConfig.clientIds,
      });

      await resolveAccountTypeId({
        ...nextConfig,
        name: accountTypeName,
        label: accountTypeName,
      });
      await loadRegistrationConfig({ showLoading: false });
      setSuccessMessage(`Created ${accountTypeName} account type.`);
      return;
    }

    const backendId = nextConfig?.backendId ?? (await resolveAccountTypeId(nextConfig));

    if (!backendId) {
      throw new Error("Unable to update this account type right now.");
    }

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
    setSuccessMessage(`Updated pre-approved clients for ${accountTypeName}.`);
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
      setActionError("");
      setIsSyncingUsers(true);
      await registrationService.syncAccountTypeUsers(syncTarget.backendId);
      setSuccessMessage(`Updated all ${syncTarget.label} users.`);
    } catch (error) {
      console.error("Failed to sync account type users:", error);
      setActionError(
        getRegistrationActionError(
          error,
          "Unable to update users for this account type.",
        ),
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
      setActionError("");
      await registrationService.deleteAccountType(deleteTarget.backendId);
      await loadRegistrationConfig({ showLoading: false });
      setSuccessMessage(`Deleted ${deleteTarget.label} account type.`);
    } catch (error) {
      console.error("Failed to delete account type:", error);
      setActionError(
        getRegistrationActionError(
          error,
          "Unable to delete this account type.",
        ),
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
      <DataTableSkeleton
        theme={isDarkMode ? "userpoolDark" : "userpool"}
        columns={[
          { header: "Account Type", type: "text", width: "w-28" },
          { header: "Client List", type: "badges" },
          { header: "Action", type: "actions" },
        ]}
      />
    );
    showTableFooter = false;
  } else if (registrationError) {
    tableContent = <div className={errorBoxClassName}>{registrationError}</div>;
    showTableFooter = false;
  }

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <PageHeader
              title="Registration"
              description="Configure pre-approved app clients for each account type."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-14 w-14 sm:h-16 sm:w-16">
                  <path fillRule="evenodd" d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5Zm6.61 10.936a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 14.47a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd"/>
                  <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                </svg>
              }
              colorMode={colorMode}
            />
          </div>

          {canCreateRegistration && (
            <div className="self-end sm:self-center">
              <PageHeaderActionButton colorMode={colorMode} onClick={handleOpenCreate}>
                + Add Account Type
              </PageHeaderActionButton>
            </div>
          )}
        </div>

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
            <ErrorAlert
              message={actionError}
              onClose={() => setActionError("")}
            />

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

      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </>
  );
}