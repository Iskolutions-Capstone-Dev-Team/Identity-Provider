import AppClientCard from "./AppClientCard";
import Pagination from "../Pagination";
import ConnectedAppClientTable from "./ConnectedAppClientTable";
import ResultsCount from "../ResultsCount";

export default function ConnectedAppClientCard({ clients, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, onView, onEdit, onDelete, onCreate }) {
    return (
        <AppClientCard title="Connected App Clients">
            <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="w-full">
                    <label className="block font-semibold mb-1 text-black text-base">What are you looking for?</label>
                    <label className="input max-w-xl rounded-xl flex items-center gap-2 bg-transparent border border-gray-300 text-gray-700 w-full focus-within:ring-1 focus-within:ring-[#991b1b] focus-within:border-[#991b1b]">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor" className="w-6">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </g>
                        </svg>
                        <input type="search" value={search} placeholder="Search by name or client ID..." className="grow bg-transparent" onChange={(e) => setSearch(e.target.value)} />
                    </label>
                </div>
                <div className="flex justify-end w-full lg:w-auto">
                    <button onClick={onCreate} className="btn bg-[#991b1b] w-auto rounded-lg text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]">
                        + Add App Client
                    </button>
                </div>
            </div>
            <ConnectedAppClientTable clients={clients} onView={onView} onEdit={onEdit} onDelete={onDelete} />
            <div className="flex justify-center mt-6">
                <ResultsCount page={page} itemsPerPage={itemsPerPage} totalResults={totalResults} />
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </AppClientCard>
    );
}