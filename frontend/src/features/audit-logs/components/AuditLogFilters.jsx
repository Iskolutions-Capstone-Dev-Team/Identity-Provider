import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, Table, WalletCards, ListFilter, View, User, ShieldAlert, Activity, Calendar, ListSortAscending, ListSortDescending } from "lucide-react";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecurityLogIcon, TransactionLogIcon } from "./auditLogIcons";

const LOG_TYPE_OPTIONS = [
  {
    value: "transaction",
    label: "Transaction Logs",
    icon: <TransactionLogIcon className="size-5" />,
  },
  {
    value: "security",
    label: "Security Logs",
    icon: <SecurityLogIcon className="size-5" />,
  },
];

export default function AuditLogFilters({ 
  search, 
  setSearch, 
  sortBy = "created_at", 
  setSortBy, 
  sort = "desc", 
  setSort, 
  viewType = "table", 
  setViewType,
  logType = "transaction",
  onLogTypeChange,
  canViewSecurityLogs = false
}) {
  const visibleLogTypeOptions = canViewSecurityLogs 
    ? LOG_TYPE_OPTIONS 
    : LOG_TYPE_OPTIONS.filter((option) => option.value !== "security");
  const showLogTypePicker = visibleLogTypeOptions.length > 1;

  return (
    <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6 w-full">
        <div className="w-full lg:w-[400px] flex flex-col gap-2 relative">
          <SpeechInputToolbar
            activeFieldLabel="Log Search"
            onTranscript={setSearch}
          />
          <Label>Which log are you looking for?</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by actor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 w-full"/>
          </div>
        </div>

        {showLogTypePicker && (
          <div className="w-full lg:w-auto shrink-0 flex flex-col gap-2 mt-auto">
            <Label>Log Type</Label>
            <Tabs value={logType} onValueChange={onLogTypeChange} className="h-10!">
              <TabsList className="h-full group-data-horizontal/tabs:h-10!">
                {visibleLogTypeOptions.map((option) => (
                  <TabsTrigger key={option.value} value={option.value} className="h-full px-4 flex items-center gap-2 transition-colors data-[state=active]:bg-[#7b0d15] data-[state=active]:text-[#f8d24e] dark:data-[state=active]:bg-[#f8d24e] dark:data-[state=active]:text-[#7b0d15]">
                    {option.icon} <span className="hidden sm:inline">{option.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

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
                  <DropdownMenuRadioItem value="actor" className="cursor-pointer gap-2">
                    <User className="w-4 h-4 opacity-70" />
                    Actor
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="action" className="cursor-pointer gap-2">
                    <Activity className="w-4 h-4 opacity-70" />
                    Action
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="status" className="cursor-pointer gap-2">
                    <ShieldAlert className="w-4 h-4 opacity-70" />
                    Status
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
