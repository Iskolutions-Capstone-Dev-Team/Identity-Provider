import { useRegisterForm } from "../hooks/useRegisterForm";
import ErrorAlert from "../../components/ErrorAlert";
import { buildLoginPath } from "../utils/loginRoute";
import RegisterDetailsStep from "./register/RegisterDetailsStep";
import RegisterPasswordStep from "./register/RegisterPasswordStep";
import RegisterStepHeader from "./register/RegisterStepHeader";
import RegisterSuccessStep from "./register/RegisterSuccessStep";
import RegisterVerificationStep from "./register/RegisterVerificationStep";
import { Card, CardContent } from "../../components/ui/card";

export default function RegisterForm({ clientId }) {
  const {
    verificationInputsRef,
    roleDropdownRef,
    step,
    details,
    detailErrors,
    passwordValues,
    passwordErrors,
    verificationCode,
    verificationError,
    resendTimer,
    isRoleMenuOpen,
    setIsRoleMenuOpen,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isSendingOtp,
    isSubmittingRegistration,
    isVerifyingCode,
    isResendingCode,
    error,
    setError,
    handleDetailChange,
    handleRoleSelect,
    handleDetailsSubmit,
    handleVerificationChange,
    handleVerificationKeyDown,
    handleVerificationPaste,
    handleVerificationSubmit,
    handleResendCode,
    handlePasswordChange,
    handlePasswordBlur,
    handlePasswordSubmit,
  } = useRegisterForm();

  const loginPath = buildLoginPath(clientId);

  return (
    <div className="relative z-20 w-full max-w-[38rem] px-1 sm:px-0">
      <Card className="rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_32px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm">
        <CardContent className="rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-6 py-6 sm:px-9 lg:px-10">
          <div className="space-y-5">
            <RegisterStepHeader step={step} email={details.email} />

            <ErrorAlert message={error} onClose={() => setError("")} />

            {step === "details" ? (
              <RegisterDetailsStep
                details={details}
                errors={detailErrors}
                isRoleMenuOpen={isRoleMenuOpen}
                isSubmitting={isSendingOtp}
                loginPath={loginPath}
                roleDropdownRef={roleDropdownRef}
                onChange={handleDetailChange}
                onRoleMenuToggle={() =>
                  setIsRoleMenuOpen((currentValue) => !currentValue)
                }
                onRoleSelect={handleRoleSelect}
                onSubmit={handleDetailsSubmit}
              />
            ) : null}

            {step === "verifyEmail" ? (
              <RegisterVerificationStep
                code={verificationCode}
                error={verificationError}
                inputsRef={verificationInputsRef}
                isResending={isResendingCode}
                isVerifying={isVerifyingCode}
                resendTimer={resendTimer}
                onChange={handleVerificationChange}
                onKeyDown={handleVerificationKeyDown}
                onPaste={handleVerificationPaste}
                onResend={handleResendCode}
                onSubmit={handleVerificationSubmit}
              />
            ) : null}

            {step === "setPassword" ? (
              <RegisterPasswordStep
                errors={passwordErrors}
                isSubmitting={isSubmittingRegistration}
                showConfirmPassword={showConfirmPassword}
                showPassword={showPassword}
                values={passwordValues}
                onBlur={handlePasswordBlur}
                onChange={handlePasswordChange}
                onSubmit={handlePasswordSubmit}
                onToggleConfirmPassword={() =>
                  setShowConfirmPassword((currentValue) => !currentValue)
                }
                onTogglePassword={() =>
                  setShowPassword((currentValue) => !currentValue)
                }
              />
            ) : null}

            {step === "success" ? (
              <RegisterSuccessStep loginPath={loginPath} />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}