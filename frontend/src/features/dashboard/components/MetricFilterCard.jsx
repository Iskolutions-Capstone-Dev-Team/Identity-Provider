import { CalendarDays, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";

export default function MetricFilterCard({ stat, colorMode = "light", isLoading = false }) {
  return (
    <Card className="shadow-sm border-border bg-card transition-transform duration-200 ease-out hover:-translate-y-1">
      <CardContent className="flex items-center gap-4 px-4 py-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {stat.type === "failed" ? <TriangleAlert className="h-6 w-6" /> : <CalendarDays className="h-6 w-6" />}
        </span>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {stat.label}
          </p>
          {isLoading ? (
            <Skeleton className="mt-2 h-10 w-16" />
          ) : (
            <p className="mt-1 text-4xl font-bold tracking-tight">
              {stat.count.toLocaleString()}
            </p>
          )}
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {stat.type === "failed" ? "Unsuccessful logins" : "Successful logins"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}