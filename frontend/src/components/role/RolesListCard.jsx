import RoleCard from "./RoleCard";
import Pagination from "../Pagination";
import RolesListTable from "./RolesListTable";
import ResultsCount from "../ResultsCount";
import { SpeechInputToolbar } from "../SpeechInputButton";

export default function RolesListCard({ loading = false, roles, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, onView, onEdit, onDelete, onCreate, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const filtersClassName = `flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;
  const labelClassName = isDarkMode
    ? "mb-2 block text-sm font-semibold tracking-[0.01em] text-[#f2dfe2] transition-colors duration-500 ease-out"
    : "mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027] transition-colors duration-500 ease-out";
  const searchFieldClassName = isDarkMode
    ? "group flex h-14 items-center gap-3 rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(30,20,28,0.88))] px-4 shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out focus-within:border-[#f8d24e]/55 focus-within:ring-4 focus-within:ring-[#f8d24e]/12"
    : "group flex h-14 items-center gap-3 rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] px-4 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition-[background-color,border-color,box-shadow] duration-500 ease-out focus-within:border-[#f8d24e]/70 focus-within:ring-4 focus-within:ring-[#f8d24e]/15";
  const searchIconClassName = isDarkMode
    ? "h-5 w-5 shrink-0 text-white/45 transition-colors duration-500 ease-out group-focus-within:text-[#f8d24e]"
    : "h-5 w-5 shrink-0 text-[#7b0d15]/55 transition-colors duration-500 ease-out group-focus-within:text-[#7b0d15]";
  const searchInputClassName = isDarkMode
    ? "h-full w-full bg-transparent text-sm text-[#f6eaec] outline-none transition-colors duration-500 ease-out placeholder:text-[#a58d95]"
    : "h-full w-full bg-transparent text-sm text-[#4a1921] outline-none transition-colors duration-500 ease-out placeholder:text-[#9a7b81]";
  const createButtonClassName = isDarkMode
    ? "inline-flex h-14 items-center justify-center rounded-2xl border border-[#f8d24e]/30 bg-[linear-gradient(135deg,#7b0d15_0%,#4a121b_100%)] px-5 text-sm font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_-26px_rgba(2,6,23,0.75)] transition-[background-color,background-image,border-color,color,box-shadow,transform] duration-500 ease-out hover:-translate-y-0.5 hover:border-[#f8d24e] hover:bg-none hover:bg-[#f8d24e] hover:text-[#7b0d15]"
    : "inline-flex h-14 items-center justify-center rounded-2xl border border-[#7b0d15] bg-[#7b0d15] px-5 text-sm font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_-26px_rgba(123,13,21,0.6)] transition-[background-color,border-color,color,box-shadow,transform] duration-500 ease-out hover:-translate-y-0.5 hover:border-[#f8d24e] hover:bg-[#f8d24e] hover:text-[#7b0d15]";
  const footerClassName = `flex flex-col gap-4 border-t pt-5 lg:flex-row lg:items-center lg:justify-between ${
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
    <RoleCard colorMode={colorMode}>
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
            <svg className={searchIconClassName} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.2" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </g>
            </svg>
            <input
              type="search"
              value={search}
              placeholder="Search by role name..."
              className={searchInputClassName}
              onChange={handleSearchChange}
            />
          </label>
        </div>

        <div className="flex justify-end lg:justify-start">
          <button type="button" onClick={onCreate} className={createButtonClassName}>
            + Add Role
          </button>
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
    </RoleCard>
  );
}