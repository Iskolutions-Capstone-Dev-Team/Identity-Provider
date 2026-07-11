import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  const countClassName = isDarkMode ? "text-white" : "text-[#2a1518]";
  const captionClassName = isDarkMode ? "text-slate-200" : "text-slate-600";
  const hoverClassName = "transition-transform duration-200 ease-out hover:-translate-y-1";

  const displayMetrics = metrics && metrics.length > 0 
    ? metrics 
    : (isLoading ? Array(4).fill({}) : []);

  if (displayMetrics.length === 0) return null;

  const cols = displayMetrics.length;
  const lgColsClass = cols === 1 ? "lg:grid-cols-1" : cols === 2 ? "lg:grid-cols-2" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  const mdColsClass = cols === 1 ? "md:grid-cols-1" : "md:grid-cols-2";

  return (
    <div className={`w-full grid gap-4 ${mdColsClass} ${lgColsClass}`}>
      {displayMetrics.map((metric, idx) => {
        const Icon = metric.Icon;
        return (
          <Card key={idx} className={`${hoverClassName} ${tone.border} shadow-sm border`}>
            <CardContent className="flex items-center gap-4 p-4">
              {Icon ? (
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
                  <Icon className="h-6 w-6" />
                </span>
              ) : isLoading ? (
                <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
              ) : null}

              <div className="min-w-0 flex flex-col justify-center">
                {metric.title ? (
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${tone.accent}`}>
                    {metric.title}
                  </p>
                ) : isLoading ? (
                  <Skeleton className="mb-1 h-3 w-20" />
                ) : null}
                
                {isLoading ? (
                  <Skeleton className="mt-1 h-8 w-16" />
                ) : (
                  <p className={`text-3xl font-black leading-none mt-1 ${countClassName}`}>
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value ?? "—"}
                  </p>
                )}

                {metric.description && !isLoading && (
                  <p className={`mt-1 text-sm font-medium ${captionClassName}`}>
                    {metric.description}
                  </p>
                )}
                {isLoading && !metric.title && (
                  <Skeleton className="mt-1 h-3 w-32" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
