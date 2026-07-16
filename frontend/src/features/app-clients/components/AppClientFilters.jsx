import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { Label } from "@/components/ui/label";

export default function AppClientFilters({ search, setSearch }) {
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
            <Input  placeholder="Search by name..."  value={search}  onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10"/>
          </div>
        </div>
      </div>
    </div>
  );
}
