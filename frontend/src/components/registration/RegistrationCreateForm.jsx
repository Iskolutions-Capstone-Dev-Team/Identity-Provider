import { useState } from "react";
import ErrorAlert from "../ErrorAlert";
import MultiSelect from "../MultiSelect";
import { getModalTheme } from "../modalTheme";

export default function RegistrationCreateForm({
  appClientOptions = [],
  isLoadingAppClients = false,
  appClientsError = "",
  onClose,
  onSave,
  colorMode = "light",
}) {
  const [accountTypeName, setAccountTypeName] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [error, setError] = useState("");
  const [accountTypeNameError, setAccountTypeNameError] = useState("");
  const isDarkMode = colorMode === "dark";
  const {
    modalBodyStackClassName,
    modalHelperTextClassName,
    modalInputClassName,
    modalLabelClassName,
    modalPrimaryButtonClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);
  const accountTypeInputClassName = `${modalInputClassName} ${
    accountTypeNameError ? "border-red-400 focus:border-red-500" : ""
  }`;
  const helperErrorClassName = isDarkMode
    ? "mt-3 text-xs text-[#ffd8dd]"
    : "mt-3 text-xs text-[#991b1b]";
  const sectionHeaderClassName = isDarkMode
    ? "mb-5 border-b border-white/10 pb-4"
    : "mb-5 border-b border-[#7b0d15]/10 pb-4";
  const sectionDescriptionClassName = `${modalHelperTextClassName} !mb-0`;
  const footerActionsClassName =
    "flex flex-col-reverse gap-3 md:mb-12 lg:flex-row lg:justify-end xl:mb-16 [&>button]:w-full lg:[&>button]:w-auto";

  const clearErrors = () => {
    setError("");
    setAccountTypeNameError("");
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedAccountTypeName = accountTypeName.trim();

    if (!normalizedAccountTypeName) {
      setAccountTypeNameError("Account type name is required.");
      setError("Account type name is required.");
      return;
    }

    try {
      clearErrors();
      await onSave({
        name: normalizedAccountTypeName,
        label: normalizedAccountTypeName,
        clientIds: selectedClientIds,
      });
    } catch (saveError) {
      setError(
        saveError?.message || "Unable to save registration settings.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <form id="registration-config-form" noValidate className={modalBodyStackClassName} onSubmit={handleSubmit}>
        <ErrorAlert message={error} onClose={() => setError("")} />

        <section className={modalSectionClassName}>
          <div className="space-y-5">
            <div>
              {renderSectionHeader(
                "Account Type",
                "Enter the account type name.",
                true,
              )}
              <input
                type="text"
                value={accountTypeName}
                onChange={(event) => {
                  setAccountTypeName(event.target.value);
                  clearErrors();
                }}
                placeholder="Enter account type"
                className={accountTypeInputClassName}
              />
              {accountTypeNameError && (
                <p className="mt-2 text-xs text-red-500">
                  {accountTypeNameError}
                </p>
              )}
            </div>

            <div>
              {renderSectionHeader(
                "Client List",
                "Select the app clients to pre-approve for this account type.",
              )}
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
            </div>
          </div>
        </section>
      </form>

      <div className={footerActionsClassName}>
        <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
          Cancel
        </button>
        <button form="registration-config-form" type="submit" className={modalPrimaryButtonClassName}>
          Create
        </button>
      </div>
    </div>
  );
}
