import { useState } from "react";
import MfaCodeInput from "./MfaCodeInput";
import { InfoCircleIcon, ClipboardCheckIcon, ClipboardDocumentIcon, ArrowLeftIcon } from "./mfaIcons";

export default function MfaSetupConfirmStep({ code, name, backupCodes, isSaving, colorMode = "dark", onCodeChange, onNameChange, onSubmit, onBack, onContinue }) {
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
    ? "rounded-2xl border border-blue-300/35 bg-blue-950/28 px-4 py-4 text-left text-blue-50 shadow-[0_18px_45px_-36px_rgba(37,99,235,0.72)]"
    : "rounded-2xl border border-[#f8d24e]/55 bg-[#fff4dc] px-4 py-4 text-left text-[#351018] shadow-[0_18px_45px_-36px_rgba(123,13,21,0.22)]";
  const noteIconClassName = isDarkMode
    ? "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-300/14 text-blue-100"
    : "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f8d24e]/25 text-[#7b0d15]";
  const backupCodesContainerClassName = isDarkMode
    ? "rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)]"
    : "rounded-2xl border border-[#7b0d15]/10 bg-white p-4 text-[#351018] shadow-[0_18px_45px_-36px_rgba(43,3,7,0.35)]";
  const backupCodesGridClassName =
    "mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-3";
  const backupCodesTitleClassName = isDarkMode
    ? "font-semibold text-white"
    : "font-semibold text-[#351018]";
  const copyButtonClassName = isDarkMode
    ? "btn relative h-10 w-10 overflow-hidden rounded-xl border border-white/15 bg-white/8 p-0 text-white/85 shadow-none transition duration-300 hover:border-white/30 hover:bg-white/14"
    : "btn relative h-10 w-10 overflow-hidden rounded-xl border border-[#7b0d15]/12 bg-[#fffaf2] p-0 text-[#7b0d15] shadow-none transition duration-300 hover:border-[#f8d24e]/75 hover:bg-[#fff4dc]";
  const backupCodeClassName = isDarkMode
    ? "min-w-0 overflow-hidden text-ellipsis rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center font-mono text-[0.68rem] font-semibold text-white/90 sm:text-xs"
    : "min-w-0 overflow-hidden text-ellipsis rounded-lg border border-[#7b0d15]/10 bg-[#fffaf2] px-2 py-2 text-center font-mono text-[0.68rem] font-semibold text-[#351018] sm:text-xs";
  const backButtonClassName = isDarkMode
    ? "mx-auto flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    : "mx-auto flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#7b5560] transition hover:text-[#351018] disabled:cursor-not-allowed disabled:opacity-60";
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
        <h1 className={titleClassName}>
          {hasBackupCodes ? "Backup Codes" : "Enter the code"}
        </h1>
      </div>

      {hasBackupCodes ? (
        <div className="space-y-4">
          <div className={noteClassName}>
            <div className="flex gap-3">
              <div className={noteIconClassName}>
                <InfoCircleIcon />
              </div>
              <p className="text-sm font-medium leading-6">
                Save these backup codes. Use them if you lose access to your authenticator app. Each code works once.
              </p>
            </div>
          </div>

          <div className={backupCodesContainerClassName}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className={backupCodesTitleClassName}>Backup codes</h2>
              <button type="button" onClick={handleCopyBackupCodes} aria-label={copyStatus === "Copied" ? "Backup codes copied" : "Copy backup codes"} title={copyStatus === "Copied" ? "Copied" : "Copy codes"} className={copyButtonClassName}>
                <ClipboardCheckIcon className={`absolute size-6 transition-all duration-300 ${copyStatus === "Copied" ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} />
                <ClipboardDocumentIcon className={`absolute size-6 transition-all duration-300 ${copyStatus === "Copied" ? "scale-75 opacity-0" : "scale-100 opacity-100"}`} />
              </button>
            </div>

            <div className={backupCodesGridClassName}>
              {backupCodes.map((backupCode) => (
                <span key={backupCode} className={backupCodeClassName}>
                  {backupCode}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mx-auto w-full max-w-[594px] space-y-5">
          <div>
            <label className={labelClassName}>
              App Name
            </label>
            <input type="text" value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Enter the App Name(e.g., Google Auth)" className="h-13 w-full rounded-2xl border border-white/20 bg-white/95 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/20"/>
          </div>

          <div className="space-y-3">
            <label className={verificationLabelClassName}>
              Verification Code
            </label>
            <MfaCodeInput
              value={code}
              onChange={onCodeChange}
              disabled={isSaving}
              fullWidth
            />
          </div>

          <div className="space-y-4">
            <button type="submit" disabled={isSaving} className="btn h-11 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-sm font-semibold text-[#991b1b] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? "Saving..." : "Save Authenticator"}
            </button>

            <button type="button" onClick={onBack} disabled={isSaving} className={backButtonClassName}>
              <ArrowLeftIcon />
              Back
            </button>
          </div>
        </form>
      )}

      {hasBackupCodes ? (
        <button type="button" onClick={onContinue} disabled={!hasCopiedBackupCodes} className={continueButtonClassName}>
          Continue
        </button>
      ) : null}
    </div>
  );
}