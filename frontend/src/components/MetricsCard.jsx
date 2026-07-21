import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsCard({ metrics = [], colorMode = "light", isLoading = false }) {
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
          <Card key={idx} className={`${hoverClassName} border-border bg-card shadow-sm border`}>
            <CardContent className="flex items-center gap-4 px-4 py-3">
              {Icon ? (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#7b0d15] text-[#f8d24e] dark:bg-primary/10 dark:text-primary">
                  <Icon className="h-6 w-6" />
                </span>
              ) : isLoading ? (
                <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
              ) : null}

              <div className="min-w-0 flex flex-col justify-center">
                {metric.title ? (
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {metric.title}
                  </p>
                ) : isLoading ? (
                  <Skeleton className="mb-1 h-3 w-20" />
                ) : null}
                
                {isLoading ? (
                  <Skeleton className="mt-1 h-8 w-16" />
                ) : (
                  <p className="text-3xl font-black leading-none mt-1 text-foreground">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value ?? "—"}
                  </p>
                )}

                {metric.description && !isLoading && (
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
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
