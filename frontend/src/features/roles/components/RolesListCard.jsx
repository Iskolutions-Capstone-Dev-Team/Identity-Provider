import RolesListTable from "./RolesListTable";
import RolesListCards from "./RolesListCards";
import Pagination from "../../../components/Pagination";

export default function RolesListCard({ loading = false, roles, totalResults, itemsPerPage, page, totalPages, onPageChange, onView, onEdit, onDelete, colorMode = "light", viewType = "table" }) {


  return (
    <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">

      {viewType === "table" ? (
        <RolesListTable
          loading={loading}
          roles={roles}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          colorMode={colorMode}
        />
      ) : (
        <RolesListCards
          loading={loading}
          roles={roles}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          colorMode={colorMode}
        />
      )}

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