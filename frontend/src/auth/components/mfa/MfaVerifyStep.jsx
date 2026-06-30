import MfaCodeInput from "./MfaCodeInput";
import { EmailIcon, AuthenticatorIcon, PasskeyIcon, ChevronIcon } from "./mfaIcons";

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