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

  return visiblePages;
}

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
  totalResults = 0,
  currentResultsCount = 0,
}) {
  if (totalPages <= 0) {
    return null;
  }

  const visiblePages = getVisiblePages(totalPages, currentPage);
  const canGoToPreviousPage = currentPage > 1;
  const canGoToNextPage = currentPage < totalPages;

  const hasResults = totalResults > 0 && currentResultsCount > 0;
  const start = hasResults ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const end = hasResults ? start + currentResultsCount - 1 : 0;

  return (
    <ShadcnPagination>
      <PaginationContent className="w-full flex flex-col-reverse sm:grid sm:grid-cols-3 items-center mt-4 gap-4 sm:gap-0">
        <PaginationItem className="flex justify-center sm:justify-start">
          <span className="text-muted-foreground text-sm">
            Showing <span className="text-foreground font-medium">{start}</span> to{" "}
            <span className="text-foreground font-medium">{end}</span> of{" "}
            <span className="text-foreground font-medium">{totalResults}</span> results
          </span>
        </PaginationItem>
        <PaginationItem className="flex items-center justify-center gap-1">
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (canGoToPreviousPage) onPageChange(currentPage - 1);
            }}
            className={!canGoToPreviousPage ? "pointer-events-none opacity-50" : ""}
          />
          
          {visiblePages.map((page, index) => {
            if (page === "...") {
              return (
                <PaginationEllipsis key={`pagination-ellipsis-${index}`} />
              );
            }

            const isActive = currentPage === page;

            return (
              <PaginationLink
                key={page}
                href="#"
                isActive={isActive}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            );
          })}

          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (canGoToNextPage) onPageChange(currentPage + 1);
            }}
            className={!canGoToNextPage ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        <div className="hidden sm:block"></div>
      </PaginationContent>
    </ShadcnPagination>
  );
}
