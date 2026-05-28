import { buildClientAuthorizeUrl, clearAuthorizeAttempt } from "../auth/utils/authorizeFlow";

const ONE_PORTAL_CLIENT_ID = import.meta.env.VITE_ONE_PORTAL_CLIENT_ID ?? "";
const ONE_PORTAL_URL = import.meta.env.VITE_ONE_PORTAL_URL ?? "";

function getOnePortalRedirectUri() {
  if (!ONE_PORTAL_URL) {
    return "";
  }

  try {
    return new URL("/callback", ONE_PORTAL_URL).toString();
  } catch {
    return "";
  }
}

export default function OnePortalButton({ className = "" }) {
  const handleClick = () => {
    const authorizeUrl = buildClientAuthorizeUrl(
      ONE_PORTAL_CLIENT_ID,
      getOnePortalRedirectUri(),
    );

    if (authorizeUrl) {
      clearAuthorizeAttempt();
      window.location.replace(authorizeUrl);
      return;
    }

    console.error(
      "Unable to authorize One Portal. Check VITE_ONE_PORTAL_CLIENT_ID and VITE_ONE_PORTAL_URL.",
    );
  };

  return (
    <button type="button" aria-label="One Portal" title="One Portal" className={className} onClick={handleClick}>
      <img src="/assets/images/PUP_Logo.png" alt="" aria-hidden="true" className="h-14 w-14 rounded-full p-1 object-contain"/>
    </button>
  );
}