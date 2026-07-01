import { SolidCheckIcon } from "./DashboardIcons";

const FILTER_OPTIONS = [
  { id: "includeSecurityAnalysis", label: "Security Analysis" },
  { id: "includeAuthStats", label: "Authentication Statistics" },
  { id: "includeFailedAttempts", label: "Failed Attempts" },
];

export default function ReportFilterSelect({ selectedFilters, onChange, colorMode }) {
  const isDarkMode = colorMode === "dark";

  const toggleFilter = (id) => {
    if (selectedFilters.includes(id)) {
      onChange(selectedFilters.filter(f => f !== id));
    } else {
      onChange([...selectedFilters, id]);
    }
  };

  const getPillClassName = (isSelected) => {
    if (isDarkMode) {
      return isSelected
        ? "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 border border-[#f8d24e] bg-[#f8d24e]/20 text-[#f8d24e]"
        : "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 border border-white/10 bg-white/5 text-[#a58d95] hover:border-white/20 hover:bg-white/10";
    } else {
      return isSelected
        ? "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 border border-[#7b0d15] bg-[#7b0d15] text-white shadow-sm"
        : "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 border border-[#7b0d15]/20 bg-white text-[#7d5c62] hover:border-[#7b0d15]/40 hover:bg-[#fff4dc]";
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {FILTER_OPTIONS.map((option) => {
        const isSelected = selectedFilters.includes(option.id);
        return (
          <button key={option.id} type="button" className={getPillClassName(isSelected)} onClick={() => toggleFilter(option.id)}>
            {isSelected && <SolidCheckIcon />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
