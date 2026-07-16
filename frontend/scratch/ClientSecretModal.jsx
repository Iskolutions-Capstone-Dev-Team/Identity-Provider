import { useEffect, useState } from "react";
import AppClientIconBox from "./AppClientIconBox";
import { CloseIcon, CopyIcon, CopySuccessIcon, EyeIcon, EyeSlashIcon, NoteInfoIcon } from "./appClientIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-card text-card-foreground border-border" hideCloseButton>
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AppClientIconBox colorMode={colorMode} variant="plain" />
              <div>
                <DialogTitle className="text-xl">Client Secret</DialogTitle>
                <DialogDescription>
                  Here is the client secret for <span className="font-semibold text-foreground">{displayName}</span>.
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => canClose && onClose?.()}
              disabled={!canClose}
              title={canClose ? "Close" : "Copy the secret first"}
            >
              <CloseIcon />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="space-y-6">
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="loading loading-spinner loading-sm text-primary" aria-hidden="true" />
                <span>Rotating secret. Please wait...</span>
              </div>
            )}

            {!loading && hasError && (
              <p className="text-sm text-destructive">Request failed, try again later.</p>
            )}

            {!loading && !hasError && (
              <>
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4">
                  <p className="flex items-start gap-3 text-sm font-medium text-foreground">
                    <NoteInfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                    <span>
                      <span className="font-bold text-yellow-500">Note:</span> This secret is shown <span className="font-bold text-yellow-500">one time only</span>. If it is lost, generate a new one.
                    </span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="relative grow">
                    <Input
                      type={showSecret ? "text" : "password"}
                      readOnly
                      value={secret || ""}
                      className="w-full pr-12 font-mono bg-muted"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setShowSecret((current) => !current)}
                      disabled={!secret}
                      aria-label={showSecret ? "Hide secret" : "Show secret"}
                      title={showSecret ? "Hide secret" : "Show secret"}
                    >
                      {showSecret ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 w-10 p-0 shrink-0"
                    onClick={handleCopy}
                    disabled={!secret}
                  >
                    <span className="relative inline-flex h-5 w-5 items-center justify-center">
                      <CopyIcon
                        className={`absolute size-5 transition-all duration-300 ease-out ${
                          copied ? "opacity-0 scale-75 -rotate-12" : "opacity-100 scale-100 rotate-0"
                        }`}
                      />
                      <CopySuccessIcon
                        className={`absolute size-5 transition-all duration-300 ease-out ${
                          copied ? "opacity-100 scale-100 rotate-0 text-emerald-600" : "opacity-0 scale-75 rotate-12"
                        }`}
                      />
                    </span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/50">
          <Button
            type="button"
            variant="default"
            onClick={() => canClose && onClose?.()}
            disabled={!canClose}
            title={canClose ? undefined : "Copy the secret first"}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
