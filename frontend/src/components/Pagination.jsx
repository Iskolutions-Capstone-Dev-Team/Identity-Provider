export default function Pagination({ totalPages, currentPage, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="join flex justify-center mt-5 sm:mb-10 lg:mb-0">
      {pages.map((page) => {
        const isActive = currentPage === page;

        return (
          <button key={page} onClick={() => onPageChange(page)}
            className={`join-item btn btn-square h-12 w-12 border-[#b22222] shadow-none
              !focus:outline-none !active:bg-transparent !focus:bg-transparent !focus-visible:bg-transparent
              ${
                isActive
                  ? "bg-[#b22222] text-white pointer-events-none"
                  : "bg-white text-[#b22222] hover:bg-[#ffd700] hover:text-[#991b1b]"
              }`}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
}