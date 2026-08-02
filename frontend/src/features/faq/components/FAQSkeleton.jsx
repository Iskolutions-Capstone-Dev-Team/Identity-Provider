import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FAQSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)] w-full items-start">
      {/* Left Sidebar Skeleton */}
      <div className="w-full shrink-0 flex flex-col gap-1.5 h-auto p-2 bg-muted rounded-xl">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-3.5 py-3 rounded-lg w-full">
            <Skeleton className="size-5 shrink-0 rounded-md bg-foreground/10" />
            <Skeleton className="h-4 w-3/4 max-w-[120px] bg-foreground/10" />
            <Skeleton className="h-5 w-6 rounded-full shrink-0 ml-auto bg-foreground/10" />
          </div>
        ))}
      </div>

      {/* Right Card Skeleton */}
      <Card className="w-full bg-card border-border shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-5">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-40" />
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-14 w-full rounded-lg border border-border px-4 py-3 flex items-center justify-between">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="size-4 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}