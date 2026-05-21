export default function MfaVerifyStep({ email, isCheckingAuthenticators, onSelectAuthenticator, onCancel }) {
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

      <div className="space-y-3 rounded-2xl border border-white/14 bg-white/8 p-4">
        <button type="button" onClick={onSelectAuthenticator} disabled={isCheckingAuthenticators} className="flex w-full items-center justify-between rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-left text-white/80 transition hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12 hover:text-white disabled:cursor-wait disabled:opacity-70">
          <span>
            <span className="block font-semibold">Authenticator app</span>
          </span>
          {isCheckingAuthenticators ? (
            <span className="text-sm text-[#ffd700]">Checking...</span>
          ) : null}
        </button>

        <button type="button" disabled title="Email OTP is not available yet." className="flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white/38">
          <span>
            <span className="block font-semibold">Email OTP</span>
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
            Not Available
          </span>
        </button>

        <button type="button" disabled title="Passkey is not available yet." className="flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white/38">
          <span>
            <span className="block font-semibold">Passkey</span>
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
            Not Available
          </span>
        </button>
      </div>

      {onCancel ? (
        <button type="button" onClick={onCancel} className="h-11 w-full rounded-lg border border-white/18 bg-white/8 text-sm font-semibold text-white/80 transition hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12 hover:text-white">
          Back to login
        </button>
      ) : null}
    </div>
  );
}