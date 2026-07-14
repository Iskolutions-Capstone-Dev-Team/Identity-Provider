import Pagination from "../../../components/Pagination";
import RegistrationTable from "./RegistrationTable";
import ResultsCount from "../../../components/ResultsCount";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { SearchIcon } from "./registrationIcons";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function RegistrationListCard({
  children,
  loading = false,
  rows = [],
  totalResults = 0,
  itemsPerPage,
  search,
  setSearch,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  tableContent = null,
  showFooter = true,
  showEditAction = true,
  showDeleteAction = true,
  colorMode = "light",
}) {
  const isDarkMode = colorMode === "dark";
  const filtersClassName = `flex flex-col gap-5 ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;
  const labelClassName = isDarkMode
    ? "mb-2 block text-sm font-semibold tracking-[0.01em] text-[#f2dfe2] transition-colors duration-500 ease-out"
    : "mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027] transition-colors duration-500 ease-out";
  const searchFieldClassName = isDarkMode
    ? "group flex h-14 w-full lg:max-w-xl items-center gap-3 rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(30,20,28,0.88))] px-4 shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out focus-within:border-[#f8d24e]/55 focus-within:ring-4 focus-within:ring-[#f8d24e]/12"
    : "group flex h-14 w-full lg:max-w-xl items-center gap-3 rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] px-4 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition-[background-color,border-color,box-shadow] duration-500 ease-out focus-within:border-[#f8d24e]/70 focus-within:ring-4 focus-within:ring-[#f8d24e]/15";
  const searchIconClassName = isDarkMode
    ? "h-5 w-5 shrink-0 text-white/45 transition-colors duration-500 ease-out group-focus-within:text-[#f8d24e]"
    : "h-5 w-5 shrink-0 text-[#7b0d15]/55 transition-colors duration-500 ease-out group-focus-within:text-[#7b0d15]";
  const searchInputClassName = isDarkMode
    ? "h-full w-full bg-transparent text-sm text-[#f6eaec] outline-none transition-colors duration-500 ease-out placeholder:text-[#a58d95]"
    : "h-full w-full bg-transparent text-sm text-[#4a1921] outline-none transition-colors duration-500 ease-out placeholder:text-[#9a7b81]";
  const footerClassName = `flex flex-col items-center gap-4 pt-5 lg:grid lg:grid-cols-3 ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSearchVoiceInput = (transcript) => {
    setSearch(transcript);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6 w-full">
          <div className="flex-1 w-full flex flex-col gap-2 relative">
            <SpeechInputToolbar
              activeFieldLabel="Registration Search"
              onTranscript={handleSearchVoiceInput}
              colorMode={colorMode}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">What registration setting are you looking for?</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" value={search} placeholder="Search by account type or client..." className="pl-9 h-10" onChange={handleSearchChange}/>
            </div>
          </div>
        </div>
      </div>

      {children}

      {tableContent || (
        <RegistrationTable
          rows={rows}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          showEditAction={showEditAction}
          showDeleteAction={showDeleteAction}
          colorMode={colorMode}
        />
      )}

      {showFooter && !loading && (
        <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-4">
          <div className="flex justify-start w-full order-2 sm:order-1">
            <ResultsCount
              page={page}
              itemsPerPage={itemsPerPage}
              totalResults={totalResults}
              currentResultsCount={rows.length}
              colorMode={colorMode}
            />
          </div>
          <div className="flex justify-center w-full order-1 sm:order-2">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              colorMode={colorMode}
            />
          </div>
          <div className="hidden sm:block order-3"></div>
        </div>
      )}
    </div>
  );
}