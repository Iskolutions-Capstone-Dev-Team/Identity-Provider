export function getUserLabel(user) {
  return user?.displayName || user?.email || "User";
}
