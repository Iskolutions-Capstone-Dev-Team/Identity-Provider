import { ADMIN_USER_TYPE, REGULAR_USER_TYPE } from "../../../utils/userPoolAccess";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Shield } from "lucide-react";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { Label } from "@/components/ui/label";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export default function UserPoolFilters({ search, setSearch, userType, setUserType, status, setStatus, showAdminUserType = true }) {
  const visibleUserTypeOptions = showAdminUserType
    ? [
        { value: REGULAR_USER_TYPE, label: "Users", Icon: Users },
        { value: ADMIN_USER_TYPE, label: "Admin", Icon: Shield },
      ]
    : [{ value: REGULAR_USER_TYPE, label: "Users", Icon: Users }];

  return (
    <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm w-full">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6 w-full">
        <div className="flex-1 w-full flex flex-col gap-2 relative">
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

        <div className="w-full lg:w-auto shrink-0 flex flex-col gap-2">
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
      </div>
    </div>
  );
}