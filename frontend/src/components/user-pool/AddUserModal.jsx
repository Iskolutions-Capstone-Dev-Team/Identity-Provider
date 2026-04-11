import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import FadeWrapper from "../FadeWrapper";
import ModalSteps from "../ModalSteps";
import ErrorAlert from "../ErrorAlert";
import MultiSelect from "../MultiSelect";
import { SpeechInputToolbar } from "../SpeechInputButton";
import { useAllRoles } from "../../hooks/useAllRoles";
import { useAllAppClients } from "../../hooks/useAllAppClients";
import UserPoolRoleRadioGroup from "./UserPoolRoleRadioGroup";
import UserPoolModalSelect from "./UserPoolModalSelect";
import InvitationConfirmModal from "./InvitationConfirmModal";
import { getModalTheme } from "../modalTheme";
import { ADMIN_USER_TYPE, getAdminRoleOptions, getAllAppClientSelectOptions } from "../../utils/userPoolAccess";
import { ACCOUNT_TYPE_OPTIONS } from "../../utils/accountTypes";
import { generateTemporaryPassword, getTemporaryPasswordValidationMessage } from "../../utils/passwordRules";

const TEMP_PASSWORD_SETUP_VALUE = "temporary_password";
const INVITATION_SETUP_VALUE = "invitation";
const ADMIN_ACCOUNT_CATEGORY = "admin";

const REGULAR_ACCOUNT_SETUP_OPTIONS = [
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

function getSelectedAdminClientIds({ adminSignInClientIds, adminCrudClientIds } = {}) {
  return normalizeSelectedClientIds(
    [
      ...normalizeSelectedClientIds(adminSignInClientIds),
      ...normalizeSelectedClientIds(adminCrudClientIds),
    ],
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
  adminSignInClientIds: [],
  adminCrudClientIds: [],
  selectedAdminRoleId: null,
};

const initialFieldErrors = {
  email: "",
  givenName: "",
  surname: "",
  tempPassword: "",
  accountType: "",
  adminSignInClientId: "",
  adminCrudClientId: "",
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

export default function AddUserModal({ open, onClose, onSubmit, userType = "regular", canAssignRoles = true, canManageUserAccess = true, colorMode = "light" }) {
  const availableRoles = useAllRoles({ endpoint: "default" });
  const {
    appClients: registrationAppClients,
    isLoadingAppClients: isLoadingRegistrationAppClients,
  } = useAllAppClients({ enabled: canManageUserAccess });
  const adminRoleOptions = getAdminRoleOptions(availableRoles);
  const registrationAppClientOptions = getAllAppClientSelectOptions(
    registrationAppClients,
  );
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [activeVoiceField, setActiveVoiceField] = useState("givenName");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [isInvitationConfirmOpen, setIsInvitationConfirmOpen] = useState(false);
  const isDarkMode = colorMode === "dark";
  const isAdminView = userType === ADMIN_USER_TYPE;
  const availableAccountTypeOptions =
    canAssignRoles || canManageUserAccess
      ? ACCOUNT_TYPE_OPTIONS
      : ACCOUNT_TYPE_OPTIONS.filter(
          (option) => option.id !== ADMIN_ACCOUNT_CATEGORY,
        );
  const isAdminAccountType =
    !isAdminView && data.accountType === ADMIN_ACCOUNT_CATEGORY;
  const isInvitationFlow =
    !isAdminView && data.accountSetupType === INVITATION_SETUP_VALUE;
  const showAccountTypeField = !isAdminView;
  const showRegularAdminClientFields =
    isAdminAccountType && canManageUserAccess;
  const showRegularAdminRoleField = isAdminAccountType && canAssignRoles;
  const showAccountSetupAtBottom = isAdminAccountType;
  const showTempPasswordField =
    isAdminView || data.accountSetupType === TEMP_PASSWORD_SETUP_VALUE;
  const needsExpandedHeaderSpacing =
    !isAdminView && isAdminAccountType;
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
    `${modalHeaderClassName} !px-7 !pt-7 ${
      needsExpandedHeaderSpacing
        ? "!pb-12 sm:!px-8 sm:!pt-8 sm:!pb-14"
        : "!pb-9 sm:!px-8 sm:!pt-8 sm:!pb-10"
    }`;
  const modalHeaderContentClassName = needsExpandedHeaderSpacing
    ? "max-w-2xl pr-12 sm:pr-14"
    : "max-w-xl pr-12 sm:pr-14";
  const modalHeaderDescriptionSpacingClassName =
    `${modalHeaderDescriptionClassName} !mt-3 leading-relaxed ${
      needsExpandedHeaderSpacing
        ? "max-w-[20rem] sm:!mt-4 sm:max-w-[34rem]"
        : "max-w-[18rem] sm:!mt-4 sm:max-w-[28rem]"
    }`;

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
    setData((current) => ({
      ...current,
      accountType,
      adminSignInClientIds:
        accountType === ADMIN_ACCOUNT_CATEGORY ? current.adminSignInClientIds : [],
      adminCrudClientIds:
        accountType === ADMIN_ACCOUNT_CATEGORY ? current.adminCrudClientIds : [],
      selectedAdminRoleId:
        accountType === ADMIN_ACCOUNT_CATEGORY ? current.selectedAdminRoleId : null,
    }));
    setFieldErrors((current) => ({
      ...current,
      accountType: "",
      adminSignInClientId: "",
      adminCrudClientId: "",
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

    if (showRegularAdminClientFields && data.adminSignInClientIds.length === 0) {
      nextFieldErrors.adminSignInClientId =
        "Select at least one sign-in app client.";
    }

    if (showRegularAdminClientFields && data.adminCrudClientIds.length === 0) {
      nextFieldErrors.adminCrudClientId =
        "Select at least one access app client.";
    }

    if (showRegularAdminRoleField && !data.selectedAdminRoleId) {
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
    if (!open) {
      setData(initialFormData);
      setStep(1);
      setFieldErrors(initialFieldErrors);
      setActiveVoiceField("givenName");
      setShowTempPassword(false);
      setIsInvitationConfirmOpen(false);
      setError("");
    }
  }, [open]);

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
    const selectedAdminRole = adminRoleOptions.find(
      (role) => role.id === data.selectedAdminRoleId,
    );
    const adminAllowedClientIds = showRegularAdminClientFields
      ? getSelectedAdminClientIds(data)
      : [];
    const selectedAccountType = !isAdminView
      ? data.accountType
      : "";

    try {
      setError("");

      await onSubmit({
        email: data.email,
        givenName: data.givenName,
        middleName: data.middleName,
        surname: data.surname,
        suffix: data.suffix,
        userType,
        roleId:
          isAdminView || isAdminAccountType
            ? selectedAdminRole?.id ?? null
            : null,
        roles: selectedAdminRole ? [selectedAdminRole.role_name] : [],
        allowedAppClientIds: adminAllowedClientIds,
        tempPassword: data.tempPassword,
        accountSetupType: data.accountSetupType,
        accountType: selectedAccountType,
        status: "active",
      });

      onClose();
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    }
  };

  const handleSubmit = async () => {
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
    setIsInvitationConfirmOpen(false);
    await submitUser();
  };

  if (!open) {
    return null;
  }

  const selectedAccountTypeLabel =
    availableAccountTypeOptions.find(
      (option) => option.id === data.accountType,
    )?.label || "Selected";
  const modalDescription = isAdminView
    ? "Create a new admin user account."
    : data.accountType
      ? `Create a new ${selectedAccountTypeLabel.toLowerCase()} user account.`
      : "Create a new regular user account.";
  const accountSetupSection = (
    <section className={modalSectionClassName}>
      <label className={modalLabelClassName}>
        Account Setup
      </label>
      <p className={modalHelperTextClassName}>
        Choose how they get access.
      </p>
      <UserPoolModalSelect
        value={data.accountSetupType}
        onChange={handleAccountSetupChange}
        options={REGULAR_ACCOUNT_SETUP_OPTIONS}
        ariaLabel="Select account setup method"
        colorMode={colorMode}
      />
    </section>
  );
  const accountTypeSection = showAccountTypeField ? (
    <section className={modalSectionClassName}>
      <label className={modalLabelClassName}>
        Account Type <span className="text-red-500">*</span>
      </label>
      <p className={modalHelperTextClassName}>
        Choose the account type.
      </p>
      <UserPoolRoleRadioGroup
        options={availableAccountTypeOptions}
        selectedValue={data.accountType}
        onChange={handleAccountTypeChange}
        colorMode={colorMode}
        name="add-user-account-type"
      />
      {fieldErrors.accountType && (
        <p className="mt-2 text-xs text-red-500">
          {fieldErrors.accountType}
        </p>
      )}
    </section>
  ) : null;
  const tempPasswordSection = showTempPasswordField ? (
    <section className={modalSectionClassName}>
      <SpeechInputToolbar
        activeFieldLabel={activeVoiceFieldLabel}
        onError={setError}
        onTranscript={handleVoiceInput}
        colorMode={colorMode}
      />

      <label className={modalLabelClassName}>
        Temporary Password <span className="text-red-500">*</span>
      </label>
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
    </section>
  ) : null;

  return createPortal(
    <>
      <dialog open className={modalOverlayClassName}>
        <div className={modalBoxClassName}>
        <div className={modalHeaderSpacingClassName}>
          <div className="flex items-start justify-between gap-4 sm:gap-6">
            <div className={modalHeaderContentClassName}>
              <h3 className={modalHeaderTitleClassName}>Add User</h3>
              <p className={modalHeaderDescriptionSpacingClassName}>
                {modalDescription}
              </p>
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
              <ModalSteps
                currentStep={step}
                colorMode={colorMode}
                steps={[
                  <>
                    <span className="step-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                      </svg>
                    </span>
                    Basic Info
                  </>,
                  <>
                    <span className="step-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M10 1.25a3.75 3.75 0 0 0-3.75 3.75v1H5A2.75 2.75 0 0 0 2.25 8.75v6.5A2.75 2.75 0 0 0 5 18h10a2.75 2.75 0 0 0 2.75-2.75v-6.5A2.75 2.75 0 0 0 15 6h-1.25V5A3.75 3.75 0 0 0 10 1.25Zm2.25 4.75V5a2.25 2.25 0 1 0-4.5 0v1h4.5Z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Account Setup
                  </>,
                ]}
              />
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
                </section>

                <section className={modalSectionClassName}>
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
                    <section className={modalSectionClassName}>
                      <label className={modalLabelClassName}>
                        Role
                      </label>
                      {canAssignRoles ? (
                        <>
                          <p className={modalHelperTextClassName}>
                            Choose a role for this admin account.
                          </p>
                          <UserPoolRoleRadioGroup
                            options={adminRoleOptions}
                            selectedValue={data.selectedAdminRoleId}
                            onChange={handleAdminRoleChange}
                            colorMode={colorMode}
                            name="add-user-role"
                            allowEmpty
                            emptyOptionLabel="No role assigned"
                          />
                        </>
                      ) : (
                        <p className={modalHelperTextClassName}>
                          No role assignment permission is available for this account.
                        </p>
                      )}
                    </section>

                    {tempPasswordSection}
                  </>
                ) : (
                  <>
                    {accountTypeSection}

                    {!showAccountSetupAtBottom && accountSetupSection}

                    {showRegularAdminClientFields && (
                      <>
                        <section className={modalSectionClassName}>
                          <label className={modalLabelClassName}>
                            Sign-In App Clients <span className="text-red-500">*</span>
                          </label>
                          <p className={modalHelperTextClassName}>
                            Choose one or more app clients used for sign-in.
                          </p>
                          <MultiSelect
                            options={registrationAppClientOptions}
                            selectedValues={data.adminSignInClientIds}
                            onChange={handleMultiSelectFieldChange("adminSignInClientIds")}
                            placeholder="Select sign-in app clients"
                            variant="userpoolModal"
                            hasError={Boolean(fieldErrors.adminSignInClientId)}
                            colorMode={colorMode}
                          />
                          {fieldErrors.adminSignInClientId && (
                            <p className="mt-2 text-xs text-red-500">
                              {fieldErrors.adminSignInClientId}
                            </p>
                          )}
                        </section>

                        <section className={modalSectionClassName}>
                          <label className={modalLabelClassName}>
                            Access App Clients <span className="text-red-500">*</span>
                          </label>
                          <p className={modalHelperTextClassName}>
                            Choose one or more app clients used to manage user access.
                          </p>
                          <MultiSelect
                            options={registrationAppClientOptions}
                            selectedValues={data.adminCrudClientIds}
                            onChange={handleMultiSelectFieldChange("adminCrudClientIds")}
                            placeholder="Select access app clients"
                            variant="userpoolModal"
                            hasError={Boolean(fieldErrors.adminCrudClientId)}
                            colorMode={colorMode}
                          />
                          {fieldErrors.adminCrudClientId && (
                            <p className="mt-2 text-xs text-red-500">
                              {fieldErrors.adminCrudClientId}
                            </p>
                          )}
                          {isLoadingRegistrationAppClients && (
                            <p className={modalHelperTextClassName}>
                              Loading app clients...
                            </p>
                          )}
                        </section>
                      </>
                    )}

                    {showRegularAdminRoleField && (
                      <section className={modalSectionClassName}>
                        <label className={modalLabelClassName}>
                          Role <span className="text-red-500">*</span>
                        </label>
                        <p className={modalHelperTextClassName}>
                          Choose the admin role.
                        </p>
                        <UserPoolRoleRadioGroup
                          options={adminRoleOptions}
                          selectedValue={data.selectedAdminRoleId}
                          onChange={handleAdminRoleChange}
                          colorMode={colorMode}
                          name="add-regular-admin-role"
                        />
                        {fieldErrors.selectedAdminRoleId && (
                          <p className="mt-2 text-xs text-red-500">
                            {fieldErrors.selectedAdminRoleId}
                          </p>
                        )}
                      </section>
                    )}

                    {showAccountSetupAtBottom ? (
                      <>
                        {accountSetupSection}
                        {tempPasswordSection}
                      </>
                    ) : (
                      tempPasswordSection
                    )}
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
              <button type="button" onClick={handleSubmit} className={modalPrimaryButtonClassName}>
                Create User
              </button>
            )}
          </div>
        </div>
        </div>
      </dialog>

      <InvitationConfirmModal
        open={isInvitationConfirmOpen}
        accountTypeLabel={selectedAccountTypeLabel}
        onCancel={() => setIsInvitationConfirmOpen(false)}
        onConfirm={handleConfirmInvitation}
        colorMode={colorMode}
      />
    </>,
    document.body,
  );
}