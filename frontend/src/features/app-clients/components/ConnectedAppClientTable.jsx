import TableRowFade from "../../../components/TableRowFade";
import DataTableSkeleton from "../../../components/DataTableSkeleton";
import EmptySearchState from "../../../components/EmptySearchState";
import { DeleteIcon, EditIcon, RotateSecretIcon, ViewIcon } from "./appClientIcons";

const getClientId = (client) => client?.id ?? client?.clientId ?? "";

const headerCellClassName =
  "border-b border-white/10 px-6 py-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90";

function renderActionButton({ label, onClick, children, className }) {
  return (
    <button type="button" className={className} onClick={onClick} aria-label={label}>
      {children}
    </button>
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

export default function ConnectedAppClientTable({ loading = false, clients, onView, onEdit, onDelete, onRotateSecret, showEditAction = true, showDeleteAction = true, showRotateSecretAction = true, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const tableTheme = isDarkMode ? "userpoolDark" : "userpool";
  const wrapperClassName = isDarkMode
    ? "overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(28,18,29,0.92))] shadow-[0_22px_55px_-38px_rgba(2,6,23,0.82)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "overflow-hidden rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/65 shadow-[0_22px_55px_-38px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const tableHeaderRowClassName = isDarkMode
    ? "bg-[linear-gradient(135deg,#7b0d15_0%,#253247_55%,#421117_100%)]"
    : "bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)]";
  const bodyCellClassName = isDarkMode
    ? "px-6 py-5 text-center align-middle text-sm text-[#f1e5e7]"
    : "px-6 py-5 text-center align-middle text-sm text-[#5d3a41]";
  const emptyStateClassName = isDarkMode
    ? "px-6 py-16 text-center text-sm text-[#bda8af]"
    : "px-6 py-16 text-center text-sm text-[#8f6f76]";
  const actionButtonClassName = isDarkMode
    ? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-[#f1e5e7] shadow-[0_14px_30px_-24px_rgba(2,6,23,0.72)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f8d24e]/60 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]"
    : "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.84))] text-[#7b0d15] shadow-[0_14px_30px_-24px_rgba(43,3,7,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";
  const logoWrapClassName = isDarkMode
    ? "mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    : "mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]";
  const fallbackLogoTextClassName = isDarkMode
    ? "flex h-full w-full items-center justify-center text-xs font-bold tracking-[0.16em] text-[#ffe28a]"
    : "flex h-full w-full items-center justify-center text-xs font-bold tracking-[0.16em] text-[#7b0d15]";
  const nameCellClassName = isDarkMode
    ? `${bodyCellClassName} font-semibold text-[#f6eaec]`
    : `${bodyCellClassName} font-semibold text-[#4a1921]`;
  const clientIdCellClassName = isDarkMode
    ? `${bodyCellClassName} text-[#f8d996]`
    : `${bodyCellClassName} text-[#7b0d15]`;

  if (loading) {
    return (
      <DataTableSkeleton
        columns={[
          { header: "Logo", type: "avatar" },
          { header: "Name", type: "stackedText" },
          { header: "Client ID", type: "text", width: "w-32" },
          { header: "Created", type: "text", width: "w-24" },
          { header: "Secret", type: "iconButton" },
          { header: "Actions", type: "actions" },
        ]}
        theme={tableTheme}
      />
    );
  }

  return (
    <div className={wrapperClassName}>
      <div className="overflow-x-auto">
        <table className="table w-full min-w-[72rem] lg:min-w-0 lg:table-fixed">
          <thead>
            <tr className={tableHeaderRowClassName}>
              <th className={`${headerCellClassName} w-24`}>Logo</th>
              <th className={headerCellClassName}>Name</th>
              <th className={headerCellClassName}>Client ID</th>
              <th className={headerCellClassName}>Created</th>
              <th className={headerCellClassName}>Secret</th>
              <th className={headerCellClassName}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className={emptyStateClassName}>
                  <EmptySearchState message="No app clients found" colorMode={colorMode} />
                </td>
              </tr>
            )}

            {clients.map((client, index) => (
              <TableRowFade
                key={client.clientId || client.id}
                className={getRowClassName(index, isDarkMode)}
              >
                <td className={bodyCellClassName}>
                  <div className={logoWrapClassName}>
                    {client.image ? (
                      <img
                        src={
                          client.image.startsWith("data:")
                            ? client.image
                            : `${client.image}`
                        }
                        alt={client.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={fallbackLogoTextClassName}>
                        {(client.name || "AC").substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </td>

                <td className={nameCellClassName}>
                  {client.name}
                </td>

                <td className={clientIdCellClassName}>
                  {client.id || client.clientId}
                </td>

                <td className={bodyCellClassName}>{client.created}</td>

                <td className={bodyCellClassName}>
                  {showRotateSecretAction ? (
                    renderActionButton({
                      label: `Rotate secret for ${client.name}`,
                      onClick: () =>
                        onRotateSecret?.({
                          id: getClientId(client),
                          name: client.name,
                        }),
                      className: actionButtonClassName,
                      children: (<RotateSecretIcon />),
                    })
                  ) : (
                    <span className={isDarkMode ? "text-[#a58d95]" : "text-[#8f6f76]"}>
                      -
                    </span>
                  )}
                </td>

                <td className={bodyCellClassName}>
                  <div className="flex items-center justify-center gap-2">
                    {renderActionButton({
                      label: `View ${client.name}`,
                      onClick: () => onView?.(client),
                      className: actionButtonClassName,
                      children: (<ViewIcon />),
                    })}

                    {showEditAction &&
                      renderActionButton({
                        label: `Edit ${client.name}`,
                        onClick: () => onEdit?.(client),
                        className: actionButtonClassName,
                        children: (<EditIcon />),
                      })}

                    {showDeleteAction &&
                      renderActionButton({
                        label: `Delete ${client.name}`,
                        onClick: () => onDelete?.(getClientId(client)),
                        className: actionButtonClassName,
                        children: (<DeleteIcon />),
                      })}
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