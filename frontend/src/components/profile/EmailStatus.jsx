export default function EmailStatus() {
    return (
        <div className="rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/80 p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#eef5ff] text-[#2d5b95]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
                        </svg>
                    </div>

                    <div>
                        <h4 className="text-base font-semibold text-[#351018]">Email Status</h4>
                        <p className="text-sm text-[#8a6971]">Current email delivery status</p>
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Email Active
                    </span>
                </div>
            </div>
        </div>
    );
}