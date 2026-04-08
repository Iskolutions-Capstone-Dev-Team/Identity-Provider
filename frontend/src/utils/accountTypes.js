export const ACCOUNT_TYPE_OPTIONS = Object.freeze([
  { id: "admin", label: "Admin", backendId: 1 },
  { id: "applicant", label: "Applicant", backendId: 4 },
  { id: "faculty", label: "Faculty", backendId: 2 },
  { id: "guest", label: "Guest", backendId: 5 },
  { id: "student", label: "Student", backendId: 3 },
]);

const ACCOUNT_TYPE_LABELS = new Map(
  ACCOUNT_TYPE_OPTIONS.map((option) => [option.id, option.label]),
);
const ACCOUNT_TYPE_VALUES = new Set(ACCOUNT_TYPE_LABELS.keys());
const ACCOUNT_TYPE_OPTIONS_BY_ID = new Map(
  ACCOUNT_TYPE_OPTIONS.map((option) => [option.id, option]),
);

function normalizeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeAccountType(value) {
  const normalizedValue = normalizeText(value);

  return ACCOUNT_TYPE_VALUES.has(normalizedValue) ? normalizedValue : "";
}

export function getAccountTypeOption(value) {
  const normalizedValue = normalizeAccountType(value);
  return ACCOUNT_TYPE_OPTIONS_BY_ID.get(normalizedValue) || null;
}

export function getAccountTypeLabel(value) {
  return getAccountTypeOption(value)?.label || "";
}

export function getAccountTypeBackendId(value) {
  return getAccountTypeOption(value)?.backendId ?? null;
}