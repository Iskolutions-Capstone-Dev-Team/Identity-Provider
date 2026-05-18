export function getDigits(value) {
  return String(value).replace(/\D/g, "").slice(0, 6);
}