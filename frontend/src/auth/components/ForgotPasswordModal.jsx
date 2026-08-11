import { useEffect, useMemo, useState } from "react";
import { passwordResetService } from "../../services/passwordResetService";
import ForgotPasswordEmailStep from "./forgot-password/ForgotPasswordEmailStep";
import ForgotPasswordOtpStep from "./forgot-password/ForgotPasswordOtpStep";
import ForgotPasswordPasswordStep from "./forgot-password/ForgotPasswordPasswordStep";
import ForgotPasswordSuccessStep from "./forgot-password/ForgotPasswordSuccessStep";
import { EMAIL_REGEX, EMPTY_OTP, EMPTY_PASSWORD_FORM, OTP_TIMER_SECONDS, getPasswordValidationState, getRequestErrorMessage, normalizeTextValue } from "./forgot-password/forgotPasswordUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

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

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()} dismissible={false}>
      <DialogContent className="sm:max-w-2xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle>{getStepTitle(step)}</DialogTitle>
        </DialogHeader>

        <div className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4">
          <div className="space-y-6 mt-4 pb-6 px-2">
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

          {step === "success" ? (
            <ForgotPasswordSuccessStep />
          ) : null}

          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          {isFormStep ? (
            <div className="flex w-full items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" disabled={isPrimaryDisabled} className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold transition-colors duration-200" onClick={step === "email" ? handleEmailContinue : handlePasswordContinue}>
                {primaryButtonLabel}
              </Button>
            </div>
          ) : (
            <div className="flex w-full justify-end gap-2">
              {step === "otp" && (
                <Button type="button" disabled={isPrimaryDisabled} className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold transition-colors duration-200" onClick={verifyOtp}>
                  {primaryButtonLabel}
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
  );
}
