import { Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import ErrorAlert from "../../../components/ErrorAlert";

export default function UserPoolAuthAppMfaModal({
  open,
  code = "",
  onCodeChange,
  onVerify,
  onClose,
  isVerifying = false,
  error = "",
}) {
  const isComplete = code.length === 6;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isComplete && !isVerifying) {
      onVerify?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && !isVerifying) onClose?.(); }}>
      <DialogContent className="sm:max-w-md" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle>Verification Required</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-0">
          {error && <ErrorAlert message={error} />}

          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7b0d15]/10 text-[#7b0d15] dark:bg-accent dark:text-foreground">
              <Smartphone className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold text-foreground">
                Enter Authenticator Code
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
                Open your authenticator app (e.g. Google Authenticator) and enter the 6-digit verification code.
              </p>
            </div>

            <div className="pt-2 pb-2">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(val) => onCodeChange?.(val)}
                disabled={isVerifying}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                  <InputOTPSlot index={1} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                  <InputOTPSlot index={2} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                  <InputOTPSlot index={4} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                  <InputOTPSlot index={5} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <DialogFooter className="-mx-4 -mb-4 border-t p-4 rounded-b-xl flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isComplete || isVerifying}
              className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold transition-colors duration-200"
            >
              {isVerifying ? "Verifying..." : "Verify Code"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
