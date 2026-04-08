export const ACCOUNT_TYPE_OPTIONS = Object.freeze([
  { id: "admin", label: "Admin" },
  { id: "applicant", label: "Applicant" },
  { id: "faculty", label: "Faculty" },
  { id: "guest", label: "Guest" },
  { id: "student", label: "Student" },
]);

const ACCOUNT_TYPE_LABELS = new Map(
  ACCOUNT_TYPE_OPTIONS.map((option) => [option.id, option.label]),
);
const ACCOUNT_TYPE_VALUES = new Set(ACCOUNT_TYPE_LABELS.keys());

function normalizeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeAccountType(value) {
  const normalizedValue = normalizeText(value);

  return ACCOUNT_TYPE_VALUES.has(normalizedValue) ? normalizedValue : "";
}

export function getAccountTypeLabel(value) {
  const normalizedValue = normalizeAccountType(value);
  return ACCOUNT_TYPE_LABELS.get(normalizedValue) || "";
}