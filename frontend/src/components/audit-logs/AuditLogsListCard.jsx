import AuditLogsCard from "./AuditLogsCard";
import ResultsCount from "../ResultsCount";
import Pagination from "../Pagination";
import TransactionLogsTable from "./TransactionLogsTable";
import DataTableSkeleton from "../DataTableSkeleton";

export default function AuditLogsListCard({ logs, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, loading, error, onView }) {
  let content = <TransactionLogsTable logs={logs} onView={onView} />;

  if (loading) {
    content = (
      <DataTableSkeleton
        theme="userpool"
        columns={[
          { header: "Timestamp", type: "text", width: "w-28" },
          { header: "Actor", type: "text", width: "w-24" },
          { header: "Target", type: "text", width: "w-24" },
          { header: "Status", type: "badge", width: "w-20" },
          { header: "Action", type: "text", width: "w-24" },
          { header: "View", type: "button" },
        ]}
      />
    );
  } else if (error) {
    content = (
      <div className="rounded-[1.75rem] border border-[#b42318]/15 bg-[linear-gradient(180deg,rgba(255,247,247,0.98),rgba(255,255,255,0.94))] px-6 py-12 text-center text-sm font-medium text-[#991b1b] shadow-[0_22px_55px_-38px_rgba(43,3,7,0.35)]">
        {error}
      </div>
    );
  }

  return (
    <AuditLogsCard>
      <div className="flex flex-col gap-5 border-b border-[#7b0d15]/10 pb-6">
        <div className="min-w-0 w-full">
          <label className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027]">
            Which transaction log are you looking for?
          </label>
          <label className="group flex h-14 w-full max-w-xl items-center gap-3 rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] px-4 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition duration-300 focus-within:border-[#f8d24e]/70 focus-within:ring-4 focus-within:ring-[#f8d24e]/15">
            <svg className="h-5 w-5 shrink-0 text-[#7b0d15]/55 transition duration-300 group-focus-within:text-[#7b0d15]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.2" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </g>
            </svg>
            <input type="search" value={search} placeholder="Search by actor..." className="h-full w-full bg-transparent text-sm text-[#4a1921] outline-none placeholder:text-[#9a7b81]"
              onChange={(event) => {
                setSearch(event.target.value);
                onPageChange(1);
              }}
            />
          </label>
        </div>
      </div>

      {content}

      {!loading && !error && (
        <div className="flex flex-col gap-4 border-t border-[#7b0d15]/10 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <ResultsCount
            page={page}
            itemsPerPage={itemsPerPage}
            totalResults={totalResults}
            currentResultsCount={logs.length}
            variant="glass"
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            variant="glass"
          />
        </div>
      )}
    </AuditLogsCard>
  );
}