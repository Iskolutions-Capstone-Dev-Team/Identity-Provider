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
    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] sm:h-16 sm:w-16 ${
        isDarkMode
          ? "border border-[#f8d24e]/35 bg-[#f8d24e]/10 text-[#ffe28a] shadow-[0_18px_44px_-34px_rgba(248,210,78,0.8)]"
          : "border border-[#f8d24e]/45 bg-[#fff4dc] text-[#7b0d15] shadow-[0_18px_44px_-34px_rgba(123,13,21,0.45)]"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-7 w-7 sm:h-8 sm:w-8">
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
  const cardClassName = isDarkMode
    ? "relative min-h-[13.5rem] overflow-hidden rounded-[1.25rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,248,243,0.025))] p-4 shadow-[0_18px_42px_-34px_rgba(2,6,23,0.85)] sm:max-w-[18rem]"
    : "relative min-h-[13.5rem] overflow-hidden rounded-[1.25rem] border border-[#7b0d15]/12 bg-white/78 p-4 shadow-[0_18px_42px_-34px_rgba(43,3,7,0.55)] sm:max-w-[18rem]";
  const cardTitleClassName = isDarkMode
    ? "break-words text-base font-bold text-[#f4eaea]"
    : "break-words text-base font-bold text-[#351018]";
  const cardTypeClassName = isDarkMode
    ? "mt-1 text-sm font-semibold text-[#c7adb4]"
    : "mt-1 text-sm font-semibold text-[#7b5560]";
  const metadataClassName = isDarkMode
    ? "border-t border-white/10 pt-3 text-xs font-semibold leading-6 text-[#c7adb4]"
    : "border-t border-[#7b0d15]/10 pt-3 text-xs font-semibold leading-6 text-[#7b5560]";
  const deleteButtonClassName =
    "btn absolute right-4 top-4 h-10 w-10 rounded-[0.9rem] border border-red-400/45 bg-red-500/10 p-0 text-red-500 shadow-none transition hover:border-red-500/70 hover:bg-red-500/15 hover:text-red-400";

  return (
    <>
      <section className={wrapperClassName}>
        <div className="space-y-5">
          <div>
            <div>
              <h3 className={headingClassName}>Authenticator Apps</h3>
              <p className={`mt-1 ${bodyTextClassName}`}>
                Manage the authenticator apps connected to your account.
              </p>
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError("")} />

          {isLoading ? (
            <div className="grid gap-3">
              {[0, 1].map((item) => (
                <div key={item}
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
            <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(15rem,18rem))]">
              {authenticators.map((authenticator) => (
                <article key={authenticator.id} className={cardClassName}>
                  <div className="flex min-w-0 flex-col gap-4">
                    <AuthenticatorIcon colorMode={colorMode} />

                    <div className="min-w-0 pr-10">
                      <h4 className={cardTitleClassName}>
                        {authenticator.name || "Authenticator app"}
                      </h4>
                      <p className={cardTypeClassName}>
                        Type: {authenticator.type || "TOTP"}
                      </p>
                    </div>

                    <div className={metadataClassName}>
                      <p>Added: {formatDate(authenticator.created_at)}</p>
                      <p>Last used: {formatDate(authenticator.last_used_at)}</p>
                    </div>
                  </div>

                  <button type="button" onClick={() => setAuthenticatorToDelete(authenticator)} aria-label={`Delete ${authenticator.name || "authenticator app"}`} title="Delete authenticator" className={deleteButtonClassName}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="size-5">
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