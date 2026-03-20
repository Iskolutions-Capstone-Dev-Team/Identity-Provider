function DetailField({ id, label, value }) {
    return (
        <div className="rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/80 p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)]">
            <label className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#7b5560]">
                <span className="h-2 w-2 rounded-full bg-[#f8d24e]" />
                {label}
            </label>
            <div className="rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,243,0.94))] px-4 py-3 text-base font-medium text-[#351018] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <span id={id} className="block min-h-6 break-words">
                    {value}
                </span>
            </div>
        </div>
    );
}

function AuditField({ id, label, value }) {
    return (
        <div className="rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.92))] p-4 shadow-[0_20px_44px_-38px_rgba(43,3,7,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8a6971]">
                {label}
            </p>
            <p id={id} className="mt-2 text-base font-semibold text-[#351018]">
                {value}
            </p>
        </div>
    );
}

export default function ProfileDetails({ profile }) {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 xl:grid-cols-3">
                <DetailField id="firstName" label="First Name" value={profile.firstName} />
                <DetailField id="middleName" label="Middle Name" value={profile.middleName} />
                <DetailField id="lastName" label="Last Name" value={profile.lastName} />
            </div>

            <div className="rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/72 p-5 shadow-[0_24px_50px_-40px_rgba(43,3,7,0.55)]">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff4dc] text-[#7b0d15]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#351018]">Audit Information</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <AuditField id="createdAt" label="Created At" value="2023-08-15 10:30:45" />
                    <AuditField id="updatedAt" label="Updated At" value="2024-01-20 14:25:10" />
                </div>
            </div>
        </div>
    );
}