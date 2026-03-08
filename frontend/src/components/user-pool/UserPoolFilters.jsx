export default function UserPoolFilters({ search, setSearch, status, setStatus, onCreate }) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto flex-1">
                <div className="relative">
                    <div>
                        <label className="block font-semibold mb-1 text-black text-base">Who are you looking for?</label>
                        <label className="input max-w-xl rounded-xl flex items-center gap-2 bg-transparent border border-gray-300 text-gray-700 w-full focus-within:ring-1 focus-within:ring-[#991b1b] focus-within:border-[#991b1b]">
                            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor" className="w-6">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                                </g>
                            </svg>
                            <input type="search" value={search} placeholder="Search by email, or name..." className="grow bg-transparent" onChange={(e) => setSearch(e.target.value)} />
                        </label>
                    </div>
                    
                </div>
                <div>
                    <label className="block font-semibold mb-1 text-black text-base">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border text-gray-400 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#991b1b]">
                        <option className="text-gray-600" value="">All Status</option>
                        <option className="text-gray-600" value="active">Active</option>
                        <option className="text-gray-600" value="inactive">Inactive</option>
                        <option className="text-gray-600" value="suspended">Suspended</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button onClick={onCreate} className="btn bg-[#991b1b] w-auto rounded-lg text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]">
                    + Add User
                </button>
            </div>
        </div>
    );
}