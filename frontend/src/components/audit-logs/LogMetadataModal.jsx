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
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm text-[#991b1b]">
        {value ?? "-"}
      </p>
    </div>
  );
}

export default function LogMetadataModal({
  open,
  log,
  loading,
  error,
  onClose,
}) {
  const metadataText = formatMetadata(log?.metadata);

  return (
    <dialog className={`modal modal-middle ${open ? "modal-open" : ""}`}>
      <div className="modal-box max-w-3xl rounded-2xl bg-white p-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-[#991b1b]">Log Metadata</h3>
            <p className="text-sm text-gray-500">
              View the selected transaction log details.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost text-[#991b1b]"
            onClick={onClose}
          >
            x
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="grid gap-3 md:grid-cols-2">
            <DetailField label="Log ID" value={log?.id} />
            <DetailField label="Timestamp" value={log?.timestamp} />
            <DetailField label="Actor" value={log?.actor} />
            <DetailField label="Target" value={log?.target} />
            <DetailField label="Status" value={log?.status} />
            <DetailField label="Action" value={log?.action} />
          </div>

          <div className="rounded-2xl border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <h4 className="font-semibold text-[#991b1b]">Metadata</h4>
            </div>

            <div className="px-4 py-4">
              {loading && (
                <p className="text-sm text-gray-500">Loading metadata...</p>
              )}

              {!loading && error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {!loading && !metadataText && (
                <p className="text-sm text-gray-500">No metadata available.</p>
              )}

              {!loading && metadataText && (
                <pre className="max-h-96 overflow-auto rounded-xl bg-gray-950 p-4 text-xs leading-6 text-gray-100">
                  {metadataText}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
