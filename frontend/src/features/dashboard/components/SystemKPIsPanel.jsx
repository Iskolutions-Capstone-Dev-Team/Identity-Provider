import { useQuery } from "@tanstack/react-query";
import { Activity, ShieldCheck, ShieldAlert, Users, UserCheck, UserX, Gauge, Cpu, Layers, ArrowUpRight, TrendingUp, Server, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { metricsService } from "@/services/metricsService";

function KPIMetricCard({ icon, label, value, subtext, statusColor, children, isLoading }) {
  return (
    <Card className="shadow-none bg-muted/30 border border-border/60">
      <CardContent className="flex flex-col justify-between h-full gap-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-foreground text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center [&_svg]:size-4 bg-[#7b0d15] rounded-lg text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15]">
            {icon}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-8 w-24 my-1" />
        ) : (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-foreground text-2xl font-bold tracking-tight">
                {value}
              </span>
              {subtext && (
                <span className="text-xs font-medium text-muted-foreground">
                  {subtext}
                </span>
              )}
            </div>
            {statusColor && (
              <span className={`text-[11px] font-semibold ${statusColor}`}>
                {statusColor}
              </span>
            )}
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  );
}

export default function SystemKPIsPanel({ colorMode = "light", isDashboardLoading = false }) {
  const { data: kpiData, isLoading: isQueryLoading, error: queryError } = useQuery({
    queryKey: ["systemKPIs"],
    queryFn: () => metricsService.getSystemKPIs(),
    refetchInterval: 15000,
  });

  const isLoading = isDashboardLoading || (isQueryLoading && !kpiData);

  const apm = kpiData?.apm || {};
  const security = kpiData?.security || {};
  const identity = kpiData?.identity || {};
  const systemHealth = kpiData?.system_health || "Operational";
  const cacheStatus = kpiData?.cache_status || "Online";

  const getThreatBadge = (level) => {
    switch (level?.toUpperCase()) {
      case "HIGH":
        return {
          variant: "destructive-outline",
          label: "HIGH THREAT",
          className: "border-red-500 text-red-600 dark:text-red-400 bg-red-500/10",
        };
      case "MEDIUM":
        return {
          variant: "outline",
          label: "ELEVATED",
          className: "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10",
        };
      default:
        return {
          variant: "success-outline",
          label: "SECURE / LOW",
          className: "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
        };
    }
  };

  const threatBadge = getThreatBadge(security.threat_level);

  if (queryError && !kpiData) {
    return (
      <Card className="flex flex-col border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold uppercase tracking-wide">
            System Key Performance Indicators (KPIs)
          </CardTitle>
          <CardDescription>
            Live APM, security health, and identity aggregate metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive text-sm py-4">
            <ShieldAlert className="h-5 w-5" />
            <span>Unable to load live system KPIs. Check connection and permissions.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col border-border bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold uppercase tracking-wide">
              Operational KPIs
            </CardTitle>
            <Badge
              variant="outline"
              className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            >
              {systemHealth}
            </Badge>
          </div>
          <CardDescription className="mt-1">
            Real-time APM telemetry, authentication posture, and identity population metrics.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cache: <strong className="text-foreground">{cacheStatus}</strong></span>
        </div>
      </CardHeader>

      <CardContent className="pt-1">
        <Tabs defaultValue="apm" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3 max-w-md">
            <TabsTrigger
              value="apm"
              className="gap-2 transition-all hover:bg-background/50 hover:text-foreground dark:hover:bg-background/40 dark:hover:text-[#f8d24e] data-active:!bg-[#7b0d15] data-active:!text-[#f8d24e] data-active:shadow-sm dark:data-active:!bg-[#f8d24e] dark:data-active:!text-[#7b0d15]"
            >
              <Activity className="size-4" />
              <span>APM & Health</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="gap-2 transition-all hover:bg-background/50 hover:text-foreground dark:hover:bg-background/40 dark:hover:text-[#f8d24e] data-active:!bg-[#7b0d15] data-active:!text-[#f8d24e] data-active:shadow-sm dark:data-active:!bg-[#f8d24e] dark:data-active:!text-[#7b0d15]"
            >
              <ShieldCheck className="size-4" />
              <span>Auth Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="identity"
              className="gap-2 transition-all hover:bg-background/50 hover:text-foreground dark:hover:bg-background/40 dark:hover:text-[#f8d24e] data-active:!bg-[#7b0d15] data-active:!text-[#f8d24e] data-active:shadow-sm dark:data-active:!bg-[#f8d24e] dark:data-active:!text-[#7b0d15]"
            >
              <Users className="size-4" />
              <span>Identity</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: APM & Health */}
          <TabsContent value="apm" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPIMetricCard
                icon={<Gauge />}
                label="Avg Latency"
                value={apm.avg_latency_ms !== undefined ? `${apm.avg_latency_ms.toFixed(1)} ms` : "0.0 ms"}
                subtext="end-to-end"
                isLoading={isLoading}
              >
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1 border-t border-border/40">
                  <span>Tx Processing:</span>
                  <strong className="text-foreground">
                    {apm.tx_processing_time_ms !== undefined ? `${apm.tx_processing_time_ms.toFixed(1)} ms` : "0.0 ms"}
                  </strong>
                </div>
              </KPIMetricCard>

              <KPIMetricCard
                icon={<TrendingUp />}
                label="Throughput"
                value={apm.throughput_rps !== undefined ? apm.throughput_rps.toFixed(2) : "0.00"}
                subtext="RPS (req/s)"
                isLoading={isLoading}
              >
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1 border-t border-border/40">
                  <ArrowUpRight className="size-3 text-emerald-500" />
                  <span>Active requests rate</span>
                </div>
              </KPIMetricCard>

              <KPIMetricCard
                icon={<Cpu />}
                label="CPU Load"
                value={apm.cpu_load_percent !== undefined ? `${apm.cpu_load_percent.toFixed(1)}%` : "0.0%"}
                isLoading={isLoading}
              >
                <div className="pt-2">
                  <Progress value={Math.min(apm.cpu_load_percent || 0, 100)} className="h-1.5" />
                </div>
              </KPIMetricCard>

              <KPIMetricCard
                icon={<Layers />}
                label="Memory Allocated"
                value={apm.memory_usage_mb !== undefined ? `${apm.memory_usage_mb.toFixed(1)}` : "0.0"}
                subtext="MB"
                isLoading={isLoading}
              >
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1 border-t border-border/40">
                  <Server className="size-3" />
                  <span>Sessions: <strong className="text-foreground">{apm.active_sessions || 0}</strong></span>
                </div>
              </KPIMetricCard>
            </div>
          </TabsContent>

          {/* Tab 2: Auth Security */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPIMetricCard
                icon={<Zap />}
                label="Total Logins (24h)"
                value={security.total_logins?.toLocaleString() || "0"}
                subtext="attempts"
                isLoading={isLoading}
              >
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1 border-t border-border/40">
                  <span>Success: <strong className="text-emerald-600 dark:text-emerald-400">{security.successful_logins?.toLocaleString() || 0}</strong></span>
                </div>
              </KPIMetricCard>

              <KPIMetricCard
                icon={<ShieldCheck />}
                label="Success Rate"
                value={security.success_rate_percent !== undefined ? `${security.success_rate_percent.toFixed(1)}%` : "0.0%"}
                isLoading={isLoading}
              >
                <div className="pt-2">
                  <Progress value={security.success_rate_percent || 0} className="h-1.5" />
                </div>
              </KPIMetricCard>

              <KPIMetricCard
                icon={<ShieldAlert />}
                label="Failed Logins"
                value={security.failed_logins?.toLocaleString() || "0"}
                subtext="blocked"
                isLoading={isLoading}
              >
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1 border-t border-border/40">
                  <span>Auth failures past 24h</span>
                </div>
              </KPIMetricCard>

              <KPIMetricCard
                icon={<ShieldCheck />}
                label="Threat Posture"
                value={threatBadge.label}
                isLoading={isLoading}
              >
                <div className="pt-1">
                  <Badge variant="outline" className={`text-[11px] font-bold ${threatBadge.className}`}>
                    {threatBadge.label}
                  </Badge>
                </div>
              </KPIMetricCard>
            </div>
          </TabsContent>

          {/* Tab 3: Identity Population */}
          <TabsContent value="identity" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPIMetricCard
                icon={<Users />}
                label="Total Accounts"
                value={identity.total_accounts?.toLocaleString() || "0"}
                subtext="registered"
                isLoading={isLoading}
              >
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  Full directory user population
                </div>
              </KPIMetricCard>

              <KPIMetricCard
                icon={<UserCheck />}
                label="Active Accounts"
                value={identity.active_accounts?.toLocaleString() || "0"}
                subtext="enabled"
                isLoading={isLoading}
              >
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  {identity.total_accounts > 0
                    ? `${Math.round(((identity.active_accounts || 0) / identity.total_accounts) * 100)}% of userbase`
                    : "Active userbase"}
                </div>
              </KPIMetricCard>

              <KPIMetricCard
                icon={<UserX />}
                label="Suspended Accounts"
                value={identity.archived_accounts?.toLocaleString() || "0"}
                subtext="deactivated"
                isLoading={isLoading}
              >
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  Locked or archived accounts
                </div>
              </KPIMetricCard>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
