import ErrorAlert from "../../../components/ErrorAlert";
import { MailIcon } from "./ForgotPasswordIcons";

export default function ForgotPasswordEmailStep({ email, setEmail, errorMessage, onClearError }) {
  const hasError = Boolean(errorMessage);

  return (
    <div className="space-y-5">
      <ErrorAlert message={errorMessage} onClose={onClearError} />

      <section className="rounded-2xl border border-[#7b0d15]/10 bg-white p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)]">
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.08em] text-[#5a0b12]">
          Email Address <span className="text-red-500">*</span>
        </label>
        <p className="mb-3 text-xs font-medium text-[#8f6f76]">
          We'll send a 6-digit verification code to this email address.
        </p>

        <div className="relative">
          <span className="pointer-events-none absolute left-5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#7b0d15]/60">
            <MailIcon />
          </span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" autoFocus required
            className={`h-12 w-full rounded-xl border bg-white/95 pl-14 pr-4 text-base text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 placeholder:text-slate-400 focus:ring-4 ${
              hasError
                ? "border-red-300 focus:border-red-300 focus:ring-red-200/70"
                : "border-[#d8b3ba] focus:border-[#ffd700] focus:ring-[#ffd700]/20"
            }`}
          />
        </div>

        {hasError ? <p className="mt-2 text-sm text-red-600">{errorMessage}</p> : null}
      </section>
    </div>
  );
}