import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Table, Square, ChevronDown, WalletCards } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Pagination from "../../../components/Pagination";
import RolesListTable from "./RolesListTable";
import RolesListCards from "./RolesListCards";
import ResultsCount from "../../../components/ResultsCount";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";

export default function RolesListCard({ loading = false, roles, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, onView, onEdit, onDelete, colorMode = "light", globalViewType }) {
  const [viewType, setViewType] = useState(() => {
    return localStorage.getItem("rolesViewType") || globalViewType || "table";
  });

  useEffect(() => {
    if (globalViewType) setViewType(globalViewType);
  }, [globalViewType]);

  useEffect(() => {
    localStorage.setItem("rolesViewType", viewType);
  }, [viewType]);

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
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                placeholder="Search by role name..."
                className="pl-9 h-10 w-full"
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="w-full lg:w-[130px] shrink-0 flex flex-col gap-2">
            <Label>View</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-3 flex items-center gap-2 bg-background border shadow-sm w-full justify-between">
                  <div className="flex items-center gap-2 text-foreground font-normal">
                    {viewType === "card" ? <WalletCards className="w-4 h-4 opacity-70" /> : <Table className="w-4 h-4 opacity-70" />}
                    <span>{viewType === "card" ? "Card" : "Table"}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[130px]">
                <DropdownMenuRadioGroup value={viewType} onValueChange={setViewType}>
                  <DropdownMenuRadioItem value="table" className="cursor-pointer gap-2">
                    <Table className="w-4 h-4 opacity-70" />
                    Table
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="card" className="cursor-pointer gap-2">
                    <WalletCards className="w-4 h-4 opacity-70" />
                    Card
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {viewType === "table" ? (
        <RolesListTable
          loading={loading}
          roles={roles}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          colorMode={colorMode}
        />
      ) : (
        <RolesListCards
          loading={loading}
          roles={roles}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          colorMode={colorMode}
        />
      )}

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