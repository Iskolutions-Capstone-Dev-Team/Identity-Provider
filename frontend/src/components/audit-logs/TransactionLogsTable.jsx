import TableRowFade from "../TableRowFade";

function getStatusClasses(status) {
  const normalizedStatus =
    typeof status === "string" ? status.trim().toLowerCase() : "";

  if (normalizedStatus === "success") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalizedStatus === "fail" || normalizedStatus === "failed") {
    return "border border-red-200 bg-red-50 text-red-700";
  }

  return "border border-gray-200 bg-gray-50 text-gray-700";
}

export default function TransactionLogsTable({ logs, onView }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-[#991b1b]">
              <th className="text-center text-white">Timestamp</th>
              <th className="text-center text-white">Actor</th>
              <th className="text-center text-white">Target</th>
              <th className="text-center text-white">Status</th>
              <th className="text-center text-white">Action</th>
              <th className="text-center text-white">View</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">
                  No transaction logs found
                </td>
              </tr>
            )}

            {logs.map((log, index) => (
              <TableRowFade
                key={log.rowKey ?? log.id ?? `${log.timestamp}-${index}`}
                keyId={log.rowKey ?? log.id ?? `${log.timestamp}-${index}`}
              >
                <td className="border-gray-200 text-center font-mono text-sm text-[#991b1b]">
                  {log.timestamp}
                </td>
                <td className="max-w-56 border-gray-200 text-center break-words text-[#991b1b]">
                  {log.actor}
                </td>
                <td className="max-w-56 border-gray-200 text-center break-words text-[#991b1b]">
                  {log.target}
                </td>
                <td className="border-gray-200 text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(log.status)}`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="max-w-44 border-gray-200 text-center break-words text-[#991b1b]">
                  {log.action}
                </td>
                <td className="border-gray-200 text-center">
                  <button
                    type="button"
                    className="btn btn-sm rounded-lg border-[#991b1b] bg-white text-[#991b1b] shadow-none hover:border-[#ffd700] hover:bg-[#ffd700] hover:text-[#991b1b]"
                    onClick={() => onView(log)}
                  >
                    View
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
