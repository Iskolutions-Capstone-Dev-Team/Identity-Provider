import { createPortal } from "react-dom";
import { getModalTheme } from "../modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../modalTransition";

export default function RegistrationSyncConfirmModal({ open, accountTypeLabel = "this", isSubmitting = false, onCancel, onConfirm, colorMode = "light" }) {
  const { shouldRender, isClosing } = useModalTransition(open);
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

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <form method="dialog" className={`${modalBoxClassName} max-w-lg text-center`}>
        <div className="px-6 py-8 sm:px-8">
          <div className="mb-6 flex justify-center">
            <div className={iconWrapClassName}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <h3 className={titleClassName}>
            Update users for {accountTypeLabel}?
          </h3>
          <p className={descriptionClassName}>
            You edited the registration config for {accountTypeLabel}. Do you want to update all users with the {accountTypeLabel} account type?
          </p>
        </div>

        <div className={modalFooterClassName}>
          <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row sm:justify-center">
            <button type="button" className={modalSecondaryButtonClassName} onClick={onCancel} disabled={isSubmitting}>
              No
            </button>
            <button type="button" className={modalPrimaryButtonClassName} onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Syncing..." : "Yes"}
            </button>
          </div>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}