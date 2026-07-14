import { useState } from "react";
import ResultsCount from "../../../components/ResultsCount";
import Pagination from "../../../components/Pagination";
import LogsTable from "./LogsTable";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { SearchIcon, SecurityLogIcon, TransactionLogIcon } from "./auditLogIcons";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

const LOG_TYPE_OPTIONS = [
  {
    value: "transaction",
    label: "Transaction Logs",
    detailLabel: "transaction log",
    searchPrompt: "Which transaction log are you looking for?",
    emptyMessage: "No transaction logs found",
    icon: <TransactionLogIcon className="size-6" />,
  },
  {
    value: "security",
    label: "Security Logs",
    detailLabel: "security log",
    searchPrompt: "Which security log are you looking for?",
    emptyMessage: "No security logs found",
    icon: <SecurityLogIcon className="size-6" />,
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

  return (
    <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">
      <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end justify-between">
          <div className="min-w-0 w-full lg:max-w-xl space-y-1">
            <SpeechInputToolbar
              activeFieldLabel={`${selectedLogType.label} Search`}
              onTranscript={handleSearchVoiceInput}
              colorMode={colorMode}
            />
            <FieldLabel>{selectedLogType.searchPrompt}</FieldLabel>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input type="search" placeholder="Search by actor..." className="pl-9 h-10 w-full rounded-lg" value={search} onChange={handleSearchChange}/>
            </div>
          </div>

          {showLogTypePicker && (
            <div className="min-w-0 lg:justify-self-end space-y-1">
              <FieldLabel>Log Type</FieldLabel>
              <Tabs value={logType} onValueChange={(val) => {
                onLogTypeChange(val);
                setActiveTooltip(null);
              }} className="h-10!">
                <TabsList className="h-full group-data-horizontal/tabs:h-10!">
                  {visibleLogTypeOptions.map((option) => (
                    <TabsTrigger key={option.value} value={option.value} className="h-full px-4 flex items-center gap-2">
                      {option.icon} <span className="hidden sm:inline">{option.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      <LogsTable
        loading={loading}
        logs={logs}
        onView={onView}
        colorMode={colorMode}
        emptyMessage={selectedLogType.emptyMessage}
        logTypeLabel={selectedLogType.detailLabel}
      />

      {!loading && !error && (
        <div className="flex flex-col items-center gap-4 pt-5 lg:grid lg:grid-cols-3 border-[#7b0d15]/10 dark:border-white/10">
          <div className="flex w-full justify-center lg:justify-start">
            <ResultsCount
              page={page}
              itemsPerPage={itemsPerPage}
              totalResults={totalResults}
              currentResultsCount={logs.length}
              variant="glass"
              colorMode={colorMode}
            />
          </div>
          <div className="flex w-full justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              variant="glass"
              colorMode={colorMode}
            />
          </div>
          <div className="hidden lg:block"></div>
        </div>
      )}
    </div>
  );
}