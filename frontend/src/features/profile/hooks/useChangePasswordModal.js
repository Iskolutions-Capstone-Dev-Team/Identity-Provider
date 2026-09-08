import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { passwordResetService } from "../../../services/passwordResetService";
import { getPasswordValidationState } from "../components/ChangePasswordStep";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_OTP = ["", "", "", "", "", ""];
const OTP_TIMER_SECONDS = 3 * 60;
const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getRequestErrorMessage(error, fallbackMessage) {
  const responseMessage = normalizeTextValue(error?.response?.data?.error);
  const errorMessage = normalizeTextValue(error?.message);

  return responseMessage || errorMessage || fallbackMessage;
}

export function getInitialStep(showCurrentPassword = true) {
  return showCurrentPassword ? "password" : "email";
}

export function getStepMeta(step, showCurrentPassword = true) {
  switch (step) {
    case "email":
      return {
        title: "Forgot Password?",
        description: "Enter your email to receive a verification code",
        showCloseButton: true,
      };
    case "otp":
      return {
        title: "Verify Identity",
        description: "Enter the OTP sent to your email",
        showCloseButton: true,
      };
    case "success":
      return {
        title: "Success!",
        description: "Password changed successfully",
        showCloseButton: false,
      };
    case "password":
    default:
      return {
        title: showCurrentPassword ? "Change Password" : "Set New Password",
        description: showCurrentPassword
          ? "Secure your account with a new password"
          : "Create a new password for your account",
        showCloseButton: true,
      };
  }
}

export function useChangePasswordModal({
  isOpen,
  showCurrentPassword,
  addAuditLog,
  setToastMessage,
  enableSuccessAlert,
  emailAddress,
}) {
  const isForgotPasswordFlow = !showCurrentPassword;
  const [step, setStep] = useState(() => getInitialStep(showCurrentPassword));
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [form, setForm] = useState(EMPTY_PASSWORD_FORM);
  const [otp, setOtp] = useState(EMPTY_OTP);
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [timer, setTimer] = useState(OTP_TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [otpTimerKey, setOtpTimerKey] = useState(0);

  const passwordValidation = useMemo(
    () => getPasswordValidationState(form),
    [form],
  );
  const trimmedRecoveryEmail = normalizeTextValue(recoveryEmail);
  const normalizedEmailAddress = normalizeTextValue(emailAddress);
  const otpTargetEmail = trimmedRecoveryEmail || normalizedEmailAddress;
  const isRecoveryEmailValid = EMAIL_REGEX.test(trimmedRecoveryEmail);
  const isCurrentPasswordMissing =
    showCurrentPassword && !normalizeTextValue(form.currentPassword);

  useEffect(() => {
    if (step !== "otp") {
      return;
    }

    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((currentTimer) => {
        if (currentTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }

        return currentTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, otpTimerKey]);

  useEffect(() => {
    if (!isOpen) {
      setStep(getInitialStep(showCurrentPassword));
      setRecoveryEmail("");
      setEmailError("");
      setForm(EMPTY_PASSWORD_FORM);
      setOtp(EMPTY_OTP);
      setOtpError("");
      setPasswordError("");
      setSuccessMessage("");
      setOtpTimerKey(0);
      setIsSendingOtp(false);
      setIsVerifyingOtp(false);
      setIsUpdatingPassword(false);
    }
  }, [isOpen, showCurrentPassword]);

  useEffect(() => {
    if (step !== "success") {
      return;
    }

    const message = "Password changed successfully!";
    
    toast.success(message);

    if (setToastMessage) {
      setToastMessage(message);

      const hide = setTimeout(() => {
        setToastMessage("");
      }, 2500);

      return () => clearTimeout(hide);
    }

    if (enableSuccessAlert) {
      setSuccessMessage(message);

      const timeout = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [step, setToastMessage, enableSuccessAlert]);

  useEffect(() => {
    if (!isOpen || !isForgotPasswordFlow || !normalizedEmailAddress) {
      return;
    }

    setRecoveryEmail(normalizedEmailAddress);
  }, [isOpen, isForgotPasswordFlow, normalizedEmailAddress]);

  const logPasswordChange = () => {
    if (!addAuditLog) {
      return;
    }

    addAuditLog({
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      action: "PASSWORD_CHANGE",
      details: isForgotPasswordFlow
        ? "Password reset successfully"
        : "Password changed successfully",
      color: "yellow",
    });
  };

  const restartOtpTimer = () => {
    setOtpTimerKey((currentKey) => currentKey + 1);
  };

  const sendOtpMutation = useMutation({
    mutationFn: (email) => passwordResetService.sendOtp({ email }),
    onSuccess: (res) => {
      const seconds = res?.remaining_seconds ?? OTP_TIMER_SECONDS;
      setTimer(seconds);
      setCanResend(seconds <= 0);
      setOtp(EMPTY_OTP);
      setStep("otp");
      restartOtpTimer();
    },
    onError: (error) => {
      setEmailError(getRequestErrorMessage(error, "Unable to send the OTP right now."));
      setPasswordError(getRequestErrorMessage(error, "Unable to send the OTP right now."));
      setOtpError(getRequestErrorMessage(error, "Unable to resend the OTP right now."));
    }
  });

  const handleEmailContinue = () => {
    if (!trimmedRecoveryEmail) {
      setEmailError("Email address is required.");
      return;
    }

    if (!isRecoveryEmailValid) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError("");
    setOtpError("");
    setPasswordError("");

    sendOtpMutation.mutate(trimmedRecoveryEmail);
  };

  const updateForgotPasswordMutation = useMutation({
    mutationFn: (data) => passwordResetService.updateForgotPassword(data),
    onSuccess: () => {
      logPasswordChange();
      setStep("success");
    },
    onError: (error) => {
      setPasswordError(getRequestErrorMessage(error, "Unable to change the password right now."));
    }
  });

  const handlePasswordContinue = async () => {
    if (!passwordValidation.isValid) {
      return;
    }

    if (isCurrentPasswordMissing) {
      setPasswordError("Current password is required.");
      return;
    }

    if (isForgotPasswordFlow) {
      if (!trimmedRecoveryEmail) {
        setPasswordError(
          "Email address is required.",
        );
        return;
      }

      setPasswordError("");
      updateForgotPasswordMutation.mutate({
        email: trimmedRecoveryEmail,
        newPassword: form.newPassword,
      });
      return;
    }

    if (!otpTargetEmail) {
      setPasswordError("Email address is required.");
      return;
    }

    setPasswordError("");
    setOtpError("");
    sendOtpMutation.mutate(otpTargetEmail);
  };

  const handleRecoveryEmailChange = (value) => {
    setRecoveryEmail(value);

    if (emailError) {
      setEmailError("");
    }
  };

  const handleOtpChange = (updatedOtp) => {
    setOtp(updatedOtp);

    if (otpError) {
      setOtpError("");
    }
  };

  const handleResend = async () => {
    if (!otpTargetEmail) {
      setOtpError("Email address is required.");

      if (isForgotPasswordFlow) {
        setStep("email");
      } else {
        setStep("password");
      }

      return;
    }

    setOtp(EMPTY_OTP);
    setOtpError("");
    setEmailError("");
    setPasswordError("");
    sendOtpMutation.mutate(otpTargetEmail);
  };

  const changePasswordMutation = useMutation({
    mutationFn: (data) => passwordResetService.changePassword(data),
    onSuccess: () => {
      logPasswordChange();
      setStep("success");
    },
    onError: (error) => {
      setOtp(EMPTY_OTP);
      setPasswordError(getRequestErrorMessage(error, "Unable to change the password right now."));
      setStep("password");
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data) => passwordResetService.verifyOtp(data),
    onSuccess: () => {
      if (isForgotPasswordFlow) {
        setPasswordError("");
        setStep("password");
        return;
      }
      changePasswordMutation.mutate({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
    },
    onError: (error) => {
      setOtpError(getRequestErrorMessage(error, "Unable to verify the OTP right now."));
    }
  });

  const verifyOTP = () => {
    const code = otp.join("");

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setOtpError("Enter the 6-digit OTP code.");
      return;
    }

    if (!otpTargetEmail) {
      setOtpError("Email address is required.");
      return;
    }

    setOtpError("");
    verifyOtpMutation.mutate({
      email: otpTargetEmail,
      otp: code,
    });
  };

  return {
    step,
    recoveryEmail,
    emailError,
    setEmailError,
    form,
    setForm,
    otp,
    setOtp,
    otpError,
    setOtpError,
    passwordError,
    setPasswordError,
    timer,
    canResend,
    successMessage,
    isSendingOtp: sendOtpMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
    isUpdatingPassword: updateForgotPasswordMutation?.isPending || changePasswordMutation?.isPending,
    passwordValidation,
    isForgotPasswordFlow,
    isCurrentPasswordMissing,
    otpTargetEmail,
    handleEmailContinue,
    handlePasswordContinue,
    handleRecoveryEmailChange,
    handleOtpChange,
    handleResend,
    verifyOTP,
  };
}
