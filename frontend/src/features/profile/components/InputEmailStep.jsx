import ErrorAlert from "../../../components/ErrorAlert";
import { getModalTheme } from "../../../components/modalTheme";
import { MailIcon } from "./profileIcons";

export default function InputEmailStep({ email, setEmail, errorMessage = "", onClearError, colorMode = "light" }) {
  const {
    modalHelperTextClassName,
    modalInputClassName,
    modalLabelClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);
  const isDarkMode = colorMode === "dark";
  const hasError = Boolean(errorMessage);
  const iconClassName = isDarkMode
    ? "pointer-events-none absolute left-4 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#c7adb4]"
    : "pointer-events-none absolute left-4 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#8f6f76]";
  const errorInputClassName = hasError
    ? isDarkMode
      ? "border-red-400/55 focus:border-red-400 focus:ring-4 focus:ring-red-500/15"
      : "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-200/70"
    : "";
  const errorTextClassName = isDarkMode
    ? "mt-2 text-sm text-red-200"
    : "mt-2 text-sm text-red-600";

  return (
    <div className="space-y-5">
      <ErrorAlert message={errorMessage} onClose={onClearError} />

      <section className={modalSectionClassName}>
        <label className={modalLabelClassName}>
          Email Address <span className="text-red-500">*</span>
        </label>
        <p className={modalHelperTextClassName}>
          We&apos;ll send a 6-digit verification code to this email address.
        </p>

        <div className="relative isolate">
          <span className={iconClassName}>
            <MailIcon />
          </span>

          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" className={`${modalInputClassName} relative z-0 pl-14 ${errorInputClassName}`} autoFocus required/>
        </div>

        {hasError ? <p className={errorTextClassName}>{errorMessage}</p> : null}
      </section>
    </div>
  );
}