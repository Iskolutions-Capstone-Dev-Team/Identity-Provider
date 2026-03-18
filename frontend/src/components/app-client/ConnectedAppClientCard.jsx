import AppClientCard from "./AppClientCard";
import Pagination from "../Pagination";
import ConnectedAppClientTable from "./ConnectedAppClientTable";
import ResultsCount from "../ResultsCount";

export default function ConnectedAppClientCard({ loading = false, clients, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, onView, onEdit, onDelete, onCreate, onRotateSecret }) {
    return (
        <AppClientCard>
            <div className="flex flex-col gap-5 border-b border-[#7b0d15]/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 w-full">
                    <label className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027]">
                        What are you looking for?
                    </label>
                    <label className="group flex h-14 items-center gap-3 rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] px-4 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition duration-300 focus-within:border-[#f8d24e]/70 focus-within:ring-4 focus-within:ring-[#f8d24e]/15">
                        <svg className="h-5 w-5 shrink-0 text-[#7b0d15]/55 transition duration-300 group-focus-within:text-[#7b0d15]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.2" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </g>
                        </svg>
                        <input type="search" value={search} placeholder="Search by name..." className="h-full w-full bg-transparent text-sm text-[#4a1921] outline-none placeholder:text-[#9a7b81]" onChange={(e) => setSearch(e.target.value)}/>
                    </label>
                </div>
                <div className="flex justify-end lg:justify-start">
                    <button type="button" onClick={onCreate} className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#7b0d15] bg-[#7b0d15] px-5 text-sm font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_-26px_rgba(123,13,21,0.6)] transition duration-300 hover:border-[#f8d24e] hover:bg-[#f8d24e] hover:text-[#7b0d15]">
                        + Add Client
                    </button>
                </div>
            </div>
            <ConnectedAppClientTable loading={loading} clients={clients} onView={onView} onEdit={onEdit} onDelete={onDelete} onRotateSecret={onRotateSecret} />
            {!loading && (
                <div className="flex flex-col gap-4 border-t border-[#7b0d15]/10 pt-5 lg:flex-row lg:items-center lg:justify-between">
                    <ResultsCount
                        page={page}
                        itemsPerPage={itemsPerPage}
                        totalResults={totalResults}
                        currentResultsCount={clients.length}
                        variant="glass"
                    />
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} variant="glass" />
                </div>
            )}
        </AppClientCard>
    );
}