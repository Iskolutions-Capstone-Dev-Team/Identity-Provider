import DashboardPanel from "./DashboardPanel";
import { CheckIcon, ClockIcon, FingerprintIcon, InfoIcon, QuestionIcon, ShieldIcon } from "./dashboardIcons";

function SkeletonBlock({ className = "", colorMode = "light" }) {
  const toneClassName = colorMode === "dark" ? "bg-white/10" : "bg-[#7b0d15]/10";

  return (
    <span className={`block animate-pulse rounded-lg ${toneClassName} ${className}`} />
  );
}

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

function SecurityMetric({ icon, label, value, colorMode, isLoading = false }) {
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
          {isLoading ? (
            <SkeletonBlock className="mt-2 h-6 w-24" colorMode={colorMode} />
          ) : (
            <p className={`mt-1 text-lg font-black ${
              isDarkMode ? "text-white" : "text-[#2a1518]"
            }`}>
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SecurityNote({ icon, title, children, tone = "blue", colorMode }) {
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
        ? "text-[#93c5fd]"
        : "text-[#1d4ed8]"
      : isDarkMode
        ? "text-[#f8d24e]"
        : "text-[#9a5b00]";

  return (
    <div className={`flex gap-3 rounded-xl border p-3.5 ${toneClassName}`}>
      <span className={`mt-0.5 flex shrink-0 items-center justify-center ${iconClassName}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-black">{title}</p>
        <p className="mt-2 text-sm leading-6">{children}</p>
      </div>
    </div>
  );
}

function SecurityMeaningDropdown({ colorMode }) {
  const isDarkMode = colorMode === "dark";
  const triggerClassName = isDarkMode
    ? "border-[#f8c21a]/35 bg-[#f8c21a]/10 text-[#f8d24e] hover:bg-[#f8d24e]/18"
    : "border-[#7b0d15]/15 bg-[#7b0d15]/8 text-[#7b0d15] hover:bg-[#7b0d15]/12";
  const menuClassName = isDarkMode
    ? "border-[#f8c21a]/30 bg-[#171914] text-[#f8d24e] shadow-[0_24px_60px_-34px_rgba(0,0,0,0.9)]"
    : "border-[#f8c21a]/35 bg-[#fff8d8] text-[#9a5b00] shadow-[0_24px_60px_-34px_rgba(123,13,21,0.5)]";

  return (
    <div className="dropdown dropdown-end">
      <button type="button" tabIndex={0} aria-label="Open security analysis explanation" className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${triggerClassName}`}>
        <QuestionIcon className="h-5 w-5" />
      </button>
      <div tabIndex={0} className={`dropdown-content z-50 mt-3 w-80 rounded-xl border p-4 ${menuClassName}`}>
        <p className="font-black">What does this mean?</p>
        <p className="mt-2 text-sm leading-6">
          The system analyzed authentication activity and user behavior. An anomaly count of zero indicates that no suspicious or unusual activity was detected.
        </p>
      </div>
    </div>
  );
}

export default function SecurityAnalysisPanel({ analysis, analyzedAt, colorMode = "light", isLoading = false }) {
  const isDarkMode = colorMode === "dark";
  const accent = getDashboardAccent(colorMode);
  const anomalies = Array.isArray(analysis?.anomalies) ? analysis.anomalies : [];
  const confidencePercent = Math.round((Number(analysis?.confidence) || 0) * 100);
  const threatLevel = analysis?.threat_level || "UNKNOWN";

  return (
    <DashboardPanel colorMode={colorMode} className="p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className={`text-xl font-black uppercase tracking-[0.03em] ${
          isDarkMode ? "text-white" : "text-[#7b0d15]"
        }`}>
          Security Analysis
        </h2>
        <SecurityMeaningDropdown colorMode={colorMode} />
      </div>
      <p className={`mt-1 text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
        AI-assisted authentication review
      </p>

      <div className="mt-5">
        <SecurityNote
          icon={<InfoIcon />}
          title="AI Analysis"
          tone="blue"
          colorMode={colorMode}
        >
          Updates every 2 hours.
        </SecurityNote>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        <SecurityMetric
          icon={<ShieldIcon />}
          label="Threat Level"
          value={<span className="text-[#20e58d]">{threatLevel}</span>}
          colorMode={colorMode}
          isLoading={isLoading}
        />
        <SecurityMetric
          icon={<FingerprintIcon />}
          label="Confidence"
          value={`${confidencePercent}%`}
          colorMode={colorMode}
          isLoading={isLoading}
        />
        <SecurityMetric
          icon={<ClockIcon />}
          label="Analyzed At"
          value={analyzedAt}
          colorMode={colorMode}
          isLoading={isLoading}
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
          {isLoading ? (
            <div className="mt-3 space-y-2">
              <SkeletonBlock className="h-4 w-full" colorMode={colorMode} />
              <SkeletonBlock className="h-4 w-3/4" colorMode={colorMode} />
            </div>
          ) : (
            <p className={`mt-2 text-sm leading-6 ${
              isDarkMode ? "text-slate-100" : "text-slate-700"
            }`}>
              {analysis?.advisory || "No security advisory is available."}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-black uppercase tracking-[0.03em] ${
            isDarkMode ? "text-white" : "text-[#7b0d15]"
          }`}>
            Anomalies
          </h3>
          {isLoading ? (
            <SkeletonBlock className="h-8 w-10 rounded-full" colorMode={colorMode} />
          ) : (
            <span className={`rounded-full px-3 py-1 text-sm font-black ${accent.chipBg} ${accent.chipText}`}>
              {anomalies.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <SkeletonBlock className="mt-3 h-4 w-48" colorMode={colorMode} />
        ) : anomalies.length > 0 ? (
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