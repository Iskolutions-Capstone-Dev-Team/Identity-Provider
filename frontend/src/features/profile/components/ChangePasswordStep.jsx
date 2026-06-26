import { useState } from "react";
import ErrorAlert from "../../../components/ErrorAlert";
import { getModalTheme } from "../../../components/modalTheme";
import { PasswordVisibilityIcon } from "./profileIcons";

const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters" },
  { key: "uppercase", label: "One uppercase letter" },
  { key: "number", label: "One number" },
  { key: "special", label: "One special character" },
];

function PasswordRuleList({ validation, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const listClassName = isDarkMode
    ? "mt-3 grid gap-1.5 text-[0.84rem] font-medium text-[#aeb9c8]"
    : "mt-3 grid gap-1.5 text-[0.84rem] font-medium text-[#64748b]";
  const validItemClassName = isDarkMode ? "text-[#4ade80]" : "text-emerald-700";
  const pendingBadgeClassName = isDarkMode
    ? "bg-[#f8d24e]/12 text-[#ffe28a]"
    : "bg-[#fff4dc] text-[#7b0d15]";
  const validBadgeClassName = isDarkMode
    ? "bg-emerald-400/12 text-emerald-200"
    : "bg-emerald-100 text-emerald-700";

  return (
    <div className={listClassName}>
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const isMet = validation.checks[requirement.key];
        const itemClassName = isMet ? validItemClassName : "";
        const badgeClassName = isMet ? validBadgeClassName : pendingBadgeClassName;

        return (
          <p key={requirement.key} className={`flex items-center gap-2 ${itemClassName}`}>
            <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-bold ${badgeClassName}`}>
              {isMet ? "OK" : "-"}
            </span>
            {requirement.label}
          </p>
        );
      })}
    </div>
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

export default function ChangePasswordStep({ form, setForm, showCurrentPassword = true, colorMode = "light", errorMessage = "", onClearError }) {
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const {
    modalInputClassName,
    modalLabelClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);
  const isDarkMode = colorMode === "dark";
  const visibilityButtonClassName = isDarkMode
    ? "absolute right-4 top-1/2 -translate-y-1/2 text-[#c7adb4] transition duration-300 hover:text-[#ffe28a]"
    : "absolute right-4 top-1/2 -translate-y-1/2 text-[#8f6f76] transition duration-300 hover:text-[#5a0b12]";

  const validation = getPasswordValidationState(form);
  const fields = showCurrentPassword
    ? ["currentPassword", "newPassword", "confirmPassword"]
    : ["newPassword", "confirmPassword"];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));

    if (errorMessage) {
      onClearError?.();
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword((currentState) => ({
      ...currentState,
      [field]: !currentState[field],
    }));
  };

  return (
    <div className="space-y-5">
      <ErrorAlert message={errorMessage} onClose={onClearError} />

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

                <button type="button" className={visibilityButtonClassName} onClick={() => toggleShowPassword(field)}>
                  <PasswordVisibilityIcon isVisible={showPassword[field]} />
                </button>
              </div>

              {field === "newPassword" && (
                <PasswordRuleList validation={validation} colorMode={colorMode} />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}