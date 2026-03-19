import { createPortal } from "react-dom";
import {
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
} from "../modalTheme";

const modalHeaderSpacingClassName = `${modalHeaderClassName} !pb-10 sm:!pb-12`;
const modalBodySpacingClassName = `${modalBodyClassName} !pt-7 sm:!pt-8`;

function formatMetadata(metadata) {
  if (metadata == null) {
    return "";
  }

  if (typeof metadata === "string") {
    return metadata;
  }

  return JSON.stringify(metadata, null, 2);
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#8f6f76]">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-medium text-[#4a1921]">
        {value ?? "-"}
      </p>
    </div>
  );
}

export default function LogMetadataModal({ open, log, loading, error, onClose }) {
  if (!open) {
    return null;
  }

  const metadataText = formatMetadata(log?.metadata);

  return createPortal(
    <dialog open className={modalOverlayClassName}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderSpacingClassName}>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h3 className={modalHeaderTitleClassName}>Log Metadata</h3>
              <p className={modalHeaderDescriptionClassName}>
                View the selected transaction log details.
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
                <DetailField label="Log ID" value={log?.id} />
                <DetailField label="Timestamp" value={log?.timestamp} />
                <DetailField label="Actor" value={log?.actor} />
                <DetailField label="Target" value={log?.target} />
                <DetailField label="Status" value={log?.status} />
                <DetailField label="Action" value={log?.action} />
              </div>
            </section>

            <section className={modalSectionClassName}>
              <h4 className={modalLabelClassName}>Metadata</h4>

              {loading && (
                <div className="rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-4 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">Loading metadata...</div>
              )}

              {!loading && error && (
                <div className="rounded-[1rem] border border-[#b42318]/15 bg-[linear-gradient(180deg,rgba(255,247,247,0.98),rgba(255,255,255,0.94))] px-4 py-4 text-sm text-[#991b1b]">
                  {error}
                </div>
              )}

              {!loading && !metadataText && (
                <div className="rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-4 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">No metadata available.</div>
              )}

              {!loading && metadataText && (
                <pre className="max-h-96 overflow-auto rounded-[1.25rem] bg-[#2b0307] p-4 text-xs leading-6 text-[#fff8f3] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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