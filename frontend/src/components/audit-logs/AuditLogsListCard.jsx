import AuditLogsCard from "./AuditLogsCard";
import ResultsCount from "../ResultsCount";
import Pagination from "../Pagination";
import TransactionLogsTable from "./TransactionLogsTable";
import DataTableSkeleton from "../DataTableSkeleton";
import { SpeechInputToolbar } from "../SpeechInputButton";

export default function AuditLogsListCard({ logs, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, loading, error, onView, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const filtersClassName = `flex flex-col gap-5 border-b pb-6 ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;
  const labelClassName = isDarkMode
    ? "mb-2 block text-sm font-semibold tracking-[0.01em] text-[#f2dfe2] transition-colors duration-500 ease-out"
    : "mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027] transition-colors duration-500 ease-out";
  const searchFieldClassName = isDarkMode
    ? "group flex h-14 w-full max-w-xl items-center gap-3 rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(30,20,28,0.88))] px-4 shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out focus-within:border-[#f8d24e]/55 focus-within:ring-4 focus-within:ring-[#f8d24e]/12"
    : "group flex h-14 w-full max-w-xl items-center gap-3 rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] px-4 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition-[background-color,border-color,box-shadow] duration-500 ease-out focus-within:border-[#f8d24e]/70 focus-within:ring-4 focus-within:ring-[#f8d24e]/15";
  const searchIconClassName = isDarkMode
    ? "h-5 w-5 shrink-0 text-white/45 transition-colors duration-500 ease-out group-focus-within:text-[#f8d24e]"
    : "h-5 w-5 shrink-0 text-[#7b0d15]/55 transition-colors duration-500 ease-out group-focus-within:text-[#7b0d15]";
  const searchInputClassName = isDarkMode
    ? "h-full w-full bg-transparent text-sm text-[#f6eaec] outline-none transition-colors duration-500 ease-out placeholder:text-[#a58d95]"
    : "h-full w-full bg-transparent text-sm text-[#4a1921] outline-none transition-colors duration-500 ease-out placeholder:text-[#9a7b81]";
  const errorClassName = isDarkMode
    ? "rounded-[1.75rem] border border-[#f8d24e]/15 bg-[linear-gradient(180deg,rgba(48,18,24,0.96),rgba(27,16,21,0.96))] px-6 py-12 text-center text-sm font-medium text-[#f2dfe2] shadow-[0_22px_55px_-38px_rgba(2,6,23,0.75)]"
    : "rounded-[1.75rem] border border-[#b42318]/15 bg-[linear-gradient(180deg,rgba(255,247,247,0.98),rgba(255,255,255,0.94))] px-6 py-12 text-center text-sm font-medium text-[#991b1b] shadow-[0_22px_55px_-38px_rgba(43,3,7,0.35)]";
  const footerClassName = `flex flex-col gap-4 border-t pt-5 lg:flex-row lg:items-center lg:justify-between ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;
  const updateSearchValue = (value) => {
    setSearch(value);
    onPageChange(1);
  };
  const handleSearchChange = (event) => {
    updateSearchValue(event.target.value);
  };
  const handleSearchVoiceInput = (transcript) => {
    updateSearchValue(transcript);
  };

  let content = (
    <TransactionLogsTable
      logs={logs}
      onView={onView}
      colorMode={colorMode}
    />
  );

  if (loading) {
    content = (
      <DataTableSkeleton
        theme={isDarkMode ? "userpoolDark" : "userpool"}
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
    content = <div className={errorClassName}>{error}</div>;
  }

  return (
    <AuditLogsCard colorMode={colorMode}>
      <div className={filtersClassName}>
        <div className="min-w-0 w-full">
          <SpeechInputToolbar
            activeFieldLabel="Audit Log Search"
            onTranscript={handleSearchVoiceInput}
            colorMode={colorMode}
          />
          <label className={labelClassName}>
            Which transaction log are you looking for?
          </label>
          <label className={searchFieldClassName}>
            <svg className={searchIconClassName} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.2" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </g>
            </svg>
            <input
              type="search"
              value={search}
              placeholder="Search by actor..."
              className={searchInputClassName}
              onChange={handleSearchChange}
            />
          </label>
        </div>
      </div>

      {content}

      {!loading && !error && (
        <div className={footerClassName}>
          <ResultsCount
            page={page}
            itemsPerPage={itemsPerPage}
            totalResults={totalResults}
            currentResultsCount={logs.length}
            variant="glass"
            colorMode={colorMode}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            variant="glass"
            colorMode={colorMode}
          />
        </div>
      )}
    </AuditLogsCard>
  );
}