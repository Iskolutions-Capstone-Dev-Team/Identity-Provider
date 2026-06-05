import { useEffect, useRef, useState } from "react";
import ErrorAlert from "../../components/ErrorAlert";
import { getPasswordRequirementChecks } from "../../utils/passwordRules";
import { registrationFlowService } from "../services/registrationFlowService";
import { buildLoginPath } from "../utils/loginRoute";
import RegisterDetailsStep from "./register/RegisterDetailsStep";
import RegisterPasswordStep from "./register/RegisterPasswordStep";
import RegisterStepHeader from "./register/RegisterStepHeader";
import RegisterSuccessStep from "./register/RegisterSuccessStep";
import RegisterVerificationStep from "./register/RegisterVerificationStep";

const verificationLength = 6;
const resendDurationSeconds = 180;

const initialDetails = {
  firstName: "",
  lastName: "",
  middleName: "",
  suffix: "",
  email: "",
  accountType: "",
};

const initialDetailErrors = {
  firstName: "",
  lastName: "",
  middleName: "",
  suffix: "",
  email: "",
  accountType: "",
};

const initialPasswordValues = {
  password: "",
  confirmPassword: "",
};

const initialPasswordErrors = {
  password: "",
  confirmPassword: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFirstErrorMessage(errors) {
  return Object.values(errors).find(Boolean) || "";
}

function getFirstNameError(value) {
  return value.trim() ? "" : "First name is required.";
}

function getLastNameError(value) {
  return value.trim() ? "" : "Last name is required.";
}

function getEmailError(value) {
  if (!value.trim()) {
    return "Email address is required.";
  }

  return emailRegex.test(value) ? "" : "Enter a valid email address.";
}

function getAccountTypeError(value) {
  return value.trim() ? "" : "Please select a role.";
}

function getDetailFieldError(field, details) {
  switch (field) {
    case "firstName":
      return getFirstNameError(details.firstName);
    case "lastName":
      return getLastNameError(details.lastName);
    case "email":
      return getEmailError(details.email);
    case "accountType":
      return getAccountTypeError(details.accountType);
    default:
      return "";
  }
}

function getPasswordError(value) {
  if (!value.trim()) {
    return "Password is required.";
  }

  const passwordChecks = getPasswordRequirementChecks(value);

  if (!Object.values(passwordChecks).every(Boolean)) {
    return "Use at least 8 characters with 1 uppercase letter, 1 number, and 1 special character.";
  }

  return "";
}

function getConfirmPasswordError(password, confirmPassword) {
  if (!confirmPassword.trim()) {
    return "Please confirm your password.";
  }

  return password === confirmPassword ? "" : "Passwords do not match.";
}

function getApiErrorMessage(
  error,
  fallbackMessage = "Unable to continue registration right now.",
) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export default function RegisterForm({ clientId }) {
  const verificationInputsRef = useRef([]);
  const roleDropdownRef = useRef(null);

  const [step, setStep] = useState("details");
  const [details, setDetails] = useState(initialDetails);
  const [detailErrors, setDetailErrors] = useState(initialDetailErrors);
  const [passwordValues, setPasswordValues] = useState(initialPasswordValues);
  const [passwordErrors, setPasswordErrors] = useState(initialPasswordErrors);
  const [verificationCode, setVerificationCode] = useState(
    Array(verificationLength).fill(""),
  );
  const [verificationError, setVerificationError] = useState("");
  const [resendTimer, setResendTimer] = useState(resendDurationSeconds);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmittingRegistration, setIsSubmittingRegistration] =
    useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
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
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
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
    setDetailErrors((currentErrors) => ({
      ...currentErrors,
      [field]: getDetailFieldError(field, details),
    }));
  };

  const handleRoleSelect = (role) => {
    setDetails((currentDetails) => ({
      ...currentDetails,
      accountType: role,
    }));

    setError("");
    setIsRoleMenuOpen(false);
    setDetailErrors((currentErrors) => ({
      ...currentErrors,
      accountType: "",
    }));
  };

  const validateDetailsStep = () => {
    const nextErrors = {
      firstName: getFirstNameError(details.firstName),
      lastName: getLastNameError(details.lastName),
      middleName: "",
      suffix: "",
      email: getEmailError(details.email),
      accountType: getAccountTypeError(details.accountType),
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

    try {
      setIsSendingOtp(true);
      await registrationFlowService.sendOtp({
        email: details.email,
      });
      setVerificationCode(Array(verificationLength).fill(""));
      setVerificationError("");
      setResendTimer(resendDurationSeconds);
      setStep("verifyEmail");
    } catch (submissionError) {
      setError(
        getApiErrorMessage(
          submissionError,
          "Unable to send the OTP right now.",
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

    try {
      if (!details.email) {
        throw new Error("Registration session expired. Please start again.");
      }

      setIsVerifyingCode(true);
      await registrationFlowService.verifyOtp({
        email: details.email,
        otp: verificationCode.join(""),
      });
      setPasswordValues(initialPasswordValues);
      setPasswordErrors(initialPasswordErrors);
      setStep("setPassword");
    } catch (submissionError) {
      const errorMessage = getApiErrorMessage(
        submissionError,
        "Unable to verify the OTP right now.",
      );
      setVerificationError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (!details.email || resendTimer > 0 || isResendingCode) {
      return;
    }

    try {
      setIsResendingCode(true);
      setError("");
      await registrationFlowService.sendOtp({
        email: details.email,
      });
      setVerificationCode(Array(verificationLength).fill(""));
      setVerificationError("");
      setResendTimer(resendDurationSeconds);
      verificationInputsRef.current[0]?.focus();
    } catch (resendError) {
      const errorMessage = getApiErrorMessage(
        resendError,
        "Unable to resend the OTP right now.",
      );
      setVerificationError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsResendingCode(false);
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
      [field]:
        field === "password"
          ? getPasswordError(passwordValues.password)
          : getConfirmPasswordError(
              passwordValues.password,
              passwordValues.confirmPassword,
            ),
    };

    if (field === "password" && passwordValues.confirmPassword) {
      nextErrors.confirmPassword = getConfirmPasswordError(
        passwordValues.password,
        passwordValues.confirmPassword,
      );
    }

    setPasswordErrors(nextErrors);
  };

  const validatePasswordStep = () => {
    const nextErrors = {
      password: getPasswordError(passwordValues.password),
      confirmPassword: getConfirmPasswordError(
        passwordValues.password,
        passwordValues.confirmPassword,
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

    try {
      setIsSubmittingRegistration(true);
      await registrationFlowService.registerAccount({
        firstName: details.firstName,
        lastName: details.lastName,
        middleName: details.middleName,
        suffix: details.suffix,
        email: details.email,
        accountType: details.accountType,
        password: passwordValues.password,
      });
      setStep("success");
    } catch (submissionError) {
      setError(
        getApiErrorMessage(
          submissionError,
          "Unable to continue registration right now.",
        ),
      );
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  return (
    <div className="relative z-20 w-full max-w-[38rem] px-1 sm:px-0">
      <div className="rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_32px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm">
        <div className="rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-6 py-6 sm:px-9 lg:px-10">
          <div className="space-y-5">
            <RegisterStepHeader step={step} email={details.email} />

            <ErrorAlert message={error} onClose={() => setError("")} />

            {step === "details" ? (
              <RegisterDetailsStep
                details={details}
                errors={detailErrors}
                isRoleMenuOpen={isRoleMenuOpen}
                isSubmitting={isSendingOtp}
                loginPath={loginPath}
                roleDropdownRef={roleDropdownRef}
                onBlur={handleDetailBlur}
                onChange={handleDetailChange}
                onRoleMenuToggle={() =>
                  setIsRoleMenuOpen((currentValue) => !currentValue)
                }
                onRoleSelect={handleRoleSelect}
                onSubmit={handleDetailsSubmit}
              />
            ) : null}

            {step === "verifyEmail" ? (
              <RegisterVerificationStep
                code={verificationCode}
                error={verificationError}
                inputsRef={verificationInputsRef}
                isResending={isResendingCode}
                isVerifying={isVerifyingCode}
                resendTimer={resendTimer}
                onChange={handleVerificationChange}
                onKeyDown={handleVerificationKeyDown}
                onPaste={handleVerificationPaste}
                onResend={handleResendCode}
                onSubmit={handleVerificationSubmit}
              />
            ) : null}

            {step === "setPassword" ? (
              <RegisterPasswordStep
                errors={passwordErrors}
                isSubmitting={isSubmittingRegistration}
                showConfirmPassword={showConfirmPassword}
                showPassword={showPassword}
                values={passwordValues}
                onBlur={handlePasswordBlur}
                onChange={handlePasswordChange}
                onSubmit={handlePasswordSubmit}
                onToggleConfirmPassword={() =>
                  setShowConfirmPassword((currentValue) => !currentValue)
                }
                onTogglePassword={() =>
                  setShowPassword((currentValue) => !currentValue)
                }
              />
            ) : null}

            {step === "success" ? (
              <RegisterSuccessStep loginPath={loginPath} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}