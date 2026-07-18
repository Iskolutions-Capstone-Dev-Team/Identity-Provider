import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";

const DEFAULT_CLIENT_IMAGE = "/assets/images/PUP_Logo.png";

function ClientLogo({ client }) {
  const [imageSrc, setImageSrc] = useState(client.image_url || DEFAULT_CLIENT_IMAGE);

  useEffect(() => {
    setImageSrc(client.image_url || DEFAULT_CLIENT_IMAGE);
  }, [client.image_url]);

  return (
    <img src={imageSrc} alt="" className="h-8 w-8 rounded-lg object-cover" onError={() => setImageSrc(DEFAULT_CLIENT_IMAGE)}/>
  );
}

export function PeriodTabs({ periods, selectedPeriodKey, onSelectPeriod }) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-lg bg-muted p-1 text-sm text-muted-foreground">
      {periods.map((period) => {
        const isSelected = selectedPeriodKey === period.key;
        return (
          <button key={period.key} type="button" onClick={() => onSelectPeriod(period.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              isSelected
                ? "bg-background text-foreground shadow-sm"
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
  const barWidth = maxLoginCount > 0
    ? `${Math.max((loginCount / maxLoginCount) * 100, 4)}%`
    : "0%";
  const percentage = totalLoginCount > 0
    ? (loginCount / totalLoginCount) * 100
    : 0;

  return (
    <div>
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background p-1">
          <ClientLogo client={client} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {client.client_name || "Unnamed Client"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {client.client_id || "No client ID"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: barWidth }}/>
        </div>

        <div className="w-20 text-right">
          <p className="text-lg font-bold text-foreground">
            {loginCount.toLocaleString()}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function TopLoginRowsSkeleton() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div key={item}>
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="mt-2 h-3 w-52" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-4">
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="w-20">
              <Skeleton className="ml-auto h-5 w-10" />
              <Skeleton className="ml-auto mt-2 h-3 w-14" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function TopLoginsPanel({ clients, periods, selectedPeriod, selectedPeriodKey, isRestrictedView = false, isLoading = false, onSelectPeriod }) {
  const totalLoginCount = Number(selectedPeriod?.count) || 0;
  const subtitle = isRestrictedView
    ? "Highest login volume by accessible applications"
    : "Highest login volume by application";
  const emptyMessage = isRestrictedView
    ? "No login activity is available for your accessible applications."
    : "No login activity is available for this application.";
  const maxLoginCount = clients.reduce((maxCount, client) => {
    const loginCount = Number(client.login_count) || 0;
    return Math.max(maxCount, loginCount);
  }, 0);
  
  const scrollClassName = "[scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50";

  return (
    <Card className="flex flex-col border-border bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-bold uppercase tracking-wide">Top Logins</CardTitle>
          <CardDescription className="mt-1">{subtitle}</CardDescription>
        </div>

        <PeriodTabs
          periods={periods}
          selectedPeriodKey={selectedPeriodKey}
          onSelectPeriod={onSelectPeriod}
        />
      </CardHeader>

      <CardContent>
        <div className={`space-y-6 ${
          clients.length > 4 ? `max-h-[30rem] overflow-y-auto pr-3 ${scrollClassName}` : ""
        }`}>
          {isLoading ? (
            <TopLoginRowsSkeleton />
          ) : clients.length > 0 ? (
            clients.map((client) => (
              <TopLoginRow
                key={client.client_id || client.client_name}
                client={client}
                maxLoginCount={maxLoginCount}
                totalLoginCount={totalLoginCount}
              />
            ))
          ) : (
            <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}