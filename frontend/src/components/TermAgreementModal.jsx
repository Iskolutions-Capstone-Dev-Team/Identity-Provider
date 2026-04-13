import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { buildLogoutPath } from "../auth/utils/logoutRoute";
import { getModalTheme } from "./modalTheme";

export default function TermsAgreementModal({ open, onClose, onContinue, colorMode = "light", currentUser = null }) {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const isDarkMode = colorMode === "dark";
  const {
    modalBodyClassName,
    modalBodyStackClassName,
    modalBoxClassName,
    modalFooterActionsClassName,
    modalFooterClassName,
    modalHeaderClassName,
    modalHeaderTitleClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);
  const contentSectionClassName = `${modalSectionClassName} space-y-4`;
  const continueButtonClassName = `${modalPrimaryButtonClassName} disabled:cursor-not-allowed ${
    isDarkMode
      ? "disabled:border-white/10 disabled:bg-white/10 disabled:text-[#d6c3c7] disabled:hover:border-white/10 disabled:hover:bg-white/10"
      : "disabled:border-[#7b0d15]/40 disabled:bg-[#7b0d15]/40 disabled:text-white/85 disabled:hover:border-[#7b0d15]/40 disabled:hover:bg-[#7b0d15]/40"
  }`;
  const descriptionTextClassName = isDarkMode
    ? "text-sm leading-7 text-[#d6c3c7] sm:text-[0.95rem]"
    : "text-sm leading-7 text-[#5d3a41] sm:text-[0.95rem]";
  const emphasisTextClassName = isDarkMode
    ? "font-semibold text-[#f4eaea]"
    : "font-semibold text-[#4a1921]";
  const linkClassName = isDarkMode
    ? "font-semibold text-[#ffe28a] underline decoration-[#f8d24e]/50 underline-offset-4 transition hover:text-[#fff1ba]"
    : "font-semibold text-[#7b0d15] underline decoration-[#d4a017]/65 underline-offset-4 transition hover:text-[#5a0b12]";
  const agreementSectionClassName = isDarkMode
    ? "rounded-[1.5rem] border border-[#f8d24e]/20 bg-[linear-gradient(135deg,rgba(248,210,78,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)]"
    : "rounded-[1.5rem] border border-[#d4a017]/20 bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(255,244,220,0.9))] p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.45)]";
  const checkboxClassName = isDarkMode
    ? "checkbox mt-0.5 h-5 w-5 shrink-0 rounded-md border-white/15 bg-white/[0.04] checked:border-[#f8d24e] checked:bg-[#7b0d15] checked:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f8d24e]/20"
    : "checkbox mt-0.5 h-5 w-5 shrink-0 rounded-md border-[#7b0d15]/20 bg-white checked:border-[#7b0d15] checked:bg-[#7b0d15] checked:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f8d24e]/30";
  const agreementTextClassName = isDarkMode
    ? "text-sm leading-7 text-[#f4eaea] sm:text-[0.95rem]"
    : "text-sm leading-7 text-[#4a1921] sm:text-[0.95rem]";
  const headerGlowClassName = isDarkMode ? "bg-white/10" : "bg-white/10";

  useEffect(() => {
    if (open) {
      setAgreed(false);
    }
  }, [open]);

  const handleCancel = () => {
    onClose?.();
    navigate(
      buildLogoutPath({
        userId: currentUser?.id,
      }),
      { replace: true },
    );
  };

  const handleContinue = () => {
    if (!agreed) {
      return;
    }

    onContinue?.();
    onClose?.();
  };

  if (!open) {
    return null;
  }

  return createPortal(
    <dialog open className={modalOverlayClassName} aria-labelledby="terms-modal-title">
      <div className={`${modalBoxClassName} max-w-2xl`}>
        <div className={`${modalHeaderClassName} !pb-7 sm:!pb-8`}>
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-10 top-[-2.5rem] h-32 w-32 rounded-full bg-[#f8d24e]/20 blur-3xl" />
            <div className={`absolute left-[-3rem] bottom-[-2rem] h-28 w-28 rounded-full blur-3xl ${headerGlowClassName}`} />
          </div>

          <div className="relative max-w-2xl">
            <h3 id="terms-modal-title" className={modalHeaderTitleClassName}>
              Terms and Conditions
            </h3>
          </div>
        </div>

        <div className={modalBodyClassName}>
          <div className={modalBodyStackClassName}>
            <section className={contentSectionClassName}>
              <p className={descriptionTextClassName}>
                By clicking <span className={emphasisTextClassName}>"I Agree"</span>, you consent to the collection, use, and{" "}
                processing of your personal data for legitimate purposes related to this service.
              </p>

              <p className={descriptionTextClassName}>
                Your information will be handled in accordance with our{" "}
                <a href="https://www.pup.edu.ph/privacy/" className={linkClassName} target="_blank" rel="noreferrer">
                  Privacy Policy
                </a>{" "}
                and in compliance with the <span className={emphasisTextClassName}>Data Privacy Act of 2012</span>.
              </p>
            </section>

            <section className={agreementSectionClassName}>
              <label className="flex items-start gap-3 sm:gap-4">
                <input type="checkbox" className={checkboxClassName} checked={agreed} onChange={(event) => setAgreed(event.target.checked)}/>

                <span className={agreementTextClassName}>
                  I Agree and acknowledge the{" "}
                  <a href="https://www.pup.edu.ph/terms/" className={linkClassName} target="_blank" rel="noreferrer">
                    Terms and Conditions
                  </a>
                </span>
              </label>
            </section>
          </div>
        </div>

        <div className={modalFooterClassName}>
          <div className={modalFooterActionsClassName}>
            <button type="button" onClick={handleCancel} className={modalSecondaryButtonClassName}>
              Cancel
            </button>

            <button type="button" onClick={handleContinue} disabled={!agreed} className={continueButtonClassName}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}