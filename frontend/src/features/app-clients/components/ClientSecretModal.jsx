import { useEffect, useState } from "react";
import AppClientIconBox from "./AppClientIconBox";
import { CloseIcon, EyeIcon, EyeSlashIcon, NoteInfoIcon } from "./appClientIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/reui/alert";
import { CircleAlertIcon, Copy, CopyCheck } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function ClientSecretModal({ open, clientName, clientId, secret, loading = false, hasError = false, onClose, colorMode = "light" }) {
  const [copied, setCopied] = useState(false);
  const [hasCopiedSecret, setHasCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const canClose = hasCopiedSecret || loading || hasError;

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setHasCopiedSecret(false);
      setShowSecret(false);
    }
  }, [open]);

  const handleCopy = async () => {
    if (!secret) return;

    try {
      await navigator.clipboard.writeText(secret);
      toast.success("Copied to clipboard");
      setCopied(true);
      setHasCopiedSecret(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // no-op
    }
  };

  const displayName = clientName || clientId || "this client";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && canClose) onClose(); }}>
      <DialogContent className="sm:max-w-xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle>Client Secret</DialogTitle>
        </DialogHeader>

          <div className="space-y-6 pt-2 pb-4 px-2 relative min-h-[160px]">
            {loading && (
              <div className="bg-background/80 absolute -inset-2 z-10 flex items-center justify-center backdrop-blur-xs rounded-xl">
                <Spinner className="size-6 opacity-80" />
              </div>
            )}

            {hasError && !loading && (
              <p className="text-sm text-destructive">Request failed, try again later.</p>
            )}

            <div className={hasError && !loading ? "hidden" : "block"}>
                <Alert variant="info" className="mb-4 border-blue-500/30 bg-blue-500/10 [&>svg]:text-blue-500">
                  <CircleAlertIcon className="h-4 w-4" />
                  <AlertTitle className="text-blue-800 dark:text-blue-200">One-time secret</AlertTitle>
                  <AlertDescription className="text-blue-800/80 dark:text-blue-200/80">
                    Shown only once. Save it securely.
                  </AlertDescription>
                </Alert>

                <div className="relative w-full">
                  <Input type={showSecret ? "text" : "password"} readOnly value={secret || ""} className="w-full pr-20 font-mono bg-muted h-10 rounded-xl"/>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowSecret((current) => !current)} disabled={!secret} aria-label={showSecret ? "Hide secret" : "Show secret"} title={showSecret ? "Hide secret" : "Show secret"}>
                      {showSecret ? <EyeSlashIcon /> : <EyeIcon />}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleCopy} disabled={!secret} title="Copy secret">
                      <span className="relative inline-flex h-5 w-5 items-center justify-center">
                        <Copy
                          className={`absolute size-4 transition-all duration-300 ease-out ${
                            copied ? "opacity-0 scale-75 -rotate-12" : "opacity-100 scale-100 rotate-0"
                          }`}
                        />
                        <CopyCheck
                          className={`absolute size-4 transition-all duration-300 ease-out ${
                            copied ? "opacity-100 scale-100 rotate-0 text-emerald-500" : "opacity-0 scale-75 rotate-12"
                          }`}
                        />
                      </span>
                    </Button>
                  </div>
                </div>
            </div>
          </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
            <Button type="button" variant="outline" onClick={() => canClose && onClose?.()} disabled={!canClose} title={canClose ? undefined : "Copy the secret first"}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
