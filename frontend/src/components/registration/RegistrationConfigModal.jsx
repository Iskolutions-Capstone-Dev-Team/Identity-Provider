import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import ErrorAlert from "../ErrorAlert";
import MultiSelect from "../MultiSelect";
import { getModalTheme } from "../modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../modalTransition";
import { ACCOUNT_TYPE_OPTIONS, getAccountTypeOption } from "../../utils/accountTypes";

function getClientNames(clientIds = [], appClientOptions = []) {
  const clientLabelLookup = new Map(
    (Array.isArray(appClientOptions) ? appClientOptions : []).map((client) => [
      client.id,
      client.label,
    ]),
  );

  return (Array.isArray(clientIds) ? clientIds : [])
    .map((clientId) => clientLabelLookup.get(clientId))
    .filter(Boolean);
}

function RegistrationIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5Zm6.61 10.936a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 14.47a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
    </svg>
  );
}

export default function RegistrationConfigModal({ open, mode = "view", config = null, appClientOptions = [], isLoadingAppClients = false, appClientsError = "", onClose, onSave, colorMode = "light" }) {
  const [accountTypeName, setAccountTypeName] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [error, setError] = useState("");
  const [accountTypeNameError, setAccountTypeNameError] = useState("");
  const [cachedConfig, setCachedConfig] = useState(config);
  const [cachedMode, setCachedMode] = useState(mode);
  const isModalOpen = open && (Boolean(config) || mode === "create");
  const { shouldRender, isClosing } = useModalTransition(isModalOpen);
  const currentConfig = open ? config : cachedConfig;
  const currentMode = open ? mode : cachedMode;
  const isCreateMode = currentMode === "create";
  const isViewMode = currentMode === "view";
  const isDarkMode = colorMode === "dark";
  const isLockedDefaultAccountType =
    !isCreateMode &&
    Boolean(
      getAccountTypeOption(
        currentConfig?.accountTypeValue ??
          currentConfig?.accountType ??
          currentConfig?.label,
        ACCOUNT_TYPE_OPTIONS,
      ),
    );
  const {
    modalBodyClassName,
    modalBodyStackClassName,
    modalBoxClassName,
    modalCloseButtonClassName,
    modalFooterActionsClassName,
    modalFooterClassName,
    modalHeaderClassName,
    modalHeaderTitleClassName,
    modalHelperTextClassName,
    modalInputClassName,
    modalLabelClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalReadOnlyInputClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);
  const readOnlyListClassName = isDarkMode
    ? "min-h-24 w-full rounded-[1rem] border border-white/10 bg-[rgba(10,15,24,0.76)] px-4 py-4 text-sm text-[#d6c3c7] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    : "min-h-24 w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-4 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]";
  const clientBadgeClassName = isDarkMode
    ? "inline-flex items-center rounded-full border border-[#f8d24e]/25 bg-[#f8d24e]/12 px-3 py-1 text-xs font-semibold text-[#ffe28a]"
    : "inline-flex items-center rounded-full border border-[#f8d24e]/45 bg-[#fff4dc] px-3 py-1 text-xs font-semibold text-[#7b0d15]";
  const emptyListClassName = isDarkMode
    ? "italic text-[#a58d95]"
    : "italic text-[#8f6f76]";
  const helperErrorClassName = isDarkMode
    ? "mt-3 text-xs text-[#ffd8dd]"
    : "mt-3 text-xs text-[#991b1b]";
  const disabledAccountTypeInputClassName =
    `${modalReadOnlyInputClassName} disabled:cursor-not-allowed disabled:opacity-100`;
  const accountTypeInputClassName = `${modalInputClassName} ${
    accountTypeNameError ? "border-red-400 focus:border-red-500" : ""
  }`;
  const modalHeaderSpacingClassName =
    `${modalHeaderClassName} h-[7rem] shrink-0 !px-7 !py-0 sm:!px-8`;
  const modalHeaderContentClassName =
    "flex min-w-0 flex-1 items-center gap-4 pr-3 sm:pr-16";
  const headerIconClassName =
    colorMode === "dark" ? "h-10 w-10 text-[#ffe28a]" : "h-10 w-10 text-[#fff0a8]";
  const sectionHeaderClassName = isDarkMode
    ? "mb-5 border-b border-white/10 pb-4"
    : "mb-5 border-b border-[#7b0d15]/10 pb-4";
  const sectionDescriptionClassName = `${modalHelperTextClassName} !mb-0`;

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    setCachedConfig(config);
    setCachedMode(mode);
  }, [config, isModalOpen, mode]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setAccountTypeName(currentConfig?.label ?? "");
    setSelectedClientIds(
      Array.isArray(currentConfig?.clientIds) ? currentConfig.clientIds : [],
    );
    setError("");
    setAccountTypeNameError("");
  }, [currentConfig, open]);

  const displayedClientNames = useMemo(
    () => {
      if (isViewMode) {
        return Array.isArray(currentConfig?.clientNames) &&
          currentConfig.clientNames.length > 0
          ? currentConfig.clientNames
          : getClientNames(currentConfig?.clientIds, appClientOptions);
      }

      return getClientNames(selectedClientIds, appClientOptions);
    },
    [
      appClientOptions,
      currentConfig,
      isViewMode,
      selectedClientIds,
    ],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

    const normalizedAccountTypeName = accountTypeName.trim();
    const nextAccountTypeName = isLockedDefaultAccountType
      ? normalizedAccountTypeName || currentConfig?.label?.trim() || ""
      : normalizedAccountTypeName;

    if (!nextAccountTypeName) {
      setAccountTypeNameError("Account type name is required.");
      setError("Account type name is required.");
      return;
    }

    try {
      setError("");
      setAccountTypeNameError("");
      await onSave({
        ...currentConfig,
        name: nextAccountTypeName,
        label: nextAccountTypeName,
        clientIds: selectedClientIds,
      });
      onClose();
    } catch (saveError) {
      setError(
        saveError?.message || "Unable to save registration settings.",
      );
    }
  };

  if (!shouldRender || (!currentConfig && !isCreateMode)) {
    return null;
  }

  const modalTitle = isCreateMode
    ? "Create Registration"
    : isViewMode
      ? "View Registration"
      : "Edit Registration";
  const accountTypeDescription = isViewMode
    ? "View the configured account type."
    : isLockedDefaultAccountType
      ? "Default account type names cannot be changed."
      : isCreateMode
        ? "Enter the account type name."
        : "Update the account type name.";
  const clientListDescription = isViewMode
    ? "View the app clients pre-approved for this account type."
    : "Select the app clients to pre-approve for this account type.";
  const renderSectionHeader = (title, description, isRequired = false) => (
    <div className={sectionHeaderClassName}>
      <label className={modalLabelClassName}>
        {title} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <p className={sectionDescriptionClassName}>
        {description}
      </p>
    </div>
  );

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderSpacingClassName}>
          <div className="flex h-full items-center justify-between gap-4 sm:gap-6">
            <div className={modalHeaderContentClassName}>
              <RegistrationIcon className={headerIconClassName} />
              <h3 className={modalHeaderTitleClassName}>{modalTitle}</h3>
            </div>

            <button type="button" className={`${modalCloseButtonClassName} shrink-0`} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <form className={modalBodyClassName} onSubmit={handleSubmit}>
          <div className={modalBodyStackClassName}>
            <ErrorAlert message={error} onClose={() => setError("")} />

            <section className={modalSectionClassName}>
              <div className="space-y-5">
                <div>
                  {renderSectionHeader(
                    "Account Type",
                    accountTypeDescription,
                    !isViewMode && !isLockedDefaultAccountType,
                  )}
                  {isViewMode || isLockedDefaultAccountType ? (
                    <input
                      type="text"
                      value={accountTypeName || currentConfig?.label || ""}
                      readOnly
                      disabled
                      aria-disabled="true"
                      className={disabledAccountTypeInputClassName}
                    />
                  ) : (
                    <>
                      <input
                        type="text"
                        value={accountTypeName}
                        onChange={(event) => {
                          setAccountTypeName(event.target.value);
                          setAccountTypeNameError("");
                          setError("");
                        }}
                        placeholder="Enter account type"
                        className={accountTypeInputClassName}
                      />
                      {accountTypeNameError && (
                        <p className="mt-2 text-xs text-red-500">
                          {accountTypeNameError}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  {renderSectionHeader(
                    "Client List",
                    clientListDescription,
                  )}

                  {isViewMode ? (
                    <div className={readOnlyListClassName}>
                      {displayedClientNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {displayedClientNames.map((clientName) => (
                            <span
                              key={`${currentConfig?.accountType || accountTypeName}-${clientName}`}
                              className={clientBadgeClassName}
                            >
                              {clientName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className={emptyListClassName}>
                          No pre-approved clients
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      <MultiSelect
                        options={appClientOptions}
                        selectedValues={selectedClientIds}
                        onChange={setSelectedClientIds}
                        placeholder="Select app clients"
                        variant="userpoolModal"
                        colorMode={colorMode}
                      />
                      {isLoadingAppClients && (
                        <p className={modalHelperTextClassName}>
                          Loading app clients...
                        </p>
                      )}
                      {appClientsError && !isLoadingAppClients && (
                        <p className={helperErrorClassName}>{appClientsError}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
        </form>

        <div className={modalFooterClassName}>
          <div className={modalFooterActionsClassName}>
            <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button type="button" className={modalPrimaryButtonClassName} onClick={handleSubmit}>
                {isCreateMode ? "Create" : "Save"}
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}