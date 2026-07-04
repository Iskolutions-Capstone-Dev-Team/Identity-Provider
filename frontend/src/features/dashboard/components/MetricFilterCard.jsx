import { CalendarIcon } from "./DashboardIcons";

function SkeletonBlock({ className = "", colorMode = "light" }) {
  const toneClassName = colorMode === "dark" ? "bg-white/10" : "bg-[#7b0d15]/10";

  return (
    <span className={`block animate-pulse rounded-lg ${toneClassName} ${className}`} />
  );
}

function getMetricTone(colorMode) {
  return colorMode === "dark"
    ? {
        accent: "text-[#f8d24e]",
        border: "border-[#f8d24e]/35",
        icon: "bg-[#f8d24e]/18 text-[#f8d24e]",
      }
    : {
        accent: "text-[#7b0d15]",
        border: "border-[#7b0d15]/20",
        icon: "bg-[#7b0d15]/10 text-[#7b0d15]",
      };
}

export default function MetricFilterCard({ stat, colorMode = "light", isLoading = false, onClick, isClickable = false }) {
  const tone = getMetricTone(colorMode);
  const isDarkMode = colorMode === "dark";
  const cardClassName = isDarkMode
    ? "bg-[#061529]/78"
    : "bg-white/85 shadow-[0_18px_46px_-38px_rgba(43,3,7,0.55)]";
  const countClassName = isDarkMode ? "text-white" : "text-[#2a1518]";
  const captionClassName = isDarkMode ? "text-slate-200" : "text-slate-600";
  const hoverClassName = "transition-transform duration-200 ease-out hover:-translate-y-1";

  const caption = stat.type === "failed" ? "Unsuccessful logins" : "Successful logins";

  return (
    <div  className={`relative rounded-2xl border p-5 ${hoverClassName} ${tone.border} ${cardClassName}`}>
      <div className="flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}>
          <CalendarIcon />
        </span>

        <div className="min-w-0">
          <p className={`text-xs font-black uppercase tracking-[0.16em] ${tone.accent}`}>
            {stat.label}
          </p>
          {isLoading ? (
            <SkeletonBlock className="mt-3 h-10 w-16" colorMode={colorMode} />
          ) : (
            <p className={`mt-3 text-4xl font-black ${countClassName}`}>
              {stat.count.toLocaleString()}
            </p>
          )}
          <p className={`mt-1 text-sm font-medium ${captionClassName}`}>
            {caption}
          </p>
        </div>
      </div>
      
      {isClickable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className={`absolute bottom-4 right-4 transition duration-300 ${
            isDarkMode
              ? "text-slate-500 hover:text-[#f8d24e] hover:drop-shadow-[0_0_8px_rgba(248,210,78,0.8)]"
              : "text-slate-400 hover:text-[#7b0d15] hover:drop-shadow-[0_0_8px_rgba(123,13,21,0.6)]"
          }`}
          aria-label="View Details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
      )}
    </div>
  );
}