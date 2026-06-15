import { getModalTransitionClassName, useModalTransition } from "../modalTransition";
import { ReportDownloadIcon } from "./DashboardIcons";

export default function ReportConfirmModal({ open, colorMode = "light", isGenerating = false, onCancel, onConfirm }) {
  const { shouldRender, isClosing } = useModalTransition(open);
  const isDarkMode = colorMode === "dark";
  const boxClassName = isDarkMode
    ? "modal-box w-full max-w-lg rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(35,22,31,0.96))] font-[Poppins] text-center text-[#f4eaea] shadow-[0_36px_90px_-40px_rgba(2,6,23,0.9)]"
    : "modal-box w-full max-w-lg rounded-[2rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,250,244,0.98),rgba(255,255,255,0.96))] font-[Poppins] text-center shadow-[0_36px_90px_-40px_rgba(43,3,7,0.72)]";
  const iconWrapClassName = isDarkMode
    ? "flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#f8d24e]/25 bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.16),transparent_45%),linear-gradient(135deg,#7b0d15_0%,#263345_60%,#1a121c_100%)] text-[#f8d24e] shadow-[0_24px_50px_-28px_rgba(2,6,23,0.8)]"
    : "flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#f8d24e]/30 bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.22),transparent_45%),linear-gradient(135deg,#7b0d15_0%,#3d0910_58%,#1f0205_100%)] text-white shadow-[0_24px_50px_-28px_rgba(43,3,7,0.72)]";
  const titleClassName = isDarkMode
    ? "text-2xl font-semibold tracking-tight text-[#f7dadd]"
    : "text-2xl font-semibold tracking-tight text-[#7b0d15]";
  const descriptionClassName = isDarkMode
    ? "text-sm leading-6 text-[#c7adb4]"
    : "text-sm leading-6 text-[#7d5c62]";
  const secondaryButtonClassName = isDarkMode
    ? "btn h-12 rounded-[1rem] border border-white/12 bg-white/[0.04] px-6 text-[#f4eaea] shadow-none transition hover:border-[#f8d24e]/45 hover:bg-[#f8d24e]/12 hover:text-[#ffe6a4]"
    : "btn h-12 rounded-[1rem] border border-[#7b0d15]/15 bg-white/85 px-6 text-[#7b0d15] shadow-none transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";
  const primaryButtonClassName = isDarkMode
    ? "btn h-12 rounded-[1rem] border border-[#f8d24e]/35 bg-[linear-gradient(135deg,#7b0d15_0%,#4f1018_100%)] px-6 text-white transition hover:border-[#f8d24e] hover:bg-[#8f121b]"
    : "btn h-12 rounded-[1rem] border border-[#7b0d15] bg-[#7b0d15] px-6 text-white transition hover:border-[#5a0b12] hover:bg-[#5a0b12]";

  if (!shouldRender) {
    return null;
  }

  return (
    <dialog open className={getModalTransitionClassName(
        "modal modal-middle modal-open px-3 backdrop:bg-[rgba(43,3,7,0.58)] backdrop:backdrop-blur-sm",
        isClosing,
      )}
    >
      <form method="dialog" className={boxClassName}>
        <div className="mb-6 flex justify-center">
          <div className={iconWrapClassName}>
            <ReportDownloadIcon className="h-10 w-10" />
          </div>
        </div>

        <h3 className={titleClassName}>Generate metrics report?</h3>
        <p className={`mt-2 ${descriptionClassName}`}>
          This will create and download the latest authentication metrics and security intelligence report.
        </p>

        <div className="modal-action justify-center gap-3">
          <button type="button" className={secondaryButtonClassName} onClick={onCancel} disabled={isGenerating}>
            Cancel
          </button>
          <button type="button" className={primaryButtonClassName} onClick={onConfirm} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </form>
    </dialog>
  );
}