import { buildClientAuthorizeUrl, clearAuthorizeAttempt } from "../auth/utils/authorizeFlow";

const ONE_PORTAL_CLIENT_ID =
  import.meta.env.VITE_ONE_PORTAL_CLIENT_ID ??
  "65b491cd-6d28-404b-85ce-a45ecd4bade0";
const ONE_PORTAL_URL = import.meta.env.VITE_ONE_PORTAL_URL ?? "";
const ONE_PORTAL_REDIRECT_URI = import.meta.env.VITE_ONE_PORTAL_REDIRECT_URI ?? "";

function getOnePortalRedirectUri() {
  if (ONE_PORTAL_REDIRECT_URI) {
    return ONE_PORTAL_REDIRECT_URI;
  }

  if (!ONE_PORTAL_URL) {
    return "";
  }

  try {
    return `${new URL(ONE_PORTAL_URL).origin}/callback`;
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

    if (!authorizeUrl) {
      return;
    }

    clearAuthorizeAttempt();
    window.location.replace(authorizeUrl);
  };

  return (
    <button type="button" aria-label="One Portal" title="One Portal" className={className} onClick={handleClick}>
      <img src="/assets/images/PUP_Logo.png" alt="" aria-hidden="true" className="h-14 w-14 rounded-full p-1 object-contain"/>
    </button>
  );
}