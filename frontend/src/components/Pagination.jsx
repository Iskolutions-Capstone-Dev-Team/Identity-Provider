function getVisiblePages(totalPages, currentPage) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const maxVisiblePages = 4;
  let startPage = 1;

  if (currentPage <= 2) {
    startPage = 1;
  } else if (currentPage >= totalPages - (maxVisiblePages - 1)) {
    startPage = totalPages - (maxVisiblePages - 1);
  } else {
    startPage = currentPage;
  }

  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );
  const visiblePages = [];

  if (startPage > 1) {
    visiblePages.push("...");
  }

  pageNumbers.forEach((page) => {
    visiblePages.push(page);
  });

  if (endPage < totalPages) {
    visiblePages.push("...");
  }

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
