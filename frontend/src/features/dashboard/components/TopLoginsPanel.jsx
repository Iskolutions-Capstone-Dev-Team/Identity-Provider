import { useEffect, useState } from "react";
import DashboardPanel from "./DashboardPanel";

const DEFAULT_CLIENT_IMAGE = "/assets/images/PUP_Logo.png";

function SkeletonBlock({ className = "", colorMode = "light" }) {
  const toneClassName = colorMode === "dark" ? "bg-white/10" : "bg-[#7b0d15]/10";

  return (
    <span className={`block animate-pulse rounded-lg ${toneClassName} ${className}`} />
  );
}

function getDashboardAccent(colorMode) {
  return colorMode === "dark"
    ? {
        bg: "bg-[#f8d24e]",
        text: "text-[#f8d24e]",
        iconBg: "bg-[#f8d24e]/18",
        iconText: "text-[#f8d24e]",
        selectedText: "text-[#2a1518]",
      }
    : {
        bg: "bg-[#7b0d15]",
        text: "text-[#7b0d15]",
        iconBg: "bg-[#7b0d15]/10",
        iconText: "text-[#7b0d15]",
        selectedText: "text-white",
      };
}

function ClientLogo({ client }) {
  const [imageSrc, setImageSrc] = useState(client.image_url || DEFAULT_CLIENT_IMAGE);

  useEffect(() => {
    setImageSrc(client.image_url || DEFAULT_CLIENT_IMAGE);
  }, [client.image_url]);

  return (
    <img src={imageSrc} alt="" className="h-8 w-8 rounded-lg object-cover" onError={() => setImageSrc(DEFAULT_CLIENT_IMAGE)}/>
  );
}

export function PeriodTabs({ periods, selectedPeriodKey, colorMode, onSelectPeriod }) {
  const isDarkMode = colorMode === "dark";
  const shellClassName = isDarkMode
    ? "border-white/10 bg-[#061224]"
    : "border-[#7b0d15]/10 bg-[#fff8f3]";

  return (
    <div className={`grid grid-cols-3 overflow-hidden rounded-lg border p-1 text-sm ${shellClassName}`}>
      {periods.map((period) => {
        const isSelected = selectedPeriodKey === period.key;
        const idleClassName = isDarkMode
          ? "text-slate-300 hover:bg-white/[0.04] hover:text-white"
          : "text-slate-600 hover:bg-[#7b0d15]/5 hover:text-[#7b0d15]";

        return (
          <button key={period.key} type="button" onClick={() => onSelectPeriod(period.key)}
            className={`rounded-md px-3 py-2 font-semibold transition ${
              isSelected
                ? isDarkMode
                  ? "bg-[linear-gradient(135deg,#7b0d15_0%,#4a121b_100%)] text-white"
                  : "bg-[#7b0d15] text-white"
                : idleClassName
            }`}
          >
            {period.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

function TopLoginRow({ client, maxLoginCount, totalLoginCount, colorMode }) {
  const isDarkMode = colorMode === "dark";
  const accent = getDashboardAccent(colorMode);
  const loginCount = Number(client.login_count) || 0;
  const barWidth = maxLoginCount > 0
    ? `${Math.max((loginCount / maxLoginCount) * 100, 4)}%`
    : "0%";
  const percentage = totalLoginCount > 0
    ? (loginCount / totalLoginCount) * 100
    : 0;

  return (
    <div>
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border p-1 ${
          isDarkMode ? "border-white/10 bg-white/[0.04]" : "border-[#7b0d15]/10 bg-white"
        }`}>
          <ClientLogo client={client} />
        </span>
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${
            isDarkMode ? "text-white" : "text-[#2a1518]"
          }`}>
            {client.client_name || "Unnamed Client"}
          </p>
          <p className={`truncate text-xs ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            {client.client_id || "No client ID"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-center gap-4">
        <div className={`h-2 rounded-full ${
          isDarkMode ? "bg-white/10" : "bg-[#7b0d15]/10"
        }`}>
          <div className={`h-full rounded-full ${accent.bg}`} style={{ width: barWidth }}/>
        </div>

        <div className="w-20 text-right">
          <p className={`text-lg font-black ${accent.text}`}>
            {loginCount.toLocaleString()}
          </p>
          <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function TopLoginRowsSkeleton({ colorMode }) {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div key={item}>
          <div className="flex min-w-0 items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-xl" colorMode={colorMode} />
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-4 w-44" colorMode={colorMode} />
              <SkeletonBlock className="mt-2 h-3 w-52" colorMode={colorMode} />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <SkeletonBlock className="h-2 w-full rounded-full" colorMode={colorMode} />
            <div className="w-20">
              <SkeletonBlock className="ml-auto h-5 w-10" colorMode={colorMode} />
              <SkeletonBlock className="ml-auto mt-2 h-3 w-14" colorMode={colorMode} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function TopLoginsPanel({ clients, periods, selectedPeriod, selectedPeriodKey, isRestrictedView = false, colorMode = "light", isLoading = false, onSelectPeriod }) {
  const isDarkMode = colorMode === "dark";
  const totalLoginCount = Number(selectedPeriod?.count) || 0;
  const subtitle = isRestrictedView
    ? "Highest login volume by accessible applications"
    : "Highest login volume by application";
  const emptyMessage = isRestrictedView
    ? "No failed login activity is available."
    : "No failed login activity is available for this application.";
  const maxLoginCount = clients.reduce((maxCount, client) => {
    const loginCount = Number(client.login_count) || 0;
    return Math.max(maxCount, loginCount);
  }, 0);
  const scrollClassName = isDarkMode
    ? "[scrollbar-width:thin] [scrollbar-color:rgba(248,210,78,0.58)_rgba(255,255,255,0.06)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.06] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#f8d24e]/55 hover:[&::-webkit-scrollbar-thumb]:bg-[#f8d24e]/75"
    : "[scrollbar-width:thin] [scrollbar-color:rgba(123,13,21,0.5)_rgba(123,13,21,0.08)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#7b0d15]/[0.08] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7b0d15]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#7b0d15]/70";

  return (
    <DashboardPanel colorMode={colorMode} className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={`text-xl font-black uppercase tracking-[0.03em] ${
            isDarkMode ? "text-white" : "text-[#7b0d15]"
          }`}>
            Top Logins
          </h2>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
            {subtitle}
          </p>
        </div>

        <PeriodTabs
          periods={periods}
          selectedPeriodKey={selectedPeriodKey}
          colorMode={colorMode}
          onSelectPeriod={onSelectPeriod}
        />
      </div>

      <div className={`mt-8 space-y-5 ${
        clients.length > 4 ? `max-h-[30rem] overflow-y-auto pr-3 ${scrollClassName}` : ""
      }`}>
        {isLoading ? (
          <TopLoginRowsSkeleton colorMode={colorMode} />
        ) : clients.length > 0 ? (
          clients.map((client) => (
            <TopLoginRow
              key={client.client_id || client.client_name}
              client={client}
              maxLoginCount={maxLoginCount}
              totalLoginCount={totalLoginCount}
              colorMode={colorMode}
            />
          ))
        ) : (
          <p className={`rounded-xl border px-4 py-3 text-sm ${
            isDarkMode
              ? "border-white/10 bg-white/[0.03] text-slate-300"
              : "border-[#7b0d15]/10 bg-white/70 text-slate-600"
          }`}>
            {emptyMessage}
          </p>
        )}
      </div>

    </DashboardPanel>
  );
}