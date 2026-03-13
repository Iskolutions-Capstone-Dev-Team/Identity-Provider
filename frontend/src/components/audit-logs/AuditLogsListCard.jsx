import AuditLogsCard from "./AuditLogsCard";
import ResultsCount from "../ResultsCount";
import Pagination from "../Pagination";
import TransactionLogsTable from "./TransactionLogsTable";
import DataTableSkeleton from "../DataTableSkeleton";

export default function AuditLogsListCard({
  logs,
  totalResults,
  itemsPerPage,
  search,
  setSearch,
  page,
  totalPages,
  onPageChange,
  loading,
  error,
  onView,
}) {
  let content = <TransactionLogsTable logs={logs} onView={onView} />;

  if (loading) {
    content = (
      <DataTableSkeleton
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
    content = <div className="py-10 text-center text-red-600">{error}</div>;
  }

  return (
    <AuditLogsCard>
      <div className="mb-4 flex flex-col gap-3">
        <div className="w-full">
          <label className="mb-1 block text-base font-semibold text-black">
            Which transaction log are you looking for?
          </label>
          <label className="input flex w-full max-w-xl items-center gap-2 rounded-xl border border-gray-300 bg-transparent text-gray-700 focus-within:border-[#991b1b] focus-within:ring-1 focus-within:ring-[#991b1b]">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor" className="w-6">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              value={search}
              placeholder="Search by actor..."
              className="grow bg-transparent"
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
        <>
          <div className="mt-6 flex justify-center">
            <ResultsCount
              page={page}
              itemsPerPage={itemsPerPage}
              totalResults={totalResults}
              currentResultsCount={logs.length}
            />
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </AuditLogsCard>
  );
}
