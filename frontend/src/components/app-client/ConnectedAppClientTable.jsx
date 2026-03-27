import TableRowFade from "../TableRowFade";
import DataTableSkeleton from "../DataTableSkeleton";

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

export default function ConnectedAppClientTable({ loading = false, clients, onView, onEdit, onDelete, onRotateSecret, colorMode = "light" }) {
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
                  No app clients found
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
                  {renderActionButton({
                    label: `Rotate secret for ${client.name}`,
                    onClick: () =>
                      onRotateSecret?.({
                        id: getClientId(client),
                        name: client.name,
                      }),
                    className: actionButtonClassName,
                    children: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"/>
                      </svg>
                    ),
                  })}
                </td>

                <td className={bodyCellClassName}>
                  <div className="flex items-center justify-center gap-2">
                    {renderActionButton({
                      label: `View ${client.name}`,
                      onClick: () => onView?.(client),
                      className: actionButtonClassName,
                      children: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        </svg>
                      ),
                    })}

                    {renderActionButton({
                      label: `Edit ${client.name}`,
                      onClick: () => onEdit?.(client),
                      className: actionButtonClassName,
                      children: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"/>
                        </svg>
                      ),
                    })}

                    {renderActionButton({
                      label: `Delete ${client.name}`,
                      onClick: () => onDelete?.(getClientId(client)),
                      className: actionButtonClassName,
                      children: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.108 0 0 0-7.5 0"/>
                        </svg>
                      ),
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