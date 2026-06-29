import Pagination from "../../../components/Pagination";
import RolesListTable from "./RolesListTable";
import ResultsCount from "../../../components/ResultsCount";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { SearchIcon } from "./roleIcons";

export default function RolesListCard({ loading = false, roles, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, onView, onEdit, onDelete, colorMode = "light" }) {
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
  const footerClassName = `flex flex-col gap-4 pt-5 lg:flex-row lg:items-center lg:justify-between ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;
  const updateSearchValue = (value) => {
    setSearch(value);
  };
  const handleSearchChange = (event) => {
    updateSearchValue(event.target.value);
  };
  const handleSearchVoiceInput = (transcript) => {
    updateSearchValue(transcript);
  };

  return (
    <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">
      <div className={filtersClassName}>
        <div className="min-w-0 w-full">
          <SpeechInputToolbar
            activeFieldLabel="Role Search"
            onTranscript={handleSearchVoiceInput}
            colorMode={colorMode}
          />
          <label className={labelClassName}>
            What role are you looking for?
          </label>
          <label className={searchFieldClassName}>
            <SearchIcon className={searchIconClassName} />
            <input
              type="search"
              value={search}
              placeholder="Search by role name..."
              className={searchInputClassName}
              onChange={handleSearchChange}
            />
          </label>
        </div>
      </div>

      <RolesListTable
        loading={loading}
        roles={roles}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        colorMode={colorMode}
      />

      {!loading && (
        <div className={footerClassName}>
          <ResultsCount
            page={page}
            itemsPerPage={itemsPerPage}
            totalResults={totalResults}
            currentResultsCount={roles.length}
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
    </div>
  );
}