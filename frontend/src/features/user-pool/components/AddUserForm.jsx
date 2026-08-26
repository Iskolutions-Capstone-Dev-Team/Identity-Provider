import { motion } from "framer-motion";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import UserPoolRoleRadioGroup from "./UserPoolRoleRadioGroup";
import InvitationConfirmModal from "./InvitationConfirmModal";
import { getModalTheme } from "../../../components/modalTheme";
import { usePermissionAccess } from "../../../providers/PermissionProvider";
import { PERMISSIONS } from "../../../utils/permissionAccess";
import { Stepper, StepperIndicator, StepperItem, StepperNav, StepperSeparator, StepperTitle, StepperTrigger } from "../../../components/reui/stepper";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../../../components/ui/input-group";
import { Field, FieldContent, FieldTitle, FieldLabel } from "../../../components/ui/field";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { toast } from "sonner";
import { LockIcon, EyeIcon, EyeOffIcon, MailIcon, CheckIcon, LoaderCircleIcon } from "lucide-react";
import AppClientComboboxField from "./AppClientComboboxField";
import { useAddUserForm, ACCOUNT_SETUP_OPTIONS, SYSTEM_ADMINISTRATOR_ACCOUNT_TYPE } from "../hooks/useAddUserForm";

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

const steps = [
  { title: "Basic Info" },
  { title: "Account Setup" },
];

export default function AddUserForm({ onClose, onSubmit, userType = "regular", canAssignRoles = true, canManageUserAccess = true, appClientOptions = [], isLoadingAppClients = false, includeSuperAdminRoleOptions = false, colorMode = "light" }) {
  const { hasPermission } = usePermissionAccess();
  
  const canViewRegistrationConfig = hasPermission(
    PERMISSIONS.VIEW_REGISTRATION_CONFIG,
  );

  const formState = useAddUserForm({
    userType,
    canAssignRoles,
    canManageUserAccess,
    canViewRegistrationConfig,
    appClientOptions,
    includeSuperAdminRoleOptions,
    onSubmit,
    onClose,
  });

  const {
    step,
    setStep,
    data,
    fieldErrors,
    error,
    showTempPassword,
    isSubmitting,
    isInvitationConfirmOpen,
    setIsInvitationConfirmOpen,
    isAdminView,
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
    setActiveVoiceField
  } = formState;

  const isDarkMode = colorMode === "dark";

  const {
    modalBodyStackClassName,
    modalHelperTextClassName,
    modalLabelClassName,
  } = getModalTheme(colorMode);

  const getInputClassName = (fieldName, hasActionButton = false) =>
    `h-10 rounded-lg px-3 bg-background border-input ${hasActionButton ? "pr-12" : ""} ${
      fieldErrors[fieldName] ? "border-red-400 focus-visible:ring-red-500 focus-visible:border-red-500" : ""
    }`;

  const selectedAccountTypeLabel = isAdminView
    ? SYSTEM_ADMINISTRATOR_ACCOUNT_TYPE
    : selectedAccountTypeOption?.label || "Selected";

  const renderSectionHeader = (title, description, isRequired = false) => (
    <CardHeader className="!flex !flex-col items-start !gap-3 pb-0 w-full">
      <div className="space-y-1">
        <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
          {title} {isRequired && <span className="text-red-500">*</span>}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground m-0">
          {description}
        </CardDescription>
      </div>
      <Separator />
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
            <p className="!mt-0 text-xs text-red-500">
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
        <p className="!mt-0 text-xs text-red-500">
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
                  <p className="!mt-0 text-xs text-red-500">
                    {fieldErrors.selectedAdminRoleId}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    ) : null;

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
                  <StepperIndicator className="size-8 text-sm data-[state=inactive]:bg-secondary data-[state=completed]:bg-[#7b0d15] data-[state=completed]:text-[#ffffff] dark:data-[state=completed]:bg-[#ffd21a] dark:data-[state=completed]:text-black data-[state=active]:bg-[#7b0d15] data-[state=active]:border-[#7b0d15] data-[state=active]:text-[#ffffff] dark:data-[state=active]:bg-[#ffd21a] dark:data-[state=active]:border-[#ffd21a] dark:data-[state=active]:text-black">{index + 1}</StepperIndicator>
                  <StepperTitle className="text-sm font-semibold whitespace-nowrap">{s.title}</StepperTitle>
                </StepperTrigger>
                {index < steps.length - 1 && <StepperSeparator className="absolute top-4 left-[50%] w-full z-0 h-1 data-[state=completed]:bg-[#7b0d15] dark:data-[state=completed]:bg-[#ffd21a]" />}
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
                      <p className="!mt-0 text-xs text-red-500">
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
                        <p className="!mt-0 text-xs text-red-500">
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
                        <p className="!mt-0 text-xs text-red-500">
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
          <Button type="button" onClick={nextStep} className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white dark:bg-[#ffd21a] dark:text-black hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-white transition-colors">
            Next
          </Button>
        )}

        {step === 2 && (
          <Button type="button" onClick={handleSubmit} className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white dark:bg-[#ffd21a] dark:text-black hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-white transition-colors" disabled={isSubmitting}>
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
