import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CopyCheck, ArrowLeft, Info } from "lucide-react";

export default function MfaSetupConfirmStep({ code, name, backupCodes, isSaving, colorMode = "dark", hideButtons = false, onCodeChange, onNameChange, onSubmit, onBack, onContinue }) {
  const isDarkMode = colorMode === "dark";
  const hasBackupCodes = backupCodes.length > 0;
  const [copyStatus, setCopyStatus] = useState("");
  const [hasCopiedBackupCodes, setHasCopiedBackupCodes] = useState(false);
  const titleClassName = isDarkMode
    ? "text-3xl font-semibold text-white"
    : "text-3xl font-semibold text-[#351018]";
  const labelClassName = isDarkMode
    ? "mb-2 block text-sm font-semibold text-white"
    : "mb-2 block text-sm font-semibold text-[#351018]";
  const verificationLabelClassName = isDarkMode
    ? "block text-sm font-semibold text-white"
    : "block text-sm font-semibold text-[#351018]";
  const noteClassName = isDarkMode
    ? "bg-[#f8d24e]/10 text-[#f8d24e] border-[#f8d24e]/30 text-left"
    : "border border-[#f8d24e]/55 bg-[#fff4dc] text-left text-[#351018] shadow-[0_18px_45px_-36px_rgba(123,13,21,0.22)]";
  const backupCodesContainerClassName = isDarkMode
    ? "rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)]"
    : "rounded-2xl border border-[#7b0d15]/10 bg-white p-4 text-[#351018] shadow-[0_18px_45px_-36px_rgba(43,3,7,0.35)]";
  const backupCodesGridClassName =
    "mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-3";
  const backupCodesTitleClassName = isDarkMode
    ? "font-semibold text-white"
    : "font-semibold text-[#351018]";
  const copyButtonClassName = isDarkMode
    ? "h-10 w-10 border border-white/15 bg-white/10 text-white/85 hover:bg-white/20 hover:text-white"
    : "h-10 w-10 border border-[#7b0d15]/12 bg-[#fffaf2] text-[#7b0d15] hover:bg-[#f8d24e]/75 hover:text-[#7b0d15]";
  const backupCodeClassName = isDarkMode
    ? "min-w-0 overflow-hidden text-ellipsis rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center font-mono text-[0.68rem] font-semibold text-white/90 sm:text-xs"
    : "min-w-0 overflow-hidden text-ellipsis rounded-lg border border-[#7b0d15]/10 bg-[#fffaf2] px-2 py-2 text-center font-mono text-[0.68rem] font-semibold text-[#351018] sm:text-xs";
  const backButtonClassName = isDarkMode
    ? "mx-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition bg-transparent hover:bg-transparent"
    : "mx-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#7b5560] hover:text-[#351018] transition bg-transparent hover:bg-transparent";
  const continueButtonClassName = isDarkMode
    ? "btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#991b1b] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/40"
    : "btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#7b0d15] transition hover:border-[#7b0d15] hover:bg-[#7b0d15] hover:text-white disabled:cursor-not-allowed disabled:border-[#7b0d15]/10 disabled:bg-[#7b0d15]/8 disabled:text-[#7b5560]/50";

  const handleCopyBackupCodes = async () => {
    const backupCodesText = backupCodes.join("\n");

    if (!backupCodesText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(backupCodesText);
      setHasCopiedBackupCodes(true);
      setCopyStatus("Copied");
      window.setTimeout(() => setCopyStatus(""), 1600);
    } catch (error) {
      console.error("Unable to copy backup codes:", error);
      setCopyStatus("Copy failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={titleClassName}>
          {hasBackupCodes ? "Backup Codes" : "Enter the code"}
        </h3>
      </div>

      {hasBackupCodes ? (
        <div className="space-y-4">
          <Alert className={noteClassName}>
            <Info className="h-5 w-5" />
            <AlertDescription className="ml-2 mt-0.5 text-sm font-medium leading-6 text-inherit">
              Save these codes! Use them to log in if you lose your authenticator app. Each code works once.
            </AlertDescription>
          </Alert>

          <Card className={isDarkMode ? "border-white/10 bg-white/[0.06] shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)]" : "border-[#7b0d15]/10 bg-white shadow-[0_18px_45px_-36px_rgba(43,3,7,0.35)]"}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className={backupCodesTitleClassName}>Backup codes</CardTitle>
              <Button variant="ghost" size="icon" onClick={handleCopyBackupCodes} className={copyButtonClassName}>
                {copyStatus === "Copied" ? (
                  <CopyCheck className="h-5 w-5 transition-all duration-300" />
                ) : (
                  <Copy className="h-5 w-5 transition-all duration-300" />
                )}
              </Button>
            </CardHeader>

            <CardContent>
              <div className={backupCodesGridClassName}>
                {backupCodes.map((backupCode) => (
                  <Badge key={backupCode} variant="outline" className={`justify-center rounded-lg px-4 py-2.5 text-xs sm:text-sm font-mono font-semibold tracking-wide ${isDarkMode ? "border-white/10 bg-white/5 text-white/90" : "border-[#7b0d15]/10 bg-[#fffaf2] text-[#351018]"}`}>
                    {backupCode}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[594px] space-y-5">
          <div>
            <label className={labelClassName}>
              App Name
            </label>
            <div className="flex w-full items-center rounded-md border border-white/20 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-within:ring-2 focus-within:ring-[#ffd700]">
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="ml-1 mr-2 flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground cursor-help outline-none transition-colors">
                    <CircleHelp className="size-4 text-emerald-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold leading-none tracking-tight">Authenticator Name</h4>
                    <p className="text-sm text-muted-foreground">
                      Your app name should not be identical to your other existing auth app.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
              <input 
                type="text" 
                value={name} 
                onChange={(event) => onNameChange(event.target.value)} 
                placeholder="Enter the App Name (e.g., Google Auth)" 
                className="flex h-9 w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className={verificationLabelClassName}>
              Verification Code
            </label>
            <div className="flex flex-col items-center">
                <InputOTP maxLength={6} value={code} onChange={onCodeChange} disabled={isSaving}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl bg-white text-slate-800" />
                    <InputOTPSlot index={1} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl bg-white text-slate-800" />
                    <InputOTPSlot index={2} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl bg-white text-slate-800" />
                  </InputOTPGroup>
                  <InputOTPSeparator className="text-white/80" />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl bg-white text-slate-800" />
                    <InputOTPSlot index={4} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl bg-white text-slate-800" />
                    <InputOTPSlot index={5} className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl bg-white text-slate-800" />
                  </InputOTPGroup>
                </InputOTP>
            </div>
          </div>
        </div>
      )}

      {hasBackupCodes ? (
        <Button onClick={onContinue} disabled={!hasCopiedBackupCodes} className="h-12 w-full bg-[#ffd700] text-[#991b1b] hover:bg-[#991b1b] hover:text-white font-bold transition duration-300">
          Continue
        </Button>
      ) : (
        <div className="mt-6 flex flex-col space-y-4">
          {!hideButtons && (
            <>
              <Button onClick={onSubmit} disabled={isSaving || !code || code.length < 6} className="h-12 w-full bg-[#ffd700] text-[#991b1b] hover:bg-[#991b1b] hover:text-white font-bold transition duration-300">
                {isSaving ? "Saving..." : "Save Authenticator"}
              </Button>
              <Button variant="ghost" onClick={onBack} disabled={isSaving} className={backButtonClassName}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}