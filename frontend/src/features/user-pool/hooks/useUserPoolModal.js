import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useRegistrationAccountTypes } from "../../registration/hooks/useRegistrationAccountTypes";
import { useAllRoles } from "../../roles/hooks/useAllRoles";
import { ADMIN_USER_TYPE, getAdminRoleOptions, getAllAppClientSelectOptions, getAppClientNamesByIds } from "../../../utils/userPoolAccess";
import { isAdminAccountType, getAccountTypeValue } from "../../../utils/accountTypes";

export const initialFormData = {
  id: "",
  email: "",
  givenName: "",
  middleName: "",
  surname: "",
  suffix: "",
  status: "active",
  roleId: null,
  roles: [],
  accessibleClientIds: [],
  accessibleClientNames: [],
  manageableClientIds: [],
  manageableClientNames: [],
  accountType: "",
};

export const STATUS_VALUES = new Set(["active", "inactive", "suspended"]);

export const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

export const normalizeStatus = (value) => {
  const normalizedValue = normalizeText(value).toLowerCase();
  return STATUS_VALUES.has(normalizedValue) ? normalizedValue : "active";
};

export const normalizeRoleId = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const normalizedValue = Number.parseInt(value, 10);
  return Number.isInteger(normalizedValue) && normalizedValue > 0 ? normalizedValue : null;
};

export const normalizeAccountTypeId = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const normalizedValue = Number.parseInt(value, 10);
  return Number.isInteger(normalizedValue) && normalizedValue > 0 ? normalizedValue : null;
};

export const normalizeClientIds = (clientIds) =>
  Array.from(new Set((Array.isArray(clientIds) ? clientIds : []).filter(Boolean)));

export const normalizeClientNames = (clientNames) =>
  (Array.isArray(clientNames) ? clientNames : [])
    .map((clientName) => (typeof clientName === "string" ? clientName.trim() : ""))
    .filter(Boolean);

export const normalizeRoleNames = (roles) => {
  const normalizedRoles = Array.isArray(roles) ? roles : roles === null || roles === undefined ? [] : [roles];
  return Array.from(
    new Set(
      normalizedRoles
        .map((role) => {
          if (typeof role === "string") return role.trim();
          return normalizeText(role?.role_name || role?.roleName || role?.name);
        })
        .filter(Boolean),
    ),
  );
};

export const extractErrorMessage = (error) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  "Unable to save user changes.";

export const createFormData = (user) => ({
  id: user?.id || "",
  email: user?.email || "",
  givenName: user?.givenName || "",
  middleName: user?.middleName || "",
  surname: user?.surname || "",
  suffix: user?.suffix || user?.name_suffix || user?.suffixName || user?.suffix_name || "",
  status: normalizeStatus(user?.status),
  roleId: normalizeRoleId(user?.roleId),
  roles: normalizeRoleNames(user?.roles),
  accessibleClientIds: normalizeClientIds(user?.accessibleClientIds),
  accessibleClientNames: normalizeClientNames(user?.accessibleClientNames),
  manageableClientIds: normalizeClientIds(user?.manageableClientIds),
  manageableClientNames: normalizeClientNames(user?.manageableClientNames),
  accountType: getAccountTypeValue(user?.accountType || user?.account_type || ""),
  accountTypeId: normalizeAccountTypeId(user?.accountTypeId || user?.account_type_id),
});

export const getSelectedClientOptions = (clientIds = [], clientNames = []) =>
  normalizeClientIds(clientIds).map((clientId, index) => ({
    id: clientId,
    label: normalizeText(clientNames[index]) || clientId,
  }));

export const mergeClientOptions = (baseOptions = [], ...selectedOptionLists) => {
  const optionMap = new Map();
  baseOptions.forEach((option) => {
    if (option?.id && option?.label) optionMap.set(option.id, option);
  });
  selectedOptionLists.flat().forEach((option) => {
    if (option?.id && option?.label && !optionMap.has(option.id)) optionMap.set(option.id, option);
  });
  return Array.from(optionMap.values());
};

export function useUserPoolModal({
  open,
  mode,
  user,
  userType = "regular",
  appClientOptions = [],
  onSubmit,
  onClose,
  canEditStatus = true,
  canEditRole = true,
  canEditAccess = true,
  includeSuperAdminRoleOptions = false,
}) {
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isAdminView = userType === ADMIN_USER_TYPE;
  const [formData, setFormData] = useState(initialFormData);
  const [originalUser, setOriginalUser] = useState(initialFormData);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEmailCopied, setIsEmailCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const isSubmittingRef = useRef(false);
  const { currentUser } = useCurrentUser();
  
  const { accountTypeOptions, isLoadingAccountTypes } = useRegistrationAccountTypes({
    enabled: open,
  });

  const accountTypeSelectOptions = accountTypeOptions.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  const selectedAccountTypeIsAdmin = !isAdminView && isAdminAccountType(formData.accountType, accountTypeOptions);
  const isAdminAccountSetup = isAdminView || selectedAccountTypeIsAdmin;
  
  const rolesEndpoint = isAdminAccountSetup && includeSuperAdminRoleOptions ? "all" : isAdminAccountSetup ? "default" : "all";
  
  const canEditThisUser = isAdminView ? canEditStatus || canEditRole || canEditAccess : canEditStatus || canEditAccess;
  const canEditRoleField = isAdminAccountSetup && canEditRole;
  const canEditAccessField = canEditAccess;
  
  const availableRoles = useAllRoles({
    endpoint: rolesEndpoint,
    enabled: open && isAdminAccountSetup,
  });
  const adminRoleOptions = getAdminRoleOptions(availableRoles, {
    includeSuperAdmin: includeSuperAdminRoleOptions,
  });

  useEffect(() => {
    if (!open) return;
    const nextFormData = createFormData(user);
    setFormData(nextFormData);
    setOriginalUser(nextFormData);
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    setIsCopied(false);
    setIsEmailCopied(false);
    setFieldErrors({});
    setError("");
    setShowMfaModal(false);
    setMfaCode("");
    setMfaError("");
    setIsVerifyingMfa(false);
  }, [open, user]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(formData.id);
    setIsCopied(true);
    toast.success("User ID copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyEmail = () => {
    if (!formData.email) return;
    navigator.clipboard.writeText(formData.email);
    setIsEmailCopied(true);
    toast.success("Email address copied to clipboard");
    setTimeout(() => setIsEmailCopied(false), 2000);
  };

  const handleStatusChange = (value) => {
    setFormData((current) => ({ ...current, status: normalizeStatus(value) }));
    if (error) setError("");
  };

  const handleAccountTypeChange = (value) => {
    const selectedAccountType = accountTypeOptions.find(opt => opt.value === value);
    
    setFormData((current) => {
      const nextData = {
        ...current,
        accountType: value,
        accountTypeId: selectedAccountType?.backendId || current.accountTypeId,
      };
      
      if (selectedAccountType?.clients && Array.isArray(selectedAccountType.clients)) {
        const validClients = selectedAccountType.clients.filter(client =>
          appClientOptions.some(opt => (opt.id || opt.value) === client.id)
        );
        nextData.accessibleClientIds = validClients.map(c => c.id);
        nextData.accessibleClientNames = validClients.map(c => c.name);
      }
      
      return nextData;
    });

    if (error) {
      setError("");
    }
  };

  const handleAdminRoleChange = (roleId) => {
    const normalizedRoleId = normalizeRoleId(roleId);
    const selectedRole = adminRoleOptions.find((role) => role.id === normalizedRoleId);
    setFormData((current) => ({
      ...current,
      roleId: normalizedRoleId,
      roles: selectedRole ? [selectedRole.role_name] : [],
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmittingRef.current) return;
    if (isViewMode || !canEditThisUser) {
      onClose();
      return;
    }
    if (!STATUS_VALUES.has(formData.status)) {
      setError("Select a valid status.");
      return;
    }

    const nextFieldErrors = {};
    if (!formData.givenName?.trim()) {
      nextFieldErrors.givenName = "First name is required.";
    }
    if (!formData.surname?.trim()) {
      nextFieldErrors.surname = "Last name is required.";
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setError("");
      await onSubmit({ ...formData, userType }, originalUser);
      toast.success("User updated successfully");
      onClose();
    } catch (submitError) {
      const errMsg = extractErrorMessage(submitError);
      if (errMsg.toLowerCase().includes("mfa") || submitError?.response?.data?.mfaRequired) {
        setShowMfaModal(true);
        setMfaError("");
      } else {
        setError(errMsg);
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleMfaVerify = async () => {
    try {
      setIsVerifyingMfa(true);
      setMfaError("");
      await onSubmit({ ...formData, userType, mfaCode }, originalUser);
      toast.success("User updated successfully");
      setShowMfaModal(false);
      onClose();
    } catch (mfaErr) {
      setMfaError(extractErrorMessage(mfaErr) || "Invalid verification code. Please try again.");
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  const editableAppClientOptions = getAllAppClientSelectOptions(appClientOptions);
  const editableAppClientIdLookup = new Set(editableAppClientOptions.map((client) => client.id).filter(Boolean));
  const appClientSelectOptions = mergeClientOptions(
    editableAppClientOptions,
    getSelectedClientOptions(formData.accessibleClientIds, formData.accessibleClientNames),
    getSelectedClientOptions(formData.manageableClientIds, formData.manageableClientNames),
  );
  
  const roleAccessItems = formData.roles.length > 0 ? formData.roles : adminRoleOptions.filter((role) => role.id === formData.roleId).map((role) => role.role_name);
  const clientAccessDisplayItems = formData.accessibleClientNames.length > 0 ? formData.accessibleClientNames : getAppClientNamesByIds(formData.accessibleClientIds, appClientSelectOptions);
  const manageableClientDisplayItems = formData.manageableClientNames.length > 0 ? formData.manageableClientNames : getAppClientNamesByIds(formData.manageableClientIds, appClientSelectOptions);
  const accountTypeDisplayLabel = accountTypeOptions.find((opt) => opt.value === formData.accountType)?.label || formData.accountType;

  return {
    isViewMode,
    isEditMode,
    isAdminView,
    formData,
    setFormData,
    error,
    isSubmitting,
    isCopied,
    isEmailCopied,
    isSelectOpen,
    setIsSelectOpen,
    fieldErrors,
    setFieldErrors,
    showMfaModal,
    setShowMfaModal,
    mfaCode,
    setMfaCode,
    mfaError,
    isVerifyingMfa,
    accountTypeOptions,
    isLoadingAccountTypes,
    accountTypeSelectOptions,
    isAdminAccountSetup,
    canEditThisUser,
    canEditRoleField,
    canEditAccessField,
    adminRoleOptions,
    handleCopyId,
    handleCopyEmail,
    handleStatusChange,
    handleAccountTypeChange,
    handleAdminRoleChange,
    handleSubmit,
    handleMfaVerify,
    editableAppClientOptions,
    editableAppClientIdLookup,
    appClientSelectOptions,
    roleAccessItems,
    clientAccessDisplayItems,
    manageableClientDisplayItems,
    accountTypeDisplayLabel,
  };
}
