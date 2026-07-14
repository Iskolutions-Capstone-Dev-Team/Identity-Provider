import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import Pagination from "../../../components/Pagination";
import RolesListTable from "./RolesListTable";
import ResultsCount from "../../../components/ResultsCount";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";

export default function RolesListCard({ loading = false, roles, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, onView, onEdit, onDelete, colorMode = "light" }) {
  const footerClassName = `flex flex-col items-center gap-4 pt-5 lg:grid lg:grid-cols-3 ${
    colorMode === "dark" ? "border-white/10" : "border-[#7b0d15]/10"
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
      <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6 w-full">
          <div className="flex-1 w-full flex flex-col gap-2 relative">
            <SpeechInputToolbar
              activeFieldLabel="Role Search"
              onTranscript={handleSearchVoiceInput}
              colorMode={colorMode}
            />
            <Label>What role are you looking for?</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                placeholder="Search by role name..."
                className="pl-9 h-10"
                onChange={handleSearchChange}
              />
            </div>
          </div>
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
          <div className="flex w-full justify-center lg:justify-start">
            <ResultsCount
              page={page}
              itemsPerPage={itemsPerPage}
              totalResults={totalResults}
              currentResultsCount={roles.length}
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