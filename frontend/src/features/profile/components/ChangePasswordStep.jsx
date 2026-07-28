import { useState } from "react";
import { LockIcon, EyeIcon, EyeOffIcon, Minus, Check } from "lucide-react";
import ErrorAlert from "../../../components/ErrorAlert";
import { Field, FieldLabel } from "../../../components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../../../components/ui/input-group";

const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters" },
  { key: "uppercase", label: "One uppercase letter" },
  { key: "number", label: "One number" },
  { key: "special", label: "One special character" },
];

function PasswordRuleList({ validation, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const listClassName = isDarkMode
    ? "mt-3 grid gap-1.5 text-xs font-medium text-[#aeb9c8]"
    : "mt-3 grid gap-1.5 text-xs font-medium text-[#64748b]";
  const validItemClassName = isDarkMode ? "text-[#4ade80]" : "text-emerald-700";
  const pendingIconClassName = isDarkMode ? "text-[#aeb9c8]" : "text-[#64748b]";
  const validIconClassName = isDarkMode ? "text-[#4ade80]" : "text-emerald-700";

  return (
    <div className={listClassName}>
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const isMet = validation.checks[requirement.key];
        const itemClassName = isMet ? validItemClassName : "";
        const iconClassName = isMet ? validIconClassName : pendingIconClassName;

        return (
          <p key={requirement.key} className={`flex items-center gap-2 ${itemClassName}`}>
            {isMet ? (
              <Check className={`size-3.5 shrink-0 ${iconClassName}`} />
            ) : (
              <Minus className={`size-3.5 shrink-0 ${iconClassName}`} />
            )}
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

      <div className="space-y-4">
        {fields.map((field) => (
          <Field key={field}>
            <FieldLabel htmlFor={`val-${field}`}>
              {field === "currentPassword"
                ? "Current Password"
                : field === "newPassword"
                  ? "New Password"
                  : "Confirm New Password"}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>

            <InputGroup className="h-10 rounded-md">
              <InputGroupAddon className="text-muted-foreground">
                <LockIcon className="size-4" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id={`val-${field}`}
                value={form[field]}
                type={showPassword[field] ? "text" : "password"}
                name={field}
                placeholder={
                  field === "currentPassword"
                    ? "Enter current password"
                    : field === "newPassword"
                      ? "Enter new password"
                      : "Confirm new password"
                }
                onChange={handleChange}
                required
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="ghost"
                  onClick={() => toggleShowPassword(field)}
                  aria-label={showPassword[field] ? "Hide password" : "Show password"}
                >
                  {showPassword[field] ? (
                    <EyeOffIcon className="text-muted-foreground size-4" />
                  ) : (
                    <EyeIcon className="text-muted-foreground size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            {field === "newPassword" && (
              <PasswordRuleList validation={validation} colorMode={colorMode} />
            )}
          </Field>
        ))}
      </div>
    </div>
  );
}