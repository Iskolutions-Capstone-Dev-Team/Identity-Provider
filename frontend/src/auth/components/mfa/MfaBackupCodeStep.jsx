export default function MfaBackupCodeStep({ backupCode, isVerifying, onBackupCodeChange, onVerify }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-white">Backup Code</h1>
      </div>

      <form onSubmit={onVerify} className="space-y-5">
        <input type="text" value={backupCode} onChange={(event) => onBackupCodeChange(event.target.value)} placeholder="Enter backup code" disabled={isVerifying} className="h-12 w-full rounded-xl border border-white/20 bg-white/95 px-4 text-center font-mono text-base font-semibold text-[#351018] outline-none transition placeholder:font-[Poppins] placeholder:text-sm placeholder:font-medium placeholder:text-slate-400 focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/20 disabled:cursor-not-allowed disabled:opacity-60"/>

        <button type="submit" disabled={isVerifying} className="btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#991b1b] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isVerifying ? "Verifying..." : "Verify Backup Code"}
        </button>
      </form>
    </div>
  );
}