import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import InputEmailStep from "./InputEmailStep";
import ChangePasswordStep, { getPasswordValidationState } from "./ChangePasswordStep";
import OtpVerificationStep from "./OtpVerificationStep";
import SuccessStep from "./SuccessStep";
import { passwordResetService } from "../../../services/passwordResetService";
import { PasswordLockIcon, CloseIcon } from "./profileIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

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
  const [timer, setTimer] = useState(OTP_TIMER_SECONDS);
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
  const otpTargetEmail = trimmedRecoveryEmail || normalizedEmailAddress;
  const isRecoveryEmailValid = EMAIL_REGEX.test(trimmedRecoveryEmail);
  const isCurrentPasswordMissing =
    showCurrentPassword && !normalizeTextValue(form.currentPassword);

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
      setIsUpdatingPassword(true);

      try {
        await passwordResetService.updateForgotPassword({
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

    if (!otpTargetEmail) {
      setPasswordError("Email address is required.");
      return;
    }

    setPasswordError("");
    setOtpError("");
    setIsSendingOtp(true);

    try {
      await passwordResetService.sendOtp({ email: otpTargetEmail });
      setOtp(EMPTY_OTP);
      setStep("otp");
      restartOtpTimer();
    } catch (error) {
      setPasswordError(
        getRequestErrorMessage(error, "Unable to send the OTP right now."),
      );
    } finally {
      setIsSendingOtp(false);
    }
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
    setIsSendingOtp(true);

    try {
      await passwordResetService.sendOtp({ email: otpTargetEmail });
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

    if (!otpTargetEmail) {
      setOtpError("Email address is required.");
      return;
    }

    setOtpError("");
    setIsVerifyingOtp(true);

    try {
      await passwordResetService.verifyOtp({
        email: otpTargetEmail,
        otp: code,
      });

      if (isForgotPasswordFlow) {
        setPasswordError("");
        setStep("password");
        return;
      }

      try {
        await passwordResetService.changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
        logPasswordChange();
        setStep("success");
      } catch (error) {
        setOtp(EMPTY_OTP);
        setPasswordError(
          getRequestErrorMessage(
            error,
            "Unable to change the password right now.",
          ),
        );
        setStep("password");
      }
    } catch (error) {
      setOtpError(
        getRequestErrorMessage(error, "Unable to verify the OTP right now."),
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const currentStepMeta = getStepMeta(step, showCurrentPassword);
  const otpEmailAddress = otpTargetEmail || "your email address";
  
  const isDarkMode = colorMode === "dark";
  const requiredFieldsClassName = isDarkMode
    ? "text-sm text-[#c7adb4]"
    : "text-sm text-[#8f6f76]";
    
  const isFormStep = step === "email" || step === "password";
  const isPrimaryDisabled =
    step === "email"
      ? isSendingOtp
      : step === "password"
        ? !passwordValidation.isValid ||
          isCurrentPasswordMissing ||
          isSendingOtp ||
          isUpdatingPassword
        : isVerifyingOtp;
  const primaryButtonLabel =
    step === "email"
      ? isSendingOtp
        ? "Sending OTP..."
        : "Continue"
      : step === "password"
        ? isForgotPasswordFlow
          ? isUpdatingPassword
            ? "Changing Password..."
            : "Change Password"
          : isSendingOtp
            ? "Sending OTP..."
            : "Continue"
        : "Continue";
  const otpButtonLabel = isForgotPasswordFlow
    ? isVerifyingOtp
      ? "Verifying OTP..."
      : "Verify OTP"
    : "Verify & Change Password";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
        <DialogContent className="sm:max-w-2xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
          <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b p-4 bg-[#7b0d15] text-white dark:bg-transparent dark:text-foreground">
            <DialogTitle>{currentStepMeta.title}</DialogTitle>
          </DialogHeader>

          <div className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4">
            <div className="space-y-6 mt-4 pb-6 px-2">
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

          <DialogFooter className="gap-2 sm:justify-end">
            {isFormStep ? (
              <div className="flex w-full justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" disabled={isPrimaryDisabled} className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold transition-colors duration-200"
                  onClick={
                    step === "email"
                      ? handleEmailContinue
                      : handlePasswordContinue
                  }
                >
                  {primaryButtonLabel}
                </Button>
              </div>
            ) : (
              <div className="flex w-full justify-end gap-2">
                {step === "otp" && (
                  <Button type="button" disabled={isPrimaryDisabled} className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold transition-colors duration-200" onClick={verifyOTP}>
                    {otpButtonLabel}
                  </Button>
                )}

                {step === "success" && (
                  <Button type="button" className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold transition-colors duration-200" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}