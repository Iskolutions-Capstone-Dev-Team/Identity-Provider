import RegistrationTable from "./RegistrationTable";
import RegistrationCards from "./RegistrationCards";

export default function RegistrationListCard({
  children,
  loading = false,
  rows = [],
  onView,
  onEdit,
  onDelete,
  colorMode = "light",
  tableContent = null,
  showEditAction = true,
  showDeleteAction = true,
}) {
  return (
    <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">
      {children}

      {tableContent || (
        <>
          {/* Laptop & Desktop Table (>= 1024px) */}
          <div className="hidden lg:block w-full">
            <RegistrationTable
              loading={loading}
              rows={rows}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              showEditAction={showEditAction}
              showDeleteAction={showDeleteAction}
              colorMode={colorMode}
            />
          </div>

          {/* Mobile & Tablet Cards (< 1024px) */}
          <div className="block lg:hidden w-full">
            <RegistrationCards
              loading={loading}
              rows={rows}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              showEditAction={showEditAction}
              showDeleteAction={showDeleteAction}
              colorMode={colorMode}
            />
          </div>
        </>
      )}
    </div>
  );
}
