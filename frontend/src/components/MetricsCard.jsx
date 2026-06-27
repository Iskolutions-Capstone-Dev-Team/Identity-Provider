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

export default function MetricsCard({ metrics = [], colorMode = "light", isLoading = false }) {
  const tone = getMetricTone(colorMode);
  const isDarkMode = colorMode === "dark";
  const cardClassName = isDarkMode
    ? "bg-[#061529]/78"
    : "bg-white/85 shadow-[0_18px_46px_-38px_rgba(43,3,7,0.55)]";
  const countClassName = isDarkMode ? "text-white" : "text-[#2a1518]";
  const captionClassName = isDarkMode ? "text-slate-200" : "text-slate-600";
  const hoverClassName = "transition-transform duration-200 ease-out hover:-translate-y-1";

  if (!metrics || metrics.length === 0) return null;

  const cols = metrics.length;
  const lgColsClass = cols === 1 ? "lg:grid-cols-1" : cols === 2 ? "lg:grid-cols-2" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  const mdColsClass = cols === 1 ? "md:grid-cols-1" : "md:grid-cols-2";

  return (
    <div className={`w-full grid gap-4 ${mdColsClass} ${lgColsClass} mt-6`}>
      {metrics.map((metric, idx) => {
        const Icon = metric.Icon;
        return (
          <div key={idx} className={`rounded-2xl border p-5 ${hoverClassName} ${tone.border} ${cardClassName}`}>
            <div className="flex items-center gap-4">
              {Icon && (
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}>
                  <Icon className="h-6 w-6" />
                </span>
              )}

              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-[0.16em] ${tone.accent}`}>
                  {metric.title}
                </p>
                {isLoading ? (
                  <SkeletonBlock className="mt-3 h-10 w-16" colorMode={colorMode} />
                ) : (
                  <p className={`mt-3 text-4xl font-black ${countClassName}`}>
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value ?? "—"}
                  </p>
                )}
                {metric.description && (
                  <p className={`mt-1 text-sm font-medium ${captionClassName}`}>
                    {metric.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
