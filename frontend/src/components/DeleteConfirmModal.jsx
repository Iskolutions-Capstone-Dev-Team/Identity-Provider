export default function DeleteConfirmModal({ open, message = "Delete this app client?", onCancel, onConfirm }) {
  return (
    <dialog className={`modal modal-middle ${open ? "modal-open" : ""}`}>
      <form method="dialog" className="modal-box bg-white rounded-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-[#991b1b] shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-10 h-10 text-[#ffd700]">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>
        <h3 className="font-bold text-2xl text-[#991b1b]">{message}</h3>
        <p className="text-sm text-gray-700">This action cannot be undone.</p>
        <div className="modal-action justify-center">
          <button type="button" className="btn btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={onConfirm}>Delete</button>
        </div>
      </form>
    </dialog>
  );
}