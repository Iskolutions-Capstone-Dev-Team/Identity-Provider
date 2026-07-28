import { Input } from "@/components/ui/input";
import { Search, Table, WalletCards, ChevronDown } from "lucide-react";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function AppClientFilters({ search, setSearch, viewType, setViewType }) {
  return (
    <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6 w-full">
        <div className="flex-1 w-full flex flex-col gap-2 relative">
          <SpeechInputToolbar
            activeFieldLabel="Client Search"
            onTranscript={setSearch}
          />
          <Label>What are you looking for?</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input  placeholder="Search by name..."  value={search}  onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 w-full"/>
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
  );
}
