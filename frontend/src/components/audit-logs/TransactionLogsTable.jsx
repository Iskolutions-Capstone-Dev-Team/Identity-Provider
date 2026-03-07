import TableRowFade from "../TableRowFade";

export default function TransactionLogsTable({ logs }) {
    return (
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr className="bg-[#991b1b]">
                            <th className="text-white text-center">Timestamp</th>
                            <th className="text-white text-center">Email</th>
                            <th className="text-white text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-500">
                                    No transaction logs found
                                </td>
                            </tr>
                        )}

                        {logs.map((log, index) => (
                            <TableRowFade key={log.id ?? `${log.timestamp}-${index}`}>
                                <td className="text-[#991b1b] text-center border-gray-200">
                                    {log.timestamp}
                                </td>
                                <td className="text-[#991b1b] text-center border-gray-200">
                                    {log.email}
                                </td>
                                <td className="text-[#991b1b] text-center border-gray-200">
                                    {log.action}
                                </td>
                            </TableRowFade>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}