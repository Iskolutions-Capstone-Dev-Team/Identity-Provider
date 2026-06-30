import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AppClientIconBox from "./AppClientIconBox";
import { getModalTheme } from "../../../components/modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../../../components/modalTransition";
import { CloseIcon, CopyIcon, CopySuccessIcon, EyeIcon, EyeSlashIcon, NoteInfoIcon } from "./appClientIcons";

export default function ClientSecretModal({ open, clientName, clientId, secret, loading = false, hasError = false, onClose, colorMode = "light" }) {
  const { shouldRender, isClosing } = useModalTransition(open);
  const [copied, setCopied] = useState(false);
  const [hasCopiedSecret, setHasCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const isDarkMode = colorMode === "dark";
  const {
    modalBodyClassName,
    modalBodyStackClassName,
    modalBoxClassName,
    modalCloseButtonClassName,
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
    ? "rounded-[1.35rem] border border-[#f8d24e]/45 bg-[linear-gradient(135deg,rgba(248,210,78,0.07),rgba(9,14,25,0.76))] px-5 py-4 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)]"
    : "rounded-[1.35rem] border border-[#d4a017]/45 bg-[linear-gradient(135deg,rgba(255,244,220,0.9),rgba(255,255,255,0.92))] px-5 py-4 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.45)]";
  const noteTextClassName = isDarkMode
    ? "flex items-start gap-3 text-sm font-medium text-[#d6c3c7]"
    : "flex items-start gap-3 text-sm font-medium text-[#5d3a41]";
  const noteEmphasisClassName = isDarkMode
    ? "font-bold text-[#ffe28a]"
    : "font-bold text-[#7b0d15]";
  const noteIconClassName = isDarkMode
    ? "mt-0.5 h-5 w-5 shrink-0 text-[#f8d24e]"
    : "mt-0.5 h-5 w-5 shrink-0 text-[#d4a017]";
  const visibilityButtonClassName = isDarkMode
    ? "absolute right-4 top-1/2 -translate-y-1/2 text-[#a58d95] transition hover:text-[#f8d24e] disabled:cursor-not-allowed disabled:text-[#6f6168]"
    : "absolute right-4 top-1/2 -translate-y-1/2 text-[#8f6f76] transition hover:text-[#5a0b12] disabled:cursor-not-allowed disabled:text-[#c8afb4]";
  const copyButtonClassName = isDarkMode
    ? "btn h-12 w-12 rounded-[1rem] border border-white/12 bg-white/[0.04] px-0 text-[#f4eaea] shadow-none transition hover:border-[#f8d24e]/45 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]"
    : "btn h-12 w-12 rounded-[1rem] border border-[#7b0d15]/15 bg-white/85 px-0 text-[#7b0d15] shadow-none transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";
  const modalHeaderSpacingClassName =
    `${modalHeaderClassName} h-[7rem] shrink-0 !px-7 !py-0 sm:!px-8`;
  const canClose = hasCopiedSecret || loading || hasError;
  const closeButtonClassName = hasCopiedSecret || loading || hasError
    ? modalPrimaryButtonClassName
    : isDarkMode
      ? "btn h-12 cursor-not-allowed rounded-[1rem] border border-white/8 bg-white/[0.04] px-6 text-white/35 shadow-none"
      : "btn h-12 cursor-not-allowed rounded-[1rem] border border-[#7b0d15]/8 bg-[#7b0d15]/10 px-6 text-[#7b0d15]/35 shadow-none";

  useEffect(() => {
    if (!shouldRender) {
      setCopied(false);
      setHasCopiedSecret(false);
      setShowSecret(false);
    }
  }, [shouldRender]);

  const handleCopy = async () => {
    if (!secret) return;

    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setHasCopiedSecret(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // no-op
    }
  };

  if (!shouldRender) return null;

  const displayName = clientName || clientId || "this client";
  const lockedCloseTitle = canClose ? undefined : "Copy the secret first";

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderSpacingClassName}>
          <div className="flex h-full items-center justify-between gap-4 sm:gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-4 pr-3 sm:pr-16">
              <AppClientIconBox colorMode={colorMode} variant="plain" />
              <div className="min-w-0">
                <h3 className={modalHeaderTitleClassName}>Client Secret</h3>
                <p className={modalHeaderDescriptionClassName}>
                  Here is the client secret for{" "}
                  <span className={displayNameClassName}>{displayName}</span>.
                </p>
              </div>
            </div>

            <button type="button" className={`${modalCloseButtonClassName} shrink-0 disabled:cursor-not-allowed disabled:opacity-45`}
              onClick={() => {
                if (canClose) {
                  onClose?.();
                }
              }}
              disabled={!canClose}
              title={lockedCloseTitle}
              aria-label="Close client secret modal"
            >
              <CloseIcon />
            </button>
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
                    <NoteInfoIcon className={noteIconClassName} />
                    <span>
                      <span className={noteEmphasisClassName}>Note:</span>{" "}
                      This secret is shown{" "}
                      <span className={noteEmphasisClassName}>one time only</span>.
                      {" "}If it is lost, generate a new one.
                    </span>
                  </p>
                </section>

                <section className={modalSectionClassName}>
                  <div className="flex gap-3">
                    <div className="relative grow">
                      <input type={showSecret ? "text" : "password"} readOnly value={secret || ""} className={`${modalReadOnlyInputClassName} w-full pr-12 font-mono`}/>
                      <button type="button" className={visibilityButtonClassName} onClick={() => setShowSecret((current) => !current)} disabled={!secret} aria-label={showSecret ? "Hide secret" : "Show secret"} title={showSecret ? "Hide secret" : "Show secret"}>
                        {showSecret ? (
                          <EyeSlashIcon />
                        ) : (
                          <EyeIcon />
                        )}
                      </button>
                    </div>
                    <button type="button" className={copyButtonClassName} onClick={handleCopy} disabled={!secret}>
                      <span className="relative inline-flex h-6 w-6 items-center justify-center">
                        <CopyIcon className={`absolute size-6 transition-all duration-300 ease-out ${
                            copied ? "opacity-0 scale-75 -rotate-12" : "opacity-100 scale-100 rotate-0"
                          }`}
                        />
                        <CopySuccessIcon className={`absolute size-6 transition-all duration-300 ease-out ${
                            copied ? "opacity-100 scale-100 rotate-0 text-emerald-600" : "opacity-0 scale-75 rotate-12"
                          }`}
                        />
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
            <button type="button" className={closeButtonClassName}
              onClick={() => {
                if (canClose) {
                  onClose?.();
                }
              }}
              disabled={!canClose}
              title={lockedCloseTitle}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}