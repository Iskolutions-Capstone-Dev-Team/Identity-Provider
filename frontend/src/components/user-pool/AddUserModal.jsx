import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import MultiSelect from "../MultiSelect";
import FadeWrapper from "../FadeWrapper";
import ModalSteps from "../ModalSteps";
import ErrorAlert from "../ErrorAlert";
import { SpeechInputToolbar } from "../SpeechInputButton";
import { useAllRoles } from "../../hooks/useAllRoles";
import UserPoolModalSelect from "./UserPoolModalSelect";
import { getModalTheme } from "../modalTheme";

const initialFormData = {
  email: "",
  givenName: "",
  middleName: "",
  surname: "",
  inviteMode: "temp",
  delivery: "email",
  tempPassword: "",
  roleIds: [],
};

const inviteModeOptions = [
  { value: "invite", label: "Send an invitation to the user" },
  { value: "temp", label: "Set a temporary password" },
];

const deliveryOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

const initialFieldErrors = {
  email: "",
  givenName: "",
  surname: "",
  tempPassword: "",
};

export default function AddUserModal({
  open,
  onClose,
  onSubmit,
  colorMode = "light",
}) {
  const [step, setStep] = useState(1);
  const roles = useAllRoles();
  const [data, setData] = useState(initialFormData);
  const [rolesError, setRolesError] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [activeVoiceField, setActiveVoiceField] = useState("givenName");
  const [showTempPassword, setShowTempPassword] = useState(false);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData({ ...data, [name]: type === "checkbox" ? checked : value });

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }

    if (name === "inviteMode") {
      setFieldErrors((current) => ({
        ...current,
        tempPassword: "",
      }));
    }

    if (error) {
      setError("");
    }
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setData({ ...data, tempPassword: pwd });
  };

  const toggleShowTempPassword = () => {
    setShowTempPassword((current) => !current);
  };

  const getInputClassName = (fieldName, hasActionButton = false) =>
    `${modalInputClassName} ${hasActionButton ? "pr-12" : ""} ${
      fieldErrors[fieldName]
        ? "border-red-400 focus:border-red-500"
        : ""
    }`;

  const handleFieldValueChange = (name, value) => {
    handleChange({
      target: {
        name,
        value,
        type: "text",
      },
    });
  };

  const validateStepOne = () => {
    const nextFieldErrors = {
      email: "",
      givenName: "",
      surname: "",
      tempPassword: fieldErrors.tempPassword,
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email.trim()) {
      nextFieldErrors.email = "Email is required.";
    } else if (!emailRegex.test(data.email)) {
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

    return true;
  };

  const validateStepTwo = () => {
    const nextFieldErrors = {
      email: "",
      givenName: "",
      surname: "",
      tempPassword: "",
    };
    const hasRolesError = !data.roleIds || data.roleIds.length === 0;

    setRolesError(hasRolesError);

    if (data.inviteMode === "temp") {
      if (!data.tempPassword.trim()) {
        nextFieldErrors.tempPassword = "Temporary password is required.";
      } else if (data.tempPassword.length < 8) {
        nextFieldErrors.tempPassword =
          "Temporary password must be at least 8 characters.";
      }
    }

    setFieldErrors(nextFieldErrors);

    if (hasRolesError || nextFieldErrors.tempPassword) {
      setError(
        hasRolesError
          ? "At least one role must be selected."
          : nextFieldErrors.tempPassword,
      );
      return false;
    }

    setError("");
    return true;
  };

  const nextStep = () => {
    if (step === 1) {
      if (!validateStepOne()) {
        return;
      }
    }

    if (step === 2) {
      if (!validateStepTwo()) {
        return;
      }
    }

    setError("");
    setStep(step + 1);
  };

  useEffect(() => {
    if (!open) {
      setData(initialFormData);
      setStep(1);
      setRolesError(false);
      setFieldErrors(initialFieldErrors);
      setActiveVoiceField("givenName");
      setShowTempPassword(false);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (step === 1) {
      if (!["email", "givenName", "middleName", "surname"].includes(activeVoiceField)) {
        setActiveVoiceField("email");
      }
      return;
    }

    if (step === 2 && data.inviteMode === "temp" && activeVoiceField !== "tempPassword") {
      setActiveVoiceField("tempPassword");
    }
  }, [activeVoiceField, data.inviteMode, step]);

  const activeVoiceFieldLabel =
    activeVoiceField === "email"
      ? "Email Address"
      : activeVoiceField === "surname"
        ? "Last Name"
        : activeVoiceField === "middleName"
          ? "Middle Name"
          : activeVoiceField === "tempPassword"
            ? "Temporary Password"
            : "First Name";

  const handleVoiceInput = (transcript) => {
    handleFieldValueChange(activeVoiceField, transcript);
  };

  const handleSubmit = () => {
    if (!validateStepTwo()) {
      setStep(2);
      return;
    }

    setError("");

    const selectedRoles = roles
      .filter((role) => data.roleIds.includes(role.id))
      .map((role) => role.role_name);

    const fullName = `${data.givenName}${data.middleName ? ` ${data.middleName}` : ""} ${data.surname}`;

    onSubmit({
      email: data.email,
      name: fullName,
      givenName: data.givenName,
      middleName: data.middleName,
      surname: data.surname,
      roleIds: data.roleIds,
      roles: selectedRoles,
      inviteMode: data.inviteMode,
      delivery: data.delivery,
      tempPassword: data.tempPassword,
      status: "active",
    });

    onClose();
  };

  if (!open) return null;

  return createPortal(
    <dialog open className={modalOverlayClassName}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderClassName}>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h3 className={modalHeaderTitleClassName}>Add User</h3>
              <p className={modalHeaderDescriptionClassName}>
                Enter user information
              </p>
            </div>

            <button type="button" className={modalCloseButtonClassName} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
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
                        <path fillRule="evenodd" d="M14.5 1A4.5 4.5 0 0 0 10 5.5V9H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5V5.5a3 3 0 1 1 6 0v2.75a.75.75 0 0 0 1.5 0V5.5A4.5 4.5 0 0 0 14.5 1Z" clipRule="evenodd"/>
                      </svg>
                    </span>
                    Access
                  </>,
                ]}
              />
            </div>

            <ErrorAlert message={error} onClose={() => setError("")} />

            <FadeWrapper isVisible={step === 1}>
              <form id="step1-form" onSubmit={(e) => e.preventDefault()} className="space-y-5">
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
                      <input type="email" name="email" value={data.email} onChange={handleChange} onFocus={() => setActiveVoiceField("email")} required placeholder="Enter email" className="grow bg-transparent"/>
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
                        <input type="text" name="givenName" value={data.givenName} onChange={handleChange} onFocus={() => setActiveVoiceField("givenName")} required placeholder="Enter firstname" className={`${getInputClassName("givenName")} validator`}/>
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
                      <label
                        className={`${modalInputClassName} flex items-center gap-2 px-4`}
                      >
                        <input type="text" name="middleName" value={data.middleName} onChange={handleChange} onFocus={() => setActiveVoiceField("middleName")} placeholder="Enter middlename" className="grow bg-transparent"/>
                        <span className={modalOptionalBadgeClassName}>
                          Optional
                        </span>
                      </label>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className={modalLabelClassName}>
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="validator w-full">
                        <input type="text" name="surname" value={data.surname} onChange={handleChange} onFocus={() => setActiveVoiceField("surname")} required placeholder="Enter lastname" className={`${getInputClassName("surname")} validator`}/>
                        {fieldErrors.surname && (
                          <p className="mt-2 text-xs text-red-500">
                            {fieldErrors.surname}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </form>
            </FadeWrapper>

            <FadeWrapper isVisible={step === 2}>
              <form id="step2-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  nextStep();
                }}
                className="space-y-5"
              >
                <section className={modalSectionClassName}>
                  <label className={modalLabelClassName}>
                    Role <span className="text-red-500">*</span>
                  </label>
                  <p className={modalHelperTextClassName}>
                    Choose a role for the user
                  </p>
                  <div className="w-full">
                    <MultiSelect
                      options={roles.map((role) => ({
                        id: role.id,
                        role_name: role.role_name,
                      }))}
                      selectedValues={data.roleIds || []}
                      onChange={(ids) => {
                        setData((prev) => ({ ...prev, roleIds: ids }));
                        if (ids.length > 0) {
                          setRolesError(false);
                          setError(fieldErrors.tempPassword || "");
                        }
                      }}
                      placeholder="Select entity groups"
                      variant="userpoolModal"
                      hasError={rolesError}
                      colorMode={colorMode}
                    />
                    {rolesError && (
                      <p className="mt-2 text-xs text-red-500">
                        At least one role is required
                      </p>
                    )}
                  </div>
                </section>

                <section className={modalSectionClassName}>
                  <div className="space-y-5">
                    <div>
                      <label className={modalLabelClassName}>
                        Invitation Method
                      </label>
                      <p className={modalHelperTextClassName}>
                        Choose how the user will get access
                      </p>
                      <UserPoolModalSelect
                        value={data.inviteMode}
                        onChange={(value) =>
                          handleChange({
                            target: { name: "inviteMode", value, type: "select-one" },
                          })
                        }
                        options={inviteModeOptions}
                        ariaLabel="Invitation Method"
                        colorMode={colorMode}
                      />
                    </div>

                    <div className="relative overflow-hidden">
                      <div className={
                          data.inviteMode === "invite"
                            ? "relative"
                            : "pointer-events-none absolute left-0 top-0 w-full opacity-0"
                        }
                      >
                        <FadeWrapper isVisible={data.inviteMode === "invite"} keyId="delivery">
                          <div>
                            <label className={modalLabelClassName}>
                              Delivery Method
                            </label>
                            <UserPoolModalSelect
                              value={data.delivery}
                              onChange={(value) =>
                                handleChange({
                                  target: { name: "delivery", value, type: "select-one" },
                                })
                              }
                              options={deliveryOptions}
                              ariaLabel="Delivery Method"
                              colorMode={colorMode}
                            />
                          </div>
                        </FadeWrapper>
                      </div>

                      <div
                        className={
                          data.inviteMode === "temp"
                            ? "relative"
                            : "pointer-events-none absolute left-0 top-0 w-full opacity-0"
                        }
                      >
                        <FadeWrapper
                          isVisible={data.inviteMode === "temp"}
                          keyId="tempPassword"
                        >
                          <div>
                            <SpeechInputToolbar
                              activeFieldLabel={activeVoiceFieldLabel}
                              onError={setError}
                              onTranscript={handleVoiceInput}
                              colorMode={colorMode}
                            />

                            <label className={modalLabelClassName}>
                              Temporary Password
                            </label>
                            <div className="flex flex-col gap-3 sm:flex-row">
                              <div className="relative w-full">
                                <input type={showTempPassword ? "text" : "password"} name="tempPassword" value={data.tempPassword} onChange={handleChange} onFocus={() => setActiveVoiceField("tempPassword")} placeholder="Temporary password" className={`${getInputClassName("tempPassword")} pr-12`}/>
                                <button type="button" onClick={toggleShowTempPassword} className={passwordVisibilityButtonClassName}
                                  aria-label={
                                    showTempPassword
                                      ? "Hide temporary password"
                                      : "Show temporary password"
                                  }
                                >
                                  {showTempPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.056 10.056 0 012.293-3.607M6.72 6.72A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.978 9.978 0 01-4.563 5.956M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/>
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 0 1 6 0z"/>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                  )}
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
                              User will be required to set a new password at first sign-in.
                            </p>
                          </div>
                        </FadeWrapper>
                      </div>
                    </div>
                  </div>
                </section>
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
    </dialog>,
    document.body,
  );
}