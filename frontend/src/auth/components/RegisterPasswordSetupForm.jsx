import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import { buildLoginPath } from "../utils/loginRoute";

const initialPasswordValues = {
  password: "",
  confirmPassword: "",
};

const initialPasswordErrors = {
  password: "",
  confirmPassword: "",
};

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

function getFirstErrorMessage(errors) {
  return Object.values(errors).find(Boolean) || "";
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

export default function RegisterPasswordSetupForm({ clientId, email = "" }) {
  const [passwordValues, setPasswordValues] = useState(initialPasswordValues);
  const [passwordErrors, setPasswordErrors] = useState(initialPasswordErrors);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);

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

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!validatePasswordStep()) {
      return;
    }

    setIsComplete(true);
  };

  return (
    <div className="relative z-20 w-full max-w-[34rem] px-1 sm:px-0">
      <div className="rounded-4xl border border-white/20 bg-white/10 p-1 shadow-[0_32px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
        <div className="rounded-[calc(2rem-4px)] bg-[linear-gradient(180deg,rgba(120,12,22,0.72),rgba(60,7,12,0.86))] px-6 py-7 sm:px-8 sm:py-8">
          {isComplete ? (
            <PasswordSavedState loginPath={loginPath} />
          ) : (
            <div className="space-y-6">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-[#f8d24e] shadow-[0_20px_45px_-28px_rgba(248,210,78,0.55)]">
                  <PasswordIcon />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold leading-tight text-white">
                    Set Your <span className="text-[#f8d24e]">Password</span>
                  </h2>
                  <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
                    Your registration has been verified. Create your password to
                    finish activating your account.
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
                  <button type="submit" className="h-12 w-full rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold tracking-[0.04em] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white">
                    SAVE PASSWORD
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
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-[0_20px_45px_-28px_rgba(16,185,129,0.6)]">
        <CheckIcon />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold leading-tight text-white">
          Password Saved
        </h2>
        <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
          Your account is ready. You can now sign in using your new password.
        </p>
      </div>

      <section className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 text-left">
        <p className="text-sm font-semibold text-white">What changed?</p>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Your password setup is complete and your registration can now move to
          the normal sign-in flow.
        </p>
      </section>

      <Link to={loginPath} className="flex h-12 w-full items-center justify-center rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold tracking-[0.04em] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white">
        Go to Login
      </Link>
    </div>
  );
}

function PasswordIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3C17.25 3.85 14.9 1.5 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd"/>
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

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-10 w-10">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.542-7a10.056 10.056 0 0 1 2.293-3.607M6.72 6.72A9.956 9.956 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7a9.978 9.978 0 0 1-4.563 5.956M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/>
    </svg>
  );
}