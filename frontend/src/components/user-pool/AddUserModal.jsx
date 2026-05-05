import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FadeWrapper from "../FadeWrapper";
import ErrorAlert from "../ErrorAlert";
import MultiSelect from "../MultiSelect";
import { SpeechInputToolbar } from "../SpeechInputButton";
import { useAllRoles } from "../../hooks/useAllRoles";
import UserPoolRoleRadioGroup from "./UserPoolRoleRadioGroup";
import UserPoolModalSelect from "./UserPoolModalSelect";
import InvitationConfirmModal from "./InvitationConfirmModal";
import UserPoolUserIconBox from "./UserPoolUserIconBox";
import { getModalTheme } from "../modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../modalTransition";
import { usePermissionAccess } from "../../context/PermissionContext";
import { ADMIN_USER_TYPE, getAdminRoleOptions, getAllAppClientSelectOptions } from "../../utils/userPoolAccess";
import {
  getAccountTypeBackendId,
  getAccountTypeOption,
  isAdminAccountType,
} from "../../utils/accountTypes";
import { generateTemporaryPassword, getTemporaryPasswordValidationMessage } from "../../utils/passwordRules";
import { useRegistrationAccountTypes } from "../../hooks/useRegistrationAccountTypes";
import { PERMISSIONS } from "../../utils/permissionAccess";

const TEMP_PASSWORD_SETUP_VALUE = "temporary_password";
const INVITATION_SETUP_VALUE = "invitation";
const SYSTEM_ADMINISTRATOR_ACCOUNT_TYPE = "System Administrator";

const ACCOUNT_SETUP_OPTIONS = [
  {
    value: TEMP_PASSWORD_SETUP_VALUE,
    label: "Temporary Password",
  },
  {
    value: INVITATION_SETUP_VALUE,
    label: "Invitation",
  },
];

function normalizeSelectedClientIds(clientIds = []) {
  return Array.from(
    new Set((Array.isArray(clientIds) ? clientIds : []).filter(Boolean)),
  );
}

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

function PasswordVisibilityIcon({ showPassword }) {
  if (showPassword) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.542-7a10.056 10.056 0 0 1 2.293-3.607M6.72 6.72A9.956 9.956 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7a9.978 9.978 0 0 1-4.563 5.956M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function AddUserStepIndicator({ currentStep, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const firstStepIsActive = currentStep >= 1;
  const secondStepIsActive = currentStep >= 2;
  const activeStepClassName = isDarkMode
    ? "border-[#f8d24e]/20 bg-[#f8d24e]/10 text-[#ffe28a]"
    : "border-[#7b0d15]/10 bg-[#f8eef0] text-[#7b0d15]";
  const inactiveStepClassName = isDarkMode
    ? "border-white/10 bg-white/[0.04] text-[#cbb8bd]"
    : "border-[#7b0d15]/10 bg-white/75 text-[#8f6f76]";
  const activeLabelClassName = isDarkMode ? "text-[#ffe28a]" : "text-[#7b0d15]";
  const inactiveLabelClassName = isDarkMode ? "text-[#cbb8bd]" : "text-[#8f6f76]";
  const lineClassName = secondStepIsActive
    ? isDarkMode
      ? "border-[#f8d24e]/45"
      : "border-[#7b0d15]/25"
    : isDarkMode
      ? "border-white/15"
      : "border-[#7b0d15]/15";

  const getStepIconClassName = (isActive) =>
    `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border transition-colors duration-300 ${
      isActive ? activeStepClassName : inactiveStepClassName
    }`;

  const getStepLabelClassName = (isActive) =>
    `text-center text-xs font-semibold leading-tight transition-colors duration-300 sm:text-sm ${
      isActive ? activeLabelClassName : inactiveLabelClassName
    }`;

  return (
    <div className="mx-auto grid w-full max-w-[32rem] grid-cols-[minmax(4.5rem,auto)_1fr_minmax(5.75rem,auto)] items-start gap-2 px-3 py-4 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 flex-col items-center gap-2">
        <span className={getStepIconClassName(firstStepIsActive)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          </svg>
        </span>
        <span className={getStepLabelClassName(firstStepIsActive)}>
          <span className="sm:hidden">Info</span>
          <span className="hidden sm:inline">Basic Info</span>
        </span>
      </div>

      <span className={`mt-5 h-px flex-1 border-t-2 border-dotted ${lineClassName}`} aria-hidden="true"/>

      <div className="flex min-w-0 flex-col items-center gap-2">
        <span className={getStepIconClassName(secondStepIsActive)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M10 1.25a3.75 3.75 0 0 0-3.75 3.75v1H5A2.75 2.75 0 0 0 2.25 8.75v6.5A2.75 2.75 0 0 0 5 18h10a2.75 2.75 0 0 0 2.75-2.75v-6.5A2.75 2.75 0 0 0 15 6h-1.25V5A3.75 3.75 0 0 0 10 1.25Zm2.25 4.75V5a2.25 2.25 0 1 0-4.5 0v1h4.5Z" clipRule="evenodd" />
          </svg>
        </span>
        <span className={getStepLabelClassName(secondStepIsActive)}>
          <span className="sm:hidden">Setup</span>
          <span className="hidden sm:inline">Account Setup</span>
        </span>
      </div>
    </div>
  );
}

export default function AddUserModal({ open, onClose, onSubmit, userType = "regular", canAssignRoles = true, canManageUserAccess = true, appClientOptions = [], isLoadingAppClients = false, includeSuperAdminRoleOptions = false, colorMode = "light" }) {
  const { hasPermission } = usePermissionAccess();
  const { shouldRender, isClosing } = useModalTransition(open);
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [activeVoiceField, setActiveVoiceField] = useState("givenName");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvitationConfirmOpen, setIsInvitationConfirmOpen] = useState(false);
  const isSubmittingRef = useRef(false);
  const isDarkMode = colorMode === "dark";
  const isAdminView = userType === ADMIN_USER_TYPE;
  const canCreateAdminAccount = canAssignRoles || canManageUserAccess;
  const canViewRegistrationConfig = hasPermission(
    PERMISSIONS.VIEW_REGISTRATION_CONFIG,
  );
  const { accountTypeOptions, isLoadingAccountTypes } =
    useRegistrationAccountTypes({
      enabled: open && !isAdminView && canViewRegistrationConfig,
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
  const adminRoleIsRequired = selectedAccountTypeIsAdmin && !isAdminView;
  const rolesEndpoint =
    isAdminView || selectedAccountTypeIsAdmin ? "all" : "default";
  const shouldLoadRoleOptions =
    open && showAdminRoleField;
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
    modalOptionalBadgeClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
    modalStepsWrapClassName,
  } = getModalTheme(colorMode);
  const passwordUtilityButtonClassName = isDarkMode
    ? "btn h-12 rounded-[1rem] border border-[#f8d24e]/35 bg-[#f8d24e]/12 px-5 text-[#ffe28a] shadow-none transition-[background-color,background-image,border-color,color] duration-500 ease-out hover:border-[#f8d24e] hover:bg-none hover:bg-[#f8d24e] hover:text-[#7b0d15]"
    : "btn h-12 rounded-[1rem] border border-[#f8d24e]/55 bg-[#fff4dc] px-5 text-[#7b0d15] shadow-none transition hover:border-[#7b0d15] hover:bg-[#7b0d15] hover:text-white";
  const passwordVisibilityButtonClassName = isDarkMode
    ? "absolute right-4 top-[46%] -translate-y-1/2 text-[#a58d95] transition hover:text-[#f8d24e]"
    : "absolute right-4 top-[46%] -translate-y-1/2 text-[#8f6f76] transition hover:text-[#5a0b12]";
  const emailIconClassName = isDarkMode
    ? "border-r border-white/10 pr-3 text-[#a58d95]"
    : "border-r border-[#7b0d15]/10 pr-3 text-[#8f6f76]";
  const tempPasswordHintClassName = isDarkMode
    ? "mt-3 text-xs text-[#c7adb4]"
    : "mt-3 text-xs text-[#8f6f76]";
  const modalHeaderSpacingClassName =
    `${modalHeaderClassName} h-[7rem] shrink-0 !px-7 !py-0 sm:!px-8`;
  const modalHeaderContentClassName =
    "flex min-w-0 flex-1 items-center gap-4 pr-3 sm:pr-16";
  const sectionHeaderClassName = isDarkMode
    ? "mb-5 border-b border-white/10 pb-4"
    : "mb-5 border-b border-[#7b0d15]/10 pb-4";
  const sectionTitleClassName = modalLabelClassName;
  const sectionDescriptionClassName = `${modalHelperTextClassName} !mb-0`;

  const getInputClassName = (fieldName, hasActionButton = false) =>
    `${modalInputClassName} ${hasActionButton ? "pr-12" : ""} ${
      fieldErrors[fieldName] ? "border-red-400 focus:border-red-500" : ""
    }`;

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
    setStep(step + 1);
  };

  useEffect(() => {
    if (!shouldRender) {
      setData(initialFormData);
      setStep(1);
      setFieldErrors(initialFieldErrors);
      setActiveVoiceField("givenName");
      setShowTempPassword(false);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      setIsInvitationConfirmOpen(false);
      setError("");
    }
  }, [shouldRender]);

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
      (role) => role.id === data.selectedAdminRoleId,
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
      setError(extractErrorMessage(submitError));
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

  if (!shouldRender) {
    return null;
  }

  const selectedAccountTypeLabel = isAdminView
    ? SYSTEM_ADMINISTRATOR_ACCOUNT_TYPE
    : selectedAccountTypeOption?.label || "Selected";
  const renderSectionHeader = (title, description, isRequired = false) => (
    <div className={sectionHeaderClassName}>
      <label className={sectionTitleClassName}>
        {title} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <p className={sectionDescriptionClassName}>
        {description}
      </p>
    </div>
  );

  const accountSetupField = (
    <div>
      {renderSectionHeader("Account Setup", "Choose how they get access.", true)}
      <UserPoolModalSelect
        value={data.accountSetupType}
        onChange={handleAccountSetupChange}
        options={ACCOUNT_SETUP_OPTIONS}
        ariaLabel="Select account setup method"
        colorMode={colorMode}
      />
    </div>
  );
  const accountTypeSection = showAccountTypeField ? (
    <section className={modalSectionClassName}>
      {renderSectionHeader("Account Type", "Choose the account type.", true)}
      <UserPoolRoleRadioGroup
        options={availableAccountTypeOptions}
        selectedValue={data.accountType}
        onChange={handleAccountTypeChange}
        colorMode={colorMode}
        name="add-user-account-type"
      />
      {isLoadingAccountTypes && canViewRegistrationConfig && (
        <p className={modalHelperTextClassName}>
          Loading latest account types...
        </p>
      )}
      {fieldErrors.accountType && (
        <p className="mt-2 text-xs text-red-500">
          {fieldErrors.accountType}
        </p>
      )}
    </section>
  ) : null;
  const tempPasswordField = showTempPasswordField ? (
    <div>
      <SpeechInputToolbar
        activeFieldLabel={activeVoiceFieldLabel}
        onError={setError}
        onTranscript={handleVoiceInput}
        colorMode={colorMode}
      />

      {renderSectionHeader("Temporary Password", "Create a temporary password.", true)}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full">
          <input type={showTempPassword ? "text" : "password"} name="tempPassword" value={data.tempPassword} onChange={handleChange} onFocus={() => setActiveVoiceField("tempPassword")} placeholder="Temporary password" className={`${getInputClassName("tempPassword")} pr-12`} />
          <button
            type="button"
            onClick={toggleShowTempPassword}
            className={passwordVisibilityButtonClassName}
            aria-label={
              showTempPassword
                ? "Hide temporary password"
                : "Show temporary password"
            }
          >
            <PasswordVisibilityIcon showPassword={showTempPassword} />
          </button>
        </div>

        <button type="button" onClick={generatePassword} className={passwordUtilityButtonClassName}>
          Generate
        </button>
      </div>
      {fieldErrors.tempPassword && (
        <p className="mt-2 text-xs text-red-500">
          {fieldErrors.tempPassword}
        </p>
      )}
      <p className={tempPasswordHintClassName}>
        Use at least 8 characters with one uppercase letter, one number, and one special character.
      </p>
    </div>
  ) : null;
  const accountSetupAndPasswordSection = (
    <section className={modalSectionClassName}>
      <div className="space-y-6">
        {accountSetupField}
        {tempPasswordField}
      </div>
    </section>
  );
  const adminAccessSection =
    showAdminClientFields || showAdminRoleField ? (
      <section className={modalSectionClassName}>
        <div className="space-y-6">
          {showAdminClientFields && (
            <>
              <div>
                {renderSectionHeader(
                  "Accessible App Clients",
                  "Choose which clients are accessible for sign-in.",
                  true,
                )}
                <MultiSelect
                  options={registrationAppClientOptions}
                  selectedValues={data.adminAccessibleClientIds}
                  onChange={handleMultiSelectFieldChange("adminAccessibleClientIds")}
                  placeholder="Select accessible app clients"
                  variant="userpoolModal"
                  hasError={Boolean(fieldErrors.adminAccessibleClientId)}
                  colorMode={colorMode}
                />
                {fieldErrors.adminAccessibleClientId && (
                  <p className="mt-2 text-xs text-red-500">
                    {fieldErrors.adminAccessibleClientId}
                  </p>
                )}
              </div>

              <div>
                {renderSectionHeader(
                  "Manageable App Clients",
                  "Choose which clients this admin can manage.",
                  true,
                )}
                <MultiSelect
                  options={registrationAppClientOptions}
                  selectedValues={data.adminManageableClientIds}
                  onChange={handleMultiSelectFieldChange("adminManageableClientIds")}
                  placeholder="Select manageable app clients"
                  variant="userpoolModal"
                  hasError={Boolean(fieldErrors.adminManageableClientId)}
                  colorMode={colorMode}
                />
                {fieldErrors.adminManageableClientId && (
                  <p className="mt-2 text-xs text-red-500">
                    {fieldErrors.adminManageableClientId}
                  </p>
                )}
                {isLoadingAppClients && (
                  <p className={modalHelperTextClassName}>
                    Loading app clients...
                  </p>
                )}
              </div>
            </>
          )}

          {showAdminRoleField && (
            <div>
              {renderSectionHeader("Role", "Choose the admin role.", adminRoleIsRequired)}
              <UserPoolRoleRadioGroup
                options={adminRoleOptions}
                selectedValue={data.selectedAdminRoleId}
                onChange={handleAdminRoleChange}
                colorMode={colorMode}
                name={isAdminView ? "add-admin-user-role" : "add-regular-admin-role"}
                allowEmpty={isAdminView}
                emptyOptionLabel="No role assigned"
              />
              {fieldErrors.selectedAdminRoleId && (
                <p className="mt-2 text-xs text-red-500">
                  {fieldErrors.selectedAdminRoleId}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    ) : null;

  return createPortal(
    <>
      <dialog open
        className={getModalTransitionClassName(
          modalOverlayClassName,
          isClosing,
        )}
      >
        <div className={modalBoxClassName}>
          <div className={modalHeaderSpacingClassName}>
            <div className="flex h-full items-center justify-between gap-4 sm:gap-6">
              <div className={modalHeaderContentClassName}>
                <UserPoolUserIconBox colorMode={colorMode} variant="plain" />
                <h3 className={modalHeaderTitleClassName}>Add User</h3>
              </div>

              <button type="button" className={`${modalCloseButtonClassName} shrink-0`} onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className={modalBodyClassName}>
            <div className={modalBodyStackClassName}>
              <div className={modalStepsWrapClassName}>
                <AddUserStepIndicator currentStep={step} colorMode={colorMode} />
              </div>

              <ErrorAlert message={error} onClose={() => setError("")} />

            <FadeWrapper isVisible={step === 1}>
              <form id="step1-form" onSubmit={(event) => event.preventDefault()} className="space-y-5">
                <section className={modalSectionClassName}>
                  <SpeechInputToolbar
                    activeFieldLabel={activeVoiceFieldLabel}
                    onError={setError}
                    onTranscript={handleVoiceInput}
                    colorMode={colorMode}
                  />

                  {renderSectionHeader(
                    "Personal Information",
                    "Enter the user's basic details.",
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className={modalLabelClassName}>
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="validator w-full">
                        <label className={`${getInputClassName("email")} flex items-center gap-3 px-4`}>
                          <span className={emailIconClassName}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                              <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                              <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                            </svg>
                          </span>
                          <input type="email" name="email" value={data.email} onChange={handleChange} onFocus={() => setActiveVoiceField("email")} required placeholder="Enter email" className="grow bg-transparent" />
                        </label>
                        {fieldErrors.email && (
                          <p className="mt-2 text-xs text-red-500">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className={modalLabelClassName}>
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="validator w-full">
                          <input type="text" name="givenName" value={data.givenName} onChange={handleChange} onFocus={() => setActiveVoiceField("givenName")} required placeholder="Enter first name" className={`${getInputClassName("givenName")} validator`} />
                          {fieldErrors.givenName && (
                            <p className="mt-2 text-xs text-red-500">
                              {fieldErrors.givenName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className={modalLabelClassName}>
                          Middle Name
                        </label>
                        <input type="text" name="middleName" value={data.middleName} onChange={handleChange} onFocus={() => setActiveVoiceField("middleName")} placeholder="Enter middle name" className={modalInputClassName} />
                      </div>

                      <div className="space-y-1">
                        <label className={modalLabelClassName}>
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="validator w-full">
                          <input type="text" name="surname" value={data.surname} onChange={handleChange} onFocus={() => setActiveVoiceField("surname")} required placeholder="Enter last name" className={`${getInputClassName("surname")} validator`} />
                          {fieldErrors.surname && (
                            <p className="mt-2 text-xs text-red-500">
                              {fieldErrors.surname}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className={modalLabelClassName}>
                          Suffix
                        </label>
                        <label className={`${modalInputClassName} flex items-center gap-2 px-4`}>
                          <input type="text" name="suffix" value={data.suffix} onChange={handleChange} onFocus={() => setActiveVoiceField("suffix")} placeholder="Enter suffix" className="grow bg-transparent" />
                          <span className={modalOptionalBadgeClassName}>
                            Optional
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </section>
              </form>
            </FadeWrapper>

            <FadeWrapper isVisible={step === 2}>
              <form
                id="step2-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSubmit();
                }}
                className="space-y-5"
              >
                {isAdminView ? (
                  <>
                    {adminAccessSection}
                    {accountSetupAndPasswordSection}
                  </>
                ) : (
                  <>
                    {accountTypeSection}

                    {adminAccessSection}

                    {accountSetupAndPasswordSection}
                  </>
                )}
              </form>
            </FadeWrapper>
          </div>
        </div>

        <div className={modalFooterClassName}>
          <div className={modalFooterActionsClassName}>
            {step === 1 && (
              <button type="button" onClick={onClose} className={modalSecondaryButtonClassName}>
                Close
              </button>
            )}

            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className={modalSecondaryButtonClassName}>
                Back
              </button>
            )}

            {step === 1 && (
              <button type="button" onClick={nextStep} className={modalPrimaryButtonClassName}>
                Next
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleSubmit}
                className={modalPrimaryButtonClassName}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create User"}
              </button>
            )}
          </div>
        </div>
        </div>
      </dialog>

      <InvitationConfirmModal
        open={isInvitationConfirmOpen}
        accountTypeLabel={selectedAccountTypeLabel}
        isSubmitting={isSubmitting}
        onCancel={() => setIsInvitationConfirmOpen(false)}
        onConfirm={handleConfirmInvitation}
        colorMode={colorMode}
      />
    </>,
    document.body,
  );
}