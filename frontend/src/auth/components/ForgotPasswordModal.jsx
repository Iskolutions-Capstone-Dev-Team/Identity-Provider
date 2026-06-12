import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { getModalTransitionClassName, useModalTransition } from "../../components/modalTransition";
import { passwordResetService } from "../../services/passwordResetService";
import ForgotPasswordEmailStep from "./forgot-password/ForgotPasswordEmailStep";
import { CloseButton, LockIcon } from "./forgot-password/ForgotPasswordIcons";
import ForgotPasswordOtpStep from "./forgot-password/ForgotPasswordOtpStep";
import ForgotPasswordPasswordStep from "./forgot-password/ForgotPasswordPasswordStep";
import ForgotPasswordSuccessStep from "./forgot-password/ForgotPasswordSuccessStep";
import { EMAIL_REGEX, EMPTY_OTP, EMPTY_PASSWORD_FORM, OTP_TIMER_SECONDS, getPasswordValidationState, getRequestErrorMessage, normalizeTextValue } from "./forgot-password/forgotPasswordUtils";

function getStepTitle(step) {
  switch (step) {
    case "otp":
      return "Verify Identity";
    case "password":
      return "Set New Password";
    case "success":
      return "Success!";
    case "email":
    default:
      return "Forgot Password?";
  }
}

function getStepDescription(step) {
  switch (step) {
    case "otp":
      return "Confirm the code sent to your email.";
    case "password":
      return "Create a new password.";
    case "success":
      return "Your account access is ready.";
    case "email":
    default:
      return "Reset access to your PUPT account.";
  }
}

export default function ForgotPasswordModal({ isOpen, onClose, emailAddress = "" }) {
  const { shouldRender, isClosing } = useModalTransition(isOpen);
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
    if (!shouldRender) {
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
  }, [shouldRender]);

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

    setTimer(OTP_TIMER_SECONDS);
    setCanResend(false);

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
      await passwordResetService.sendOtp({ email: trimmedRecoveryEmail });
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
      await passwordResetService.sendOtp({ email: trimmedRecoveryEmail });
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

  if (!shouldRender) {
    return null;
  }

  const isFormStep = step === "email" || step === "password";
  const isPrimaryDisabled =
    step === "email"
      ? isSendingOtp
      : step === "password"
        ? !passwordValidation.isValid || isUpdatingPassword
        : isVerifyingOtp;
  const primaryButtonLabel =
    step === "email"
      ? isSendingOtp
        ? "Sending OTP..."
        : "Continue"
      : step === "password"
        ? isUpdatingPassword
          ? "Changing Password..."
          : "Change Password"
        : isVerifyingOtp
          ? "Verifying OTP..."
          : "Verify OTP";
  const primaryButtonClassName = `btn h-12 rounded-xl border px-6 text-sm font-bold shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 ${
    isPrimaryDisabled
      ? "cursor-not-allowed border-[#7b0d15]/12 bg-[#cdb7bb] text-white/70 hover:border-[#7b0d15]/12 hover:bg-[#cdb7bb]"
      : "border-[#ffd700] bg-[#ffd700] text-[#6f0f15] hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white"
  }`;

  return createPortal(
    <dialog open className={getModalTransitionClassName("modal modal-open fixed inset-0 z-[120] px-3 py-6 backdrop:bg-[rgba(43,3,7,0.74)] backdrop:backdrop-blur-sm", isClosing)}>
      <div className="modal-box relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-white p-0 font-[Poppins] text-slate-800 shadow-[0_36px_90px_-40px_rgba(0,0,0,0.95)] backdrop-blur-md">
        <div className="relative shrink-0 border-b border-white/10 bg-[linear-gradient(180deg,rgba(122,13,21,0.95),rgba(55,6,11,0.96))] px-6 py-6 sm:px-8">
          <div className="flex items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <LockIcon className="h-10 w-10 shrink-0 text-[#fff0a8]" />
              <div className="min-w-0">
                <h3 className="text-2xl font-bold leading-tight text-white sm:text-[2rem]">
                  {getStepTitle(step)}
                </h3>
                <p className="mt-1 text-sm text-white/65">
                  {getStepDescription(step)}
                </p>
              </div>
            </div>

            {step !== "success" ? <CloseButton onClose={onClose} /> : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white px-6 py-6 sm:px-8">
          {step === "email" ? (
            <ForgotPasswordEmailStep
              email={recoveryEmail}
              setEmail={(value) => {
                setRecoveryEmail(value);
                if (emailError) {
                  setEmailError("");
                }
              }}
              errorMessage={emailError}
              onClearError={() => setEmailError("")}
            />
          ) : null}

          {step === "otp" ? (
            <ForgotPasswordOtpStep
              otp={otp}
              setOtp={(updatedOtp) => {
                setOtp(updatedOtp);
                if (otpError) {
                  setOtpError("");
                }
              }}
              timer={timer}
              canResend={canResend}
              onResend={handleResend}
              errorMessage={otpError}
              onClearError={() => setOtpError("")}
              emailAddress={trimmedRecoveryEmail || "your email address"}
            />
          ) : null}

          {step === "password" ? (
            <ForgotPasswordPasswordStep
              form={form}
              setForm={setForm}
              validation={passwordValidation}
              errorMessage={passwordError}
              onClearError={() => setPasswordError("")}
            />
          ) : null}

          {step === "success" ? <ForgotPasswordSuccessStep /> : null}
        </div>

        <div className="shrink-0 border-t border-[#7b0d15]/10 bg-white px-6 py-5 sm:px-8">
          {isFormStep ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[#8f6f76]">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" className="btn h-12 rounded-xl border border-[#7b0d15]/15 bg-white px-6 text-[#7b0d15] shadow-none transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" disabled={isPrimaryDisabled} className={primaryButtonClassName} onClick={step === "email" ? handleEmailContinue : handlePasswordContinue}>
                  {primaryButtonLabel}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              {step === "otp" ? (
                <button type="button" disabled={isPrimaryDisabled} className={primaryButtonClassName} onClick={verifyOtp}>
                  {primaryButtonLabel}
                </button>
              ) : (
                <button type="button" className={primaryButtonClassName} onClick={onClose}>
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
