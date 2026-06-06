import MfaCodeInput from "./MfaCodeInput";

export default function MfaAuthenticatorCodeStep({ code, isVerifying, onCodeChange, onVerify, onUseBackupCode }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-white">
          Authenticator Code
        </h1>
      </div>

      <form onSubmit={onVerify} className="space-y-5">
        <MfaCodeInput
          value={code}
          onChange={onCodeChange}
          disabled={isVerifying}
        />

        <button type="submit" disabled={isVerifying} className="btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#991b1b] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isVerifying ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      {onUseBackupCode ? (
        <p className="text-center text-sm text-white/72">
          Lost your authenticator app? Use{" "}
          <button type="button" onClick={onUseBackupCode} className="font-semibold text-[#ffd700] underline decoration-transparent transition hover:decoration-[#ffd700]">
            Backup Code
          </button>
        </p>
      ) : null}
    </div>
  );
}