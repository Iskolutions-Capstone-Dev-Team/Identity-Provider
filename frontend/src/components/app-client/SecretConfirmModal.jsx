import { createPortal } from "react-dom";
import { getModalTheme } from "../modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../modalTransition";

export default function SecretConfirmModal({ open, message = "Generate a new client secret?", onCancel, onConfirm, colorMode = "light" }) {
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

  if (!shouldRender) return null;

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <form method="dialog" className={`${modalBoxClassName} max-w-lg text-center`}>
        <div className="px-6 py-8 sm:px-8">
          <div className="mb-6 flex justify-center">
            <div className={iconWrapClassName}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white">
                <path fillRule="evenodd" d="M15.75 1.5a6.75 6.75 0 0 0-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 0 0-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 0 0 .75-.75v-1.5h1.5A.75.75 0 0 0 9 19.5V18h1.5a.75.75 0 0 0 .53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1 0 15.75 1.5Zm0 3a.75.75 0 0 0 0 1.5A2.25 2.25 0 0 1 18 8.25a.75.75 0 0 0 1.5 0 3.75 3.75 0 0 0-3.75-3.75Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <h3 className={titleClassName}>
            {message}
          </h3>
          <p className={descriptionClassName}>
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