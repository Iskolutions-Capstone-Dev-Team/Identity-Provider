import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import InputEmailStep from "./InputEmailStep";
import ChangePasswordStep, {
  getPasswordValidationState,
} from "./ChangePasswordStep";
import OtpVerificationStep from "./OtpVerificationStep";
import SuccessStep from "./SuccessStep";
import SuccessAlert from "./SuccessAlert";
import { getModalTheme } from "./modalTheme";
import { passwordResetService } from "../services/passwordResetService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_OTP = ["", "", "", "", "", ""];
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

function getInitialStep(showCurrentPassword = true) {
  return showCurrentPassword ? "password" : "email";
}

function getStepMeta(step, showCurrentPassword = true) {
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

function getDisabledPrimaryButtonClassName(isDarkMode) {
  return isDarkMode
    ? "cursor-not-allowed border-white/10 bg-white/[0.08] text-white/45 hover:border-white/10 hover:bg-white/[0.08]"
    : "cursor-not-allowed border-[#7b0d15]/12 bg-[#cdb7bb] text-white/70 hover:border-[#7b0d15]/12 hover:bg-[#cdb7bb]";
}

export default function ChangePasswordModal({ isOpen, onClose, showCurrentPassword = true, addAuditLog, setToastMessage, enableSuccessAlert = false, colorMode = "light", emailAddress = "" }) {
  const isForgotPasswordFlow = !showCurrentPassword;
  const [step, setStep] = useState(() => getInitialStep(showCurrentPassword));
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [form, setForm] = useState(EMPTY_PASSWORD_FORM);
  const [otp, setOtp] = useState(EMPTY_OTP);
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
    if (step !== "otp") {
      return;
    }

    setTimer(60);
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
      setEmailError(
        getRequestErrorMessage(error, "Unable to send the OTP right now."),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handlePasswordContinue = async () => {
    if (!passwordValidation.isValid) {
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
      setIsUpdatingPassword(true);

      try {
        await passwordResetService.updatePassword({
          email: trimmedRecoveryEmail,
          newPassword: form.newPassword,
        });
        logPasswordChange();
        setStep("success");
      } catch (error) {
        setPasswordError(
          getRequestErrorMessage(
            error,
            "Unable to change the password right now.",
          ),
        );
      } finally {
        setIsUpdatingPassword(false);
      }

      return;
    }

    setPasswordError("");
    setOtpError("");
    setStep("otp");
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
    if (!isForgotPasswordFlow) {
      setOtp(EMPTY_OTP);
      setOtpError("");
      setEmailError("");
      setPasswordError("");
      setStep(getInitialStep(showCurrentPassword));
      return;
    }

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
      setOtpError(
        getRequestErrorMessage(error, "Unable to resend the OTP right now."),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOTP = async () => {
    const code = otp.join("");

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setOtpError("Enter the 6-digit OTP code.");
      return;
    }

    setOtpError("");

    if (isForgotPasswordFlow) {
      setIsVerifyingOtp(true);

      try {
        await passwordResetService.verifyOtp({
          email: trimmedRecoveryEmail,
          otp: code,
        });
        setPasswordError("");
        setStep("password");
      } catch (error) {
        setOtpError(
          getRequestErrorMessage(error, "Unable to verify the OTP right now."),
        );
      } finally {
        setIsVerifyingOtp(false);
      }

      return;
    }

    logPasswordChange();
    setStep("success");
  };

  if (!isOpen) {
    return null;
  }

  const currentStepMeta = getStepMeta(step, showCurrentPassword);
  const otpEmailAddress =
    trimmedRecoveryEmail || normalizedEmailAddress || "your email address";
  const {
    modalBodyClassName,
    modalBodyStackClassName,
    modalBoxClassName,
    modalCloseButtonClassName,
    modalFooterActionsClassName,
    modalFooterClassName,
    modalHeaderClassName,
    modalHeaderDescriptionClassName,
    modalHeaderTitleClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalSecondaryButtonClassName,
  } = getModalTheme(colorMode);
  const isDarkMode = colorMode === "dark";
  const passwordModalBoxClassName = `${modalBoxClassName} !max-w-2xl`;
  const requiredFieldsClassName = isDarkMode
    ? "text-sm text-[#c7adb4]"
    : "text-sm text-[#8f6f76]";
  const getPrimaryButtonClassName = (isDisabled = false) =>
    `${modalPrimaryButtonClassName} ${
      isDisabled ? getDisabledPrimaryButtonClassName(isDarkMode) : ""
    }`;
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
      : isForgotPasswordFlow
        ? isUpdatingPassword
          ? "Changing Password..."
          : "Change Password"
        : "Continue";
  const otpButtonLabel = isForgotPasswordFlow
    ? isVerifyingOtp
      ? "Verifying OTP..."
      : "Verify OTP"
    : "Verify & Change Password";

  return (
    <>
      {createPortal(
        <dialog open className={modalOverlayClassName}>
          <div className={passwordModalBoxClassName}>
            <div className={modalHeaderClassName}>
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <h3 className={modalHeaderTitleClassName}>
                    {currentStepMeta.title}
                  </h3>
                  <p className={modalHeaderDescriptionClassName}>
                    {currentStepMeta.description}
                  </p>
                </div>

                {currentStepMeta.showCloseButton && (
                  <button type="button" className={modalCloseButtonClassName} onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className={modalBodyClassName}>
              <div className={modalBodyStackClassName}>
                {step === "email" && (
                  <InputEmailStep
                    email={recoveryEmail}
                    setEmail={handleRecoveryEmailChange}
                    errorMessage={emailError}
                    onClearError={() => setEmailError("")}
                    colorMode={colorMode}
                  />
                )}

                {step === "password" && (
                  <ChangePasswordStep
                    form={form}
                    setForm={setForm}
                    showCurrentPassword={showCurrentPassword}
                    colorMode={colorMode}
                    errorMessage={passwordError}
                    onClearError={() => setPasswordError("")}
                  />
                )}

                {step === "otp" && (
                  <OtpVerificationStep
                    otp={otp}
                    setOtp={handleOtpChange}
                    timer={timer}
                    canResend={canResend}
                    onResend={handleResend}
                    onVerify={verifyOTP}
                    errorMessage={otpError}
                    onClearError={() => setOtpError("")}
                    emailAddress={otpEmailAddress}
                    colorMode={colorMode}
                  />
                )}

                {step === "success" && (
                  <SuccessStep
                    colorMode={colorMode}
                    showCurrentPassword={showCurrentPassword}
                  />
                )}
              </div>
            </div>

            <div className={modalFooterClassName}>
              {isFormStep ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className={requiredFieldsClassName}>
                    <span className="text-red-500">*</span> Required fields
                  </div>
                  <div className={modalFooterActionsClassName}>
                    <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isPrimaryDisabled}
                      className={getPrimaryButtonClassName(isPrimaryDisabled)}
                      onClick={
                        step === "email"
                          ? handleEmailContinue
                          : handlePasswordContinue
                      }
                    >
                      {primaryButtonLabel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={modalFooterActionsClassName}>
                  {step === "otp" && (
                    <button type="button" disabled={isPrimaryDisabled} className={getPrimaryButtonClassName(isPrimaryDisabled)} onClick={verifyOTP}>
                      {otpButtonLabel}
                    </button>
                  )}

                  {step === "success" && (
                    <button type="button" className={modalPrimaryButtonClassName} onClick={onClose}>
                      Close
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </dialog>,
        document.body,
      )}

      {enableSuccessAlert && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </>
  );
}