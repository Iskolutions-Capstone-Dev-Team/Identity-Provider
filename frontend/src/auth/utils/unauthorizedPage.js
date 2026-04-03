export const UNAUTHORIZED_PAGE_PATH = "/unauthorized";

export function getOnePortalUrl() {
  return import.meta.env.VITE_ONE_PORTAL_URL?.trim() ?? "";
}