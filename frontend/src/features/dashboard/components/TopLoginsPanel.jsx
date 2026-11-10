import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../components/ui/tooltip";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../../components/ui/empty";
import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";
import { Activity } from "lucide-react";
import { IconStack } from "../../../components/reui/icon-stack";

function getInitials(name) {
  if (!name) return "CL";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

const sparklineData = [
  { val: 20 }, { val: 40 }, { val: 30 }, { val: 60 }, { val: 50 },
  { val: 70 }, { val: 80 }, { val: 60 }, { val: 90 }, { val: 100 }
];

function TopLoginSparkline({ loginCount, maxLoginCount }) {
  const count = Number(loginCount) || 0;
  const scale = maxLoginCount > 0 ? count / maxLoginCount : 1;
  const rowChartData = sparklineData.map((d) => ({
    val: Math.max(d.val * scale, 5),
  }));

  return (
    <svg
      role="img"
      aria-label={`Login activity: ${count} logins`}
      viewBox="0 0 100 32"
      className="h-7 w-[96px] shrink-0 text-emerald-500 dark:text-emerald-400"
    >
      {rowChartData.map((d, index) => {
        const barHeight = Math.max(4, Math.round((d.val / 100) * 26));
        const x = 2 + index * 10;
        const y = 29 - barHeight;

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={6}
            height={barHeight}
            rx={2}
            ry={2}
            fill="currentColor"
            className="fill-emerald-500 dark:fill-emerald-400 text-emerald-500 dark:text-emerald-400 transition-all duration-300"
          />
        );
      })}
    </svg>
  );
}

function PeriodTabs({ periods, selectedPeriodKey, onSelectPeriod }) {
  return (
    <div className="inline-flex h-8 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground">
      {periods.map((period) => {
        const isSelected = selectedPeriodKey === period.key;
        return (
          <button key={period.key} type="button" onClick={() => onSelectPeriod(period.key)}
            className={`relative inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md px-3 py-0.5 text-sm font-medium transition-all ${
              isSelected
                ? "bg-[#7b0d15] text-[#f8d24e] shadow-sm dark:bg-[#f8d24e] dark:text-[#7b0d15]"
                : "hover:bg-background/50 hover:text-foreground"
            }`}
          >
            {period.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

function TopLoginRow({ client, maxLoginCount, totalLoginCount }) {
  const loginCount = Number(client.login_count) || 0;
  const percentage = totalLoginCount > 0
    ? (loginCount / totalLoginCount) * 100
    : 0;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-3 shadow-sm transition-colors hover:bg-muted/50">
      <div className="flex min-w-0 flex-[2] items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0 rounded-lg">
          <AvatarImage src={client.image_url || "/assets/images/PUP_Logo.png"} alt={client.client_name || "Client"} className="rounded-lg object-cover" />
          <AvatarFallback className="rounded-lg bg-transparent">
            <img src="/assets/images/PUP_Logo.png" alt="PUP Logo" className="h-full w-full rounded-lg object-cover" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {client.client_name || "Unnamed Client"}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <p className="cursor-default truncate text-xs text-muted-foreground hover:text-foreground">
                    {client.client_id || "No client ID"}
                  </p>
                }
              />
              <TooltipContent side="bottom">
                <p>{client.client_id || "No client ID"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex h-8 w-[100px] shrink-0 items-center justify-center">
        <TopLoginSparkline loginCount={loginCount} maxLoginCount={maxLoginCount} />
      </div>

      <div className="flex w-32 shrink-0 items-center justify-end gap-4 text-right">
        <p className="text-sm font-bold text-foreground">
          {loginCount.toLocaleString()}
        </p>
        <p className="w-10 text-sm font-medium text-muted-foreground">
          {percentage.toFixed(0)}%
        </p>
      </div>
    </div>
  );
}

function TopLoginRowsSkeleton() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-3 shadow-sm">
          <div className="flex min-w-0 flex-[2] items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="mt-2 h-3 w-52" />
            </div>
          </div>
          <div className="h-8 w-[100px] shrink-0">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
          <div className="flex w-32 shrink-0 items-center justify-end gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function TopLoginsPanel({ clients = [], periods = [], selectedPeriod, selectedPeriodKey, isRestrictedView = false, isLoading = false, onSelectPeriod }) {
  const safeClients = Array.isArray(clients) ? clients : [];
  const safePeriods = Array.isArray(periods) ? periods : [];
  const totalLoginCount = Number(selectedPeriod?.count) || 0;
  const subtitle = isRestrictedView
    ? "Highest login volume by accessible applications"
    : "Highest login volume by application";
  const emptyMessage = isRestrictedView
    ? "No login activity is available."
    : "No login activity is available for today.";
  const maxLoginCount = safeClients.reduce((maxCount, client) => {
    const loginCount = Number(client.login_count) || 0;
    return Math.max(maxCount, loginCount);
  }, 0);
  
  const scrollClassName = "[scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50";

  return (
    <Card className="flex flex-col border-border bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl font-bold uppercase tracking-wide">Top Logins</CardTitle>
          <CardDescription className="mt-1">{subtitle}</CardDescription>
        </div>

        <PeriodTabs
          periods={safePeriods}
          selectedPeriodKey={selectedPeriodKey}
          onSelectPeriod={onSelectPeriod}
        />
      </CardHeader>

      <CardContent>
        <ScrollArea className="w-full">
          <div className="w-full min-w-[420px] lg:min-w-0 pb-2">
            {safeClients.length > 0 && !isLoading && (
              <div className="mb-3 flex items-center justify-between px-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                <div className="flex-[2]">CLIENT</div>
                <div className="w-[100px] shrink-0 text-center">LOGINS</div>
                <div className="w-32 shrink-0 text-right">SHARE %</div>
              </div>
            )}
            <div className={`space-y-3 ${
              safeClients.length > 4 ? `max-h-[30rem] overflow-y-auto pr-2 ${scrollClassName}` : ""
            }`}>
              {isLoading ? (
                <TopLoginRowsSkeleton />
              ) : safeClients.length > 0 ? (
                safeClients.map((client) => (
                  <TopLoginRow
                    key={client.client_id || client.client_name}
                    client={client}
                    maxLoginCount={maxLoginCount}
                    totalLoginCount={totalLoginCount}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center p-4">
                  <Empty className="py-10 max-w-md">
                    <EmptyHeader>
                      <EmptyMedia>
                        <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-[#f8d24e] h-24 w-22">
                          <Activity className="text-[#7b0d15] dark:text-[#f8d24e] size-5" />
                        </IconStack>
                      </EmptyMedia>
                      <EmptyTitle>No login activity</EmptyTitle>
                      <EmptyDescription>
                        {emptyMessage}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              )}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
