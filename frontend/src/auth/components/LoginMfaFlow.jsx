import { useLoginMfaFlow } from "../hooks/useLoginMfaFlow";
import ErrorAlert from "../../components/ErrorAlert";
import InfoAlert from "../../components/InfoAlert";
import MfaAuthenticatorCodeStep from "./mfa/MfaAuthenticatorCodeStep";
import MfaBackupCodeStep from "./mfa/MfaBackupCodeStep";
import MfaLoadingStep from "./mfa/MfaLoadingStep";
import MfaSetupConfirmStep from "./mfa/MfaSetupConfirmStep";
import MfaSetupQrStep from "./mfa/MfaSetupQrStep";
import MfaVerifyStep from "./mfa/MfaVerifyStep";
import { getDigits } from "./mfa/mfaInputUtils";
import { Card, CardContent } from "../../components/ui/card";

export default function LoginMfaFlow({ callbackRedirectUrl = "", initialEmail = "", isReturningToLogin = false, onBackToLogin }) {
  const {
    MFA_STEPS,
    step,
    setStep,
    email,
    code,
    setCode,
    backupCode,
    setBackupCode,
    mode,
    error,
    setError,
    info,
    setInfo,
    isLoading,
    hasSentOtp,
    isSendingOtp,
    isVerifying,
    isCheckingAuthenticators,
    isCheckingPasskey,
    qrCodeUrl,
    name,
    setName,
    backupCodes,
    isSaving,
    finishMfa,
    handleSendOtp,
    handleSelectEmail,
    handleSelectAuthenticator,
    handleSelectPasskey,
    handleVerifyEmailOtp,
    handleVerifyAuthenticator,
    handleVerifyBackupCode,
    handleOpenSetupConfirm,
    handleBackToSetupQr,
    handleSaveAuthenticator,
  } = useLoginMfaFlow({ callbackRedirectUrl, initialEmail, onBackToLogin });

  const renderStep = () => {
    if (isLoading) {
      return <MfaLoadingStep />;
    }

    if (step === MFA_STEPS.AUTHENTICATOR) {
      return (
        <MfaAuthenticatorCodeStep
          code={code}
          isVerifying={isVerifying}
          onCodeChange={(value) => setCode(getDigits(value))}
          onVerify={handleVerifyAuthenticator}
          onUseBackupCode={() => {
            setBackupCode("");
            setError("");
            setStep(MFA_STEPS.BACKUP_CODE);
          }}
        />
      );
    }

    if (step === MFA_STEPS.BACKUP_CODE) {
      return (
        <MfaBackupCodeStep
          backupCode={backupCode}
          isVerifying={isVerifying}
          onBackupCodeChange={setBackupCode}
          onVerify={handleVerifyBackupCode}
        />
      );
    }

    if (step === MFA_STEPS.SETUP) {
      return (
        <MfaSetupQrStep
          qrCodeUrl={qrCodeUrl}
          isLoading={!qrCodeUrl && !error}
          onNext={handleOpenSetupConfirm}
        />
      );
    }

    if (step === MFA_STEPS.SETUP_CONFIRM) {
      return (
        <MfaSetupConfirmStep
          code={code}
          name={name}
          backupCodes={backupCodes}
          isSaving={isSaving}
          onCodeChange={(value) => setCode(getDigits(value))}
          onNameChange={setName}
          onSubmit={handleSaveAuthenticator}
          onBack={handleBackToSetupQr}
          onContinue={finishMfa}
        />
      );
    }

    return (
      <MfaVerifyStep
        email={email}
        code={code}
        mode={mode}
        hasSentOtp={hasSentOtp}
        isSendingOtp={isSendingOtp}
        isVerifying={isVerifying}
        isCheckingAuthenticators={isCheckingAuthenticators}
        isCheckingPasskey={isCheckingPasskey}
        onSelectEmail={handleSelectEmail}
        onSelectAuthenticator={handleSelectAuthenticator}
        onSelectPasskey={handleSelectPasskey}
        onCodeChange={(value) => setCode(getDigits(value))}
        onSendOtp={handleSendOtp}
        onVerify={handleVerifyEmailOtp}
        isCancelling={isReturningToLogin}
        onCancel={onBackToLogin}
      />
    );
  };

  return (
    <div className="w-full max-w-[34.5rem] px-1 sm:px-0">
      <Card className="rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm">
        <CardContent className="rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 flex justify-center">
            <img src="/assets/images/IDP_Logo.png" alt="Identity Provider" className="h-20 w-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)]" />
          </div>

          <div className="mb-5 space-y-3">
            <ErrorAlert message={error} onClose={() => setError("")} />
            <InfoAlert message={info} onClose={() => setInfo("")} />
          </div>

          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}