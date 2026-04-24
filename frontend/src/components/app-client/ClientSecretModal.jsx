import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getModalTheme } from "../modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../modalTransition";

export default function ClientSecretModal({ open, clientName, clientId, secret, loading = false, hasError = false, onClose, colorMode = "light" }) {
  const { shouldRender, isClosing } = useModalTransition(open);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const isDarkMode = colorMode === "dark";
  const {
    modalBodyClassName,
    modalBodyStackClassName,
    modalBoxClassName,
    modalFooterActionsClassName,
    modalFooterClassName,
    modalHeaderClassName,
    modalHeaderDescriptionClassName,
    modalHeaderTitleClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalReadOnlyInputClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);
  const displayNameClassName = isDarkMode ? "font-semibold text-[#ffe28a]" : "font-semibold text-white";
  const loadingTextClassName = isDarkMode
    ? "flex items-center gap-3 text-sm text-[#d6c3c7]"
    : "flex items-center gap-3 text-sm text-[#5d3a41]";
  const loadingSpinnerClassName = isDarkMode
    ? "loading loading-spinner loading-sm text-[#f8d24e]"
    : "loading loading-spinner loading-sm text-[#7b0d15]";
  const errorTextClassName = isDarkMode
    ? "text-sm text-rose-300"
    : "text-sm text-red-600";
  const noteClassName = isDarkMode
    ? "rounded-[1.5rem] border border-[#f8d24e]/28 bg-[linear-gradient(135deg,rgba(123,13,21,0.26),rgba(248,210,78,0.08))] px-5 py-4 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)]"
    : "rounded-[1.5rem] border border-[#d4a017]/35 bg-[#ffd700] px-5 py-4 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.45)]";
  const noteTextClassName = isDarkMode
    ? "text-sm font-medium text-[#f8e5a3]"
    : "text-sm font-medium text-[#5a0b12]";
  const visibilityButtonClassName = isDarkMode
    ? "absolute right-4 top-1/2 -translate-y-1/2 text-[#a58d95] transition hover:text-[#f8d24e] disabled:cursor-not-allowed disabled:text-[#6f6168]"
    : "absolute right-4 top-1/2 -translate-y-1/2 text-[#8f6f76] transition hover:text-[#5a0b12] disabled:cursor-not-allowed disabled:text-[#c8afb4]";
  const copyButtonClassName = isDarkMode
    ? "btn h-12 w-12 rounded-[1rem] border border-white/12 bg-white/[0.04] px-0 text-[#f4eaea] shadow-none transition hover:border-[#f8d24e]/45 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]"
    : "btn h-12 w-12 rounded-[1rem] border border-[#7b0d15]/15 bg-white/85 px-0 text-[#7b0d15] shadow-none transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";

  useEffect(() => {
    if (!shouldRender) {
      setCopied(false);
      setShowSecret(false);
    }
  }, [shouldRender]);

  const handleCopy = async () => {
    if (!secret) return;

    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // no-op
    }
  };

  if (!shouldRender) return null;

  const displayName = clientName || clientId || "this client";

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderClassName}>
          <div className="max-w-2xl pb-5 sm:pb-10">
            <h3 className={modalHeaderTitleClassName}>Client Secret</h3>
            <p className={modalHeaderDescriptionClassName}>
              Here is the client secret for{" "}
              <span className={displayNameClassName}>{displayName}</span>.
            </p>
          </div>
        </div>

        <div className={modalBodyClassName}>
          <div className={modalBodyStackClassName}>
            {loading && (
              <section className={modalSectionClassName}>
                <div className={loadingTextClassName}>
                  <span className={loadingSpinnerClassName} aria-hidden="true" />
                  <span>Rotating secret. Please wait...</span>
                </div>
              </section>
            )}

            {!loading && hasError && (
              <section className={modalSectionClassName}>
                <p className={errorTextClassName}>Request failed, try again later.</p>
              </section>
            )}

            {!loading && !hasError && (
              <>
                <section className={noteClassName}>
                  <p className={noteTextClassName}>
                    <span className="font-bold">Note:</span> This secret is shown{" "}
                    <span className="font-bold">one time only</span>. If it is lost, generate a new one.
                  </p>
                </section>

                <section className={modalSectionClassName}>
                  <div className="flex gap-3">
                    <div className="relative grow">
                      <input type={showSecret ? "text" : "password"} readOnly value={secret || ""} className={`${modalReadOnlyInputClassName} w-full pr-12 font-mono`}/>
                      <button type="button" className={visibilityButtonClassName} onClick={() => setShowSecret((current) => !current)} disabled={!secret} aria-label={showSecret ? "Hide secret" : "Show secret"} title={showSecret ? "Hide secret" : "Show secret"}>
                        {showSecret ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 102.828 2.828M9.88 4.24A9.956 9.956 0 0112 4c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.132 5.411M6.228 6.228C4.024 7.515 2.458 9.56 1.5 12c1.274 4.057 5.064 7 9.542 7a9.96 9.96 0 005.227-1.472"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <button type="button" className={copyButtonClassName} onClick={handleCopy} disabled={!secret}>
                      <span className="relative inline-flex h-6 w-6 items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                          className={`absolute size-6 transition-all duration-300 ease-out ${
                            copied ? "opacity-0 scale-75 -rotate-12" : "opacity-100 scale-100 rotate-0"
                          }`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                          className={`absolute size-6 transition-all duration-300 ease-out ${
                            copied ? "opacity-100 scale-100 rotate-0 text-emerald-600" : "opacity-0 scale-75 rotate-12"
                          }`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        <div className={modalFooterClassName}>
          <div className={modalFooterActionsClassName}>
            <button type="button" className={modalPrimaryButtonClassName} onClick={() => onClose?.()}>
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}