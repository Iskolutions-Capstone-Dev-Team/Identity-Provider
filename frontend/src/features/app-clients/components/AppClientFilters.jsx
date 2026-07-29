import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, Table, WalletCards, ListFilter, View, Monitor, AlignLeft, Calendar, Link, ListSortAscending, ListSortDescending } from "lucide-react";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { Label } from "@/components/ui/label";

export default function AppClientFilters({ search, setSearch, sortBy = "created_at", setSortBy, sort = "desc", setSort, viewType = "table", setViewType }) {
  return (
    <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6 w-full">
        <div className="w-full lg:w-[400px] flex flex-col gap-2 relative">
          <SpeechInputToolbar
            activeFieldLabel="Client Search"
            onTranscript={setSearch}
          />
          <Label>What client are you looking for?</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 w-full"/>
          </div>
        </div>

        <div className="w-full lg:w-auto shrink-0 flex flex-col gap-2 lg:ml-auto mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10! px-3 flex items-center gap-2 bg-background border shadow-sm w-full justify-between">
                <div className="flex items-center gap-2 text-foreground font-normal">
                  <ListFilter className="w-4 h-4 opacity-70" />
                  <span>Filter</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                  <DropdownMenuRadioItem value="client_name" className="cursor-pointer gap-2">
                    <Monitor className="w-4 h-4 opacity-70" />
                    Client Name
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="description" className="cursor-pointer gap-2">
                    <AlignLeft className="w-4 h-4 opacity-70" />
                    Description
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="base_url" className="cursor-pointer gap-2">
                    <Link className="w-4 h-4 opacity-70" />
                    Base URL
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="created_at" className="cursor-pointer gap-2">
                    <Calendar className="w-4 h-4 opacity-70" />
                    Date Created
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Order By</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
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

        <div className="w-full lg:w-auto shrink-0 flex flex-col gap-2 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10! px-3 flex items-center gap-2 bg-background border shadow-sm w-full justify-between capitalize">
                <div className="flex items-center gap-2 text-foreground font-normal">
                  <View className="w-4 h-4 opacity-70" />
                  <span>View</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuGroup>
                <DropdownMenuLabel>View</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={viewType} onValueChange={setViewType}>
                  <DropdownMenuRadioItem value="card" className="cursor-pointer gap-2">
                    <WalletCards className="w-4 h-4 opacity-70" />
                    Card
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="table" className="cursor-pointer gap-2">
                    <Table className="w-4 h-4 opacity-70" />
                    Table
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
