export default function SecretConfirmModal({ open, message = "Generate a new client secret?", onCancel, onConfirm }) {
  return (
    <dialog className={`modal modal-middle ${open ? "modal-open" : ""}`}>
      <form method="dialog" className="modal-box bg-white rounded-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-[#991b1b] shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#ffd700]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
          </div>
        </div>
        <h3 className="font-bold text-2xl text-[#991b1b]">{message}</h3>
        <p className="text-sm text-gray-700">Your existing secret will be replaced.</p>
        <div className="modal-action justify-center">
          <button type="button" className="btn btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={onConfirm}>
            Generate
          </button>
        </div>
      </form>
    </dialog>
  );
}
