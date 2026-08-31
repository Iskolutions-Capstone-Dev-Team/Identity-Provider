import InputEmailStep from "./InputEmailStep";
import ChangePasswordStep from "./ChangePasswordStep";
import OtpVerificationStep from "./OtpVerificationStep";
import SuccessStep from "./SuccessStep";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { useChangePasswordModal, getStepMeta } from "../hooks/useChangePasswordModal";

export default function ChangePasswordModal({ isOpen, onClose, showCurrentPassword = true, addAuditLog, setToastMessage, enableSuccessAlert = false, colorMode = "light", emailAddress = "" }) {
  const modalState = useChangePasswordModal({
    isOpen,
    showCurrentPassword,
    addAuditLog,
    setToastMessage,
    enableSuccessAlert,
    emailAddress,
  });

  const {
    step,
    recoveryEmail,
    emailError,
    setEmailError,
    form,
    setForm,
    otp,
    otpError,
    setOtpError,
    passwordError,
    setPasswordError,
    timer,
    canResend,
    isSendingOtp,
    isVerifyingOtp,
    isUpdatingPassword,
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
  } = modalState;

  const currentStepMeta = getStepMeta(step, showCurrentPassword);
  const otpEmailAddress = otpTargetEmail || "your email address";

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
      <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()} dismissible={false}>
        <DialogContent className="sm:max-w-2xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
          <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
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