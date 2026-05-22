import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import ErrorAlert from "../ErrorAlert";
import { getModalTheme } from "../modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../modalTransition";
import MfaSetupConfirmStep from "../../auth/components/mfa/MfaSetupConfirmStep";
import MfaSetupQrStep from "../../auth/components/mfa/MfaSetupQrStep";
import { getDigits } from "../../auth/components/mfa/mfaInputUtils";
import { mfaService } from "../../services/mfaService";

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

function AuthenticatorSetupIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 3.75 5.25 6.75v5.063c0 3.902 2.527 7.356 6.25 8.438 3.723-1.082 6.25-4.536 6.25-8.438V6.75L12 3.75Zm3.61 7.686a.75.75 0 0 0-1.22-.872l-3.236 4.53-1.624-1.624a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

export default function NewAuthenticatorModal({ open, email, onClose, onCreated, colorMode = "light" }) {
  const [step, setStep] = useState("qr");
  const [setup, setSetup] = useState({ secret: "", otpAuthUri: "" });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { shouldRender, isClosing } = useModalTransition(open);
  const {
    modalBodyClassName,
    modalBoxClassName,
    modalCloseButtonClassName,
    modalHeaderClassName,
    modalHeaderTitleClassName,
    modalOverlayClassName,
  } = getModalTheme(colorMode);
  const headerIconClassName =
    colorMode === "dark" ? "h-10 w-10 text-[#ffe28a]" : "h-10 w-10 text-[#fff0a8]";
  const modalHeaderSpacingClassName =
    `${modalHeaderClassName} h-[7rem] shrink-0 !px-7 !py-0 sm:!px-8`;
  const setupBodyClassName =
    "rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(31,19,27,0.96))] p-5 text-white shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)] sm:p-6";

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let isCancelled = false;

    const loadSetup = async () => {
      setStep("qr");
      setSetup({ secret: "", otpAuthUri: "" });
      setQrCodeUrl("");
      setCode("");
      setName("");
      setBackupCodes([]);
      setError("");

      try {
        const nextSetup = await mfaService.getSetup(email);
        const nextQrCodeUrl = await QRCode.toDataURL(nextSetup.otpAuthUri, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
        });

        if (!isCancelled) {
          setSetup(nextSetup);
          setQrCodeUrl(nextQrCodeUrl);
        }
      } catch (setupError) {
        if (!isCancelled) {
          setError(
            getRequestErrorMessage(
              setupError,
              "Unable to load authenticator setup.",
            ),
          );
        }
      }
    };

    loadSetup();

    return () => {
      isCancelled = true;
    };
  }, [email, open]);

  const handleSaveAuthenticator = async (event) => {
    event.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    if (!name.trim()) {
      setError("Enter the authenticator app name.");
      return;
    }

    try {
      setIsSaving(true);
      const result = await mfaService.createAuthenticator({
        email,
        secret: setup.secret,
        code,
        name,
      });

      setBackupCodes(result.backupCodes);
    } catch (saveError) {
      setError(
        getRequestErrorMessage(saveError, "Unable to save this authenticator."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = () => {
    onCreated?.();
    onClose?.();
  };

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <div className={`${modalBoxClassName} !max-w-xl`}>
        <div className={modalHeaderSpacingClassName}>
          <div className="flex h-full items-center justify-between gap-4 sm:gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-4 pr-3 sm:pr-16">
              <AuthenticatorSetupIcon className={headerIconClassName} />
              <h3 className={modalHeaderTitleClassName}>New Authenticator</h3>
            </div>

            <button type="button" className={`${modalCloseButtonClassName} shrink-0`} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className={modalBodyClassName}>
          <div className="space-y-5">
            <ErrorAlert message={error} onClose={() => setError("")} />

            <div className={setupBodyClassName}>
              {step === "qr" ? (
                <MfaSetupQrStep
                  qrCodeUrl={qrCodeUrl}
                  isLoading={!qrCodeUrl && !error}
                  onNext={() => {
                    setCode("");
                    setError("");
                    setStep("confirm");
                  }}
                />
              ) : (
                <MfaSetupConfirmStep
                  code={code}
                  name={name}
                  backupCodes={backupCodes}
                  isSaving={isSaving}
                  onCodeChange={(value) => setCode(getDigits(value))}
                  onNameChange={setName}
                  onSubmit={handleSaveAuthenticator}
                  onBack={() => {
                    setCode("");
                    setError("");
                    setStep("qr");
                  }}
                  onContinue={handleFinish}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}