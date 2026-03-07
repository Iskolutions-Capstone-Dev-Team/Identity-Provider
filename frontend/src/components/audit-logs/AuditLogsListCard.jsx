import AuditLogsCard from "./AuditLogsCard";
import ResultsCount from "../ResultsCount";
import Pagination from "../Pagination";
import TransactionLogsTable from "./TransactionLogsTable";
import SystemLogsTable from "./SystemLogsTable";

export default function AuditLogsListCard({ activeTab, logs, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, loading, error}) {
    const label =
        activeTab === "transaction"
            ? "Which transaction log are you looking for?"
            : "What system log are you looking for?";

    const placeholder =
        activeTab === "transaction"
            ? "Search by email..."
            : "Search by error type...";

    return (
        <AuditLogsCard>
            <div className="flex flex-col gap-3 mb-4">
                <div className="w-full">
                    <label className="block font-semibold mb-1 text-black text-base">
                        {label}
                    </label>
                    <label className="input max-w-xl rounded-xl flex items-center gap-2 bg-transparent border border-gray-300 text-gray-700 w-full focus-within:ring-1 focus-within:ring-[#991b1b] focus-within:border-[#991b1b]">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor" className="w-6">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </g>
                        </svg>
                        <input type="search" value={search} placeholder={placeholder} className="grow bg-transparent" onChange={(e) => {
                                setSearch(e.target.value);
                                onPageChange(1);
                            }}
                        />
                    </label>
                </div>
            </div>

            {error ? (
                <div className="text-center py-10 text-red-600">{error}</div>
            ) : loading ? (
                <div className="text-center py-10 text-gray-500">Loading logs...</div>
            ) : activeTab === "transaction" ? (
                <TransactionLogsTable logs={logs} />
            ) : (
                <SystemLogsTable logs={logs} />
            )}

            {!loading && !error && (
                <>
                    <div className="flex justify-center mt-6">
                        <ResultsCount page={page} itemsPerPage={itemsPerPage} totalResults={totalResults}/>
                    </div>

                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange}/>
                </>
            )}
        </AuditLogsCard>
    );
}