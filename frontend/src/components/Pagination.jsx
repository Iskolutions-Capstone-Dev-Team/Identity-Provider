function getVisiblePages(totalPages, currentPage) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const showFirstAndLastPages =
    currentPage <= 2 || currentPage >= totalPages - 1;
  const showLastFourPages = currentPage >= totalPages - 3;

  let pageNumbers = [currentPage, currentPage + 1, totalPages - 1, totalPages];

  if (showFirstAndLastPages) {
    pageNumbers = [1, 2, totalPages - 1, totalPages];
  } else if (showLastFourPages) {
    pageNumbers = [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  const uniquePages = [...new Set(pageNumbers)]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((firstPage, secondPage) => firstPage - secondPage);
  const visiblePages = [];

  if (uniquePages[0] > 1) {
    visiblePages.push("...");
  }

  uniquePages.forEach((page, index) => {
    const previousPage = uniquePages[index - 1];

    if (index > 0 && page - previousPage > 1) {
      visiblePages.push("...");
    }

    visiblePages.push(page);
  });

  return visiblePages;
}

export default function Pagination({ totalPages, currentPage, onPageChange }) {
  if (totalPages <= 0) {
    return null;
  }

  const visiblePages = getVisiblePages(totalPages, currentPage);
  const showNavigationButtons = totalPages > 5;
  const canGoToPreviousPage = currentPage > 1;
  const canGoToNextPage = currentPage < totalPages;
  const baseButtonClassName =
    "join-item btn btn-square h-12 w-12 border-[#b22222] shadow-none !focus:outline-none !active:bg-transparent !focus:bg-transparent !focus-visible:bg-transparent";
  const inactiveButtonClassName =
    "bg-white text-[#b22222] hover:bg-[#ffd700] hover:text-[#991b1b]";
  const activeButtonClassName = "bg-[#b22222] text-white pointer-events-none";
  const disabledButtonClassName =
    "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-400";

  const getButtonClassName = ({ isActive = false, isDisabled = false } = {}) => {
    if (isDisabled) {
      return `${baseButtonClassName} ${disabledButtonClassName}`;
    }

    if (isActive) {
      return `${baseButtonClassName} ${activeButtonClassName}`;
    }

    return `${baseButtonClassName} ${inactiveButtonClassName}`;
  };

  return (
    <div className="join mt-5 flex justify-center sm:mb-10 lg:mb-0">
      {showNavigationButtons && (
        <button
          type="button"
          aria-label="Previous page"
          disabled={!canGoToPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
          className={getButtonClassName({ isDisabled: !canGoToPreviousPage })}
        >
          {"<<"}
        </button>
      )}

      {visiblePages.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`pagination-ellipsis-${index}`}
              className={getButtonClassName({ isDisabled: true })}
            >
              ...
            </span>
          );
        }

        const isActive = currentPage === page;

        return (
          <button
            key={page}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onPageChange(page)}
            className={getButtonClassName({ isActive })}
          >
            {page}
          </button>
        );
      })}

      {showNavigationButtons && (
        <button
          type="button"
          aria-label="Next page"
          disabled={!canGoToNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          className={getButtonClassName({ isDisabled: !canGoToNextPage })}
        >
          {">>"}
        </button>
      )}
    </div>
  );
}