export default function ActionButtons({ openEdit, openPassword }) {
    return (
        <div className="flex flex-col gap-3 border-t border-[#7b0d15]/10 pt-6 sm:flex-row sm:justify-end">
            <button type="button" onClick={openEdit} className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-[#7b0d15]/15 bg-white/85 px-5 text-sm font-semibold text-[#7b0d15] shadow-none transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 1 1 3.536 3.536L6.5 21.036H3v-3.572L16.732 3.732Z" />
                </svg>
                Edit Profile
            </button>

            <button type="button" onClick={openPassword} className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-[#7b0d15] bg-[#7b0d15] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-26px_rgba(123,13,21,0.6)] transition hover:border-[#f8d24e] hover:bg-[#f8d24e] hover:text-[#7b0d15]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z" />
                </svg>
                Change Password
            </button>
        </div>
    );
}