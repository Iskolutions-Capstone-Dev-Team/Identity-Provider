import { CalendarDays, TriangleAlert, CircleEllipsis } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";

export default function MetricFilterCard({ stat, colorMode = "light", isLoading = false, onClick, isClickable }) {
  return (
    <Card className="shadow-sm border-[#7b0d15]/30 dark:border-[#f8d24e]/30 bg-card transition-transform duration-200 ease-out hover:-translate-y-1 border relative">
      <CardContent className="flex items-center gap-4 px-4 py-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-[#7b0d15] rounded-xl text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15]">
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

        {isClickable && onClick && (
          <Button variant="ghost" size="icon" onClick={onClick} className="absolute bottom-2 right-2 h-8 w-8 text-[#7b0d15] hover:text-[#7b0d15]/80 dark:text-[#f8d24e] dark:hover:text-[#f8d24e]/80 transition-colors rounded-full" aria-label="View more details">
            <CircleEllipsis className="h-5 w-5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}