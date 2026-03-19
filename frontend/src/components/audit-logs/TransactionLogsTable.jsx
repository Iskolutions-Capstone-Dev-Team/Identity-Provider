import TableRowFade from "../TableRowFade";

const headerCellClassName =
  "border-b border-white/10 px-6 py-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90";
const bodyCellClassName =
  "border-b border-[#7b0d15]/10 px-6 py-5 text-center align-middle text-sm text-[#5d3a41]";

function getStatusClasses(status) {
  const normalizedStatus =
    typeof status === "string" ? status.trim().toLowerCase() : "";

  if (normalizedStatus === "success") {
    return "border border-emerald-200/80 bg-emerald-50 text-emerald-700";
  }

  if (normalizedStatus === "fail" || normalizedStatus === "failed") {
    return "border border-red-200/80 bg-red-50 text-red-700";
  }

  return "border border-[#7b0d15]/10 bg-[#fff7ef] text-[#7b0d15]";
}

function getRowClassName(index) {
  return `transition-colors duration-300 ${
    index % 2 === 0
      ? "bg-white/70 hover:bg-[#fff4dc]/70"
      : "bg-[#fff8f3]/80 hover:bg-[#fff4dc]/80"
  }`;
}

export default function TransactionLogsTable({ logs, onView }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/65 shadow-[0_22px_55px_-38px_rgba(43,3,7,0.55)]">
      <div className="overflow-x-auto">
        <table className="table w-full min-w-[72rem] lg:min-w-0">
          <thead>
            <tr className="bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)]">
              <th className={headerCellClassName}>Timestamp</th>
              <th className={headerCellClassName}>Actor</th>
              <th className={headerCellClassName}>Target</th>
              <th className={headerCellClassName}>Status</th>
              <th className={headerCellClassName}>Action</th>
              <th className={headerCellClassName}>View</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-sm text-[#8f6f76]">
                  No transaction logs found
                </td>
              </tr>
            )}

            {logs.map((log, index) => (
              <TableRowFade
                key={log.rowKey ?? log.id ?? `${log.timestamp}-${index}`}
                keyId={log.rowKey ?? log.id ?? `${log.timestamp}-${index}`}
                className={getRowClassName(index)}
              >
                <td className={`${bodyCellClassName} text-[0.82rem] text-[#7b0d15]`}>
                  {log.timestamp}
                </td>
                <td className={`${bodyCellClassName} whitespace-nowrap font-semibold text-[#4a1921]`} title={log.actor}>
                  {log.actor}
                </td>
                <td className={`${bodyCellClassName} max-w-56 break-words`}>
                  {log.target}
                </td>
                <td className={bodyCellClassName}>
                  <span className={`inline-flex min-w-[6rem] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.06em] ${getStatusClasses(log.status)}`}>
                    {log.status}
                  </span>
                </td>
                <td className={`${bodyCellClassName} max-w-44 break-words text-[#7b0d15]`}>
                  {log.action}
                </td>
                <td className={bodyCellClassName}>
                  <button type="button" aria-label={`View ${log.actor} log details`} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.84))] text-[#7b0d15] shadow-[0_14px_30px_-24px_rgba(43,3,7,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]" onClick={() => onView(log)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>
                  </button>
                </td>
              </TableRowFade>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}