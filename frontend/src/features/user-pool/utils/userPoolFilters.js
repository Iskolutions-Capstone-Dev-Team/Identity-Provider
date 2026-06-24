import { normalizeClientIds } from "./userPoolMappers";

export function matchesUserSearch(user, searchValue) {
  const normalizedSearch =
    typeof searchValue === "string" ? searchValue.trim().toLowerCase() : "";

  if (!normalizedSearch) {
    return true;
  }

  const fullName = [user.givenName, user.middleName, user.surname, user.suffix]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    user.displayName?.toLowerCase().includes(normalizedSearch) ||
    user.email?.toLowerCase().includes(normalizedSearch) ||
    fullName.includes(normalizedSearch)
  );
}

export function userHasVisibleClient(user = {}, visibleClientLookup) {
  if (!(visibleClientLookup instanceof Set) || visibleClientLookup.size === 0) {
    return true;
  }

  const accessibleClientIds = normalizeClientIds(user?.accessibleClientIds);

  if (accessibleClientIds.length === 0) {
    return false;
  }

  return accessibleClientIds.some((clientId) => visibleClientLookup.has(clientId));
}
