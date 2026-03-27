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

const PAGINATION_VARIANTS = {
  default: {
    containerClassName: "join mt-5 flex justify-center sm:mb-10 lg:mb-0",
    baseButtonClassName:
      "join-item btn btn-square h-12 w-12 border-[#b22222] shadow-none !focus:outline-none !active:bg-transparent !focus:bg-transparent !focus-visible:bg-transparent",
    inactiveButtonClassName:
      "bg-white text-[#b22222] hover:bg-[#ffd700] hover:text-[#991b1b]",
    activeButtonClassName: "pointer-events-none bg-[#b22222] text-white",
    disabledButtonClassName:
      "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-400",
  },
  glass: {
    containerClassName:
      "mt-1 flex flex-wrap justify-center gap-2 lg:justify-end",
    baseButtonClassName:
      "flex h-11 min-w-[2.75rem] items-center justify-center rounded-2xl border px-4 text-sm font-semibold outline-none transition duration-300",
    inactiveButtonClassName:
      "border-[#7b0d15]/10 bg-white/75 text-[#7b0d15] shadow-[0_18px_40px_-34px_rgba(43,3,7,0.45)] hover:border-[#f8d24e]/70 hover:bg-[#fff6dc] hover:text-[#5a0b12]",
    activeButtonClassName:
      "pointer-events-none border-transparent bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)] text-white shadow-[0_20px_45px_-28px_rgba(43,3,7,0.85)]",
    disabledButtonClassName:
      "cursor-not-allowed border-[#7b0d15]/8 bg-white/45 text-[#c8afb4] shadow-none hover:border-[#7b0d15]/8 hover:bg-white/45 hover:text-[#c8afb4]",
  },
  glassDark: {
    containerClassName:
      "mt-1 flex flex-wrap justify-center gap-2 lg:justify-end",
    baseButtonClassName:
      "flex h-11 min-w-[2.75rem] items-center justify-center rounded-2xl border px-4 text-sm font-semibold outline-none transition duration-300",
    inactiveButtonClassName:
      "border-white/10 bg-white/[0.04] text-[#f3e7e9] shadow-[0_18px_40px_-34px_rgba(2,6,23,0.72)] hover:border-[#f8d24e]/55 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]",
    activeButtonClassName:
      "pointer-events-none border-[#f8d24e]/30 bg-[linear-gradient(135deg,#7b0d15_0%,#273449_100%)] text-white shadow-[0_20px_45px_-28px_rgba(2,6,23,0.9)]",
    disabledButtonClassName:
      "cursor-not-allowed border-white/8 bg-white/[0.02] text-[#7d6c74] shadow-none hover:border-white/8 hover:bg-white/[0.02] hover:text-[#7d6c74]",
  },
};

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  variant = "default",
  colorMode = "light",
}) {
  if (totalPages <= 0) {
    return null;
  }

  const visiblePages = getVisiblePages(totalPages, currentPage);
  const showNavigationButtons = totalPages > 5;
  const canGoToPreviousPage = currentPage > 1;
  const canGoToNextPage = currentPage < totalPages;
  const paginationVariant =
    variant === "glass" && colorMode === "dark" ? "glassDark" : variant;
  const styles =
    PAGINATION_VARIANTS[paginationVariant] || PAGINATION_VARIANTS.default;

  const getButtonClassName = ({ isActive = false, isDisabled = false } = {}) => {
    if (isDisabled) {
      return `${styles.baseButtonClassName} ${styles.disabledButtonClassName}`;
    }

    if (isActive) {
      return `${styles.baseButtonClassName} ${styles.activeButtonClassName}`;
    }

    return `${styles.baseButtonClassName} ${styles.inactiveButtonClassName}`;
  };

  return (
    <div className={styles.containerClassName}>
      {showNavigationButtons && (
        <button type="button" aria-label="Previous page" disabled={!canGoToPreviousPage} onClick={() => onPageChange(currentPage - 1)} className={getButtonClassName({ isDisabled: !canGoToPreviousPage })}>
          {"<<"}
        </button>
      )}

      {visiblePages.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`pagination-ellipsis-${index}`} className={getButtonClassName({ isDisabled: true })}>
              ...
            </span>
          );
        }

        const isActive = currentPage === page;

        return (
          <button key={page} type="button" aria-current={isActive ? "page" : undefined} onClick={() => onPageChange(page)} className={getButtonClassName({ isActive })}>
            {page}
          </button>
        );
      })}

      {showNavigationButtons && (
        <button type="button" aria-label="Next page" disabled={!canGoToNextPage} onClick={() => onPageChange(currentPage + 1)} className={getButtonClassName({ isDisabled: !canGoToNextPage })}>
          {">>"}
        </button>
      )}
    </div>
  );
}
