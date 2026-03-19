import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
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
} from "./modalTheme";

const contentSectionClassName = `${modalSectionClassName} space-y-4`;
const continueButtonClassName =
  `${modalPrimaryButtonClassName} disabled:cursor-not-allowed disabled:border-[#7b0d15]/40 disabled:bg-[#7b0d15]/40 disabled:text-white/85 disabled:hover:border-[#7b0d15]/40 disabled:hover:bg-[#7b0d15]/40`;

export default function TermsAgreementModal({ open, onClose, onContinue }) {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (open) {
      setAgreed(false);
    }
  }, [open]);

  const handleCancel = () => {
    onClose?.();
    navigate("/logout", { replace: true });
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
            <div className="absolute left-[-3rem] bottom-[-2rem] h-28 w-28 rounded-full bg-white/10 blur-3xl" />
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
              <p className="text-sm leading-7 text-[#5d3a41] sm:text-[0.95rem]">
                By clicking <span className="font-semibold text-[#4a1921]">"I Agree"</span>, you consent to the collection, use, and
                processing of your personal data for legitimate purposes related to this service.
              </p>

              <p className="text-sm leading-7 text-[#5d3a41] sm:text-[0.95rem]">
                Your information will be handled in accordance with our{" "}
                <a href="https://www.pup.edu.ph/privacy/" className="font-semibold text-[#7b0d15] underline decoration-[#d4a017]/65 underline-offset-4 transition hover:text-[#5a0b12]" target="_blank" rel="noreferrer">
                  Privacy Policy
                </a>{" "}
                and in compliance with the <span className="font-semibold text-[#4a1921]">Data Privacy Act of 2012</span>.
              </p>
            </section>

            <section className="rounded-[1.5rem] border border-[#d4a017]/20 bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(255,244,220,0.9))] p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.45)]">
              <label className="flex items-start gap-3 sm:gap-4">
                <input type="checkbox" className="checkbox mt-0.5 h-5 w-5 shrink-0 rounded-md border-[#7b0d15]/20 bg-white checked:border-[#7b0d15] checked:bg-[#7b0d15] checked:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f8d24e]/30" checked={agreed} onChange={(event) => setAgreed(event.target.checked)}/>

                <span className="text-sm leading-7 text-[#4a1921] sm:text-[0.95rem]">
                  I Agree and acknowledge the{" "}
                  <a href="https://www.pup.edu.ph/terms/" className="font-semibold text-[#7b0d15] underline decoration-[#d4a017]/65 underline-offset-4 transition hover:text-[#5a0b12]" target="_blank" rel="noreferrer">
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