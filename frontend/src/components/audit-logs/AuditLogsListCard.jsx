import { useState } from "react";
import AuditLogsCard from "./AuditLogsCard";
import ResultsCount from "../ResultsCount";
import Pagination from "../Pagination";
import LogsTable from "./LogsTable";
import DataTableSkeleton from "../DataTableSkeleton";
import { SpeechInputToolbar } from "../SpeechInputButton";

const LOG_TYPE_OPTIONS = [
  {
    value: "transaction",
    label: "Transaction Logs",
    detailLabel: "transaction log",
    searchPrompt: "Which transaction log are you looking for?",
    emptyMessage: "No transaction logs found",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    value: "security",
    label: "Security Logs",
    detailLabel: "security log",
    searchPrompt: "Which security log are you looking for?",
    emptyMessage: "No security logs found",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
        <path fillRule="evenodd" d="M11.484 2.17a.75.75 0 0 1 1.032 0 11.209 11.209 0 0 0 7.877 3.08.75.75 0 0 1 .722.515 12.74 12.74 0 0 1 .635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 0 1-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 0 1 .722-.516l.143.001c2.996 0 5.718-1.17 7.734-3.08ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM12 15a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75H12Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

function getLogTypeConfig(logType) {
  return (
    LOG_TYPE_OPTIONS.find((option) => option.value === logType) ||
    LOG_TYPE_OPTIONS[0]
  );
}

function getVisibleLogTypeOptions(canViewSecurityLogs) {
  return canViewSecurityLogs
    ? LOG_TYPE_OPTIONS
    : LOG_TYPE_OPTIONS.filter((option) => option.value !== "security");
}

export default function AuditLogsListCard({ logs, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, loading, error, onView, logType = "transaction", onLogTypeChange, canViewSecurityLogs = false, colorMode = "light" }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const isDarkMode = colorMode === "dark";
  const visibleLogTypeOptions = getVisibleLogTypeOptions(canViewSecurityLogs);
  const selectedLogType =
    visibleLogTypeOptions.find((option) => option.value === logType) ||
    visibleLogTypeOptions[0] ||
    getLogTypeConfig(logType);
  const showLogTypePicker = visibleLogTypeOptions.length > 1;
  const filtersClassName = `flex flex-col gap-5 border-b pb-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end ${
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
  const logTypeGroupClassName = isDarkMode
    ? "inline-grid h-14 w-fit grid-cols-2 gap-1.5 rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(30,20,28,0.88))] p-1.5 shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)]"
    : "inline-grid h-14 w-fit grid-cols-2 gap-1.5 rounded-[1.35rem] border border-[#eed7ab] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,247,239,0.94))] p-1.5 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)]";
  const getLogTypeButtonClassName = (isSelected) =>
    `flex h-full w-14 items-center justify-center rounded-[1rem] transition duration-300 ${
      isSelected
        ? isDarkMode
          ? "bg-[linear-gradient(135deg,#7b0d15_0%,#4a121b_100%)] text-white shadow-[0_16px_28px_-22px_rgba(2,6,23,0.82)]"
          : "bg-[#7b0d15] text-white shadow-[0_16px_28px_-22px_rgba(123,13,21,0.45)]"
        : isDarkMode
          ? "bg-white/[0.03] text-[#d6c3c7] hover:bg-[#f8d24e]/10 hover:text-[#ffe28a]"
          : "bg-white/75 text-[#5d3a41] hover:bg-[#fff4dc] hover:text-[#7b0d15]"
    } focus-visible:outline-none focus-visible:ring-2 ${
      isDarkMode
        ? "focus-visible:ring-[#f8d24e]/70"
        : "focus-visible:ring-[#7b0d15]/30"
    }`;
  const tooltipBubbleClassName = isDarkMode
    ? "pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] z-30 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(16,23,38,0.98),rgba(30,20,30,0.98))] px-3 py-2 text-xs font-semibold text-[#f6eaec] opacity-0 shadow-[0_18px_40px_-24px_rgba(2,6,23,0.8)] transition duration-200"
    : "pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] z-30 -translate-x-1/2 whitespace-nowrap rounded-xl border border-[#eed7ab] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(255,247,239,0.99))] px-3 py-2 text-xs font-semibold text-[#5d3a41] opacity-0 shadow-[0_18px_40px_-24px_rgba(43,3,7,0.35)] transition duration-200";
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
    <LogsTable
      logs={logs}
      onView={onView}
      colorMode={colorMode}
      emptyMessage={selectedLogType.emptyMessage}
      logTypeLabel={selectedLogType.detailLabel}
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
          { header: "Actions", type: "iconButton" },
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
            activeFieldLabel={`${selectedLogType.label} Search`}
            onTranscript={handleSearchVoiceInput}
            colorMode={colorMode}
          />
          <label className={labelClassName}>
            {selectedLogType.searchPrompt}
          </label>
          <label className={searchFieldClassName}>
            <svg className={searchIconClassName} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.2" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </g>
            </svg>
            <input type="search" value={search} placeholder="Search by actor..." className={searchInputClassName} onChange={handleSearchChange}/>
          </label>
        </div>

        {showLogTypePicker && (
          <div className="min-w-0 lg:justify-self-end">
            <label className={labelClassName}>Log Type</label>
            <div className={logTypeGroupClassName} role="tablist" aria-label="Log Type">
              {visibleLogTypeOptions.map((option) => {
                const isSelected = option.value === logType;

                return (
                  <div key={option.value} className="relative">
                    <button type="button" className={getLogTypeButtonClassName(isSelected)}
                      onClick={() => {
                        onLogTypeChange(option.value);
                        setActiveTooltip(null);
                      }}
                      onMouseEnter={() => setActiveTooltip(option.value)}
                      onMouseLeave={() =>
                        setActiveTooltip((current) =>
                          current === option.value ? null : current,
                        )
                      }
                      onFocus={() => setActiveTooltip(option.value)}
                      onBlur={() =>
                        setActiveTooltip((current) =>
                          current === option.value ? null : current,
                        )
                      }
                      role="tab"
                      aria-selected={isSelected}
                      aria-label={option.label}
                    >
                      {option.icon}
                    </button>
                    <span
                      className={`${tooltipBubbleClassName} ${
                        activeTooltip === option.value ? "opacity-100" : ""
                      }`}
                      role="tooltip"
                    >
                      {option.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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