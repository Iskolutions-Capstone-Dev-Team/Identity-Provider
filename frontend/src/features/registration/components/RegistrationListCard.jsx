import Pagination from "../../../components/Pagination";
import RegistrationTable from "./RegistrationTable";
import RegistrationCards from "./RegistrationCards";
import ResultsCount from "../../../components/ResultsCount";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { SearchIcon } from "./registrationIcons";
import { Input } from "@/components/ui/input";
import { Search, Table, WalletCards, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
export default function RegistrationListCard({
  children,
  loading = false,
  rows = [],
  onView,
  onEdit,
  onDelete,
  colorMode = "light",
  viewType = "table",
  tableContent = null,
  showEditAction = true,
  showDeleteAction = true,
}) {
  const isDarkMode = colorMode === "dark";
  return (
    <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">

      {children}

      {tableContent || (
        viewType === "table" ? (
          <RegistrationTable
            loading={loading}
            rows={rows}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            showEditAction={showEditAction}
            showDeleteAction={showDeleteAction}
            colorMode={colorMode}
          />
        ) : (
          <RegistrationCards
            loading={loading}
            rows={rows}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            showEditAction={showEditAction}
            showDeleteAction={showDeleteAction}
            colorMode={colorMode}
          />
        )
      )}

    </div>
  );
}