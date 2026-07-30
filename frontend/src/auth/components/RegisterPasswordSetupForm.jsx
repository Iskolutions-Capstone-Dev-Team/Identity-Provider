import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import { isInvitationForbiddenError, registrationActivationService } from "../services/registrationActivationService";
import { buildLoginPath } from "../utils/loginRoute";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
      <Card className="rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm">
        <CardContent className="rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-6 py-7 sm:px-8 sm:py-8">
          {isComplete ? (
            <PasswordSavedState loginPath={loginPath} />
          ) : (
            <div className="space-y-6">
              <div className="space-y-3 text-center">
                <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="mx-auto block h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)] transition duration-300 hover:scale-105" />

                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Set Your <span className="text-[#ffd700]">Password</span>
                  </h2>
                  <p className="text-sm text-muted-foreground text-white/70">
                    Create your password to finish activating your account.
                  </p>
                </div>

                {maskedEmail ? (
                  <Badge variant="outline" className="inline-flex items-center gap-2 border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/85">
                    <Mail className="size-4" strokeWidth={1.5} />
                    {maskedEmail}
                  </Badge>
                ) : null}
              </div>

              <ErrorAlert message={error} onClose={() => setError("")} />

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/90">
                    Password <span className="text-red-300">*</span>
                  </label>
                  <div className="relative w-full">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b0d15]/60 z-10">
                      <Lock className="size-5" />
                    </span>
                    <Input type={showPassword ? "text" : "password"} value={passwordValues.password}
                      onChange={(event) =>
                        handlePasswordChange("password", event.target.value)
                      }
                      autoComplete="new-password"
                      placeholder="Create your password"
                      className={`h-12 w-full rounded-xl bg-background pl-10 pr-10 text-base shadow-sm ${
                        passwordErrors.password
                          ? "border-destructive focus-visible:ring-destructive"
                          : "border-input focus-visible:ring-[#ffd700]"
                      }`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  <FieldError message={passwordErrors.password} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/90">
                    Confirm Password <span className="text-red-300">*</span>
                  </label>
                  <div className="relative w-full">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b0d15]/60 z-10">
                      <Lock className="size-5" />
                    </span>
                    <Input type={showConfirmPassword ? "text" : "password"} value={passwordValues.confirmPassword}
                      onChange={(event) =>
                        handlePasswordChange(
                          "confirmPassword",
                          event.target.value,
                        )
                      }
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      className={`h-12 w-full rounded-xl bg-background pl-10 pr-10 text-base shadow-sm ${
                        passwordErrors.confirmPassword
                          ? "border-destructive focus-visible:ring-destructive"
                          : "border-input focus-visible:ring-[#ffd700]"
                      }`}
                    />
                    <button type="button"
                      onClick={() =>
                        setShowConfirmPassword((currentValue) => !currentValue)
                      }
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  <FieldError message={passwordErrors.confirmPassword} />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={isSubmitting} className="mt-2 h-12 w-full rounded-xl bg-[#ffd700] text-sm font-bold text-[#6f0f15] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] hover:bg-[#991b1b] hover:text-white transition duration-300 disabled:cursor-not-allowed disabled:bg-[#f8d24e]/60 disabled:text-[#7b0d15]/70 disabled:shadow-none">
                    {isSubmitting ? "SAVING..." : "SAVE PASSWORD"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PasswordSavedState({ loginPath }) {
  return (
    <div className="space-y-3 text-center">
      <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="mx-auto block h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)] transition duration-300 hover:scale-105" />

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Password Saved
        </h2>
        <p className="text-sm text-muted-foreground text-white/70">
          Your account is ready. You can now sign in using your new password.
        </p>
      </div>
      <div className="pt-2">
        <Button asChild className="mt-2 h-12 w-full rounded-xl bg-[#ffd700] text-sm font-bold text-[#6f0f15] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] hover:bg-[#991b1b] hover:text-white transition duration-300">
          <Link to={loginPath}>
            Go to Login
          </Link>
        </Button>
      </div>
    </div>
  );
}