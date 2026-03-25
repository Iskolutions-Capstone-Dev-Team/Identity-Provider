import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import { authService } from "../services/authService";
import { buildLoginPath } from "../utils/loginRoute";

const roleOptions = [
  {
    label: "Student",
    Icon: StudentRoleIcon,
  },
  {
    label: "Guest",
    Icon: GuestRoleIcon,
  },
  {
    label: "Applicant",
    Icon: ApplicantRoleIcon,
  },
];
const verificationLength = 6;
const resendDurationSeconds = 200;

const initialDetails = {
  firstName: "",
  lastName: "",
  middleName: "",
  email: "",
  role: "",
};

const initialDetailErrors = {
  firstName: "",
  lastName: "",
  middleName: "",
  email: "",
  role: "",
};

const initialPasswordValues = {
  password: "",
  confirmPassword: "",
};

const initialPasswordErrors = {
  password: "",
  confirmPassword: "",
};

const registerRoleValueByLabel = {
  Student: "student",
  Guest: "guest",
  Applicant: "applicant",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function getInputClassName(hasError, hasActionButton = false) {
  return `h-12 w-full rounded-2xl border bg-white/95 pl-12 ${
    hasActionButton ? "pr-12" : "pr-4"
  } text-sm text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 placeholder:text-slate-400 focus:ring-4 ${
    hasError
      ? "border-red-300 focus:border-red-300 focus:ring-red-200/70"
      : "border-white/20 focus:border-[#ffd700] focus:ring-[#ffd700]/20"
  }`;
}

function getSelectContainerClassName(hasError) {
  return `relative rounded-[1.35rem] border bg-white/95 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] transition duration-200 ${
    hasError
      ? "border-red-300 focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-200/70"
      : "border-white/20 focus-within:border-[#ffd700] focus-within:ring-4 focus-within:ring-[#ffd700]/20"
  }`;
}

function getFirstErrorMessage(errors) {
  return Object.values(errors).find(Boolean) || "";
}

function getApiErrorMessage(error, fallbackMessage) {
  const responseMessage = error?.response?.data?.error || error?.response?.data?.message;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  return fallbackMessage;
}

function getRoleOption(value) {
  return roleOptions.find((roleOption) => roleOption.label === value) || null;
}

function trimRegistrationDetails(details) {
  return {
    ...details,
    firstName: details.firstName.trim(),
    lastName: details.lastName.trim(),
    middleName: details.middleName.trim(),
    email: details.email.trim(),
  };
}

function getRegisterRoleValue(roleLabel) {
  return registerRoleValueByLabel[roleLabel] || roleLabel.trim().toLowerCase();
}

function buildRegisterPayload(details, password) {
  const normalizedDetails = trimRegistrationDetails(details);

  return {
    first_name: normalizedDetails.firstName,
    middle_name: normalizedDetails.middleName,
    last_name: normalizedDetails.lastName,
    email: normalizedDetails.email,
    password,
    role: getRegisterRoleValue(normalizedDetails.role),
  };
}

function getRegistrationRedirectUrl(response) {
  if (typeof response?.redirect_url !== "string") {
    return "";
  }

  return response.redirect_url.trim();
}

function maskEmail(email) {
  const [localPart, domainPart] = email.split("@");

  if (!localPart || !domainPart) {
    return email;
  }

  const visibleLocalPart = localPart.slice(0, Math.min(3, localPart.length));
  const hiddenLocalPart = "*".repeat(Math.max(localPart.length - visibleLocalPart.length, 2));
  const [domainName, ...domainParts] = domainPart.split(".");
  const visibleDomainName = domainName.slice(0, Math.min(2, domainName.length));
  const hiddenDomainName = "*".repeat(Math.max(domainName.length - visibleDomainName.length, 2));
  const domainSuffix = domainParts.length ? `.${domainParts.join(".")}` : "";

  return `${visibleLocalPart}${hiddenLocalPart}@${visibleDomainName}${hiddenDomainName}${domainSuffix}`;
}

function getFirstNameError(value) {
  if (!value.trim()) {
    return "First name is required.";
  }

  return "";
}

function getLastNameError(value) {
  if (!value.trim()) {
    return "Last name is required.";
  }

  return "";
}

function getEmailError(value) {
  if (!value.trim()) {
    return "Email address is required.";
  }

  if (!emailRegex.test(value)) {
    return "Enter a valid email address.";
  }

  return "";
}

function getRoleError(value) {
  if (!value.trim()) {
    return "Please select a role.";
  }

  return "";
}

function getPasswordError(value) {
  if (!value.trim()) {
    return "Password is required.";
  }

  if (!passwordRegex.test(value)) {
    return "Use at least 8 characters with uppercase, lowercase, and a number.";
  }

  return "";
}

function getConfirmPasswordError(password, confirmPassword) {
  if (!confirmPassword.trim()) {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

function getDetailFieldError(field, details) {
  switch (field) {
    case "firstName":
      return getFirstNameError(details.firstName);
    case "lastName":
      return getLastNameError(details.lastName);
    case "email":
      return getEmailError(details.email);
    case "role":
      return getRoleError(details.role);
    default:
      return "";
  }
}

function getPasswordFieldError(field, passwordValues) {
  switch (field) {
    case "password":
      return getPasswordError(passwordValues.password);
    case "confirmPassword":
      return getConfirmPasswordError(
        passwordValues.password,
        passwordValues.confirmPassword
      );
    default:
      return "";
  }
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="pl-1 pt-2 text-xs text-red-100/95">{message}</p>;
}

function FormLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-white/90">
      {children}
      {required ? <span className="text-red-300"> *</span> : null}
    </label>
  );
}

export default function RegisterForm({ clientId, onComplete }) {
  const navigate = useNavigate();
  const verificationInputsRef = useRef([]);
  const roleDropdownRef = useRef(null);

  const [step, setStep] = useState("details");
  const [details, setDetails] = useState(initialDetails);
  const [detailErrors, setDetailErrors] = useState(initialDetailErrors);
  const [verificationCode, setVerificationCode] = useState(
    Array(verificationLength).fill("")
  );
  const [verificationError, setVerificationError] = useState("");
  const [resendTimer, setResendTimer] = useState(resendDurationSeconds);
  const [passwordValues, setPasswordValues] = useState(initialPasswordValues);
  const [passwordErrors, setPasswordErrors] = useState(initialPasswordErrors);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isCompletingRegistration, setIsCompletingRegistration] = useState(false);
  const [error, setError] = useState("");

  const loginPath = buildLoginPath(clientId);

  useEffect(() => {
    if (step !== "verifyEmail" || resendTimer <= 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setResendTimer((currentTimer) => currentTimer - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [step, resendTimer]);

  useEffect(() => {
    if (step !== "verifyEmail") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      verificationInputsRef.current[0]?.focus();
    }, 60);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [step]);

  useEffect(() => {
    if (!isRoleMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsRoleMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRoleMenuOpen]);

  const handleDetailChange = (field, value) => {
    setDetails((currentDetails) => ({
      ...currentDetails,
      [field]: value,
    }));

    setError("");
    setDetailErrors((currentErrors) => ({
      ...currentErrors,
      [field]: "",
    }));
  };

  const handleDetailBlur = (field) => {
    const fieldError = getDetailFieldError(field, details);

    setDetailErrors((currentErrors) => ({
      ...currentErrors,
      [field]: fieldError,
    }));
  };

  const handleRoleSelect = (role) => {
    setDetails((currentDetails) => ({
      ...currentDetails,
      role,
    }));

    setError("");
    setIsRoleMenuOpen(false);
    setDetailErrors((currentErrors) => ({
      ...currentErrors,
      role: "",
    }));
  };

  const validateDetailsStep = () => {
    const nextErrors = {
      firstName: getFirstNameError(details.firstName),
      lastName: getLastNameError(details.lastName),
      middleName: "",
      email: getEmailError(details.email),
      role: getRoleError(details.role),
    };

    setDetailErrors(nextErrors);

    const validationMessage = getFirstErrorMessage(nextErrors);
    setError(validationMessage);

    return !validationMessage;
  };

  const handleDetailsSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateDetailsStep()) {
      return;
    }

    const normalizedDetails = trimRegistrationDetails(details);

    setIsSendingOtp(true);

    try {
      await authService.requestOtp(normalizedDetails.email);

      setDetails(normalizedDetails);
      setVerificationCode(Array(verificationLength).fill(""));
      setVerificationError("");
      setResendTimer(resendDurationSeconds);
      setStep("verifyEmail");
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to send the verification code. Please try again.",
        ),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerificationChange = (index, value) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const nextCode = [...verificationCode];
    nextCode[index] = value;
    setVerificationCode(nextCode);
    setVerificationError("");
    setError("");

    if (value && index < verificationLength - 1) {
      verificationInputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerificationKeyDown = (index, event) => {
    if (event.key === "Backspace" && !verificationCode[index] && index > 0) {
      verificationInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerificationPaste = (event) => {
    event.preventDefault();

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, verificationLength)
      .split("");

    if (!pastedDigits.length) {
      return;
    }

    const nextCode = Array.from({ length: verificationLength }, (_, index) => {
      return pastedDigits[index] || "";
    });

    setVerificationCode(nextCode);
    setVerificationError("");
    setError("");

    const nextFocusIndex = Math.min(pastedDigits.length, verificationLength - 1);
    verificationInputsRef.current[nextFocusIndex]?.focus();
  };

  const validateVerificationStep = () => {
    const joinedCode = verificationCode.join("");

    if (joinedCode.length !== verificationLength) {
      const validationMessage = "Enter the 6-digit verification code.";
      setVerificationError(validationMessage);
      setError(validationMessage);
      return false;
    }

    setVerificationError("");
    setError("");
    return true;
  };

  const handleVerificationSubmit = async (event) => {
    event.preventDefault();

    if (!validateVerificationStep()) {
      return;
    }

    setIsVerifyingOtp(true);

    try {
      await authService.validateOtp(details.email.trim(), verificationCode.join(""));
      setStep("createPassword");
    } catch (verificationRequestError) {
      const verificationMessage = getApiErrorMessage(
        verificationRequestError,
        "Unable to verify the code. Please try again.",
      );

      setVerificationError(verificationMessage);
      setError(verificationMessage);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isResendingOtp) {
      return;
    }

    setIsResendingOtp(true);
    setVerificationError("");
    setError("");

    try {
      await authService.resendOtp(details.email);
      setVerificationCode(Array(verificationLength).fill(""));
      setResendTimer(resendDurationSeconds);
      verificationInputsRef.current[0]?.focus();
    } catch (requestError) {
      const requestMessage = getApiErrorMessage(
        requestError,
        "Unable to resend the verification code. Please try again.",
      );

      setVerificationError(requestMessage);
      setError(requestMessage);
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setError("");
    setPasswordErrors((currentErrors) => ({
      ...currentErrors,
      [field]: "",
      ...(field === "password" ? { confirmPassword: "" } : {}),
    }));
  };

  const handlePasswordBlur = (field) => {
    const nextErrors = {
      ...passwordErrors,
      [field]: getPasswordFieldError(field, passwordValues),
    };

    if (field === "password" && passwordValues.confirmPassword) {
      nextErrors.confirmPassword = getConfirmPasswordError(
        passwordValues.password,
        passwordValues.confirmPassword
      );
    }

    setPasswordErrors(nextErrors);
  };

  const validatePasswordStep = () => {
    const nextErrors = {
      password: getPasswordError(passwordValues.password),
      confirmPassword: getConfirmPasswordError(
        passwordValues.password,
        passwordValues.confirmPassword
      ),
    };

    setPasswordErrors(nextErrors);

    const validationMessage = getFirstErrorMessage(nextErrors);
    setError(validationMessage);

    return !validationMessage;
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validatePasswordStep()) {
      return;
    }

    const normalizedDetails = trimRegistrationDetails(details);

    setIsCompletingRegistration(true);

    try {
      if (onComplete) {
        await onComplete({
          ...normalizedDetails,
          verificationCode: verificationCode.join(""),
          password: passwordValues.password,
        });
        return;
      }

      const registerResponse = await authService.register(
        buildRegisterPayload(normalizedDetails, passwordValues.password),
      );

      const redirectUrl = getRegistrationRedirectUrl(registerResponse);

      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      navigate(loginPath);
    } catch (submissionError) {
      setError(
        getApiErrorMessage(
          submissionError,
          "Registration failed. Please try again.",
        ),
      );
    } finally {
      setIsCompletingRegistration(false);
    }
  };

  const renderDetailsStep = () => {
    const selectedRoleOption = getRoleOption(details.role);

    return (
      <form onSubmit={handleDetailsSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormLabel required>First Name</FormLabel>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
                <UserIcon />
              </span>
              <input type="text" value={details.firstName} onChange={(event) => handleDetailChange("firstName", event.target.value)} onBlur={() => handleDetailBlur("firstName")} autoComplete="given-name" placeholder="Enter your first name" className={getInputClassName(detailErrors.firstName)}/>
            </div>
            <FieldError message={detailErrors.firstName} />
          </div>

          <div>
            <FormLabel required>Last Name</FormLabel>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
                <UserIcon />
              </span>
              <input type="text" value={details.lastName} onChange={(event) => handleDetailChange("lastName", event.target.value)} onBlur={() => handleDetailBlur("lastName")} autoComplete="family-name" placeholder="Enter your last name" className={getInputClassName(detailErrors.lastName)}/>
            </div>
            <FieldError message={detailErrors.lastName} />
          </div>
        </div>

        <div>
          <FormLabel>Middle Name</FormLabel>
          <label className="flex h-12 w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/95 pl-4 pr-3 text-sm text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 focus-within:border-[#ffd700] focus-within:ring-4 focus-within:ring-[#ffd700]/20">
            <span className="shrink-0 text-[#7b0d15]/60">
              <UserIcon />
            </span>
            <input type="text" value={details.middleName} onChange={(event) => handleDetailChange("middleName", event.target.value)} autoComplete="additional-name" placeholder="Enter your middle name" className="min-w-0 grow bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"/>
            <span className="inline-flex shrink-0 rounded-full border border-[#7b0d15]/15 bg-[#7b0d15]/8 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[#7b0d15]/70">
              Optional
            </span>
          </label>
        </div>

        <div>
          <FormLabel required>Email Address</FormLabel>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
              <EmailIcon />
            </span>
            <input type="email" value={details.email} onChange={(event) => handleDetailChange("email", event.target.value)} onBlur={() => handleDetailBlur("email")} autoComplete="email" placeholder="Enter your email address" className={getInputClassName(detailErrors.email)}/>
          </div>
          <FieldError message={detailErrors.email} />
        </div>

        <div>
          <FormLabel required>Select Your Role</FormLabel>
          <div ref={roleDropdownRef} className={`relative ${isRoleMenuOpen ? "z-[80]" : ""}`}>
            <div className={getSelectContainerClassName(detailErrors.role)}>
              <button type="button" onClick={() => setIsRoleMenuOpen((currentValue) => !currentValue)}
                onBlur={() => {
                  window.setTimeout(() => {
                    if (!roleDropdownRef.current?.contains(document.activeElement)) {
                      handleDetailBlur("role");
                    }
                  }, 0);
                }}
                className="flex h-14 w-full items-center justify-between gap-3 bg-transparent pl-4 pr-2 text-left outline-none"
                aria-haspopup="listbox"
                aria-expanded={isRoleMenuOpen}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="shrink-0 text-[#7b0d15]/60">
                    {selectedRoleOption ? <selectedRoleOption.Icon /> : <RoleIcon />}
                  </span>
                  <span className={`truncate text-sm ${details.role ? "text-slate-800" : "text-slate-400"}`}>
                    {details.role || "Select your role"}
                  </span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#7b0d15]/15 bg-[#7b0d15]/8 text-[#991b1b]">
                  <ChevronDownIcon
                    className={`h-5 w-5 transition duration-200 ${
                      isRoleMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>
            </div>

            {isRoleMenuOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%-0.15rem)] z-[90] overflow-hidden rounded-[1.35rem] border border-white/20 bg-white/98 shadow-[0_28px_55px_-24px_rgba(15,23,42,0.88)] backdrop-blur-xl" role="listbox" aria-label="Select your role">
                <button type="button" onClick={() => handleRoleSelect("")}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition duration-200 ${
                    details.role
                      ? "text-slate-700 hover:bg-[#fff2d2] hover:text-[#7b0d15]"
                      : "bg-[#fff2d2] font-medium text-[#7b0d15]"
                  }`}
                >
                  <span className="shrink-0">
                    <RoleIcon />
                  </span>
                  <span className="truncate">Select your role</span>
                </button>

                {roleOptions.map((roleOption) => {
                  const isSelected = details.role === roleOption.label;

                  return (
                    <button key={roleOption.label} type="button" onClick={() => handleRoleSelect(roleOption.label)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition duration-200 ${
                        isSelected
                          ? "bg-[#fff2d2] font-medium text-[#7b0d15]"
                          : "text-slate-700 hover:bg-[#fff2d2] hover:text-[#7b0d15]"
                      }`}
                    >
                      <span className="shrink-0">
                        <roleOption.Icon />
                      </span>
                      <span className="truncate">{roleOption.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <FieldError message={detailErrors.role} />
        </div>

        <p className="pt-1 text-sm text-white/80">
          Need to login instead?{" "}
          <Link to={loginPath} className="font-semibold text-[#ffd700] underline decoration-transparent transition duration-300 hover:decoration-[#ffd700]">
            Go back to login
          </Link>
        </p>

        <button type="submit" disabled={isSendingOtp} className="h-12 w-full rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold tracking-[0.08em] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:border-[#f8d24e]/60 disabled:bg-[#f8d24e]/60 disabled:text-[#991b1b]/70">
          {isSendingOtp ? "SENDING CODE..." : "SEND VERIFICATION CODE"}
        </button>
      </form>
    );
  };

  const renderVerificationStep = () => {
    return (
      <form onSubmit={handleVerificationSubmit} noValidate className="space-y-5">
        <div>
          <FormLabel>Enter Verification Code</FormLabel>
          <div className="grid grid-cols-6 gap-2" onPaste={handleVerificationPaste}>
            {verificationCode.map((digit, index) => (
              <input key={index}
                ref={(element) => {
                  verificationInputsRef.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                disabled={isVerifyingOtp}
                value={digit}
                onChange={(event) => handleVerificationChange(index, event.target.value)}
                onKeyDown={(event) => handleVerificationKeyDown(index, event)}
                className={`h-14 min-w-0 rounded-2xl border bg-white/95 text-center text-xl font-semibold text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 focus:ring-4 ${
                  verificationError
                    ? "border-red-300 focus:border-red-300 focus:ring-red-200/70"
                    : "border-white/20 focus:border-[#ffd700] focus:ring-[#ffd700]/20"
                }`}
              />
            ))}
          </div>
          <FieldError message={verificationError} />
        </div>

        <p className="text-center text-sm text-white/80">
          Didn't receive a code?{" "}
          <button type="button" onClick={handleResendCode} disabled={resendTimer > 0 || isResendingOtp || isVerifyingOtp}
            className={`font-semibold underline decoration-transparent transition duration-300 ${
              resendTimer > 0 || isResendingOtp || isVerifyingOtp
                ? "cursor-not-allowed text-white/45"
                : "text-[#ffd700] hover:decoration-[#ffd700]"
            }`}
          >
            {isResendingOtp ? "Resending..." : "Resend"}
          </button>{" "}
          {resendTimer > 0 ? `in ${resendTimer}s` : "now"}
        </p>

        <button type="submit" disabled={isVerifyingOtp || isResendingOtp} className="h-12 w-full rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold tracking-[0.04em] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:border-[#f8d24e]/60 disabled:bg-[#f8d24e]/60 disabled:text-[#991b1b]/70">
          {isVerifyingOtp ? "VERIFYING..." : "VERIFY & CONTINUE"}
        </button>
      </form>
    );
  };

  const renderPasswordStep = () => {
    return (
      <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
        <div>
          <FormLabel required>Password</FormLabel>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
              <PasswordIcon />
            </span>
            <input type={showPassword ? "text" : "password"} value={passwordValues.password} onChange={(event) => handlePasswordChange("password", event.target.value)} onBlur={() => handlePasswordBlur("password")} autoComplete="new-password" placeholder="Create your password" className={getInputClassName(passwordErrors.password, true)}/>
            <button type="button" onClick={() => setShowPassword((currentValue) => !currentValue)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
          <FieldError message={passwordErrors.password} />
        </div>

        <div>
          <FormLabel required>Confirm Password</FormLabel>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
              <PasswordIcon />
            </span>
            <input type={showConfirmPassword ? "text" : "password"} value={passwordValues.confirmPassword}
              onChange={(event) =>
                handlePasswordChange("confirmPassword", event.target.value)
              }
              onBlur={() => handlePasswordBlur("confirmPassword")}
              autoComplete="new-password"
              placeholder="Confirm your password"
              className={getInputClassName(passwordErrors.confirmPassword, true)}
            />
            <button type="button"
              onClick={() =>
                setShowConfirmPassword((currentValue) => !currentValue)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
          <FieldError message={passwordErrors.confirmPassword} />
        </div>

        <button type="submit" disabled={isCompletingRegistration} className="h-12 w-full rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold tracking-[0.04em] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:border-[#f8d24e]/60 disabled:bg-[#f8d24e]/60 disabled:text-[#991b1b]/70">
          {isCompletingRegistration ? "CREATING ACCOUNT..." : "COMPLETE REGISTRATION"}
        </button>
      </form>
    );
  };

  return (
    <div className="relative z-20 w-full max-w-[32rem] px-1 sm:px-0">
      <div className="rounded-4xl border border-white/20 bg-white/10 p-1 shadow-[0_32px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
        <div className="rounded-[calc(2rem-4px)] bg-[linear-gradient(180deg,rgba(120,12,22,0.72),rgba(60,7,12,0.86))] px-6 py-7 sm:px-8 sm:py-8">
          <div className="space-y-6">
            <div className="space-y-4 text-center">
              <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="float-logo mx-auto block h-24 object-contain drop-shadow-[0_12px_20px_rgba(248,210,78,0.35)] transition duration-300 hover:scale-105"/>

              {step === "details" ? (
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold leading-none text-white">
                    Join <span className="text-[#f8d24e]">PUPTian!</span>
                  </h2>
                  <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
                    Create an account to access PUPT systems.
                  </p>
                </div>
              ) : null}

              {step === "verifyEmail" ? (
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold leading-tight text-white">
                    Verify <span className="text-[#f8d24e]">Your Email</span>
                  </h2>
                  <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
                    We sent a code to the email you provided ({maskEmail(details.email)}). If
                    you can't find it, check your spam folder.
                  </p>
                </div>
              ) : null}

              {step === "createPassword" ? (
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold leading-tight text-white">
                    Create Your <span className="text-[#f8d24e]">Password</span>
                  </h2>
                  <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
                    You're almost there. Set a strong password to protect your new account.
                  </p>
                </div>
              ) : null}
            </div>

            <ErrorAlert message={error} onClose={() => setError("")} />

            {step === "details" ? renderDetailsStep() : null}
            {step === "verifyEmail" ? renderVerificationStep() : null}
            {step === "createPassword" ? renderPasswordStep() : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path
        fillRule="evenodd"
        d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
    </svg>
  );
}

function RoleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>
    </svg>
  );
}

function StudentRoleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path d="M10.75 16.82A7.462 7.462 0 0 1 15 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0 0 18 15.06v-11a.75.75 0 0 0-.546-.721A9.006 9.006 0 0 0 15 3a8.963 8.963 0 0 0-4.25 1.065V16.82ZM9.25 4.065A8.963 8.963 0 0 0 5 3c-.85 0-1.673.118-2.454.339A.75.75 0 0 0 2 4.06v11a.75.75 0 0 0 .954.721A7.506 7.506 0 0 1 5 15.5c1.579 0 3.042.487 4.25 1.32V4.065Z" />
    </svg>
  );
}

function GuestRoleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
    </svg>
  );
}

function ApplicantRoleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path fillRule="evenodd" d="M1 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V6Zm4 1.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm2 3a4 4 0 0 0-3.665 2.395.75.75 0 0 0 .416 1A8.98 8.98 0 0 0 7 14.5a8.98 8.98 0 0 0 3.249-.604.75.75 0 0 0 .416-1.001A4.001 4.001 0 0 0 7 10.5Zm5-3.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Zm0 6.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Zm.75-4a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function PasswordIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3C17.25 3.85 14.9 1.5 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.542-7a10.056 10.056 0 0 1 2.293-3.607M6.72 6.72A9.956 9.956 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7a9.978 9.978 0 0 1-4.563 5.956M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-5 w-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
