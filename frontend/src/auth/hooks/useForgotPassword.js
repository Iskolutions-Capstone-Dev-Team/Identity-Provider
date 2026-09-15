import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { passwordResetService } from "../../services/passwordResetService";
import { EMAIL_REGEX, EMPTY_OTP, EMPTY_PASSWORD_FORM, OTP_TIMER_SECONDS, getPasswordValidationState, getRequestErrorMessage, normalizeTextValue } from "../components/forgot-password/forgotPasswordUtils";

export function useForgotPassword({ isOpen, emailAddress = "" }) {
  const [step, setStep] = useState("email");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(EMPTY_OTP);
  const [otpError, setOtpError] = useState("");
  const [form, setForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] = useState("");
  const [timer, setTimer] = useState(OTP_TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [otpTimerKey, setOtpTimerKey] = useState(0);

  const passwordValidation = useMemo(
    () => getPasswordValidationState(form),
    [form],
  );
  const trimmedRecoveryEmail = normalizeTextValue(recoveryEmail);
  const normalizedEmailAddress = normalizeTextValue(emailAddress);
  const isRecoveryEmailValid = EMAIL_REGEX.test(trimmedRecoveryEmail);

  useEffect(() => {
    if (!isOpen) {
      setStep("email");
      setRecoveryEmail("");
      setEmailError("");
      setOtp(EMPTY_OTP);
      setOtpError("");
      setForm(EMPTY_PASSWORD_FORM);
      setPasswordError("");
      setTimer(OTP_TIMER_SECONDS);
      setCanResend(false);
      setOtpTimerKey(0);
      setCanResend(false);
      setOtpTimerKey(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !normalizedEmailAddress) {
      return;
    }

    setRecoveryEmail(normalizedEmailAddress);
  }, [isOpen, normalizedEmailAddress]);

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
  }, [step, otpTimerKey, timer]);

  const restartOtpTimer = () => {
    setOtpTimerKey((currentKey) => currentKey + 1);
  };

  const sendOtpMutation = useMutation({
    mutationFn: (emailToUse) => passwordResetService.sendOtp({ email: emailToUse }),
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
    }
  });

  const resendOtpMutation = useMutation({
    mutationFn: (emailToUse) => passwordResetService.sendOtp({ email: emailToUse }),
    onSuccess: (res) => {
      const seconds = res?.remaining_seconds ?? OTP_TIMER_SECONDS;
      setTimer(seconds);
      setCanResend(seconds <= 0);
      restartOtpTimer();
    },
    onError: (error) => {
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

  const handleResend = () => {
    if (!trimmedRecoveryEmail) {
      setOtpError("Email address is required.");
      setStep("email");
      return;
    }

    setOtp(EMPTY_OTP);
    setOtpError("");
    setEmailError("");
    setPasswordError("");

    resendOtpMutation.mutate(trimmedRecoveryEmail);
  };

  const verifyOtpMutation = useMutation({
    mutationFn: (codeToVerify) => passwordResetService.verifyOtp({
      email: trimmedRecoveryEmail,
      otp: codeToVerify,
    }),
    onSuccess: () => {
      setPasswordError("");
      setStep("password");
    },
    onError: (error) => {
      setOtpError(getRequestErrorMessage(error, "Unable to verify the OTP right now."));
    }
  });

  const verifyOtp = () => {
    const code = otp.join("");

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setOtpError("Enter the 6-digit OTP code.");
      return;
    }

    if (!trimmedRecoveryEmail) {
      setOtpError("Email address is required.");
      return;
    }

    setOtpError("");
    verifyOtpMutation.mutate(code);
  };

  const updatePasswordMutation = useMutation({
    mutationFn: () => passwordResetService.updateForgotPassword({
      email: trimmedRecoveryEmail,
      newPassword: form.newPassword,
    }),
    onSuccess: () => {
      setStep("success");
    },
    onError: (error) => {
      setPasswordError(getRequestErrorMessage(error, "Unable to change the password right now."));
    }
  });

  const handlePasswordContinue = () => {
    if (!passwordValidation.isValid) {
      return;
    }

    if (!trimmedRecoveryEmail) {
      setPasswordError("Email address is required.");
      return;
    }

    setPasswordError("");
    updatePasswordMutation.mutate();
  };

  return {
    step,
    setStep,
    recoveryEmail,
    setRecoveryEmail,
    emailError,
    setEmailError,
    otp,
    setOtp,
    otpError,
    setOtpError,
    form,
    setForm,
    passwordError,
    setPasswordError,
    timer,
    canResend,
    isSendingOtp: sendOtpMutation.isPending || resendOtpMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    passwordValidation,
    trimmedRecoveryEmail,
    handleEmailContinue,
    handleResend,
    verifyOtp,
    handlePasswordContinue,
  };
}
