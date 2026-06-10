import MfaCodeInput from "./MfaCodeInput";

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
    </svg>
  );
}

function AuthenticatorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
    </svg>
  );
}

function PasskeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"/>
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M7.22 14.78a.75.75 0 0 1 0-1.06L10.94 10 7.22 6.28a.75.75 0 0 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clipRule="evenodd"/>
    </svg>
  );
}

function MfaMethodButton({ label, icon, isActive, isLoading = false, loadingText = "Checking...", disabled = false, onClick }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition disabled:cursor-wait disabled:opacity-70 ${
        isActive
          ? "border-[#ffd700]/70 bg-[#ffd700]/15 text-white"
          : "border-white/12 bg-white/6 text-white/80 hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12 hover:text-white"
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffd700]/12 text-[#ffd700]">
          {icon}
        </span>
        <span className="font-semibold">{label}</span>
      </span>

      {isLoading ? (
        <span className="text-sm text-[#ffd700]">{loadingText}</span>
      ) : (
        <ChevronIcon />
      )}
    </button>
  );
}

export default function MfaVerifyStep({ email, code, mode, hasSentOtp, isSendingOtp, isVerifying, isCheckingAuthenticators, isCheckingPasskey, isCancelling = false, onSelectEmail, onSelectAuthenticator, onSelectPasskey, onCodeChange, onSendOtp, onVerify, onCancel }) {
  const isEmailMode = mode === "email";
  const isAuthenticatorMode = mode === "authenticator";
  const isPasskeyMode = mode === "passkey";
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
        <MfaMethodButton
          label="Email"
          icon={<EmailIcon />}
          isActive={isEmailMode}
          onClick={onSelectEmail}
        />

        {isEmailMode && !hasSentOtp ? (
          <button type="button" onClick={onSendOtp} disabled={isSendingOtp || !email} className="btn h-11 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#991b1b] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
            {isSendingOtp ? "Sending..." : "Send OTP"}
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
        <span>other verification methods</span>
        <div className="h-px flex-1 bg-white/18" />
      </div>

      <div className="space-y-3">
        <MfaMethodButton
          label="Authenticator app"
          icon={<AuthenticatorIcon />}
          isActive={isAuthenticatorMode}
          isLoading={isCheckingAuthenticators}
          disabled={isCheckingAuthenticators}
          onClick={onSelectAuthenticator}
        />

        <MfaMethodButton
          label="Passkey"
          icon={<PasskeyIcon />}
          isActive={isPasskeyMode}
          isLoading={isCheckingPasskey}
          disabled={isCheckingPasskey}
          onClick={onSelectPasskey}
        />
      </div>

      {onCancel ? (
        <button type="button" onClick={onCancel} disabled={isCancelling} className="h-11 w-full rounded-lg border border-white/18 bg-white/8 text-sm font-semibold text-white/80 transition hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-70">
          {isCancelling ? "Signing out..." : "Back to login"}
        </button>
      ) : null}
    </div>
  );
}