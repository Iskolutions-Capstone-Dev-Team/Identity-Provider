import MfaCodeInput from "./MfaCodeInput";

export default function MfaVerifyStep({ email, code, mode, hasSentOtp, isSendingOtp, isVerifying, isCheckingAuthenticators, onSelectEmail, onSelectAuthenticator, onCodeChange, onSendOtp, onVerify }) {
  const isEmailMode = mode === "email";
  const isAuthenticatorMode = mode === "authenticator";
  const shouldShowCodeInput = isAuthenticatorMode || hasSentOtp;
  const verifyLabel = isAuthenticatorMode
    ? "Verify Authenticator Code"
    : "Verify OTP";

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-white">
          Multi-Factor Authentication
        </h1>
        <p className="text-sm leading-6 text-white/75">
          Signed in as{" "}
          <span className="font-semibold text-white">
            {email || "your account"}
          </span>
        </p>
      </div>

      <form onSubmit={onVerify} className="space-y-4">
        <button type="button" onClick={onSelectEmail}
          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
            isEmailMode
              ? "border-[#ffd700]/70 bg-[#ffd700]/15 text-white"
              : "border-white/12 bg-white/6 text-white/80 hover:border-white/24"
          }`}
        >
          <span>
            <span className="block font-semibold">Email OTP</span>
          </span>
        </button>

        {isEmailMode && !hasSentOtp ? (
          <button type="button" onClick={onSendOtp} disabled={isSendingOtp || !email} className="btn h-11 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#991b1b] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
            {isSendingOtp ? "Sending..." : "Send OTP to Email"}
          </button>
        ) : null}

        {shouldShowCodeInput ? (
          <>
            <MfaCodeInput
              value={code}
              onChange={onCodeChange}
              disabled={isVerifying}
            />

            <button type="submit" disabled={isVerifying} className="btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#991b1b] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
              {isVerifying ? "Verifying..." : verifyLabel}
            </button>
          </>
        ) : null}
      </form>

      <div className="flex items-center gap-4 text-sm font-semibold text-white/55">
        <div className="h-px flex-1 bg-white/18" />
        <span>or</span>
        <div className="h-px flex-1 bg-white/18" />
      </div>

      <div className="space-y-3 rounded-2xl border border-white/14 bg-white/8 p-4">
        <button type="button" disabled title="Passkey is not available yet." className="flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white/38">
          <span>
            <span className="block font-semibold">Passkey</span>
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
            Disabled
          </span>
        </button>

        <button type="button" onClick={onSelectAuthenticator} disabled={isCheckingAuthenticators}
          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition disabled:cursor-wait disabled:opacity-70 ${
            isAuthenticatorMode
              ? "border-[#ffd700]/70 bg-[#ffd700]/15 text-white"
              : "border-white/12 bg-white/6 text-white/80 hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12 hover:text-white"
          }`}
        >
          <span>
            <span className="block font-semibold">Authenticator app</span>
          </span>
          {isCheckingAuthenticators ? (
            <span className="text-sm text-[#ffd700]">Checking...</span>
          ) : null}
        </button>
      </div>
    </div>
  );
}