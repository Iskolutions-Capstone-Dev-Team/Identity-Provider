import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, Table, WalletCards, ListFilter, View, Monitor, ListSortAscending, ListSortDescending, Shield } from "lucide-react";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { Label } from "@/components/ui/label";

export default function RegistrationFilters({ search, setSearch, sortBy = "account_type_name", setSortBy, sort = "desc", setSort, viewType = "table", setViewType }) {
  return (
    <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6 w-full">
        <div className="w-full lg:w-[400px] flex flex-col gap-2 relative">
          <SpeechInputToolbar
            activeFieldLabel="Registration Search"
            onTranscript={setSearch}
          />
          <Label>What registration setting are you looking for?</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by account type or client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 w-full"/>
          </div>
        </div>

        <div className="flex flex-row gap-4 w-full lg:w-auto lg:ml-auto mt-auto">
          <div className="w-1/2 lg:w-auto flex flex-col gap-2">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10! px-3 flex items-center gap-2 bg-background border shadow-sm w-full justify-between">
                <div className="flex items-center gap-2 text-foreground font-normal">
                  <ListFilter className="w-4 h-4 opacity-70" />
                  <span>Filter</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)] lg:w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(val) => setSortBy(val === sortBy ? "" : val)}>
                  <DropdownMenuRadioItem value="account_type_name" className="cursor-pointer gap-2">
                    <Shield className="w-4 h-4 opacity-70" />
                    Account Type
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="client_name" className="cursor-pointer gap-2">
                    <Monitor className="w-4 h-4 opacity-70" />
                    Client Name
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Order By</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sort} onValueChange={(val) => setSort(val === sort ? "" : val)}>
                  <DropdownMenuRadioItem value="asc" className="cursor-pointer gap-2">
                    <ListSortAscending className="w-4 h-4 opacity-70" />
                    Ascending
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="desc" className="cursor-pointer gap-2">
                    <ListSortDescending className="w-4 h-4 opacity-70" />
                    Descending
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </div>
    </div>
  );
}
