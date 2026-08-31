import { useForgotPassword } from "../hooks/useForgotPassword";
import ForgotPasswordEmailStep from "./forgot-password/ForgotPasswordEmailStep";
import ForgotPasswordOtpStep from "./forgot-password/ForgotPasswordOtpStep";
import ForgotPasswordPasswordStep from "./forgot-password/ForgotPasswordPasswordStep";
import ForgotPasswordSuccessStep from "./forgot-password/ForgotPasswordSuccessStep";
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
  const {
    step,
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
  } = useForgotPassword({ isOpen, emailAddress });

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
  const primaryButtonClassName = `btn h-12 rounded-xl border px-6 text-sm font-bold shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 ${isPrimaryDisabled
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
