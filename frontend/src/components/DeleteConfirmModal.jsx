import { getModalTransitionClassName, useModalTransition } from "./modalTransition";

const defaultDialogClassName = "modal modal-middle";
const glassDialogClassName =
  "modal modal-middle px-3 backdrop:bg-[rgba(43,3,7,0.58)] backdrop:backdrop-blur-sm";

const defaultBoxClassName =
  "modal-box rounded-2xl bg-white text-center";
const glassBoxClassName =
  "modal-box w-full max-w-lg rounded-[2rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,250,244,0.98),rgba(255,255,255,0.96))] font-[Poppins] text-center shadow-[0_36px_90px_-40px_rgba(43,3,7,0.72)]";

const defaultIconWrapClassName =
  "flex h-20 w-20 items-center justify-center rounded-2xl bg-[#991b1b] shadow-lg";
const glassIconWrapClassName =
  "flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#f8d24e]/30 bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.22),transparent_45%),linear-gradient(135deg,#7b0d15_0%,#3d0910_58%,#1f0205_100%)] shadow-[0_24px_50px_-28px_rgba(43,3,7,0.72)]";

const defaultTitleClassName = "text-2xl font-bold text-[#991b1b]";
const glassTitleClassName = "text-2xl font-semibold tracking-tight text-[#7b0d15]";

const defaultDescriptionClassName = "text-sm text-gray-700";
const glassDescriptionClassName = "text-sm text-[#7d5c62]";

const defaultSecondaryButtonClassName =
  "btn btn-outline h-12 rounded-lg border-[#991b1b] text-[#991b1b] hover:border-[#ffd700] hover:bg-[#ffd700] hover:text-[#991b1b]";
const glassSecondaryButtonClassName =
  "btn h-12 rounded-[1rem] border border-[#7b0d15]/15 bg-white/85 px-6 text-[#7b0d15] shadow-none transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";

const defaultPrimaryButtonClassName =
  "btn h-12 rounded-lg border-[#991b1b] bg-[#991b1b] text-white hover:border-[#ffd700] hover:bg-[#ffd700] hover:text-[#991b1b]";
const glassPrimaryButtonClassName =
  "btn h-12 rounded-[1rem] border border-[#7b0d15] bg-[#7b0d15] px-6 text-white transition hover:border-[#5a0b12] hover:bg-[#5a0b12]";

export default function DeleteConfirmModal({ open, message = "Delete this app client?", onCancel, onConfirm, theme = "default", colorMode = "light" }) {
  const { shouldRender, isClosing } = useModalTransition(open);
  const isGlassTheme = theme === "glass";
  const isDarkGlassTheme = isGlassTheme && colorMode === "dark";
  const dialogClassName = isGlassTheme
    ? glassDialogClassName
    : defaultDialogClassName;
  const boxClassName = isDarkGlassTheme
    ? "modal-box w-full max-w-lg rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(35,22,31,0.96))] font-[Poppins] text-center text-[#f4eaea] shadow-[0_36px_90px_-40px_rgba(2,6,23,0.9)]"
    : isGlassTheme
      ? glassBoxClassName
      : defaultBoxClassName;
  const iconWrapClassName = isDarkGlassTheme
    ? "flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#f8d24e]/25 bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.16),transparent_45%),linear-gradient(135deg,#7b0d15_0%,#263345_60%,#1a121c_100%)] shadow-[0_24px_50px_-28px_rgba(2,6,23,0.8)]"
    : isGlassTheme
      ? glassIconWrapClassName
      : defaultIconWrapClassName;
  const titleClassName = isDarkGlassTheme
    ? "text-2xl font-semibold tracking-tight text-[#f7dadd]"
    : isGlassTheme
      ? glassTitleClassName
      : defaultTitleClassName;
  const descriptionClassName = isDarkGlassTheme
    ? "text-sm text-[#c7adb4]"
    : isGlassTheme
      ? glassDescriptionClassName
      : defaultDescriptionClassName;
  const secondaryButtonClassName = isDarkGlassTheme
    ? "btn h-12 rounded-[1rem] border border-white/12 bg-white/[0.04] px-6 text-[#f4eaea] shadow-none transition hover:border-[#f8d24e]/45 hover:bg-[#f8d24e]/12 hover:text-[#ffe6a4]"
    : isGlassTheme
      ? glassSecondaryButtonClassName
      : defaultSecondaryButtonClassName;
  const primaryButtonClassName = isDarkGlassTheme
    ? "btn h-12 rounded-[1rem] border border-[#f8d24e]/35 bg-[linear-gradient(135deg,#7b0d15_0%,#4f1018_100%)] px-6 text-white transition hover:border-[#f8d24e] hover:bg-[#8f121b]"
    : isGlassTheme
      ? glassPrimaryButtonClassName
      : defaultPrimaryButtonClassName;

  if (!shouldRender) {
    return null;
  }

  return (
    <dialog open
      className={getModalTransitionClassName(
        `${dialogClassName} modal-open`,
        isClosing,
      )}
    >
      <form method="dialog" className={boxClassName}>
        <div className="mb-6 flex justify-center">
          <div className={iconWrapClassName}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              className={`h-10 w-10 ${
                isGlassTheme ? "text-white" : "text-[#ffd700]"
              }`}
            >
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>

        <h3 className={titleClassName}>
          {message}
        </h3>
        <p className={`mt-2 ${descriptionClassName}`}>
          This action cannot be undone.
        </p>

        <div className="modal-action justify-center gap-3">
          <button type="button" className={secondaryButtonClassName} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={primaryButtonClassName} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </form>
    </dialog>
  );
}