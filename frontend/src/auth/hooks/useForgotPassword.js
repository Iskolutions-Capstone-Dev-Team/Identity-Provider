import { useEffect, useMemo, useState } from "react";
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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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
      setIsSendingOtp(false);
      setIsVerifyingOtp(false);
      setIsUpdatingPassword(false);
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

  const handleEmailContinue = async () => {
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
    setIsSendingOtp(true);

    try {
      const res = await passwordResetService.sendOtp({ email: trimmedRecoveryEmail });
      const seconds = res?.remaining_seconds ?? OTP_TIMER_SECONDS;
      setTimer(seconds);
      setCanResend(seconds <= 0);
      setOtp(EMPTY_OTP);
      setStep("otp");
      restartOtpTimer();
    } catch (error) {
      setEmailError(getRequestErrorMessage(error, "Unable to send the OTP right now."));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResend = async () => {
    if (!trimmedRecoveryEmail) {
      setOtpError("Email address is required.");
      setStep("email");
      return;
    }

    setOtp(EMPTY_OTP);
    setOtpError("");
    setEmailError("");
    setPasswordError("");
    setIsSendingOtp(true);

    try {
      const res = await passwordResetService.sendOtp({ email: trimmedRecoveryEmail });
      const seconds = res?.remaining_seconds ?? OTP_TIMER_SECONDS;
      setTimer(seconds);
      setCanResend(seconds <= 0);
      restartOtpTimer();
    } catch (error) {
      setOtpError(getRequestErrorMessage(error, "Unable to resend the OTP right now."));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
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
    setIsVerifyingOtp(true);

    try {
      await passwordResetService.verifyOtp({
        email: trimmedRecoveryEmail,
        otp: code,
      });
      setPasswordError("");
      setStep("password");
    } catch (error) {
      setOtpError(getRequestErrorMessage(error, "Unable to verify the OTP right now."));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handlePasswordContinue = async () => {
    if (!passwordValidation.isValid) {
      return;
    }

    if (!trimmedRecoveryEmail) {
      setPasswordError("Email address is required.");
      return;
    }

    setPasswordError("");
    setIsUpdatingPassword(true);

    try {
      await passwordResetService.updateForgotPassword({
        email: trimmedRecoveryEmail,
        newPassword: form.newPassword,
      });
      setStep("success");
    } catch (error) {
      setPasswordError(getRequestErrorMessage(error, "Unable to change the password right now."));
    } finally {
      setIsUpdatingPassword(false);
    }
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
    isSendingOtp,
    isVerifyingOtp,
    isUpdatingPassword,
    passwordValidation,
    trimmedRecoveryEmail,
    handleEmailContinue,
    handleResend,
    verifyOtp,
    handlePasswordContinue,
  };
}
