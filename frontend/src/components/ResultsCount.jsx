export default function ResultsCount({ page, itemsPerPage, totalResults,}) {
  const start = totalResults === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const end = totalResults === 0 ? 0 : Math.min(page * itemsPerPage, totalResults);

  return (
    <div className="flex items-center justify-center lg:justify-end text-sm text-gray-600 mt-3">
      Showing <span className="mx-1">{start}</span> to
      <span className="mx-1">{end}</span> of
      <span className="mx-1">{totalResults}</span> results
    </div>
  );
}
