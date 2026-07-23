import { useEffect, useRef, useState, Fragment } from "react";
import { motion } from "framer-motion";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import MultiSelect from "../../../components/MultiSelect";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { useAllRoles } from "../../roles/hooks/useAllRoles";
import UserPoolRoleRadioGroup from "./UserPoolRoleRadioGroup";
import UserPoolModalSelect from "./UserPoolModalSelect";
import InvitationConfirmModal from "./InvitationConfirmModal";
import { getModalTheme } from "../../../components/modalTheme";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { ADMIN_USER_TYPE, getAdminRoleOptions, getAllAppClientSelectOptions } from "../../../utils/userPoolAccess";
import { getAccountTypeBackendId, getAccountTypeOption, isAdminAccountType } from "../../../utils/accountTypes";
import { generateTemporaryPassword, getTemporaryPasswordValidationMessage } from "../../../utils/passwordRules";
import { useRegistrationAccountTypes } from "../../registration/hooks/useRegistrationAccountTypes";
import { PERMISSIONS } from "../../../utils/permissionAccess";
import { PasswordVisibilityIcon, StepOneIcon, StepTwoIcon } from "./userpoolIcons";

const TEMP_PASSWORD_SETUP_VALUE = "temporary_password";
const INVITATION_SETUP_VALUE = "invitation";
import { Stepper, StepperContent, StepperIndicator, StepperItem, StepperNav, StepperPanel, StepperSeparator, StepperTitle, StepperTrigger } from "../../../components/reui/stepper";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../../../components/ui/input-group";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "../../../components/ui/field";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "../../../components/ui/combobox";
import { toast } from "sonner";
import { LockIcon, EyeIcon, EyeOffIcon, MailIcon, CheckIcon, LoaderCircleIcon } from "lucide-react";

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

const sectionFadeProps = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: 8,
  },
  transition: {
    duration: 0.35,
    ease: "easeInOut",
  },
};

function normalizeSelectedClientIds(clientIds = []) {
  return Array.from(
    new Set((Array.isArray(clientIds) ? clientIds : []).filter(Boolean)),
  );
}

const steps = [
  { title: "Basic Info" },
  { title: "Account Setup" },
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

function AppClientComboboxField({ label, description, options, selectedIds, onChange, error, placeholder, isDarkMode }) {
  const anchor = useComboboxAnchor();

  const stringifiedSelectedIds = selectedIds.map(id => String(id));
  
  const chipClassName = isDarkMode
    ? "rounded-md border border-[#f8d24e]/25 bg-[#f8d24e]/12 text-[#ffe28a]"
    : "rounded-md border border-[#7b0d15]/20 bg-[#7b0d15]/10 text-[#7b0d15]";
  
  const comboboxContainerClassName = `min-h-[2.625rem] rounded-md transition-[border-color,box-shadow,background-color] duration-200 ${
    error ? "border-red-400" : ""
  }`;
  
  const inputPlaceholderClassName = isDarkMode
    ? "placeholder:text-[#a58d95] text-[#f4eaea] bg-transparent outline-none flex-1 ml-1"
    : "placeholder:text-[#9b7d84] text-[#4a1921] bg-transparent outline-none flex-1 ml-1";
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col space-y-0 w-full">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
          {label} <span className="text-red-500">*</span>
        </h3>
        <p className="m-0 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Field className="w-full">
        <Combobox
          multiple
          autoHighlight
          items={options}
          itemToString={(item) => (item ? item.label : "")}
          value={stringifiedSelectedIds}
          onValueChange={onChange}
        >
          <ComboboxChips ref={anchor} className={comboboxContainerClassName}>
            <ComboboxValue>
              {(values) => (
                <Fragment>
                  {values.map((val) => {
                    const opt = options.find(o => String(o.value ?? o.id) === String(val));
                    return <ComboboxChip key={val} className={chipClassName}>{opt ? opt.label : val}</ComboboxChip>;
                  })}
                  <ComboboxChipsInput placeholder={placeholder} className={inputPlaceholderClassName} />
                </Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No client found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => {
                const optValue = String(item.value ?? item.id);
                return (
                  <ComboboxItem key={optValue} value={optValue}>
                    {item.label}
                  </ComboboxItem>
                );
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </Field>
    </div>
  );
}

export default function AddUserForm({ onClose, onSubmit, userType = "regular", canAssignRoles = true, canManageUserAccess = true, appClientOptions = [], isLoadingAppClients = false, includeSuperAdminRoleOptions = false, colorMode = "light" }) {
  const { hasPermission } = usePermissionAccess();
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
  const isDarkMode = colorMode === "dark";
  const isAdminView = userType === ADMIN_USER_TYPE;
  const canCreateAdminAccount = canAssignRoles || canManageUserAccess;
  const canViewRegistrationConfig = hasPermission(
    PERMISSIONS.VIEW_REGISTRATION_CONFIG,
  );
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
  const adminRoleIsRequired = selectedAccountTypeIsAdmin && !isAdminView;
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
  const {
    modalBodyStackClassName,
    modalHelperTextClassName,
    modalInputClassName,
    modalLabelClassName,
    modalOptionalBadgeClassName,
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
  const sectionHeaderClassName = isDarkMode
    ? "mb-5 border-b border-white/10 pb-4"
    : "mb-5 border-b border-[#7b0d15]/10 pb-4";
  const sectionTitleClassName = modalLabelClassName;
  const sectionDescriptionClassName = `${modalHelperTextClassName} !mb-0`;
  const getInputClassName = (fieldName, hasActionButton = false) =>
    `h-10 rounded-lg px-3 bg-background border-input ${hasActionButton ? "pr-12" : ""} ${
      fieldErrors[fieldName] ? "border-red-400 focus-visible:ring-red-500 focus-visible:border-red-500" : ""
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

  const selectedAccountTypeLabel = isAdminView
    ? SYSTEM_ADMINISTRATOR_ACCOUNT_TYPE
    : selectedAccountTypeOption?.label || "Selected";
  const renderSectionHeader = (title, description, isRequired = false) => (
    <CardHeader className="!flex !flex-col items-start !gap-0 pb-0 w-full">
      <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
        {title} {isRequired && <span className="text-red-500">*</span>}
      </CardTitle>
      <CardDescription className="text-sm text-muted-foreground m-0">
        {description}
      </CardDescription>
    </CardHeader>
  );

  const accountSetupField = (
    <div className="space-y-3">
      <Label className="text-sm leading-none font-medium">Method</Label>
      <Select value={data.accountSetupType} onValueChange={handleAccountSetupChange}>
        <SelectTrigger className="w-full !h-10 rounded-lg bg-background border-input px-3">
          <SelectValue placeholder="Select account setup method">
            {ACCOUNT_SETUP_OPTIONS.find((item) => item.value === data.accountSetupType)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {ACCOUNT_SETUP_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
  const accountTypeSection = showAccountTypeField ? (
    <section>
      <Card className="w-full bg-card border-border shadow-sm !gap-2">
        {renderSectionHeader("Account Type", "Choose the account type.", true)}
        <CardContent>
          <RadioGroup value={data.accountType} onValueChange={handleAccountTypeChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAccountTypeOptions.map((option) => (
              <FieldLabel htmlFor={`account-type-${option.value}`} key={option.value}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{option.label}</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem value={option.value} id={`account-type-${option.value}`} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          {isLoadingAccountTypes && canViewRegistrationConfig && (
            <p className="mt-2 text-sm text-muted-foreground">
              Loading latest account types...
            </p>
          )}
          {fieldErrors.accountType && (
            <p className="mt-2 text-xs text-red-500">
              {fieldErrors.accountType}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  ) : null;
  const tempPasswordField = showTempPasswordField ? (
    <div className="space-y-3 pt-4 border-t border-border">
      <div className="flex items-center justify-between">
        <Label className="text-sm leading-none font-medium">Temporary Password</Label>
        <SpeechInputToolbar
          activeFieldLabel={activeVoiceFieldLabel}
          onError={(err) => toast.error(err, { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } })}
          onTranscript={handleVoiceInput}
          colorMode={colorMode}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full">
          <InputGroup className={getInputClassName("tempPassword")}>
            <InputGroupAddon>
              <LockIcon className="text-muted-foreground size-4" />
            </InputGroupAddon>
            <InputGroupInput
              type={showTempPassword ? "text" : "password"}
              name="tempPassword"
              value={data.tempPassword}
              onChange={handleChange}
              onFocus={() => setActiveVoiceField("tempPassword")}
              placeholder="Temporary password"
              className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent"
            />
            <InputGroupButton
              variant="ghost"
              onClick={toggleShowTempPassword}
              aria-label={
                showTempPassword
                  ? "Hide temporary password"
                  : "Show temporary password"
              }
            >
              {showTempPassword ? (
                <EyeOffIcon className="text-muted-foreground size-4" />
              ) : (
                <EyeIcon className="text-muted-foreground size-4" />
              )}
            </InputGroupButton>
          </InputGroup>
        </div>

        <Button type="button" variant="secondary" onClick={generatePassword} className="h-10">
          Generate
        </Button>
      </div>
      {fieldErrors.tempPassword && (
        <p className="mt-2 text-xs text-red-500">
          {fieldErrors.tempPassword}
        </p>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">
        Use at least 8 characters with one uppercase letter, one number, and one special character.
      </p>
    </div>
  ) : null;
  const accountSetupAndPasswordSection = (
    <section>
      <Card className="w-full bg-card border-border shadow-sm !gap-6">
        {renderSectionHeader("Account Setup", "Choose how they get access.", true)}
        <CardContent className="space-y-6">
          {accountSetupField}
          {tempPasswordField}
        </CardContent>
      </Card>
    </section>
  );
  const adminAccessSection =
    showAdminClientFields || showAdminRoleField ? (
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left Side: App Clients */}
          {showAdminClientFields && (
            <Card className={`w-full bg-card border-border shadow-sm flex-1 ${!showAdminRoleField ? "w-full" : ""}`}>
              <CardContent className="space-y-8 h-full">
                <AppClientComboboxField
                  label="Accessible App Clients"
                  description="Choose which clients are accessible for sign-in."
                  options={registrationAppClientOptions}
                  selectedIds={data.adminAccessibleClientIds}
                  onChange={handleMultiSelectFieldChange("adminAccessibleClientIds")}
                  placeholder="Select accessible app clients"
                  error={fieldErrors.adminAccessibleClientId}
                  isDarkMode={isDarkMode}
                />

                <AppClientComboboxField
                  label="Manageable App Clients"
                  description="Choose which clients this admin can manage."
                  options={registrationAppClientOptions}
                  selectedIds={data.adminManageableClientIds}
                  onChange={handleMultiSelectFieldChange("adminManageableClientIds")}
                  placeholder="Select manageable app clients"
                  error={fieldErrors.adminManageableClientId}
                  isDarkMode={isDarkMode}
                />
                
                {isLoadingAppClients && (
                  <p className="text-sm text-muted-foreground">
                    Loading app clients...
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Right Side: Role */}
          {showAdminRoleField && (
            <Card className={`w-full bg-card border-border shadow-sm flex-1 flex flex-col !gap-2 ${!showAdminClientFields ? "w-full" : ""}`}>
              {renderSectionHeader("Role", "Choose the admin role.", adminRoleIsRequired)}
              <CardContent className="flex-1">
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
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    ) : null;
  const stepTwoAnimationKey = isAdminAccountSetup
    ? "account-setup-step-admin"
    : "account-setup-step-standard";

  const formBody = (
    <div className={modalBodyStackClassName}>
      <Card className="w-full bg-card border-border shadow-sm p-6 mb-6">
        <Stepper
          className="w-full max-w-md mx-auto space-y-8"
          value={step}
          indicators={{
            completed: (
              <CheckIcon className="size-3.5" />
            ),
            loading: (
              <LoaderCircleIcon className="size-3.5 animate-spin" />
            ),
          }}
        >
          <StepperNav>
            {steps.map((s, index) => (
              <StepperItem
                key={index}
                step={index + 1}
                className="relative flex-1 items-start"
              >
                <StepperTrigger className="relative z-10 flex flex-col gap-2.5 items-center w-full" onClick={() => { if(index + 1 < step) setStep(index + 1) }}>
                  <StepperIndicator className="size-8 text-sm data-[state=inactive]:bg-secondary data-[state=completed]:bg-[#7b0d15] data-[state=completed]:text-[#ffffff] data-[state=active]:bg-[#7b0d15] data-[state=active]:border-[#7b0d15] data-[state=active]:text-[#ffffff]">{index + 1}</StepperIndicator>
                  <StepperTitle className="text-sm font-semibold whitespace-nowrap">{s.title}</StepperTitle>
                </StepperTrigger>
                {index < steps.length - 1 && <StepperSeparator className="absolute top-4 left-[50%] w-full z-0 h-1 data-[state=completed]:bg-[#7b0d15]" />}
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </Card>

      {step === 1 && (
        <motion.form
          key="user-step-1"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          id="step1-form"
          onSubmit={(event) => event.preventDefault()}
          className="space-y-5"
        >
          <section>
            <Card className="w-full bg-card border-border shadow-sm !gap-6">
              <div className="flex items-center justify-between">
                {renderSectionHeader(
                  "Personal Information",
                  "Enter the user's basic details.",
                )}
                <div className="pr-6">
                  <SpeechInputToolbar
                    activeFieldLabel={activeVoiceFieldLabel}
                    onError={(err) => toast.error(err, { style: { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" } })}
                    onTranscript={handleVoiceInput}
                    colorMode={colorMode}
                  />
                </div>
              </div>

              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-sm leading-none font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="validator w-full">
                    <InputGroup className={getInputClassName("email")}>
                      <InputGroupAddon>
                        <MailIcon className="h-5 w-5" />
                      </InputGroupAddon>
                      <InputGroupInput type="email" name="email" value={data.email} onChange={handleChange} onFocus={() => setActiveVoiceField("email")} required placeholder="Enter email" className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent" />
                    </InputGroup>
                    {fieldErrors.email && (
                      <p className="mt-2 text-xs text-red-500">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="flex items-center min-h-[24px]">
                      <Label className="text-sm leading-none font-medium">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <div className="validator w-full">
                      <InputGroup className={`${getInputClassName("givenName")} validator`}>
                        <InputGroupInput type="text" name="givenName" value={data.givenName} onChange={handleChange} onFocus={() => setActiveVoiceField("givenName")} required placeholder="Enter first name" className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent" />
                      </InputGroup>
                      {fieldErrors.givenName && (
                        <p className="mt-2 text-xs text-red-500">
                          {fieldErrors.givenName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center min-h-[24px]">
                      <Label className="text-sm leading-none font-medium">
                        Middle Name
                      </Label>
                    </div>
                    <div className="w-full">
                      <InputGroup className={getInputClassName("middleName")}>
                        <InputGroupInput type="text" name="middleName" value={data.middleName} onChange={handleChange} onFocus={() => setActiveVoiceField("middleName")} placeholder="Enter middle name" className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent" />
                      </InputGroup>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center min-h-[24px]">
                      <Label className="text-sm leading-none font-medium">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <div className="validator w-full">
                      <InputGroup className={`${getInputClassName("surname")} validator`}>
                        <InputGroupInput type="text" name="surname" value={data.surname} onChange={handleChange} onFocus={() => setActiveVoiceField("surname")} required placeholder="Enter last name" className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent" />
                      </InputGroup>
                      {fieldErrors.surname && (
                        <p className="mt-2 text-xs text-red-500">
                          {fieldErrors.surname}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between w-full min-h-[24px]">
                      <Label className="text-sm leading-none font-medium">
                        Suffix
                      </Label>
                      <span className={`text-[10px] border px-1.5 py-0.5 rounded-md font-medium ${isDarkMode ? "border-[#f8d24e]/40 text-[#f8d24e]" : "border-[#7b0d15]/40 text-[#7b0d15]"}`}>Optional</span>
                    </div>
                    <div className="w-full">
                      <InputGroup className={getInputClassName("suffix")}>
                        <InputGroupInput type="text" name="suffix" value={data.suffix} onChange={handleChange} onFocus={() => setActiveVoiceField("suffix")} placeholder="Enter suffix" className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent" />
                      </InputGroup>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </motion.form>
      )}

      {step === 2 && (
        <motion.form
          key="user-step-2"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          id="step2-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="space-y-5"
        >
          <div className="space-y-5">
            {!isAdminView && accountTypeSection}
            <div className="space-y-5">
              {adminAccessSection}
              {accountSetupAndPasswordSection}
            </div>
          </div>
        </motion.form>
      )}
    </div>
  );

  const footer = (
    <div className="flex flex-col-reverse gap-3 mt-4 md:mb-12 lg:flex-row lg:justify-end xl:mb-16 [&>button]:w-full lg:[&>button]:w-auto">
        {step === 1 && (
          <Button type="button" variant="outline" onClick={onClose} className="h-10 rounded-lg px-6">
            Cancel
          </Button>
        )}

        {step > 1 && (
          <Button type="button" variant="outline" onClick={previousStep} className="h-10 rounded-lg px-6">
            Back
          </Button>
        )}

        {step === 1 && (
          <Button type="button" onClick={nextStep} className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] transition-colors">
            Next
          </Button>
        )}

        {step === 2 && (
          <Button type="button" onClick={handleSubmit} className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] transition-colors" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        )}
    </div>
  );

  const invitationConfirmModal = (
    <InvitationConfirmModal
      open={isInvitationConfirmOpen}
      accountTypeLabel={selectedAccountTypeLabel}
      isSubmitting={isSubmitting}
      onCancel={() => setIsInvitationConfirmOpen(false)}
      onConfirm={handleConfirmInvitation}
      colorMode={colorMode}
    />
  );

  return (
    <div className="space-y-6">
      {formBody}
      {footer}
      {invitationConfirmModal}
    </div>
  );
}
