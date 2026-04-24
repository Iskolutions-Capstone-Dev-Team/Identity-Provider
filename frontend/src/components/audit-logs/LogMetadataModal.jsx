import { createPortal } from "react-dom";
import { getModalTheme } from "../modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../modalTransition";

function formatMetadata(metadata) {
  if (metadata == null) {
    return "";
  }

  if (typeof metadata === "string") {
    return metadata;
  }

  return JSON.stringify(metadata, null, 2);
}

function DetailField({ label, value, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const fieldClassName = isDarkMode
    ? "rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,23,38,0.94),rgba(32,22,30,0.9))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[background-color,border-color,color] duration-500 ease-out"
    : "rounded-[1.25rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition-[background-color,border-color,color] duration-500 ease-out";
  const labelClassName = isDarkMode
    ? "text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#c7adb4] transition-colors duration-500 ease-out"
    : "text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#8f6f76] transition-colors duration-500 ease-out";
  const valueClassName = isDarkMode
    ? "mt-2 break-all text-sm font-medium text-[#f4eaea] transition-colors duration-500 ease-out"
    : "mt-2 break-all text-sm font-medium text-[#4a1921] transition-colors duration-500 ease-out";

  return (
    <div className={fieldClassName}>
      <p className={labelClassName}>
        {label}
      </p>
      <p className={valueClassName}>
        {value ?? "-"}
      </p>
    </div>
  );
}

export default function LogMetadataModal({ open, log, loading, error, onClose, colorMode = "light" }) {
  const { shouldRender, isClosing } = useModalTransition(open);

  if (!shouldRender) {
    return null;
  }

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
    modalLabelClassName,
    modalOverlayClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);
  const isDarkMode = colorMode === "dark";
  const metadataText = formatMetadata(log?.metadata);
  const modalHeaderSpacingClassName = `${modalHeaderClassName} !pb-10 sm:!pb-12`;
  const modalBodySpacingClassName = `${modalBodyClassName} !pt-7 sm:!pt-8`;
  const messageBoxClassName = isDarkMode
    ? "rounded-[1rem] border border-white/10 bg-[rgba(10,15,24,0.72)] px-4 py-4 text-sm text-[#d6c3c7] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[background-color,border-color,color] duration-500 ease-out"
    : "rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-4 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-[background-color,border-color,color] duration-500 ease-out";
  const errorBoxClassName = isDarkMode
    ? "rounded-[1rem] border border-red-400/25 bg-[linear-gradient(180deg,rgba(69,22,29,0.92),rgba(32,16,21,0.94))] px-4 py-4 text-sm text-[#ffd8dd] transition-[background-color,border-color,color] duration-500 ease-out"
    : "rounded-[1rem] border border-[#b42318]/15 bg-[linear-gradient(180deg,rgba(255,247,247,0.98),rgba(255,255,255,0.94))] px-4 py-4 text-sm text-[#991b1b] transition-[background-color,border-color,color] duration-500 ease-out";
  const metadataClassName = isDarkMode
    ? "max-h-96 overflow-auto rounded-[1.25rem] bg-[linear-gradient(180deg,rgba(9,14,25,0.96),rgba(22,18,28,0.96))] p-4 text-xs leading-6 text-[#f8ecee] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[background-color,color] duration-500 ease-out"
    : "max-h-96 overflow-auto rounded-[1.25rem] bg-[#2b0307] p-4 text-xs leading-6 text-[#fff8f3] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[background-color,color] duration-500 ease-out";

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderSpacingClassName}>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h3 className={modalHeaderTitleClassName}>Log Metadata</h3>
              <p className={modalHeaderDescriptionClassName}>
                View the selected log details.
              </p>
            </div>

            <button type="button" className={modalCloseButtonClassName} onClick={onClose} aria-label="Close log metadata modal">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className={modalBodySpacingClassName}>
          <div className={modalBodyStackClassName}>
            <section className={modalSectionClassName}>
              <div className="grid gap-4 md:grid-cols-2">
                <DetailField label="Timestamp" value={log?.timestamp} colorMode={colorMode} />
                <DetailField label="Actor" value={log?.actor} colorMode={colorMode} />
                <DetailField label="Target" value={log?.target} colorMode={colorMode} />
                <DetailField label="Status" value={log?.status} colorMode={colorMode} />
                <DetailField label="Action" value={log?.action} colorMode={colorMode} />
              </div>
            </section>

            <section className={modalSectionClassName}>
              <h4 className={modalLabelClassName}>Metadata</h4>

              {loading && (
                <div className={messageBoxClassName}>Loading metadata...</div>
              )}

              {!loading && error && (
                <div className={errorBoxClassName}>
                  {error}
                </div>
              )}

              {!loading && !metadataText && (
                <div className={messageBoxClassName}>No metadata available.</div>
              )}

              {!loading && metadataText && (
                <pre className={metadataClassName}>
                  {metadataText}
                </pre>
              )}
            </section>
          </div>
        </div>

        <div className={modalFooterClassName}>
          <div className={modalFooterActionsClassName}>
            <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}