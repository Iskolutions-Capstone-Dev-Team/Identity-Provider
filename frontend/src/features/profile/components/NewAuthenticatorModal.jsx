import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import ErrorAlert from "../../../components/ErrorAlert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import MfaSetupConfirmStep from "../../../auth/components/mfa/MfaSetupConfirmStep";
import MfaSetupQrStep from "../../../auth/components/mfa/MfaSetupQrStep";
import { getDigits } from "../../../auth/components/mfa/mfaInputUtils";
import { createPasskeyCredential } from "../../../auth/utils/webAuthn";
import { mfaService } from "../../../services/mfaService";
import { PhoneIcon, ConnectionSetupIcon, PasskeyIcon } from "./profileIcons";
import { Smartphone, KeySquare } from "lucide-react";

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

function ConnectionOptionButton({ title, description, icon, onClick, disabled }) {
  return (
    <Button
      variant="outline"
      className="group/button h-auto justify-start gap-3 px-4 py-3 text-left w-full"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="bg-muted text-accent-foreground group-hover/button:bg-background rounded-md flex size-10 shrink-0 items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="truncate font-semibold">{title}</span>
        <span className="text-muted-foreground text-xs font-normal truncate">
          {description}
        </span>
      </div>
    </Button>
  );
}

export default function NewAuthenticatorModal({ open, email, onClose, onCreated, colorMode = "light" }) {
  const [connectionType, setConnectionType] = useState("");
  const [step, setStep] = useState("choice");
  const [setup, setSetup] = useState({ secret: "", otpAuthUri: "" });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);


  useEffect(() => {
    if (open) {
      setConnectionType("");
      setStep("choice");
      setSetup({ secret: "", otpAuthUri: "" });
      setQrCodeUrl("");
      setCode("");
      setName("");
      setBackupCodes([]);
      setError("");
      setIsSaving(false);
      setIsRegisteringPasskey(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || connectionType !== "authenticator") {
      return undefined;
    }

    let isCancelled = false;

    const loadSetup = async () => {
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
  }, [connectionType, email, open]);

  const handleSelectAuthenticator = () => {
    setConnectionType("authenticator");
    setStep("qr");
    setError("");
  };

  const handleSelectPasskey = async () => {
    setConnectionType("passkey");
    setError("");

    try {
      setIsRegisteringPasskey(true);
      const options = await mfaService.beginPasskeyRegistration(email);
      const credential = await createPasskeyCredential(options);

      await mfaService.finishPasskeyRegistration(email, credential);
      onCreated?.({ type: "passkey" });
      toast.success("Passkey added successfully");
      onClose?.();
    } catch (passkeyError) {
      setError(
        getRequestErrorMessage(passkeyError, "Unable to connect this passkey."),
      );
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleSaveAuthenticator = async (event) => {
    event?.preventDefault?.();
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
    onCreated?.({ type: "authenticator", code });
    toast.success("Authenticator app added successfully");
    onClose?.();
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose?.()}>
      <DialogContent className="sm:max-w-md" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b p-4 bg-[#7b0d15] text-white dark:bg-transparent dark:text-foreground">
          <DialogTitle>
            {connectionType === "authenticator"
              ? "New Authenticator"
              : connectionType === "passkey"
                ? "New Passkey"
                : "New Connection"}
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4">
          <div className="space-y-5 px-2 mt-4 pb-6">
            <ErrorAlert message={error} onClose={() => setError("")} />

            {step === "choice" ? (
              <div className="space-y-4">
                <ConnectionOptionButton
                  title="Authenticator App"
                  description="Scan a QR code and verify a 6-digit code."
                  icon={<Smartphone className="size-5" />}
                  onClick={handleSelectAuthenticator}
                  disabled={isRegisteringPasskey}
                />
                <ConnectionOptionButton
                  title="Passkey"
                  description="Use your device, browser, or security key."
                  icon={<KeySquare className="size-5" />}
                  onClick={handleSelectPasskey}
                  disabled={isRegisteringPasskey}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {step === "qr" ? (
                <MfaSetupQrStep
                  qrCodeUrl={qrCodeUrl}
                  isLoading={!qrCodeUrl && !error}
                  colorMode={colorMode}
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
                  colorMode={colorMode}
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
            )}
          </div>
        </div>

        {(step === "choice" || step === "qr" || step === "confirm") && (
          <DialogFooter className="gap-2 sm:justify-end">
            <div className="flex gap-2 w-full sm:w-auto">
              {step === "confirm" ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setCode("");
                    setError("");
                    setStep("qr");
                  }} 
                  disabled={isSaving} 
                  className="flex-1 sm:flex-none"
                >
                  Back
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={onClose} disabled={isRegisteringPasskey} className="flex-1 sm:flex-none">
                  Cancel
                </Button>
              )}
              {step === "qr" && (
                <Button 
                  type="button" 
                  disabled={!qrCodeUrl} 
                  onClick={() => {
                    setCode("");
                    setError("");
                    setStep("confirm");
                  }} 
                  className={
                    colorMode === "dark"
                      ? "flex-1 sm:flex-none"
                      : "flex-1 sm:flex-none bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] font-bold transition-colors duration-200"
                  }
                >
                  Next
                </Button>
              )}
              {step === "confirm" && (
                <Button 
                  type="button" 
                  disabled={isSaving} 
                  onClick={handleSaveAuthenticator} 
                  className={
                    colorMode === "dark"
                      ? "flex-1 sm:flex-none"
                      : "flex-1 sm:flex-none bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] font-bold transition-colors duration-200"
                  }
                >
                  {isSaving ? "Saving..." : "Save Authenticator"}
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
