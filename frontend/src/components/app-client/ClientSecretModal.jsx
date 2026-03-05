import { useEffect, useState } from "react";

export default function ClientSecretModal({
  open,
  clientName,
  clientId,
  secret,
  loading = false,
  error = "",
  onClose,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const handleCopy = async () => {
    if (!secret) return;

    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  };

  if (!open) return null;

  const isError = Boolean(error);
  const displayName = clientName || clientId || "this client";

  return (
    <dialog className="modal modal-open z-9999">
      <div className="modal-box max-w-lg bg-white p-0 overflow-hidden">
        <div className="bg-linear-to-r from-[#991b1b] to-red-600 p-6 text-white shrink-0">
          <h3 className="text-2xl font-bold">Client Secret</h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">
            Here is the client secret for <b>{displayName}</b>.
          </p>

          {loading && (
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <span className="loading loading-spinner loading-sm text-[#991b1b]" aria-hidden="true"></span>
              <span>Rotating secret. Please wait...</span>
            </div>
          )}

          {!loading && isError && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          {!loading && !isError && (
            <>
              <div className="alert alert-warning text-sm">
                <span>
                  This secret is shown one time only. If it is lost, generate a new one.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="password"
                  readOnly
                  value={secret || ""}
                  className="w-full px-3 py-2 rounded-md border bg-gray-100 text-gray-700 border-gray-300"
                />
                <button
                  type="button"
                  className="btn h-12 rounded-lg btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]"
                  onClick={handleCopy}
                  disabled={!secret}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]"
              onClick={() => onClose?.()}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="modal-backdrop" aria-hidden="true"></div>
    </dialog>
  );
}
