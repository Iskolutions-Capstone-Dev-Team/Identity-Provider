import { createPortal } from "react-dom";
import {
  modalBoxClassName,
  modalFooterClassName,
  modalOverlayClassName,
  modalPrimaryButtonClassName,
  modalSecondaryButtonClassName,
} from "../modalTheme";

export default function SecretConfirmModal({ open, message = "Generate a new client secret?", onCancel, onConfirm }) {
  if (!open) return null;

  return createPortal(
    <dialog open className={modalOverlayClassName}>
      <form method="dialog" className={`${modalBoxClassName} max-w-lg text-center`}>
        <div className="px-6 py-8 sm:px-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#f8d24e]/30 bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.22),transparent_45%),linear-gradient(135deg,#7b0d15_0%,#3d0910_58%,#1f0205_100%)] shadow-[0_24px_50px_-28px_rgba(43,3,7,0.72)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            </div>
          </div>

          <h3 className="text-2xl font-semibold tracking-tight text-[#7b0d15]">
            {message}
          </h3>
          <p className="mt-2 text-sm text-[#7d5c62]">
            Your existing secret will be replaced.
          </p>
        </div>

        <div className={modalFooterClassName}>
          <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row sm:justify-center">
            <button type="button" className={modalSecondaryButtonClassName} onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className={modalPrimaryButtonClassName} onClick={onConfirm}>
              Generate
            </button>
          </div>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}