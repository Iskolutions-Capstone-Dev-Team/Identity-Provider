export default function AuditLogs({ logs, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const wrapperClassName = isDarkMode
    ? "relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(33,21,30,0.92))] shadow-[0_32px_90px_-54px_rgba(2,6,23,0.9)] backdrop-blur-2xl transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,243,0.86))] shadow-[0_32px_90px_-54px_rgba(43,3,7,0.85)] backdrop-blur-2xl transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const overlayClassName = isDarkMode
    ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.12),transparent_22%),linear-gradient(180deg,rgba(123,13,21,0.1),transparent_38%)]"
    : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.16),transparent_22%),linear-gradient(180deg,rgba(123,13,21,0.04),transparent_38%)]";
  const headerClassName = `border-b pb-5 ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;
  const titleClassName = isDarkMode
    ? "text-2xl font-semibold text-[#f6eaec] transition-colors duration-500 ease-out"
    : "text-2xl font-semibold text-[#351018] transition-colors duration-500 ease-out";
  const descriptionClassName = isDarkMode
    ? "mt-1 text-sm text-[#c7adb4] transition-colors duration-500 ease-out"
    : "mt-1 text-sm text-[#8a6971] transition-colors duration-500 ease-out";
  const tableWrapClassName = isDarkMode
    ? "overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(28,18,29,0.92))] shadow-[0_22px_45px_-36px_rgba(2,6,23,0.82)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "overflow-hidden rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/78 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const tableHeaderClassName = isDarkMode
    ? "bg-[linear-gradient(135deg,#7b0d15_0%,#253247_55%,#421117_100%)] text-left text-xs uppercase tracking-[0.08em] text-white/90"
    : "bg-[linear-gradient(135deg,rgba(123,13,21,0.96),rgba(43,3,7,0.95))] text-left text-xs uppercase tracking-[0.08em] text-white/90";
  const tbodyClassName = isDarkMode
    ? "divide-y divide-white/10"
    : "divide-y divide-[#7b0d15]/10";
  const rowClassName = isDarkMode
    ? "transition duration-500 ease-out hover:bg-[#f8d24e]/[0.08]"
    : "transition duration-500 ease-out hover:bg-[#fff8ef]";
  const timestampClassName = isDarkMode
    ? "px-5 py-4 text-sm text-[#d6c3c7] transition-colors duration-500 ease-out"
    : "px-5 py-4 text-sm text-[#5d3a41] transition-colors duration-500 ease-out";
  const detailsClassName = isDarkMode
    ? "px-5 py-4 text-sm font-medium text-[#f4eaea] transition-colors duration-500 ease-out"
    : "px-5 py-4 text-sm font-medium text-[#351018] transition-colors duration-500 ease-out";

  return (
    <div className={wrapperClassName}>
      <div className={overlayClassName} />

      <div className="relative space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className={headerClassName}>
          <h3 className={titleClassName}>Recent Changes</h3>
          <p className={descriptionClassName}>
            Recent account activities and changes
          </p>
        </div>

        <div className={tableWrapClassName}>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className={tableHeaderClassName}>
                <tr>
                  <th className="px-5 py-4 font-semibold">Timestamp</th>
                  <th className="px-5 py-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className={tbodyClassName}>
                {logs.map((log, idx) => (
                  <tr key={idx} className={rowClassName}>
                    <td className={timestampClassName}>{log.timestamp}</td>
                    <td className={detailsClassName}>{log.details}</td>
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