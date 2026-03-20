import TableRowFade from "../TableRowFade";
import DataTableSkeleton from "../DataTableSkeleton";

const headerCellClassName =
  "border-b border-white/10 px-6 py-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90";
const bodyCellClassName =
  "border-b border-[#7b0d15]/10 px-6 py-5 text-center align-middle text-sm text-[#5d3a41]";

function getRowClassName(index) {
  return `transition-colors duration-300 ${
    index % 2 === 0
      ? "bg-white/70 hover:bg-[#fff4dc]/70"
      : "bg-[#fff8f3]/80 hover:bg-[#fff4dc]/80"
  }`;
}

function renderActionButton({ buttonKey, label, onClick, children }) {
  return (
    <button key={buttonKey} type="button" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.84))] text-[#7b0d15] shadow-[0_14px_30px_-24px_rgba(43,3,7,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]" onClick={onClick} aria-label={label}>
      {children}
    </button>
  );
}

function getRoleActions(role, { onView, onEdit, onDelete }) {
  const actions = [
    {
      key: "view",
      label: `View ${role.role_name}`,
      onClick: () => onView(role),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    },
  ];

  if (role.canUpdate) {
    actions.push({
      key: "edit",
      label: `Edit ${role.role_name}`,
      onClick: () => onEdit(role),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
        </svg>
      ),
    });
  }

  if (role.canDelete) {
    actions.push({
      key: "delete",
      label: `Delete ${role.role_name}`,
      onClick: () => onDelete(role.id),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.108 0 0 0-7.5 0" />
        </svg>
      ),
    });
  }

  return actions;
}

export default function RolesListTable({ loading = false, roles, onView, onEdit, onDelete }) {
  if (loading) {
    return (
      <DataTableSkeleton
        theme="userpool"
        columns={[
          { header: "Role Name", type: "text", width: "w-28" },
          { header: "Description", type: "text", width: "w-36" },
          { header: "Created", type: "text", width: "w-24" },
          { header: "Actions", type: "actions" },
        ]}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/65 shadow-[0_22px_55px_-38px_rgba(43,3,7,0.55)]">
      <div className="overflow-x-auto">
        <table className="table w-full min-w-[56rem] lg:min-w-0 lg:table-fixed">
          <thead>
            <tr className="bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)]">
              <th className={headerCellClassName}>Role Name</th>
              <th className={headerCellClassName}>Description</th>
              <th className={headerCellClassName}>Created</th>
              <th className={headerCellClassName}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-sm text-[#8f6f76]">
                  No roles found
                </td>
              </tr>
            )}

            {roles.map((role, index) => (
              <TableRowFade key={role.id} className={getRowClassName(index)}>
                <td className={`${bodyCellClassName} font-semibold text-[#4a1921]`}>
                  {role.role_name}
                </td>
                <td className={bodyCellClassName}>{role.description}</td>
                <td className={`${bodyCellClassName} text-[#7b0d15]`}>
                  {role.created_at}
                </td>
                <td className={bodyCellClassName}>
                  <div className="flex items-center justify-center gap-2">
                    {getRoleActions(role, { onView, onEdit, onDelete }).map((action) =>
                      renderActionButton({
                        buttonKey: action.key,
                        label: action.label,
                        onClick: action.onClick,
                        children: action.icon,
                      }),
                    )}
                  </div>
                </td>
              </TableRowFade>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}