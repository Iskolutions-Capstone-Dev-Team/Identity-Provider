import TableRowFade from "../../../components/TableRowFade";
import DataTableSkeleton from "../../../components/DataTableSkeleton";
import EmptySearchState from "../../../components/EmptySearchState";
import { ViewIcon, EditIcon, DeleteIcon } from "./roleIcons";

const headerCellClassName =
  "border-b border-white/10 px-6 py-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90";

function renderPermissionLabels( role, emptyStateClassName, listClassName, badgeClassName ) {
  if (!Array.isArray(role.permissionLabels) || role.permissionLabels.length === 0) {
    return <span className={emptyStateClassName}>No permissions</span>;
  }

  return (
    <div className={listClassName}>
      {role.permissionLabels.map((permission) => (
        <span key={permission} className={badgeClassName}>
          {permission}
        </span>
      ))}
    </div>
  );
}

function getRowClassName(index, isDarkMode) {
  if (isDarkMode) {
    return `transition-colors duration-500 ease-out ${
      index % 2 === 0
        ? "bg-white/[0.03] hover:bg-[#f8d24e]/[0.08]"
        : "bg-[#7b0d15]/[0.08] hover:bg-[#7b0d15]/[0.16]"
    }`;
  }

  return `transition-colors duration-500 ease-out ${
    index % 2 === 0
      ? "bg-white/70 hover:bg-[#fff4dc]/70"
      : "bg-[#fff8f3]/80 hover:bg-[#fff4dc]/80"
  }`;
}

function renderActionButton({ buttonKey, label, onClick, children, className }) {
  return (
    <button key={buttonKey} type="button" className={className} onClick={onClick} aria-label={label}>
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
      icon: <ViewIcon />
    },
  ];

  if (role.canEdit) {
    actions.push({
      key: "edit",
      label: `Edit ${role.role_name}`,
      onClick: () => onEdit(role),
      icon: <EditIcon />
    });
  }

  if (role.canDelete) {
    actions.push({
      key: "delete",
      label: `Delete ${role.role_name}`,
      onClick: () => onDelete(role.id),
      icon: <DeleteIcon />
    });
  }

  return actions;
}

export default function RolesListTable({ loading = false, roles, onView, onEdit, onDelete, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const tableTheme = isDarkMode ? "userpoolDark" : "userpool";
  const wrapperClassName = isDarkMode
    ? "overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(28,18,29,0.92))] shadow-[0_22px_55px_-38px_rgba(2,6,23,0.82)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "overflow-hidden rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/65 shadow-[0_22px_55px_-38px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const tableHeaderRowClassName = isDarkMode
    ? "bg-[linear-gradient(135deg,#7b0d15_0%,#253247_55%,#421117_100%)]"
    : "bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)]";
  const bodyCellClassName = isDarkMode
    ? "border-b border-white/10 px-6 py-5 text-center align-middle text-sm text-[#f1e5e7]"
    : "border-b border-[#7b0d15]/10 px-6 py-5 text-center align-middle text-sm text-[#5d3a41]";
  const roleNameCellClassName = isDarkMode
    ? `${bodyCellClassName} font-semibold text-[#f6eaec]`
    : `${bodyCellClassName} font-semibold text-[#4a1921]`;
  const permissionsListClassName =
    "mx-auto grid w-full max-w-[24rem] grid-cols-2 gap-3 min-[1700px]:grid-cols-3";
  const permissionsBadgeClassName = isDarkMode
    ? "inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl border border-[#f8d24e]/35 bg-[#f8d24e]/10 px-3 py-2 text-center text-xs font-semibold leading-tight text-[#ffe28a] shadow-[0_12px_24px_-20px_rgba(248,210,78,0.75)]"
    : "inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl border border-[#f8d24e]/45 bg-[#fff4dc] px-3 py-2 text-center text-xs font-semibold leading-tight text-[#7b0d15] shadow-[0_12px_24px_-20px_rgba(123,13,21,0.35)]";
  const permissionEmptyStateClassName = isDarkMode
    ? "italic text-[#a58d95]"
    : "italic text-[#8f6f76]";
  const emptyStateClassName = isDarkMode
    ? "px-6 py-16 text-center text-sm text-[#bda8af]"
    : "px-6 py-16 text-center text-sm text-[#8f6f76]";
  const actionButtonClassName = isDarkMode
    ? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-[#f1e5e7] shadow-[0_14px_30px_-24px_rgba(2,6,23,0.72)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f8d24e]/60 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]"
    : "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.84))] text-[#7b0d15] shadow-[0_14px_30px_-24px_rgba(43,3,7,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";

  if (loading) {
    return (
      <DataTableSkeleton
        theme={tableTheme}
        columns={[
          { header: "Role Name", type: "text", width: "w-28" },
          { header: "Description", type: "text", width: "w-36" },
          { header: "Permissions", type: "text", width: "w-40" },
          { header: "Actions", type: "actions" },
        ]}
      />
    );
  }

  return (
    <div className={wrapperClassName}>
      <div className="overflow-x-auto">
        <table className="table w-full min-w-[64rem] lg:min-w-0 lg:table-fixed">
          <thead>
            <tr className={tableHeaderRowClassName}>
              <th className={headerCellClassName}>Role Name</th>
              <th className={headerCellClassName}>Description</th>
              <th className={headerCellClassName}>Permissions</th>
              <th className={headerCellClassName}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.length === 0 && (
              <tr>
                <td colSpan={4} className={emptyStateClassName}>
                  <EmptySearchState message="No roles found" colorMode={colorMode} />
                </td>
              </tr>
            )}

            {roles.map((role, index) => (
              <TableRowFade key={role.id} className={getRowClassName(index, isDarkMode)}>
                <td className={roleNameCellClassName}>
                  {role.role_name}
                </td>
                <td className={bodyCellClassName}>{role.description}</td>
                <td className={bodyCellClassName}>
                  {renderPermissionLabels(
                    role,
                    permissionEmptyStateClassName,
                    permissionsListClassName,
                    permissionsBadgeClassName,
                  )}
                </td>
                <td className={bodyCellClassName}>
                  <div className="flex items-center justify-center gap-2">
                    {getRoleActions(role, { onView, onEdit, onDelete }).map((action) =>
                      renderActionButton({
                        buttonKey: action.key,
                        label: action.label,
                        onClick: action.onClick,
                        className: actionButtonClassName,
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