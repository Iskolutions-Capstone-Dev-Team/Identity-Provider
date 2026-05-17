import { useCallback, useEffect, useState } from "react";
import DeleteConfirmModal from "../DeleteConfirmModal";
import ErrorAlert from "../ErrorAlert";
import SuccessAlert from "../SuccessAlert";
import { mfaService } from "../../services/mfaService";
import { formatTimestamp } from "../../utils/formatTimestamp";

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

function formatDate(value) {
  if (!value) {
    return "Never";
  }

  const timestamp = formatTimestamp(value);

  return timestamp === "NaN-NaN-NaN NaN:NaN:NaN" ? "Unavailable" : timestamp;
}

function AuthenticatorIcon({ colorMode }) {
  const isDarkMode = colorMode === "dark";

  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
        isDarkMode
          ? "border border-[#f8d24e]/20 bg-[#f8d24e]/10 text-[#ffe28a]"
          : "border border-[#7b0d15]/10 bg-[#fff4dc] text-[#7b0d15]"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M12 3.75 5.25 6.75v5.063c0 3.902 2.527 7.356 6.25 8.438 3.723-1.082 6.25-4.536 6.25-8.438V6.75L12 3.75Z" />
      </svg>
    </div>
  );
}

export default function AuthenticatorsPanel({ email = "", colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const [authenticators, setAuthenticators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [authenticatorToDelete, setAuthenticatorToDelete] = useState(null);

  const loadAuthenticators = useCallback(async () => {
    if (!email) {
      setAuthenticators([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const list = await mfaService.getAuthenticators(email);
      setAuthenticators(list);
    } catch (loadError) {
      setError(
        getRequestErrorMessage(
          loadError,
          "Unable to load authenticator apps.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  useEffect(() => {
    loadAuthenticators();
  }, [loadAuthenticators]);

  const handleDeleteAuthenticator = async () => {
    if (!authenticatorToDelete?.id) {
      return;
    }

    try {
      await mfaService.deleteAuthenticator({
        email,
        id: authenticatorToDelete.id,
      });
      setAuthenticatorToDelete(null);
      setSuccessMessage("Authenticator removed successfully.");
      await loadAuthenticators();
    } catch (deleteError) {
      setError(
        getRequestErrorMessage(
          deleteError,
          "Unable to remove this authenticator.",
        ),
      );
    }
  };

  const wrapperClassName = isDarkMode
    ? "relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(33,21,30,0.92))] p-5 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)] sm:p-6"
    : "relative overflow-hidden rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/80 p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)] sm:p-6";
  const headingClassName = isDarkMode
    ? "text-xl font-semibold text-[#f4eaea]"
    : "text-xl font-semibold text-[#351018]";
  const bodyTextClassName = isDarkMode
    ? "text-sm text-[#c7adb4]"
    : "text-sm text-[#7b5560]";
  const emptyClassName = isDarkMode
    ? "rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,248,243,0.025))] px-4 py-5 text-center text-sm text-[#c7adb4]"
    : "rounded-2xl border border-[#7b0d15]/10 bg-[#fffaf2] px-4 py-5 text-center text-sm text-[#7b5560]";

  return (
    <>
      <section className={wrapperClassName}>
        <div className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className={headingClassName}>Authenticator Apps</h3>
              <p className={`mt-1 ${bodyTextClassName}`}>
                Manage the authenticator apps connected to your account.
              </p>
            </div>
            <button type="button" onClick={loadAuthenticators} disabled={isLoading}
              className={`btn h-10 rounded-xl px-4 text-sm shadow-none ${
                isDarkMode
                  ? "border border-white/12 bg-[rgba(255,248,243,0.05)] text-[#f4eaea] hover:border-[#f8d24e]/45 hover:bg-[#f8d24e]/12"
                  : "border border-[#7b0d15]/15 bg-white text-[#7b0d15] hover:border-[#f8d24e]/70 hover:bg-[#fff4dc]"
              }`}
            >
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <ErrorAlert message={error} onClose={() => setError("")} />

          {isLoading ? (
            <div className="grid gap-3">
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className={`h-24 animate-pulse rounded-2xl ${
                    isDarkMode
                      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,248,243,0.025))]"
                      : "bg-slate-200/40"
                  }`}
                />
              ))}
            </div>
          ) : authenticators.length === 0 ? (
            <div className={emptyClassName}>
              No authenticator apps are connected yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {authenticators.map((authenticator) => (
                <article
                  key={authenticator.id}
                  className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    isDarkMode
                      ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,248,243,0.025))]"
                      : "border-[#7b0d15]/10 bg-white/75"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <AuthenticatorIcon colorMode={colorMode} />
                    <div className="min-w-0">
                      <h4 className={`break-words text-base font-semibold ${
                          isDarkMode ? "text-[#f4eaea]" : "text-[#351018]"
                        }`}
                      >
                        {authenticator.name || "Authenticator app"}
                      </h4>
                      <p className={`mt-1 text-sm ${bodyTextClassName}`}>
                        Type: {authenticator.type || "TOTP"}
                      </p>
                      <p className={`mt-1 text-xs ${bodyTextClassName}`}>
                        Added {formatDate(authenticator.created_at)} | Last used {formatDate(authenticator.last_used_at)}
                      </p>
                    </div>
                  </div>

                  <button type="button" onClick={() => setAuthenticatorToDelete(authenticator)} aria-label={`Delete ${authenticator.name || "authenticator app"}`} title="Delete authenticator" className="btn h-10 w-10 rounded-xl border border-red-400/30 bg-red-500/10 p-0 text-red-500 shadow-none transition hover:border-red-500/60 hover:bg-red-500/15 hover:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <DeleteConfirmModal
        open={Boolean(authenticatorToDelete)}
        message={`Delete ${authenticatorToDelete?.name || "this authenticator"}?`}
        onCancel={() => setAuthenticatorToDelete(null)}
        onConfirm={handleDeleteAuthenticator}
        theme="glass"
        colorMode={colorMode}
      />
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </>
  );
}