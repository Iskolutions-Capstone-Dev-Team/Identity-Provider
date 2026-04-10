import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { usePermissionAccess } from "../context/PermissionContext";
import AuditLogsCard from "../components/audit-logs/AuditLogsCard";
import DataTableSkeleton from "../components/DataTableSkeleton";
import PageHeader from "../components/PageHeader";
import SuccessAlert from "../components/SuccessAlert";
import RegistrationConfigModal from "../components/registration/RegistrationConfigModal";
import RegistrationTable from "../components/registration/RegistrationTable";
import { useAllAppClients } from "../hooks/useAllAppClients";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { registrationService } from "../services/registrationService";
import { ACCOUNT_TYPE_OPTIONS, getAccountTypeBackendId } from "../utils/accountTypes";
import { REGISTRATION_EDIT_PERMISSIONS } from "../utils/permissionAccess";
import { getAllAppClientSelectOptions } from "../utils/userPoolAccess";

export default function Registration() {
  const { colorMode = "light" } = useOutletContext() || {};
  const { hasAnyPermission } = usePermissionAccess();
  const canEditRegistration = hasAnyPermission(REGISTRATION_EDIT_PERMISSIONS);
  const { appClients, appClientsError, isLoadingAppClients } = useAllAppClients({
    enabled: canEditRegistration,
  });
  const [registrationConfigs, setRegistrationConfigs] = useState([]);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(true);
  const [registrationError, setRegistrationError] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [successMessage, setSuccessMessage] = useState("");
  const showLoading = useDelayedLoading(isLoadingRegistration);
  const isDarkMode = colorMode === "dark";
  const appClientOptions = useMemo(
    () => getAllAppClientSelectOptions(appClients),
    [appClients],
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

  const loadRegistrationConfig = useEffectEvent(async () => {
    try {
      setIsLoadingRegistration(true);
      setRegistrationError("");

      const nextConfigs = await Promise.all(
        ACCOUNT_TYPE_OPTIONS.map(async (option) => {
          const config = await registrationService.getClientsByAccountTypeId(
            option.backendId,
            option.id,
          );

          return {
            accountType: option.id,
            clients: Array.isArray(config?.clients) ? config.clients : [],
          };
        }),
      );

      setRegistrationConfigs(nextConfigs);
    } catch (error) {
      console.error("Failed to load registration config:", error);
      setRegistrationConfigs([]);
      setRegistrationError(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to load registration settings. Check the backend connection.",
      );
    } finally {
      setIsLoadingRegistration(false);
    }
  });

  useEffect(() => {
    loadRegistrationConfig();
  }, []);

  const rows = useMemo(
    () =>
      ACCOUNT_TYPE_OPTIONS.map((option) => {
        const matchedConfig = registrationConfigs.find(
          (config) => config.accountType === option.id,
        );
        const clients = Array.isArray(matchedConfig?.clients)
          ? matchedConfig.clients
          : [];

        return {
          accountType: option.id,
          label: option.label,
          clientIds: clients.map((client) => client.id),
          clientNames: clients.map((client) => client.name),
          totalClientCount: clients.length,
        };
      }),
    [registrationConfigs],
  );

  const selectedConfig = useMemo(
    () =>
      rows.find((row) => row.accountType === selectedAccountType) || null,
    [rows, selectedAccountType],
  );

  const handleOpenView = (row) => {
    setSelectedAccountType(row.accountType);
    setModalMode("view");
  };

  const handleOpenEdit = (row) => {
    if (!canEditRegistration) {
      return;
    }

    setSelectedAccountType(row.accountType);
    setModalMode("edit");
  };

  const handleCloseModal = () => {
    setSelectedAccountType(null);
    setModalMode("view");
  };

  const handleSave = async (nextConfig) => {
    const accountTypeId = getAccountTypeBackendId(nextConfig.accountType);

    if (!accountTypeId) {
      throw new Error("Unable to match the selected account type.");
    }

    await registrationService.updatePreapprovedClients({
      accountTypeId,
      clientIds: nextConfig.clientIds,
    });
    await loadRegistrationConfig();
    setSuccessMessage(
      `Updated pre-approved clients for ${nextConfig.label}.`,
    );
  };

  let content = (
    <RegistrationTable
      rows={rows}
      onView={handleOpenView}
      onEdit={handleOpenEdit}
      showEditAction={canEditRegistration}
      colorMode={colorMode}
    />
  );

  if (showLoading) {
    content = (
      <DataTableSkeleton
        theme={isDarkMode ? "userpoolDark" : "userpool"}
        columns={[
          { header: "Account Type", type: "text", width: "w-28" },
          { header: "Client List", type: "badges" },
          { header: "Action", type: "actions" },
        ]}
      />
    );
  } else if (registrationError) {
    content = <div className={errorBoxClassName}>{registrationError}</div>;
  }

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        <PageHeader
          title="Registration"
          description="Configure pre-approved app clients for each account type."
          colorMode={colorMode}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-20 w-20 sm:h-24 sm:w-24">
              <path fillRule="evenodd" d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5Zm6.61 10.936a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 14.47a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd"/>
              <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
            </svg>
          }
          variant="hero"
        />

        <div className="relative">
          <AuditLogsCard colorMode={colorMode}>
            {!showLoading && !registrationError && appClientsError && (
              <div className={warningBoxClassName}>{appClientsError}</div>
            )}

            {!showLoading &&
              !registrationError &&
              !appClientsError &&
              appClientOptions.length === 0 && (
                <div className={infoBoxClassName}>
                  No app clients are available yet. Add app clients first to
                  configure registration access.
                </div>
              )}

            {content}
          </AuditLogsCard>
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

      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </>
  );
}
