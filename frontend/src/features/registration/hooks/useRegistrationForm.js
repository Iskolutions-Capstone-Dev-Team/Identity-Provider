import { useState, useEffect, useMemo } from "react";
import { ACCOUNT_TYPE_OPTIONS, getAccountTypeOption } from "../../../utils/accountTypes";

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

export function useRegistrationForm({ mode = "create", config = null, appClientOptions = [], onSave, onClose }) {
  const [accountTypeName, setAccountTypeName] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [accountTypeNameError, setAccountTypeNameError] = useState("");

  const isCreateMode = mode === "create";
  const isViewMode = mode === "view";

  const isLockedDefaultAccountType =
    !isCreateMode &&
    Boolean(
      getAccountTypeOption(
        config?.accountTypeValue ?? config?.accountType ?? config?.label,
        ACCOUNT_TYPE_OPTIONS,
      ),
    );

  useEffect(() => {
    if (isCreateMode) {
      setAccountTypeName("");
      setSelectedClientIds([]);
      setAccountTypeNameError("");
      return;
    }

    setAccountTypeName(config?.label ?? "");
    setSelectedClientIds(Array.isArray(config?.clientIds) ? config.clientIds : []);
    setAccountTypeNameError("");
  }, [config, isCreateMode]);

  const displayedClientNames = useMemo(
    () => {
      if (isViewMode) {
        return Array.isArray(config?.clientNames) && config.clientNames.length > 0
          ? config.clientNames
          : getClientNames(config?.clientIds, appClientOptions);
      }
      return getClientNames(selectedClientIds, appClientOptions);
    },
    [appClientOptions, config, isViewMode, selectedClientIds],
  );

  const clearErrors = () => {
    setAccountTypeNameError("");
  };

  const handleAccountTypeNameChange = (value) => {
    setAccountTypeName(value);
    clearErrors();
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();

    if (isViewMode) {
      if (onClose) onClose();
      return;
    }

    const normalizedAccountTypeName = accountTypeName.trim();
    const nextAccountTypeName = isLockedDefaultAccountType
      ? normalizedAccountTypeName || config?.label?.trim() || ""
      : normalizedAccountTypeName;

    if (!nextAccountTypeName) {
      setAccountTypeNameError("Account type name is required.");
      return;
    }

    try {
      clearErrors();
      if (onSave) {
        await onSave({
          ...config,
          name: nextAccountTypeName,
          label: nextAccountTypeName,
          clientIds: selectedClientIds,
        });
      }
      if (onClose && !isCreateMode) onClose();
    } catch (saveError) {
      // Assuming parent handles or we could show a toast here
    }
  };

  return {
    accountTypeName,
    selectedClientIds,
    setSelectedClientIds,
    accountTypeNameError,
    isCreateMode,
    isViewMode,
    isLockedDefaultAccountType,
    displayedClientNames,
    handleAccountTypeNameChange,
    handleSubmit,
  };
}
