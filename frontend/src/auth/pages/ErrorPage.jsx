import { useNavigate } from "react-router-dom";
import { clearIdpErrorMessage, clearIdpErrorReturnPath, getIdpErrorMessage, getIdpErrorReturnPath } from "../utils/idpErrorPage";
import { userService } from "../../services/userService";
import { resolveUserIsAdmin } from "../../utils/userPoolAccess";

const DEFAULT_ERROR_RETURN_PATH = "/profile";
const URL_PARSE_FALLBACK_ORIGIN = "https://idp.invalid";
const ADMIN_ONLY_PATHS = new Set([
  "/user-pool",
  "/roles",
  "/app-client",
  "/audit-logs",
  "/notifications",
]);

function getPathname(path = "") {
  if (typeof path !== "string") {
    return "";
  }

  const normalizedPath = path.trim();

  if (!normalizedPath) {
    return "";
  }

  try {
    return new URL(
      normalizedPath,
      typeof window === "undefined"
        ? URL_PARSE_FALLBACK_ORIGIN
        : window.location.origin,
    ).pathname;
  } catch {
    return normalizedPath.split(/[?#]/, 1)[0] || "";
  }
}

function resolveSafeReturnPath(path = "", currentUser = {}) {
  const normalizedPath = typeof path === "string" ? path.trim() : "";
  const pathname = getPathname(normalizedPath);

  if (!normalizedPath || !pathname) {
    return DEFAULT_ERROR_RETURN_PATH;
  }

  if (!ADMIN_ONLY_PATHS.has(pathname)) {
    return normalizedPath;
  }

  return resolveUserIsAdmin(currentUser)
    ? normalizedPath
    : DEFAULT_ERROR_RETURN_PATH;
}

export default function ErrorPage() {
  const navigate = useNavigate();
  const errorMessage = getIdpErrorMessage();

  const handleGoBack = async () => {
    const returnPath = getIdpErrorReturnPath();

    clearIdpErrorMessage();
    clearIdpErrorReturnPath();

    try {
      const currentUser = await userService.getMe();
      navigate(resolveSafeReturnPath(returnPath, currentUser), {
        replace: true,
      });
    } catch {
      navigate(DEFAULT_ERROR_RETURN_PATH, { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#250508] font-[Poppins] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}/>
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b0307]/90 via-[#7b0d15]/80 to-[#180204]/90" />
        <div className="absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full bg-[#f8d24e]/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="w-28 sm:w-32 float-logo"/>
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/75 sm:text-sm">
          {errorMessage}
        </p>
        <button onClick={handleGoBack} className="btn btn-lg mt-6 rounded-xl border-[#ffd700] bg-[#ffd700] font-bold text-[#991b1b] transition-all hover:border-[#ffd700] hover:bg-white hover:text-[#991b1b]">
          Go Back
        </button>
      </div>
    </div>
  );
}
