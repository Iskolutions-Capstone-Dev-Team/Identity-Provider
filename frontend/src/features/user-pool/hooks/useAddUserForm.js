import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { getAccountTypeBackendId, getAccountTypeOption, isAdminAccountType } from "../../../utils/accountTypes";
import { generateTemporaryPassword, getTemporaryPasswordValidationMessage } from "../../../utils/passwordRules";
import { useAllRoles } from "../../roles/hooks/useAllRoles";
import { useRegistrationAccountTypes } from "../../registration/hooks/useRegistrationAccountTypes";
import { ADMIN_USER_TYPE, getAdminRoleOptions, getAllAppClientSelectOptions } from "../../../utils/userPoolAccess";

export const TEMP_PASSWORD_SETUP_VALUE = "temporary_password";
export const INVITATION_SETUP_VALUE = "invitation";
export const SYSTEM_ADMINISTRATOR_ACCOUNT_TYPE = "System Administrator";

export const ACCOUNT_SETUP_OPTIONS = [
  {
    value: TEMP_PASSWORD_SETUP_VALUE,
    label: "Temporary Password",
  },
  {
    value: INVITATION_SETUP_VALUE,
    label: "Invitation",
  },
];

const initialFormData = {
  email: "",
  givenName: "",
  middleName: "",
  surname: "",
  suffix: "",
  tempPassword: "",
  accountSetupType: TEMP_PASSWORD_SETUP_VALUE,
  accountType: "",
  adminAccessibleClientIds: [],
  adminManageableClientIds: [],
  selectedAdminRoleId: null,
};

const initialFieldErrors = {
  email: "",
  givenName: "",
  surname: "",
  tempPassword: "",
  accountType: "",
  adminAccessibleClientId: "",
  adminManageableClientId: "",
  selectedAdminRoleId: "",
};

const extractErrorMessage = (error) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  "Unable to create user.";

function normalizeSelectedClientIds(clientIds = []) {
  return Array.from(
    new Set((Array.isArray(clientIds) ? clientIds : []).filter(Boolean)),
  );
}

export function useAddUserForm({
  userType = "regular",
  canAssignRoles = true,
  canManageUserAccess = true,
  canViewRegistrationConfig = false,
  appClientOptions = [],
  includeSuperAdminRoleOptions = false,
  onSubmit,
  onClose,
}) {
  const [step, setStep] = useState(1);
  const [stepDirection, setStepDirection] = useState(1);
  const [data, setData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [error, setError] = useState("");
  const [activeVoiceField, setActiveVoiceField] = useState("givenName");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvitationConfirmOpen, setIsInvitationConfirmOpen] = useState(false);
  const isSubmittingRef = useRef(false);

  const isAdminView = userType === ADMIN_USER_TYPE;
  const canCreateAdminAccount = canAssignRoles || canManageUserAccess;

  const { accountTypeOptions, isLoadingAccountTypes } =
    useRegistrationAccountTypes({
      enabled: !isAdminView && canViewRegistrationConfig,
    });

  const availableAccountTypeOptions = canCreateAdminAccount
    ? accountTypeOptions
    : accountTypeOptions.filter((option) => !option?.isAdminType);

  const selectedAccountTypeOption = getAccountTypeOption(
    data.accountType,
    availableAccountTypeOptions,
  );

  const selectedAccountTypeIsAdmin =
    !isAdminView &&
    isAdminAccountType(data.accountType, availableAccountTypeOptions);

  const isInvitationFlow = data.accountSetupType === INVITATION_SETUP_VALUE;
  const showAccountTypeField = !isAdminView;
  const isAdminAccountSetup = isAdminView || selectedAccountTypeIsAdmin;
  const showAdminClientFields = isAdminAccountSetup && canManageUserAccess;
  const showAdminRoleField = isAdminAccountSetup && canAssignRoles;
  const adminRoleIsRequired = isAdminAccountSetup;

  const rolesEndpoint =
    isAdminView || selectedAccountTypeIsAdmin ? "all" : "default";
  const shouldLoadRoleOptions = showAdminRoleField;
  
  const availableRoles = useAllRoles({
    endpoint: rolesEndpoint,
    enabled: shouldLoadRoleOptions,
  });

  const adminRoleOptions = getAdminRoleOptions(availableRoles, {
    includeSuperAdmin: includeSuperAdminRoleOptions,
  });

  const registrationAppClientOptions = getAllAppClientSelectOptions(
    appClientOptions,
  );

  const showTempPasswordField =
    data.accountSetupType === TEMP_PASSWORD_SETUP_VALUE;

  const clearFieldError = (fieldName) => {
    if (!fieldErrors[fieldName]) {
      return;
    }
    setFieldErrors((current) => ({
      ...current,
      [fieldName]: "",
    }));
  };

  const clearErrorBanner = () => {
    if (error) {
      setError("");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((current) => ({
      ...current,
      [name]: value,
    }));
    clearFieldError(name);
    clearErrorBanner();
  };

  const handleFieldValueChange = (name, value) => {
    handleChange({
      target: {
        name,
        value,
      },
    });
  };

  const handleMultiSelectFieldChange = (fieldName) => (values) => {
    setData((current) => ({
      ...current,
      [fieldName]: normalizeSelectedClientIds(values),
    }));
    clearFieldError(fieldName);
    clearErrorBanner();
  };

  const handleAdminRoleChange = (selectedAdminRoleId) => {
    setData((current) => ({
      ...current,
      selectedAdminRoleId,
    }));
    clearFieldError("selectedAdminRoleId");
    clearErrorBanner();
  };

  const handleAccountSetupChange = (accountSetupType) => {
    setData((current) => ({
      ...current,
      accountSetupType,
    }));
    setFieldErrors((current) => ({
      ...current,
      tempPassword: "",
    }));
    clearErrorBanner();
  };

  const handleAccountTypeChange = (accountType) => {
    const nextIsAdminAccountType = isAdminAccountType(
      accountType,
      availableAccountTypeOptions,
    );
    setData((current) => ({
      ...current,
      accountType,
      adminAccessibleClientIds:
        nextIsAdminAccountType ? current.adminAccessibleClientIds : [],
      adminManageableClientIds:
        nextIsAdminAccountType ? current.adminManageableClientIds : [],
      selectedAdminRoleId:
        nextIsAdminAccountType ? current.selectedAdminRoleId : null,
    }));
    setFieldErrors((current) => ({
      ...current,
      accountType: "",
      adminAccessibleClientId: "",
      adminManageableClientId: "",
      selectedAdminRoleId: "",
    }));
    clearErrorBanner();
  };

  const generatePassword = () => {
    setData((current) => ({
      ...current,
      tempPassword: generateTemporaryPassword(),
    }));
    setFieldErrors((current) => ({
      ...current,
      tempPassword: "",
    }));
    setShowTempPassword(false);
    clearErrorBanner();
  };

  const toggleShowTempPassword = () => {
    setShowTempPassword((current) => !current);
  };

  const validateStepOne = () => {
    const nextFieldErrors = {
      ...initialFieldErrors,
    };
    const trimmedEmail = data.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      nextFieldErrors.email = "Email is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!data.givenName.trim()) {
      nextFieldErrors.givenName = "First name is required.";
    }

    if (!data.surname.trim()) {
      nextFieldErrors.surname = "Last name is required.";
    }

    setFieldErrors(nextFieldErrors);

    const firstError = Object.values(nextFieldErrors).find(Boolean);
    if (firstError) {
      setError(firstError);
      return false;
    }

    setError("");
    return true;
  };

  const validateStepTwo = () => {
    const nextFieldErrors = {
      ...initialFieldErrors,
    };

    if (showAccountTypeField && !data.accountType) {
      nextFieldErrors.accountType = "Select an account type.";
    }

    if (showAdminClientFields && data.adminAccessibleClientIds.length === 0) {
      nextFieldErrors.adminAccessibleClientId =
        "Select at least one accessible app client.";
    }

    if (showAdminClientFields && data.adminManageableClientIds.length === 0) {
      nextFieldErrors.adminManageableClientId =
        "Select at least one manageable app client.";
    }

    if (showAdminRoleField && adminRoleIsRequired && !data.selectedAdminRoleId) {
      nextFieldErrors.selectedAdminRoleId = "Select a role.";
    }

    if (showTempPasswordField) {
      const trimmedTempPassword = data.tempPassword.trim();
      if (!trimmedTempPassword) {
        nextFieldErrors.tempPassword = "Temporary password is required.";
      } else {
        nextFieldErrors.tempPassword =
          getTemporaryPasswordValidationMessage(trimmedTempPassword);
      }
    }

    setFieldErrors(nextFieldErrors);

    const firstError = Object.values(nextFieldErrors).find(Boolean);
    if (firstError) {
      setError(firstError);
      return false;
    }

    setError("");
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStepOne()) {
      return;
    }
    if (step === 2 && !validateStepTwo()) {
      return;
    }
    setError("");
    setStepDirection(1);
    setStep(step + 1);
  };

  const previousStep = () => {
    setStepDirection(-1);
    setStep(step - 1);
  };

  useEffect(() => {
    if (step === 1) {
      if (
        !["email", "givenName", "middleName", "surname", "suffix"].includes(
          activeVoiceField,
        )
      ) {
        setActiveVoiceField("email");
      }
      return;
    }

    if (step !== 2) {
      return;
    }

    if (!showTempPasswordField) {
      if (activeVoiceField === "tempPassword") {
        setActiveVoiceField("email");
      }
      return;
    }

    if (activeVoiceField !== "tempPassword") {
      setActiveVoiceField("tempPassword");
    }
  }, [activeVoiceField, showTempPasswordField, step]);

  const activeVoiceFieldLabel =
    activeVoiceField === "email"
      ? "Email Address"
      : activeVoiceField === "surname"
        ? "Last Name"
        : activeVoiceField === "suffix"
          ? "Suffix"
          : activeVoiceField === "middleName"
            ? "Middle Name"
            : activeVoiceField === "tempPassword"
              ? "Temporary Password"
              : "First Name";

  const handleVoiceInput = (transcript) => {
    handleFieldValueChange(activeVoiceField, transcript);
  };

  const submitUser = async () => {
    if (isSubmittingRef.current) {
      return;
    }

    const selectedAdminRole = adminRoleOptions.find(
      (role) => String(role.id) === String(data.selectedAdminRoleId),
    );
    const adminAccessibleClientIds = showAdminClientFields
      ? normalizeSelectedClientIds(data.adminAccessibleClientIds)
      : [];
    const adminManageableClientIds = showAdminClientFields
      ? normalizeSelectedClientIds(data.adminManageableClientIds)
      : [];
    const selectedAccountType = !isAdminView
      ? selectedAccountTypeOption?.value || data.accountType
      : "";
    const selectedAccountTypeId = isAdminView
      ? getAccountTypeBackendId(SYSTEM_ADMINISTRATOR_ACCOUNT_TYPE)
      : selectedAccountTypeOption?.backendId ?? null;

    if (!Number.isInteger(selectedAccountTypeId) || selectedAccountTypeId <= 0) {
      setError(
        isAdminView
          ? "System Administrator account type is unavailable right now."
          : "Unable to use this account type right now.",
      );
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setError("");

      await onSubmit({
        email: data.email,
        givenName: data.givenName,
        middleName: data.middleName,
        surname: data.surname,
        suffix: data.suffix,
        userType,
        roleId:
          isAdminView || selectedAccountTypeIsAdmin
            ? selectedAdminRole?.id ?? null
            : null,
        roles: selectedAdminRole ? [selectedAdminRole.role_name] : [],
        accessibleClientIds: adminAccessibleClientIds,
        manageableClientIds: adminManageableClientIds,
        allowedAppClientIds: adminAccessibleClientIds,
        tempPassword: data.tempPassword,
        accountSetupType: data.accountSetupType,
        accountType: selectedAccountType,
        accountTypeId: selectedAccountTypeId,
        status: "active",
      });

      onClose();
    } catch (submitError) {
      toast.error(extractErrorMessage(submitError), {
        style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" }
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) {
      return;
    }
    if (!validateStepTwo()) {
      return;
    }
    if (isInvitationFlow) {
      setIsInvitationConfirmOpen(true);
      return;
    }
    await submitUser();
  };

  const handleConfirmInvitation = async () => {
    if (isSubmittingRef.current) {
      return;
    }
    setIsInvitationConfirmOpen(false);
    await submitUser();
  };

  return {
    step,
    setStep,
    stepDirection,
    data,
    fieldErrors,
    error,
    activeVoiceField,
    setActiveVoiceField,
    showTempPassword,
    isSubmitting,
    isInvitationConfirmOpen,
    setIsInvitationConfirmOpen,
    isAdminView,
    accountTypeOptions,
    isLoadingAccountTypes,
    availableAccountTypeOptions,
    selectedAccountTypeOption,
    showAccountTypeField,
    isAdminAccountSetup,
    showAdminClientFields,
    showAdminRoleField,
    adminRoleIsRequired,
    adminRoleOptions,
    registrationAppClientOptions,
    showTempPasswordField,
    activeVoiceFieldLabel,
    handleChange,
    handleFieldValueChange,
    handleMultiSelectFieldChange,
    handleAdminRoleChange,
    handleAccountSetupChange,
    handleAccountTypeChange,
    generatePassword,
    toggleShowTempPassword,
    nextStep,
    previousStep,
    handleVoiceInput,
    handleSubmit,
    handleConfirmInvitation,
  };
}
