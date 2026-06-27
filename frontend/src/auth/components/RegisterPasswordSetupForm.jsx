import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import { isInvitationForbiddenError, registrationActivationService } from "../services/registrationActivationService";
import { buildLoginPath } from "../utils/loginRoute";
import { EmailIcon, PasswordIcon, EyeIcon, EyeSlashIcon } from "./authIcons";

const initialPasswordValues = {
  password: "",
  confirmPassword: "",
};

const initialPasswordErrors = {
  password: "",
  confirmPassword: "",
};

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function getInputClassName(hasError, hasActionButton = false) {
  return `h-12 w-full rounded-2xl border bg-white/95 pl-12 ${hasActionButton ? "pr-12" : "pr-4"
    } text-sm text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 placeholder:text-slate-400 focus:ring-4 ${hasError
      ? "border-red-300 focus:border-red-300 focus:ring-red-200/70"
      : "border-white/20 focus:border-[#ffd700] focus:ring-[#ffd700]/20"
    }`;
}

function getFirstErrorMessage(errors) {
  return Object.values(errors).find(Boolean) || "";
}

function getPasswordError(value) {
  if (!value.trim()) {
    return "Password is required.";
  }

  if (!passwordRegex.test(value)) {
    return "Use at least 8 characters with 1 uppercase letter, 1 number, and 1 special character.";
  }

  return "";
}

function getConfirmPasswordError(password, confirmPassword) {
  const passwordError = getPasswordError(password);

  if (passwordError) {
    return passwordError;
  }

  if (!confirmPassword.trim()) {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

function getApiErrorMessage(error, fallbackMessage = "Unable to save your password right now.") {
  return (
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

function maskEmail(email) {
  const [localPart, domainPart] = email.split("@");

  if (!localPart || !domainPart) {
    return email;
  }

  const visibleLocalPart = localPart.slice(0, Math.min(3, localPart.length));
  const hiddenLocalPart = "*".repeat(
    Math.max(localPart.length - visibleLocalPart.length, 2),
  );
  const [domainName, ...domainParts] = domainPart.split(".");
  const visibleDomainName = domainName.slice(0, Math.min(2, domainName.length));
  const hiddenDomainName = "*".repeat(
    Math.max(domainName.length - visibleDomainName.length, 2),
  );
  const domainSuffix = domainParts.length ? `.${domainParts.join(".")}` : "";

  return `${visibleLocalPart}${hiddenLocalPart}@${visibleDomainName}${hiddenDomainName}${domainSuffix}`;
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

export default function RegisterPasswordSetupForm({ clientId, email = "", invitationCode = "", onInvalidInvitation }) {
  const [passwordValues, setPasswordValues] = useState(initialPasswordValues);
  const [passwordErrors, setPasswordErrors] = useState(initialPasswordErrors);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginPath = buildLoginPath(clientId);
  const maskedEmail = email ? maskEmail(email) : "";

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validatePasswordStep()) {
      return;
    }

    if (!invitationCode) {
      onInvalidInvitation?.();
      return;
    }

    let shouldSkipSubmittingReset = false;

    try {
      setIsSubmitting(true);

      await registrationActivationService.activateAccount({
        invitationCode,
        password: passwordValues.password,
      });

      setIsComplete(true);
    } catch (submissionError) {
      if (isInvitationForbiddenError(submissionError)) {
        shouldSkipSubmittingReset = true;
        onInvalidInvitation?.();
        return;
      }

      try {
        await registrationActivationService.checkInvitation(invitationCode);
      } catch (validationError) {
        if (isInvitationForbiddenError(validationError)) {
          shouldSkipSubmittingReset = true;
          onInvalidInvitation?.();
          return;
        }
      }

      setError(getApiErrorMessage(submissionError));
    } finally {
      if (!shouldSkipSubmittingReset) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="relative z-20 w-full max-w-[34rem] px-1 sm:px-0">
      <div className="rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm">
        <div className="rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-6 py-7 sm:px-8 sm:py-8">
          {isComplete ? (
            <PasswordSavedState loginPath={loginPath} />
          ) : (
            <div className="space-y-6">
              <div className="space-y-4 text-center">
                <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="float-logo mx-auto block h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)]" />

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold leading-tight text-white">
                    Set Your <span className="text-[#f8d24e]">Password</span>
                  </h2>
                  <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
                    Create your password to finish activating your account.
                  </p>
                </div>

                {maskedEmail ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/85">
                    <EmailIcon />
                    {maskedEmail}
                  </div>
                ) : null}
              </div>

              <ErrorAlert message={error} onClose={() => setError("")} />

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <FormLabel required>Password</FormLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
                      <PasswordIcon />
                    </span>
                    <input type={showPassword ? "text" : "password"} value={passwordValues.password}
                      onChange={(event) =>
                        handlePasswordChange("password", event.target.value)
                      }
                      onBlur={() => handlePasswordBlur("password")}
                      autoComplete="new-password"
                      placeholder="Create your password"
                      className={getInputClassName(passwordErrors.password, true)}
                    />
                    <button type="button"
                      onClick={() =>
                        setShowPassword((currentValue) => !currentValue)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
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
                        handlePasswordChange(
                          "confirmPassword",
                          event.target.value,
                        )
                      }
                      onBlur={() => handlePasswordBlur("confirmPassword")}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      className={getInputClassName(
                        passwordErrors.confirmPassword,
                        true,
                      )}
                    />
                    <button type="button"
                      onClick={() =>
                        setShowConfirmPassword((currentValue) => !currentValue)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <FieldError message={passwordErrors.confirmPassword} />
                </div>

                <div className="space-y-3 pt-1">
                  <button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold tracking-[0.04em] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:border-[#f8d24e]/40 disabled:bg-[#f8d24e]/60 disabled:text-[#7b0d15]/70 disabled:shadow-none">
                    {isSubmitting ? "SAVING..." : "SAVE PASSWORD"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordSavedState({ loginPath }) {
  return (
    <div className="space-y-5 text-center">
      <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="float-logo mx-auto block h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)]" />

      <div className="space-y-2">
        <h2 className="text-3xl font-bold leading-tight text-white">
          Password Saved
        </h2>
        <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
          Your account is ready. You can now sign in using your new password.
        </p>
      </div>

      <Link to={loginPath} className="flex h-12 w-full items-center justify-center rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold tracking-[0.04em] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white">
        Go to Login
      </Link>
    </div>
  );
}