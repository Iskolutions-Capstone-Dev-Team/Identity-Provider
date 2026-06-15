import DashboardPanel from "./DashboardPanel";
import { CheckIcon, ClockIcon, FingerprintIcon, InfoIcon, QuestionIcon, ShieldIcon } from "./DashboardIcons";

function getDashboardAccent(colorMode) {
  return colorMode === "dark"
    ? {
        iconBg: "bg-[#f8d24e]/18",
        iconText: "text-[#f8d24e]",
        chipBg: "bg-[#f8d24e]",
        chipText: "text-[#2a1518]",
      }
    : {
        iconBg: "bg-[#7b0d15]/10",
        iconText: "text-[#7b0d15]",
        chipBg: "bg-[#7b0d15]",
        chipText: "text-white",
      };
}

function SecurityMetric({ icon, label, value, colorMode }) {
  const isDarkMode = colorMode === "dark";
  const accent = getDashboardAccent(colorMode);

  return (
    <div className={`rounded-xl border p-4 ${
      isDarkMode
        ? "border-white/10 bg-white/[0.04]"
        : "border-[#7b0d15]/10 bg-[#fff8f3]"
    }`}>
      <div className="flex min-h-32 flex-col items-start justify-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accent.iconBg} ${accent.iconText}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className={`text-[0.68rem] font-black uppercase tracking-[0.14em] ${
            isDarkMode ? "text-slate-300" : "text-slate-500"
          }`}>
            {label}
          </p>
          <p className={`mt-1 text-lg font-black ${
            isDarkMode ? "text-white" : "text-[#2a1518]"
          }`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SecurityNote({ icon, title, children, tone = "yellow", colorMode }) {
  const isDarkMode = colorMode === "dark";
  const toneClassName =
    tone === "blue"
      ? isDarkMode
        ? "border-[#3b82f6]/30 bg-[#08284c]/42 text-[#93c5fd]"
        : "border-[#2563eb]/20 bg-[#eff6ff] text-[#1d4ed8]"
      : isDarkMode
        ? "border-[#f8c21a]/30 bg-[#2c2108]/42 text-[#f8d24e]"
        : "border-[#f8c21a]/35 bg-[#fff8d8] text-[#9a5b00]";
  const iconClassName =
    tone === "blue"
      ? isDarkMode
        ? "border-[#3b82f6]/30 bg-[#3b82f6]/12 text-[#93c5fd]"
        : "border-[#2563eb]/20 bg-white/70 text-[#1d4ed8]"
      : isDarkMode
        ? "border-[#f8c21a]/30 bg-[#f8c21a]/12 text-[#f8d24e]"
        : "border-[#f8c21a]/35 bg-white/70 text-[#9a5b00]";

  return (
    <div className={`flex gap-3 rounded-xl border p-4 ${toneClassName}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${iconClassName}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-black">{title}</p>
        <p className="mt-2 text-sm leading-6">{children}</p>
      </div>
    </div>
  );
}

export default function SecurityAnalysisPanel({ analysis, analyzedAt, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const accent = getDashboardAccent(colorMode);
  const anomalies = Array.isArray(analysis?.anomalies) ? analysis.anomalies : [];
  const confidencePercent = Math.round((Number(analysis?.confidence) || 0) * 100);
  const threatLevel = analysis?.threat_level || "UNKNOWN";

  return (
    <DashboardPanel colorMode={colorMode} className="p-5">
      <h2 className={`text-xl font-black uppercase tracking-[0.03em] ${
        isDarkMode ? "text-white" : "text-[#7b0d15]"
      }`}>
        Security Analysis
      </h2>
      <p className={`mt-1 text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
        AI-assisted authentication review
      </p>

      <div className="mt-5 space-y-3">
        <SecurityNote
          icon={<InfoIcon />}
          title="AI analysis refresh"
          tone="blue"
          colorMode={colorMode}
        >
          AI security analysis refreshes every 2 hours to help prevent exhausting the AI request quota.
        </SecurityNote>

        <SecurityNote
          icon={<QuestionIcon />}
          title="What does this mean?"
          colorMode={colorMode}
        >
          The system analyzed authentication patterns and behavior. No risks or unusual activities were found when the anomaly count is zero.
        </SecurityNote>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        <SecurityMetric
          icon={<ShieldIcon />}
          label="Threat Level"
          value={<span className="text-[#20e58d]">{threatLevel}</span>}
          colorMode={colorMode}
        />
        <SecurityMetric
          icon={<FingerprintIcon />}
          label="Confidence"
          value={`${confidencePercent}%`}
          colorMode={colorMode}
        />
        <SecurityMetric
          icon={<ClockIcon />}
          label="Analyzed At"
          value={analyzedAt}
          colorMode={colorMode}
        />
      </div>

      <div className={`mt-5 flex gap-4 rounded-xl border border-[#20e58d]/30 p-4 ${
        isDarkMode ? "bg-[#0a3b35]/40" : "bg-[#e9fff5]"
      }`}>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#20e58d]/35 text-[#20e58d]">
          <CheckIcon />
        </span>
        <div>
          <p className={`text-sm font-black uppercase tracking-[0.08em] ${
            isDarkMode ? "text-white" : "text-[#14523b]"
          }`}>
            AI Summary
          </p>
          <p className={`mt-2 text-sm leading-6 ${
            isDarkMode ? "text-slate-100" : "text-slate-700"
          }`}>
            {analysis?.advisory || "No security advisory is available."}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-black uppercase tracking-[0.03em] ${
            isDarkMode ? "text-white" : "text-[#7b0d15]"
          }`}>
            Anomalies
          </h3>
          <span className={`rounded-full px-3 py-1 text-sm font-black ${accent.chipBg} ${accent.chipText}`}>
            {anomalies.length}
          </span>
        </div>

        {anomalies.length > 0 ? (
          <ul className={`mt-3 list-inside list-disc space-y-2 text-sm ${
            isDarkMode ? "text-slate-300" : "text-slate-600"
          }`}>
            {anomalies.map((anomaly) => (
              <li key={String(anomaly)}>{String(anomaly)}</li>
            ))}
          </ul>
        ) : (
          <p className={`mt-3 text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
            No anomalies detected in the selected period.
          </p>
        )}
      </div>

    </DashboardPanel>
  );
}