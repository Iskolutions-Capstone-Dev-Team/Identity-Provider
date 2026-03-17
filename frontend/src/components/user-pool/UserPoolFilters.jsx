export default function UserPoolFilters({ search, setSearch, status, setStatus, onCreate }) {
  return (
    <div className="flex flex-col gap-5 border-b border-[#7b0d15]/10 pb-6 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(14rem,19rem)_auto] lg:items-end">
      <div className="min-w-0">
        <label className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027]">Who are you looking for?</label>
        <label className="group flex h-14 items-center gap-3 rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] px-4 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition duration-300 focus-within:border-[#f8d24e]/70 focus-within:ring-4 focus-within:ring-[#f8d24e]/15">
          <svg className="h-5 w-5 shrink-0 text-[#7b0d15]/55 transition duration-300 group-focus-within:text-[#7b0d15]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7.5" />
              <path d="m20 20-3.8-3.8" />
            </g>
          </svg>
          <input type="search" value={search} placeholder="Search by email, or name..." className="h-full w-full bg-transparent text-sm text-[#4a1921] outline-none placeholder:text-[#9a7b81]" onChange={(e) => setSearch(e.target.value)}/>
        </label>
      </div>

      <div className="min-w-0">
        <label className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027]">Status</label>
        <div className="group relative flex h-14 items-center rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,246,237,0.92))] px-4 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition duration-300 hover:border-[#7b0d15]/20 focus-within:border-[#f8d24e]/70 focus-within:ring-4 focus-within:ring-[#f8d24e]/15">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-full w-full cursor-pointer appearance-none bg-transparent pr-12 text-sm font-medium text-[#4a1921] outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <div className="pointer-events-none flex h-9 w-9 items-center justify-center rounded-full bg-[#7b0d15]/5 text-[#7b0d15]/60 transition duration-300 group-focus-within:bg-[#f8d24e]/15 group-focus-within:text-[#7b0d15]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex justify-end lg:justify-start">
        <button type="button" onClick={onCreate} className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#7b0d15] bg-[#7b0d15] px-5 text-sm font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_-26px_rgba(123,13,21,0.6)] transition duration-300 hover:border-[#f8d24e] hover:bg-[#f8d24e] hover:text-[#7b0d15]">
          + Add User
        </button>
      </div>
    </div>
  );
}