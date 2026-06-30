import { createPortal } from "react-dom";
import { getModalTheme } from "../../../components/modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../../../components/modalTransition";
import { CloseIcon, SecurityLogIcon, TransactionLogIcon } from "./auditLogIcons";

const SECURITY_LOG_TYPE = "security";

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

export default function LogMetadataModal({ open, log, logType = "transaction", loading, error, onClose, colorMode = "light" }) {
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
    modalHeaderTitleClassName,
    modalHelperTextClassName,
    modalLabelClassName,
    modalOverlayClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);
  const isDarkMode = colorMode === "dark";
  const isSecurityLog = logType === SECURITY_LOG_TYPE;
  const metadataText = formatMetadata(log?.metadata);
  const modalTitle = isSecurityLog
    ? "Security Log Metadata"
    : "Transaction Log Metadata";
  const headerIconClassName =
    colorMode === "dark" ? "h-10 w-10 text-[#ffe28a]" : "h-10 w-10 text-[#fff0a8]";
  const modalHeaderSpacingClassName =
    `${modalHeaderClassName} h-[7rem] shrink-0 !px-7 !py-0 sm:!px-8`;
  const modalHeaderContentClassName =
    "flex min-w-0 flex-1 items-center gap-4 pr-3 sm:pr-16";
  const sectionHeaderClassName = isDarkMode
    ? "mb-5 border-b border-white/10 pb-4"
    : "mb-5 border-b border-[#7b0d15]/10 pb-4";
  const sectionDescriptionClassName = `${modalHelperTextClassName} !mb-0`;
  const messageBoxClassName = isDarkMode
    ? "rounded-[1rem] border border-white/10 bg-[rgba(10,15,24,0.72)] px-4 py-4 text-sm text-[#d6c3c7] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[background-color,border-color,color] duration-500 ease-out"
    : "rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-4 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-[background-color,border-color,color] duration-500 ease-out";
  const errorBoxClassName = isDarkMode
    ? "rounded-[1rem] border border-red-400/25 bg-[linear-gradient(180deg,rgba(69,22,29,0.92),rgba(32,16,21,0.94))] px-4 py-4 text-sm text-[#ffd8dd] transition-[background-color,border-color,color] duration-500 ease-out"
    : "rounded-[1rem] border border-[#b42318]/15 bg-[linear-gradient(180deg,rgba(255,247,247,0.98),rgba(255,255,255,0.94))] px-4 py-4 text-sm text-[#991b1b] transition-[background-color,border-color,color] duration-500 ease-out";
  const metadataClassName = isDarkMode
    ? "max-h-96 overflow-auto rounded-[1.25rem] bg-[linear-gradient(180deg,rgba(9,14,25,0.96),rgba(22,18,28,0.96))] p-4 text-xs leading-6 text-[#f8ecee] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[background-color,color] duration-500 ease-out"
    : "max-h-96 overflow-auto rounded-[1.25rem] bg-[#2b0307] p-4 text-xs leading-6 text-[#fff8f3] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[background-color,color] duration-500 ease-out";
  const renderSectionHeader = (title, description) => (
    <div className={sectionHeaderClassName}>
      <label className={modalLabelClassName}>
        {title}
      </label>
      <p className={sectionDescriptionClassName}>
        {description}
      </p>
    </div>
  );

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderSpacingClassName}>
          <div className="flex h-full items-center justify-between gap-4 sm:gap-6">
            <div className={modalHeaderContentClassName}>
              {isSecurityLog ? (
                <SecurityLogIcon className={headerIconClassName} />
              ) : (
                <TransactionLogIcon className={headerIconClassName} />
              )}
              <h3 className={modalHeaderTitleClassName}>{modalTitle}</h3>
            </div>

            <button type="button" className={`${modalCloseButtonClassName} shrink-0`} onClick={onClose} aria-label="Close log metadata modal">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className={modalBodyClassName}>
          <div className={modalBodyStackClassName}>
            <section className={modalSectionClassName}>
              {renderSectionHeader(
                "Log Details",
                `View the selected ${isSecurityLog ? "security" : "transaction"} log details.`,
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <DetailField label="Timestamp" value={log?.timestamp} colorMode={colorMode} />
                <DetailField label="Actor" value={log?.actor} colorMode={colorMode} />
                <DetailField label="Target" value={log?.target} colorMode={colorMode} />
                <DetailField label="Status" value={log?.status} colorMode={colorMode} />
                <DetailField label="Action" value={log?.action} colorMode={colorMode} />
              </div>
            </section>

            <section className={modalSectionClassName}>
              {renderSectionHeader(
                "Metadata",
                "Review the raw metadata captured with this log.",
              )}

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