import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}) {
  if (totalPages <= 0) {
    return null;
  }

  const visiblePages = getVisiblePages(totalPages, currentPage);
  const showNavigationButtons = totalPages > 5;
  const canGoToPreviousPage = currentPage > 1;
  const canGoToNextPage = currentPage < totalPages;

  return (
    <ShadcnPagination className="justify-center">
      <PaginationContent>
        {showNavigationButtons && (
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (canGoToPreviousPage) onPageChange(currentPage - 1);
              }}
              className={!canGoToPreviousPage ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        )}

        {visiblePages.map((page, index) => {
          if (page === "...") {
            return (
              <PaginationItem key={`pagination-ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          const isActive = currentPage === page;

          return (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={isActive}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {showNavigationButtons && (
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (canGoToNextPage) onPageChange(currentPage + 1);
              }}
              className={!canGoToNextPage ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </ShadcnPagination>
  );
}
