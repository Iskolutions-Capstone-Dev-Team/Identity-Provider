import { createPortal } from "react-dom";
import { getModalTheme } from "../../../components/modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../../../components/modalTransition";
import { ResendInviteIcon } from "./userpoolIcons";

function getArticle(label = "") {
  const normalizedLabel = label.trim().toLowerCase();
  return ["a", "e", "i", "o", "u"].includes(normalizedLabel[0]) ? "an" : "a";
}

export default function InvitationConfirmModal({ open, accountTypeLabel = "selected", title = "Send Invitation?", description = "", confirmLabel = "Send Invitation", isSubmitting = false, onCancel, onConfirm, colorMode = "light" }) {
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

  const article = getArticle(accountTypeLabel);

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <form method="dialog" className={`${modalBoxClassName} max-w-lg text-center`}>
        <div className="px-6 py-8 sm:px-8">
          <div className="mb-6 flex justify-center">
            <div className={iconWrapClassName}>
              <ResendInviteIcon className="h-10 w-10 text-white" />
            </div>
          </div>

          <h3 className={titleClassName}>{title}</h3>
          <p className={descriptionClassName}>
            {description ||
              `This will create the user and send an invitation for ${article} ${accountTypeLabel.toLowerCase()} account.`}
          </p>
        </div>

        <div className={modalFooterClassName}>
          <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row sm:justify-center">
            <button type="button" className={modalSecondaryButtonClassName} onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="button" className={modalPrimaryButtonClassName} onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : confirmLabel}
            </button>
          </div>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}