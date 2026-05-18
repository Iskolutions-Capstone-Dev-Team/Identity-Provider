import TableRowFade from "../TableRowFade";

const headerCellClassName =
  "border-b border-white/10 px-6 py-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90";
const MAX_VISIBLE_CLIENT_SLOTS = 5;

function getPreviewClientItems(clientNames = []) {
  const normalizedClientNames = Array.isArray(clientNames) ? clientNames : [];
  return normalizedClientNames.slice(0, MAX_VISIBLE_CLIENT_SLOTS);
}

function getRemainingClientCount(totalClientCount = 0) {
  return Math.max(0, totalClientCount - MAX_VISIBLE_CLIENT_SLOTS);
}

function getRowClassName(index, isDarkMode) {
  if (isDarkMode) {
    return `transition-colors duration-500 ease-out ${
      index % 2 === 0
        ? "bg-white/[0.03] hover:bg-[#f8d24e]/[0.08]"
        : "bg-[#7b0d15]/[0.08] hover:bg-[#7b0d15]/[0.16]"
    }`;
  }

  return `transition-colors duration-300 ${
    index % 2 === 0
      ? "bg-white/70 hover:bg-[#fff4dc]/70"
      : "bg-[#fff8f3]/80 hover:bg-[#fff4dc]/80"
  }`;
}

export default function RegistrationTable({ rows = [], onView, onEdit, onDelete, showEditAction = true, showDeleteAction = true, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const wrapperClassName = isDarkMode
    ? "overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(28,18,29,0.92))] shadow-[0_22px_55px_-38px_rgba(2,6,23,0.82)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "overflow-hidden rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/65 shadow-[0_22px_55px_-38px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const tableHeaderRowClassName = isDarkMode
    ? "bg-[linear-gradient(135deg,#7b0d15_0%,#253247_55%,#421117_100%)]"
    : "bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)]";
  const bodyCellClassName = isDarkMode
    ? "border-b border-white/10 px-6 py-5 text-center align-middle text-sm text-[#f1e5e7]"
    : "border-b border-[#7b0d15]/10 px-6 py-5 text-center align-middle text-sm text-[#5d3a41]";
  const accountTypeCellClassName = isDarkMode
    ? `${bodyCellClassName} whitespace-nowrap font-semibold text-[#f6eaec]`
    : `${bodyCellClassName} whitespace-nowrap font-semibold text-[#4a1921]`;
  const clientBadgeClassName = isDarkMode
    ? "inline-flex items-center whitespace-nowrap rounded-full border border-[#f8d24e]/25 bg-[#f8d24e]/12 px-3 py-1 text-xs font-semibold text-[#ffe28a]"
    : "inline-flex items-center whitespace-nowrap rounded-full border border-[#f8d24e]/45 bg-[#fff4dc] px-3 py-1 text-xs font-semibold text-[#7b0d15]";
  const emptyClientListClassName = isDarkMode
    ? "italic text-[#a58d95]"
    : "italic text-[#8f6f76]";
  const moreClientsClassName = isDarkMode
    ? "mt-3 text-center text-xs font-semibold tracking-[0.08em] text-[#c7adb4]"
    : "mt-3 text-center text-xs font-semibold tracking-[0.08em] text-[#8f6f76]";
  const emptyStateClassName = isDarkMode
    ? "px-6 py-16 text-center text-sm text-[#bda8af]"
    : "px-6 py-16 text-center text-sm text-[#8f6f76]";
  const actionButtonClassName = isDarkMode
    ? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-[#f1e5e7] shadow-[0_14px_30px_-24px_rgba(2,6,23,0.72)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f8d24e]/60 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]"
    : "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.84))] text-[#7b0d15] shadow-[0_14px_30px_-24px_rgba(43,3,7,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";

  return (
    <div className={wrapperClassName}>
      <div className="overflow-x-auto">
        <table className="table w-full min-w-[60rem] lg:min-w-0">
          <thead>
            <tr className={tableHeaderRowClassName}>
              <th className={headerCellClassName}>Account Type</th>
              <th className={headerCellClassName}>Client List</th>
              <th className={headerCellClassName}>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className={emptyStateClassName}>
                  No account type found
                </td>
              </tr>
            )}

            {rows.map((row, index) => {
              const previewClientItems = getPreviewClientItems(row.clientNames);
              const remainingClientCount = getRemainingClientCount(
                row.totalClientCount,
              );

              return (
                <TableRowFade
                  key={row.accountType}
                  keyId={row.accountType}
                  className={getRowClassName(index, isDarkMode)}
                >
                  <td className={accountTypeCellClassName}>{row.label}</td>
                  <td className={bodyCellClassName}>
                    {row.clientNames.length > 0 ? (
                      <div className="mx-auto max-w-[24rem]">
                        <div className="grid grid-cols-1 gap-2">
                          {previewClientItems.map((clientName, previewIndex) => (
                            <div key={`${row.accountType}-${clientName}-${previewIndex}`} className="flex justify-center">
                              <span className={clientBadgeClassName}>
                                {clientName}
                              </span>
                            </div>
                          ))}
                        </div>
                        {remainingClientCount > 0 && (
                          <p className={moreClientsClassName}>
                            +{remainingClientCount} more{" "}
                            {remainingClientCount === 1 ? "client" : "clients"}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className={emptyClientListClassName}>
                        No pre-approved clients
                      </span>
                    )}
                  </td>
                  <td className={bodyCellClassName}>
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" aria-label={`View ${row.label} registration settings`} className={actionButtonClassName} onClick={() => onView(row)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        </svg>
                      </button>

                      {showEditAction && (
                        <button type="button" aria-label={`Edit ${row.label} registration settings`} className={actionButtonClassName} onClick={() => onEdit(row)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a2.25 2.25 0 1 1 3.182 3.182L10.582 17.13a4.5 4.5 0 0 1-1.897 1.13L6 19l.74-2.685a4.5 4.5 0 0 1 1.13-1.897l8.992-8.99Zm0 0L19.5 7.125"/>
                          </svg>
                        </button>
                      )}

                      {showDeleteAction && row.canDelete !== false && (
                        <button type="button" aria-label={`Delete ${row.label} registration settings`} className={actionButtonClassName} onClick={() => onDelete(row)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21.75H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0V4.875c0-1.242-.91-2.281-2.133-2.438a49.403 49.403 0 0 0-3.734 0C8.66 2.594 7.75 3.633 7.75 4.875v.518m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </TableRowFade>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}