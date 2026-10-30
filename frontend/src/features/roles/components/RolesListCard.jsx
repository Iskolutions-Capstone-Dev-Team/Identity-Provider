import RolesListTable from "./RolesListTable";
import RolesListCards from "./RolesListCards";
import Pagination from "../../../components/Pagination";

export default function RolesListCard({ loading = false, roles, totalResults, itemsPerPage, page, totalPages, onPageChange, onView, onEdit, onDelete, colorMode = "light" }) {
  return (
    <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Laptop & Desktop Table (>= 1024px) */}
      <div className="hidden lg:block w-full">
        <RolesListTable
          loading={loading}
          roles={roles}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          colorMode={colorMode}
        />
      </div>

      {/* Mobile & Tablet Cards (< 1024px) */}
      <div className="block lg:hidden w-full">
        <RolesListCards
          loading={loading}
          roles={roles}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          colorMode={colorMode}
        />
      </div>

      {!loading && (
        <div className="w-full">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            totalResults={totalResults}
            currentResultsCount={roles.length}
            variant="glass"
            colorMode={colorMode}
          />
        </div>
      )}
    </div>
  );
}
