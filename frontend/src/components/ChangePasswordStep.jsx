import { useState } from "react";
import {
  modalInputClassName,
  modalLabelClassName,
  modalSectionClassName,
} from "./modalTheme";

function PasswordVisibilityIcon({ isVisible }) {
  if (isVisible) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.542-7a10.056 10.056 0 0 1 2.293-3.607M6.72 6.72A9.956 9.956 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7a9.978 9.978 0 0 1-4.563 5.956M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  );
}

function PasswordRuleItem({ isMet, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#7b0d15]/10 bg-[#fffaf2] px-2.5 py-1 text-[0.72rem] font-medium text-[#6f4f56]">
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold ${
          isMet
            ? "bg-emerald-100 text-emerald-700"
            : "bg-[#fff4dc] text-[#7b0d15]"
        }`}
      >
        {isMet ? "OK" : "?"}
      </span>
      <span>{label}</span>
    </span>
  );
}

export function getPasswordValidationState(form) {
  const password = form.newPassword || "";

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  return {
    checks,
    isValid:
      Object.values(checks).every(Boolean) &&
      form.newPassword !== "" &&
      form.newPassword === form.confirmPassword,
  };
}

export default function ChangePasswordStep({ form, setForm, showCurrentPassword = true }) {
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const validation = getPasswordValidationState(form);
  const fields = showCurrentPassword
    ? ["currentPassword", "newPassword", "confirmPassword"]
    : ["newPassword", "confirmPassword"];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const toggleShowPassword = (field) => {
    setShowPassword((currentState) => ({
      ...currentState,
      [field]: !currentState[field],
    }));
  };

  return (
    <section className={modalSectionClassName}>
      <div className="space-y-4">
        {fields.map((field) => (
          <div className="space-y-2" key={field}>
            <label className={modalLabelClassName}>
              {field === "currentPassword"
                ? "Current Password"
                : field === "newPassword"
                  ? "New Password"
                  : "Confirm New Password"}{" "}
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input value={form[field]} type={showPassword[field] ? "text" : "password"} name={field}
                placeholder={
                  field === "currentPassword"
                    ? "Enter current password"
                    : field === "newPassword"
                      ? "Enter new password"
                      : "Confirm new password"
                }
                className={`${modalInputClassName} pr-12`}
                onChange={handleChange}
                required
              />

              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f6f76] transition hover:text-[#5a0b12]" onClick={() => toggleShowPassword(field)}>
                <PasswordVisibilityIcon isVisible={showPassword[field]} />
              </button>
            </div>

            {field === "newPassword" && (
              <div className="mt-3 flex flex-col items-start gap-1.5">
                <PasswordRuleItem
                  isMet={validation.checks.length}
                  label="At least 8 characters"
                />
                <PasswordRuleItem
                  isMet={validation.checks.uppercase}
                  label="One uppercase letter"
                />
                <PasswordRuleItem
                  isMet={validation.checks.number}
                  label="One number"
                />
                <PasswordRuleItem
                  isMet={validation.checks.special}
                  label="One special character"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}