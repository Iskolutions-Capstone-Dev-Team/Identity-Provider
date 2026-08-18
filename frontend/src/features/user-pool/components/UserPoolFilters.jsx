import { ADMIN_USER_TYPE, REGULAR_USER_TYPE } from "../../../utils/userPoolAccess";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Users, Shield, Table, WalletCards, Settings, ListFilter, View, User, Mail, Activity, Calendar, ListSortAscending, ListSortDescending } from "lucide-react";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { Label } from "@/components/ui/label";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export default function UserPoolFilters({ search, setSearch, userType, setUserType, status, setStatus, sortBy = "created_at", setSortBy, sort = "desc", setSort, viewType = "table", setViewType, showAdminUserType = true }) {
  const visibleUserTypeOptions = showAdminUserType
    ? [
        { value: REGULAR_USER_TYPE, label: "Users", Icon: Users },
        { value: ADMIN_USER_TYPE, label: "Admin", Icon: Shield },
      ]
    : [{ value: REGULAR_USER_TYPE, label: "Users", Icon: Users }];

  return (
    <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6 w-full">
        <div className="w-full lg:w-[400px] flex flex-col gap-2 relative">
          <SpeechInputToolbar
            activeFieldLabel="User Search"
            onTranscript={setSearch}
          />
          <Label>Who are you looking for?</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by email, or name..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        <div className="w-full lg:w-auto shrink-0 flex flex-col gap-2 lg:ml-auto">
          <Label>User Type</Label>
          <Tabs value={userType} onValueChange={setUserType} className="h-10!">
            <TabsList className="h-full group-data-horizontal/tabs:h-10!">
              {visibleUserTypeOptions.map((opt) => (
                <TabsTrigger key={opt.value} value={opt.value} className="h-full px-4 flex items-center gap-2 transition-colors data-active:!bg-[#7b0d15] data-active:!text-[#f8d24e] data-[active]:!bg-[#7b0d15] data-[active]:!text-[#f8d24e] dark:data-active:!bg-[#f8d24e] dark:data-active:!text-[#7b0d15] dark:data-[active]:!bg-[#f8d24e] dark:data-[active]:!text-[#7b0d15]">
                  <opt.Icon className="h-4 w-4" />
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="w-full lg:w-[150px] shrink-0 flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={status || ""} onValueChange={(v) => setStatus(v)}>
            <SelectTrigger className="h-10! w-full">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-row gap-4 w-full lg:w-auto mt-auto">
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
                  <DropdownMenuRadioItem value="first_name" className="cursor-pointer gap-2">
                    <User className="w-4 h-4 opacity-70" />
                    First Name
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="last_name" className="cursor-pointer gap-2">
                    <User className="w-4 h-4 opacity-70" />
                    Last Name
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="email" className="cursor-pointer gap-2">
                    <Mail className="w-4 h-4 opacity-70" />
                    Email
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="status" className="cursor-pointer gap-2">
                    <Activity className="w-4 h-4 opacity-70" />
                    Status
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="created_at" className="cursor-pointer gap-2">
                    <Calendar className="w-4 h-4 opacity-70" />
                    Date Created
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="updated_at" className="cursor-pointer gap-2">
                    <Calendar className="w-4 h-4 opacity-70" />
                    Date Updated
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

          <div className="w-1/2 lg:w-auto flex flex-col gap-2">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10! px-3 flex items-center gap-2 bg-background border shadow-sm w-full justify-between capitalize">
                <div className="flex items-center gap-2 text-foreground font-normal">
                  <View className="w-4 h-4 opacity-70" />
                  <span>View</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)] lg:w-32">
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
    </div>
  );
}