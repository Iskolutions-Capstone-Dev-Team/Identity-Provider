import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import ErrorAlert from "../ErrorAlert";
import MultiSelect from "../MultiSelect";
import { getModalTheme } from "../modalTheme";

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

export default function RegistrationConfigModal({ open, mode = "view", config = null, appClientOptions = [], isLoadingAppClients = false, appClientsError = "", onClose, onSave, colorMode = "light" }) {
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [error, setError] = useState("");
  const isViewMode = mode === "view";
  const isDarkMode = colorMode === "dark";
  const {
    modalBodyClassName,
    modalBodyStackClassName,
    modalBoxClassName,
    modalCloseButtonClassName,
    modalFooterActionsClassName,
    modalFooterClassName,
    modalHeaderClassName,
    modalHeaderDescriptionClassName,
    modalHeaderTitleClassName,
    modalHelperTextClassName,
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

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedClientIds(
      Array.isArray(config?.clientIds) ? config.clientIds : [],
    );
    setError("");
  }, [open, config]);

  const displayedClientNames = useMemo(
    () => {
      if (isViewMode) {
        return Array.isArray(config?.clientNames) && config.clientNames.length > 0
          ? config.clientNames
          : getClientNames(config?.clientIds, appClientOptions);
      }

      return getClientNames(selectedClientIds, appClientOptions);
    },
    [
      appClientOptions,
      config?.clientIds,
      config?.clientNames,
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

    try {
      setError("");
      await onSave({
        ...config,
        clientIds: selectedClientIds,
      });
      onClose();
    } catch (saveError) {
      setError(
        saveError?.message || "Unable to save registration settings.",
      );
    }
  };

  if (!open || !config) {
    return null;
  }

  return createPortal(
    <dialog open className={modalOverlayClassName}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderClassName}>
          <div className="flex items-start justify-between gap-4 sm:gap-6">
            <div className="max-w-xl pr-12 sm:pr-14">
              <h3 className={modalHeaderTitleClassName}>
                {isViewMode ? "View Registration" : "Edit Registration"}
              </h3>
              <p className={`${modalHeaderDescriptionClassName} max-w-[28rem] leading-relaxed`}>
                {isViewMode
                  ? "Review the pre-approved app clients for this account type."
                  : "Update the pre-approved app clients for this account type."}
              </p>
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
                  <label className={modalLabelClassName}>Account Type</label>
                  <input type="text" value={config.label} readOnly disabled aria-disabled="true" className={disabledAccountTypeInputClassName}/>
                </div>

                <div>
                  <label className={modalLabelClassName}>Client List</label>

                  {isViewMode ? (
                    <div className={readOnlyListClassName}>
                      {displayedClientNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {displayedClientNames.map((clientName) => (
                            <span
                              key={`${config.accountType}-${clientName}`}
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
                      <p className={modalHelperTextClassName}>
                        Select the app clients to pre-approve for this account
                        type.
                      </p>
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
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}