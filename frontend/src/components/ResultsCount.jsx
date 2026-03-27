export default function ResultsCount({
  page,
  itemsPerPage,
  totalResults,
  currentResultsCount = 0,
  variant = "default",
  colorMode = "light",
}) {
  const hasResults = totalResults > 0 && currentResultsCount > 0;
  const start = hasResults ? (page - 1) * itemsPerPage + 1 : 0;
  const end = hasResults ? start + currentResultsCount - 1 : 0;
  const isDarkMode = colorMode === "dark";
  const containerClassName =
    variant === "glass"
      ? `inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium ${
          isDarkMode
            ? "border-white/10 bg-white/[0.04] text-[#dac7cc] shadow-[0_18px_40px_-34px_rgba(2,6,23,0.72)]"
            : "border-[#7b0d15]/10 bg-white/75 text-[#6f4f56] shadow-[0_18px_40px_-34px_rgba(43,3,7,0.45)]"
        }`
      : "flex items-center justify-center lg:justify-end mt-3 text-sm text-gray-600";

  return (
    <div className={containerClassName}>
      Showing <span className="mx-1">{start}</span> to
      <span className="mx-1">{end}</span> of
      <span className="mx-1">{totalResults}</span> results
    </div>
  );
}
