import { createPortal } from "react-dom";
import { getModalTheme } from "../modalTheme";

export default function InvitationConfirmModal({ open, accountTypeLabel = "selected", onCancel, onConfirm, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const {
    modalBoxClassName,
    modalFooterClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalSecondaryButtonClassName,
  } = getModalTheme(colorMode);
  const iconWrapClassName = isDarkMode
    ? "flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#f8d24e]/25 bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.16),transparent_45%),linear-gradient(135deg,#7b0d15_0%,#263345_60%,#1a121c_100%)] shadow-[0_24px_50px_-28px_rgba(2,6,23,0.8)]"
    : "flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#f8d24e]/30 bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.22),transparent_45%),linear-gradient(135deg,#7b0d15_0%,#3d0910_58%,#1f0205_100%)] shadow-[0_24px_50px_-28px_rgba(43,3,7,0.72)]";
  const titleClassName = isDarkMode
    ? "text-2xl font-semibold tracking-tight text-[#f7dadd]"
    : "text-2xl font-semibold tracking-tight text-[#7b0d15]";
  const descriptionClassName = isDarkMode
    ? "mt-2 text-sm text-[#c7adb4]"
    : "mt-2 text-sm text-[#7d5c62]";

  if (!open) {
    return null;
  }

  return createPortal(
    <dialog open className={modalOverlayClassName}>
      <form method="dialog" className={`${modalBoxClassName} max-w-lg text-center`}>
        <div className="px-6 py-8 sm:px-8">
          <div className="mb-6 flex justify-center">
            <div className={iconWrapClassName}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white">
                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
              </svg>
            </div>
          </div>

          <h3 className={titleClassName}>
            Send Invitation?
          </h3>
          <p className={descriptionClassName}>
            This will create the user and send an invitation for a {accountTypeLabel.toLowerCase()} account.
          </p>
        </div>

        <div className={modalFooterClassName}>
          <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row sm:justify-center">
            <button type="button" className={modalSecondaryButtonClassName} onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className={modalPrimaryButtonClassName} onClick={onConfirm}>
              Send Invitation
            </button>
          </div>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}