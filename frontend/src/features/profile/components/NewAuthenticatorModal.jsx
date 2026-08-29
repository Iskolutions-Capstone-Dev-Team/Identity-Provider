import ErrorAlert from "../../../components/ErrorAlert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import MfaSetupConfirmStep from "../../../auth/components/mfa/MfaSetupConfirmStep";
import MfaSetupQrStep from "../../../auth/components/mfa/MfaSetupQrStep";
import { getDigits } from "../../../auth/components/mfa/mfaInputUtils";
import { Smartphone, KeySquare } from "lucide-react";
import { useNewAuthenticatorModal } from "../hooks/useNewAuthenticatorModal";

function ConnectionOptionButton({ title, description, icon, onClick, disabled }) {
  return (
    <Button variant="outline" className="group/button h-auto justify-start gap-3 px-4 py-3 text-left w-full" onClick={onClick} disabled={disabled}>
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
  const modalState = useNewAuthenticatorModal({
    open,
    email,
    onClose,
    onCreated,
  });

  const {
    connectionType,
    step,
    setStep,
    qrCodeUrl,
    code,
    setCode,
    name,
    setName,
    backupCodes,
    hasCopiedBackupCodes,
    setHasCopiedBackupCodes,
    error,
    setError,
    isSaving,
    isRegisteringPasskey,
    handleSelectAuthenticator,
    handleSelectPasskey,
    handleSaveAuthenticator,
    handleFinish,
  } = modalState;

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose?.()} dismissible={false}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="sm:max-w-md [&>button]:!hidden" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
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
            <ErrorAlert 
              message={cooldown > 0 && error === "Too many attempts. Please wait." ? `Too many attempts. Please wait ${cooldown}s.` : error} 
              onClose={() => setError("")} 
            />

            {step === "choice" ? (
              <div className="space-y-4">
                <ConnectionOptionButton
                  title="Authenticator App"
                  description={cooldown > 0 ? `Please wait ${cooldown}s` : "Scan a QR code and verify a 6-digit code."}
                  icon={<Smartphone className="size-5" />}
                  onClick={handleSelectAuthenticator}
                  disabled={isRegisteringPasskey || cooldown > 0}
                />
                <ConnectionOptionButton
                  title="Passkey"
                  description={cooldown > 0 ? `Please wait ${cooldown}s` : "Use your device, browser, or security key."}
                  icon={<KeySquare className="size-5" />}
                  onClick={handleSelectPasskey}
                  disabled={isRegisteringPasskey || cooldown > 0}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {step === "qr" ? (
                  <MfaSetupQrStep
                    qrCodeUrl={qrCodeUrl}
                    isLoading={!qrCodeUrl && !error}
                    colorMode={colorMode}
                    hideButtons={true}
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
                    hideButtons={true}
                    isProfileFlow={true}
                    onCodeChange={(value) => setCode(getDigits(value))}
                    onNameChange={setName}
                    onCopied={() => setHasCopiedBackupCodes(true)}
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
                  disabled={isSaving || (backupCodes.length > 0 && !hasCopiedBackupCodes)}
                  onClick={backupCodes.length > 0 ? handleFinish : handleSaveAuthenticator}
                  className={
                    colorMode === "dark"
                      ? "flex-1 sm:flex-none"
                      : "flex-1 sm:flex-none bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] font-bold transition-colors duration-200"
                  }
                >
                  {backupCodes.length > 0 ? "Continue" : isSaving ? "Saving..." : "Save Authenticator"}
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
