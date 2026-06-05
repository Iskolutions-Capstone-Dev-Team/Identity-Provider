export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMPTY_OTP = ["", "", "", "", "", ""];
export const EMPTY_PASSWORD_FORM = {
  newPassword: "",
  confirmPassword: "",
};
export const OTP_TIMER_SECONDS = 3 * 60;
export const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters" },
  { key: "uppercase", label: "One uppercase letter" },
  { key: "number", label: "One number" },
  { key: "special", label: "One special character" },
];

export function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function getRequestErrorMessage(error, fallbackMessage) {
  const responseMessage = normalizeTextValue(error?.response?.data?.error);
  const errorMessage = normalizeTextValue(error?.message);

  return responseMessage || errorMessage || fallbackMessage;
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

export function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}