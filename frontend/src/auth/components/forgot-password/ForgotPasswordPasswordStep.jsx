import { useState } from "react";
import ErrorAlert from "../../../components/ErrorAlert";
import { EyeIcon, LockIcon } from "./ForgotPasswordIcons";
import { PASSWORD_REQUIREMENTS } from "./forgotPasswordUtils";

function PasswordRuleList({ validation }) {
  return (
    <div className="mt-3 grid gap-1.5 text-[0.84rem] font-medium text-[#64748b]">
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const isMet = validation.checks[requirement.key];

        return (
          <p key={requirement.key} className={`flex items-center gap-2 ${isMet ? "text-emerald-700" : ""}`}>
            <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-bold ${isMet ? "bg-emerald-100 text-emerald-700" : "bg-[#fff4dc] text-[#7b0d15]"}`}>
              {isMet ? "OK" : "-"}
            </span>
            {requirement.label}
          </p>
        );
      })}
    </div>
  );
}

export default function ForgotPasswordPasswordStep({ form, setForm, validation, errorMessage, onClearError }) {
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const fields = ["newPassword", "confirmPassword"];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));

    if (errorMessage) {
      onClearError?.();
    }
  };

  return (
    <div className="space-y-5">
      <ErrorAlert message={errorMessage} onClose={onClearError} />

      <section className="rounded-2xl border border-[#7b0d15]/10 bg-white p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)]">
        <div className="space-y-4">
          {fields.map((field) => (
            <div className="space-y-2" key={field}>
              <label className="block text-sm font-semibold uppercase tracking-[0.08em] text-[#5a0b12]">
                {field === "newPassword" ? "New Password" : "Confirm New Password"}{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#7b0d15]/60">
                  <LockIcon />
                </span>
                <input value={form[field]} type={showPassword[field] ? "text" : "password"} name={field}
                  placeholder={field === "newPassword" ? "Enter new password" : "Confirm new password"}
                  className="h-12 w-full rounded-xl border border-[#d8b3ba] bg-white/95 pl-14 pr-14 text-base text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/20"
                  onChange={handleChange}
                  required
                />

                <button type="button" className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#7b0d15]" onClick={() => setShowPassword((currentState) => ({ ...currentState, [field]: !currentState[field] }))} aria-label={showPassword[field] ? "Hide password" : "Show password"}>
                  <EyeIcon isVisible={showPassword[field]} />
                </button>
              </div>

              {field === "newPassword" ? (
                <PasswordRuleList validation={validation} />
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}