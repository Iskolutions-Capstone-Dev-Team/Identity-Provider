import { useEffect, useState } from "react";

export default function ClientSecretModal({ open, clientName, clientId, secret, loading = false, hasError = false, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const handleCopy = async () => {
    if (!secret) return;

    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // no-op
    }
  };

  if (!open) return null;

  const isError = Boolean(hasError);
  const displayName = clientName || clientId || "this client";

  return (
    <dialog className="modal modal-open z-9999">
      <div className="modal-box max-w-lg bg-white p-0 overflow-hidden">
        <div className="bg-linear-to-r from-[#991b1b] to-red-600 p-6 text-white shrink-0">
          <h3 className="text-2xl font-bold">Client Secret</h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-lg text-gray-700">
            Here is the client secret for <b>{displayName}</b>.
          </p>

          {loading && (
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <span className="loading loading-spinner loading-sm text-[#991b1b]" aria-hidden="true"></span>
              <span>Rotating secret. Please wait...</span>
            </div>
          )}

          {!loading && isError && (
            <div className="alert alert-error text-sm shadow-lg hover:shadow-xl hover:scale-102 transition-all">
              <span>Request failed, try again later.</span>
            </div>
          )}

          {!loading && !isError && (
            <>
              <div className="alert alert-warning text-sm shadow-lg hover:shadow-xl hover:scale-102 transition-all">
                <span>
                  This secret is shown <span className="font-bold">one time only</span>. If it is lost, generate a new one.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input type="password" readOnly value={secret || ""} className="w-full px-3 py-2 rounded-md border bg-gray-100 text-gray-700 border-gray-300"/>
                <button
                  type="button" className="btn h-12 rounded-lg btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b] transition-all duration-300" onClick={handleCopy} disabled={!secret}>
                  <span className="relative inline-flex h-6 w-6 items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                      className={`absolute size-6 transition-all duration-300 ease-out ${
                        copied ? "opacity-0 scale-75 -rotate-12" : "opacity-100 scale-100 rotate-0"
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                      className={`absolute size-6 transition-all duration-300 ease-out ${
                        copied ? "opacity-100 scale-100 rotate-0 text-emerald-600" : "opacity-0 scale-75 rotate-12"
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                  </span>
                </button>
              </div>
            </>
          )}

          <div className="flex justify-end pt-2">
            <button type="button" className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={() => onClose?.()}>
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="modal-backdrop" aria-hidden="true"></div>
    </dialog>
  );
}
