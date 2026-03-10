export default function ResultsCount({
  page,
  itemsPerPage,
  totalResults,
  currentResultsCount = 0,
}) {
  const hasResults = totalResults > 0 && currentResultsCount > 0;
  const start = hasResults ? (page - 1) * itemsPerPage + 1 : 0;
  const end = hasResults ? start + currentResultsCount - 1 : 0;

  return (
    <div className="flex items-center justify-center lg:justify-end text-sm text-gray-600 mt-3">
      Showing <span className="mx-1">{start}</span> to
      <span className="mx-1">{end}</span> of
      <span className="mx-1">{totalResults}</span> results
    </div>
  );
}