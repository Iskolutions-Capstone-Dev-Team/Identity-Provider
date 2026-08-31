import { useState } from "react";
import { isInvitationForbiddenError, registrationActivationService } from "../services/registrationActivationService";

const initialPasswordValues = {
  password: "",
  confirmPassword: "",
};

const initialPasswordErrors = {
  password: "",
  confirmPassword: "",
};

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

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

export function maskEmail(email) {
  if (!email) return "";

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

export function useRegisterPasswordSetupForm({ invitationCode = "", onInvalidInvitation }) {
  const [passwordValues, setPasswordValues] = useState(initialPasswordValues);
  const [passwordErrors, setPasswordErrors] = useState(initialPasswordErrors);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return {
    passwordValues,
    passwordErrors,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    setError,
    isComplete,
    isSubmitting,
    handlePasswordChange,
    handlePasswordBlur,
    handleSubmit,
  };
}
