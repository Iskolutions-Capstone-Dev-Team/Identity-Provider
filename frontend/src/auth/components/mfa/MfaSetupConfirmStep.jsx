import { useState } from "react";
import MfaCodeInput from "./MfaCodeInput";

export default function MfaSetupConfirmStep({ code, name, backupCodes, isSaving, onCodeChange, onNameChange, onSubmit, onBack, onContinue }) {
  const hasBackupCodes = backupCodes.length > 0;
  const [copyStatus, setCopyStatus] = useState("");
  const [hasCopiedBackupCodes, setHasCopiedBackupCodes] = useState(false);
  const backupCodesContainerClassName =
    "rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)]";
  const backupCodesGridClassName =
    "mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-3";

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
        <h1 className="text-3xl font-semibold text-white">
          {hasBackupCodes ? "Backup Codes" : "Enter the code"}
        </h1>
      </div>

      {hasBackupCodes ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-300/35 bg-blue-950/28 px-4 py-4 text-left text-blue-50 shadow-[0_18px_45px_-36px_rgba(37,99,235,0.72)]">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-300/14 text-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <p className="text-sm font-medium leading-6">
                Save these backup codes. Use them if you lose access to your authenticator app. Each code works once.
              </p>
            </div>
          </div>

          <div className={backupCodesContainerClassName}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold text-white">Backup codes</h2>
              <button type="button" onClick={handleCopyBackupCodes} aria-label={copyStatus === "Copied" ? "Backup codes copied" : "Copy backup codes"} title={copyStatus === "Copied" ? "Copied" : "Copy codes"} className="btn relative h-10 w-10 overflow-hidden rounded-xl border border-white/15 bg-white/8 p-0 text-white/85 shadow-none transition duration-300 hover:border-white/30 hover:bg-white/14">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`absolute size-6 transition-all duration-300 ${copyStatus === "Copied" ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`absolute size-6 transition-all duration-300 ${copyStatus === "Copied" ? "scale-75 opacity-0" : "scale-100 opacity-100"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </button>
            </div>

            <div className={backupCodesGridClassName}>
              {backupCodes.map((backupCode) => (
                <span key={backupCode} className="min-w-0 overflow-hidden text-ellipsis rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center font-mono text-[0.68rem] font-semibold text-white/90 sm:text-xs">
                  {backupCode}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/90">
              Authenticator Name
            </label>
            <input type="text" value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Enter the App Name(e.g., Google Auth)" className="h-13 w-full rounded-2xl border border-white/20 bg-white/95 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/20"/>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/90">
              Authenticator code
            </label>
            <MfaCodeInput
              value={code}
              onChange={onCodeChange}
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <button type="button" onClick={onBack} disabled={isSaving} aria-label="Back to QR code" title="Back" className="btn h-12 w-12 rounded-lg border border-white/18 bg-white/8 p-0 text-white/85 transition hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <button type="submit" disabled={isSaving} className="btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#991b1b] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? "Saving..." : "Save Authenticator"}
            </button>
          </div>
        </form>
      )}

      {hasBackupCodes ? (
        <button type="button" onClick={onContinue} disabled={!hasCopiedBackupCodes} className="btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#991b1b] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/40">
          Continue
        </button>
      ) : null}
    </div>
  );
}