export default function AuditLogs({ logs }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,243,0.86))] shadow-[0_32px_90px_-54px_rgba(43,3,7,0.85)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.16),transparent_22%),linear-gradient(180deg,rgba(123,13,21,0.04),transparent_38%)]" />

      <div className="relative space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="border-b border-[#7b0d15]/10 pb-5">
          <h3 className="text-2xl font-semibold text-[#351018]">Recent Changes</h3>
          <p className="mt-1 text-sm text-[#8a6971]">Recent account activities and changes</p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/78 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)]">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-[linear-gradient(135deg,rgba(123,13,21,0.96),rgba(43,3,7,0.95))] text-left text-xs uppercase tracking-[0.08em] text-white/90">
                <tr>
                  <th className="px-5 py-4 font-semibold">Timestamp</th>
                  <th className="px-5 py-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#7b0d15]/10">
                {logs.map((log, idx) => (
                  <tr key={idx} className="transition hover:bg-[#fff8ef]">
                    <td className="px-5 py-4 text-sm text-[#5d3a41]">{log.timestamp}</td>
                    <td className="px-5 py-4 text-sm font-medium text-[#351018]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}