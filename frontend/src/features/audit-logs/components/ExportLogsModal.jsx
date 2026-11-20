import { useState, useMemo, useId } from "react";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function getISODateString(d) {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPastDate(daysAgo = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export const DATE_PRESETS = [
  { key: "7d", label: "Last 7 Days", days: 7 },
  { key: "30d", label: "Last 30 Days", days: 30 },
  { key: "90d", label: "Last 90 Days", days: 90 },
  { key: "1y", label: "Last 1 Year", days: 365 },
  { key: "custom", label: "Custom", days: null },
];

function DatePickerField({
  label,
  id,
  date,
  onSelect,
  minDate,
  maxDate,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5 flex-1 min-w-0">
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={(triggerProps) => (
            <Button
              {...triggerProps}
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              className="group/pick-date w-full justify-between h-10 px-3 text-left font-normal border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <span className={cn("truncate text-sm", !date && "text-muted-foreground")}>
                {date ? format(date, "PPP") : "Pick a date"}
              </span>
              <CalendarIcon
                aria-hidden="true"
                className="size-4 opacity-60 transition-opacity group-hover/pick-date:opacity-100 shrink-0 ml-2"
              />
            </Button>
          )}
        />
        <PopoverContent align="start" className="w-auto p-0 z-50">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDay) => {
              if (selectedDay) {
                onSelect(selectedDay);
                setOpen(false);
              }
            }}
            disabled={(day) => {
              if (minDate && day < minDate) return true;
              if (maxDate && day > maxDate) return true;
              return false;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function ExportLogsModal({
  open,
  onClose,
  onExport,
  isExporting = false,
  canViewSecurityLogs = false,
  defaultLogType = "all",
}) {
  const fromId = useId();
  const toId = useId();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const minAllowedDate = useMemo(() => getPastDate(366), []);

  const [preset, setPreset] = useState("30d");
  const [fromDate, setFromDate] = useState(() => getPastDate(30));
  const [toDate, setToDate] = useState(() => new Date());
  const [logType, setLogType] = useState(() => {
    if (defaultLogType === "security" && canViewSecurityLogs) return "security";
    if (defaultLogType === "transaction") return "audit";
    return "all";
  });
  const [validationError, setValidationError] = useState("");

  const handlePresetSelect = (selectedPreset) => {
    setPreset(selectedPreset.key);
    setValidationError("");
    if (selectedPreset.days !== null) {
      setFromDate(getPastDate(selectedPreset.days));
      setToDate(new Date());
    }
  };

  const handleFromChange = (newFrom) => {
    setFromDate(newFrom);
    if (!newFrom || !toDate) {
      setValidationError("Please select both a start date and an end date.");
      return;
    }
    if (newFrom > toDate) {
      setValidationError("Start date cannot be after end date.");
      return;
    }
    const daySpan = Math.ceil((toDate - newFrom) / (1000 * 60 * 60 * 24));
    if (daySpan > 366) {
      setValidationError("Date range cannot exceed 366 days (1 year).");
      return;
    }
    setValidationError("");
  };

  const handleToChange = (newTo) => {
    setToDate(newTo);
    if (!fromDate || !newTo) {
      setValidationError("Please select both a start date and an end date.");
      return;
    }
    if (fromDate > newTo) {
      setValidationError("Start date cannot be after end date.");
      return;
    }
    const daySpan = Math.ceil((newTo - fromDate) / (1000 * 60 * 60 * 24));
    if (daySpan > 366) {
      setValidationError("Date range cannot exceed 366 days (1 year).");
      return;
    }
    setValidationError("");
  };

  const handleConfirm = () => {
    if (!fromDate || !toDate) {
      setValidationError("Please select both a start date and an end date.");
      return;
    }

    if (fromDate > toDate) {
      setValidationError("Start date cannot be after end date.");
      return;
    }

    const daySpan = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    if (daySpan > 366) {
      setValidationError("Date range cannot exceed 366 days (1 year).");
      return;
    }

    setValidationError("");
    onExport?.({
      from: getISODateString(fromDate),
      to: getISODateString(toDate),
      type: logType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !isExporting && onClose?.()}>
      <DialogContent
        className="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-md md:max-w-lg p-3 sm:p-5"
        closeButtonClassName="text-white hover:text-white/80 hover:bg-white/10 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-muted top-3 right-3 sm:top-4 sm:right-4"
      >
        <DialogHeader className="-mx-3 sm:-mx-5 -mt-3 sm:-mt-5 mb-2 rounded-t-xl border-b p-3 sm:p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle className="text-base sm:text-xl font-bold text-white dark:text-foreground pr-6 sm:pr-0">
            Export Log Records
          </DialogTitle>
          <DialogDescription className="mt-1 text-[11px] sm:text-xs text-white/90 dark:text-muted-foreground">
            Export audit and security logs up to 1 year.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-1 py-1">
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Timeframe Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Timeframe
            </Label>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map((p) => (
                <Button
                  key={p.key}
                  type="button"
                  variant={preset === p.key ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-1 min-w-[70px] text-xs h-9",
                    preset === p.key &&
                      "bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#e6c140]"
                  )}
                  onClick={() => handlePresetSelect(p)}
                  disabled={isExporting}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range - Only displayed when preset === "custom" */}
          {preset === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in-50 duration-200">
              <DatePickerField
                id={fromId}
                label="From"
                date={fromDate}
                onSelect={handleFromChange}
                minDate={minAllowedDate}
                maxDate={toDate || today}
                disabled={isExporting}
              />
              <DatePickerField
                id={toId}
                label="To"
                date={toDate}
                onSelect={handleToChange}
                minDate={fromDate || minAllowedDate}
                maxDate={today}
                disabled={isExporting}
              />
            </div>
          )}

          {/* Log Type Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Log Type
            </Label>
            <Tabs value={logType} onValueChange={setLogType} className="h-10">
              <TabsList className="w-full grid grid-cols-3 h-full">
                <TabsTrigger
                  value="all"
                  disabled={isExporting}
                  className="data-active:!bg-[#7b0d15] data-active:!text-[#f8d24e] dark:data-active:!bg-[#f8d24e] dark:data-active:!text-[#7b0d15] text-xs"
                >
                  All Logs
                </TabsTrigger>
                <TabsTrigger
                  value="audit"
                  disabled={isExporting}
                  className="data-active:!bg-[#7b0d15] data-active:!text-[#f8d24e] dark:data-active:!bg-[#f8d24e] dark:data-active:!text-[#7b0d15] text-xs"
                >
                  Transaction
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  disabled={isExporting || !canViewSecurityLogs}
                  title={!canViewSecurityLogs ? "Security logs permission required" : ""}
                  className="data-active:!bg-[#7b0d15] data-active:!text-[#f8d24e] dark:data-active:!bg-[#f8d24e] dark:data-active:!text-[#7b0d15] text-xs disabled:opacity-40"
                >
                  Security
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isExporting || !!validationError}
            className="w-full sm:w-auto bg-[#7b0d15] text-white hover:bg-[#5a0b12] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#e6c140]"
          >
            {isExporting ? (
              <>
                <span className="loading loading-spinner loading-xs mr-2" />
                Exporting CSV...
              </>
            ) : (
              "Download CSV"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
