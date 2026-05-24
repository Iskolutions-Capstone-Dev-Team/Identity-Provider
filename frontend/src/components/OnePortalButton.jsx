import { buildLoginPath } from "../auth/utils/loginRoute";

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
    const loginPath = buildLoginPath(ONE_PORTAL_CLIENT_ID, {
      redirectUri: getOnePortalRedirectUri(),
    });
    const loginUrl =
      typeof window === "undefined"
        ? loginPath
        : `${window.location.origin}${loginPath}`;

    window.location.href = loginUrl;
  };

  return (
    <button type="button" aria-label="One Portal" title="One Portal" className={className} onClick={handleClick}>
      <img src="/assets/images/PUP_Logo.png" alt="" aria-hidden="true" className="h-14 w-14 rounded-full p-1 object-contain"/>
    </button>
  );
}