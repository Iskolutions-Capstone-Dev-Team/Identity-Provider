import { useState, useEffect } from "react";
import { Database, Server, HardDrive, CheckCircle2, AlertTriangle, XCircle, Cpu, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { getSystemHealth } from "../../../services/healthService";

function ResourceMetric({ icon, label, value, subtext, alertIcon, isLoading }) {
  return (
    <Card className="w-full h-full shadow-none bg-muted/30">
      <CardContent className="flex flex-col justify-between h-full gap-3 px-4 py-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center [&_svg]:size-5 bg-[#7b0d15] rounded-xl text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15]">
          {icon}
        </div>
        <span className="text-foreground block text-sm leading-tight font-medium">
          {label}
        </span>
        {isLoading ? (
          <Skeleton className="h-6 w-16" />
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-foreground text-2xl leading-none font-bold tracking-tight">
              {value}
            </span>
            {subtext && <span className="text-sm font-medium text-muted-foreground">{subtext}</span>}
            {alertIcon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SystemHealthWidget({ colorMode = "light", isDashboardLoading = false }) {
  const [healthData, setHealthData] = useState(null);
  const [isWidgetLoading, setIsWidgetLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoading = isWidgetLoading || isDashboardLoading;

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setIsWidgetLoading(true);
        const data = await getSystemHealth();
        setHealthData(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch system health.");
        console.error("Health check error:", err);
      } finally {
        setIsWidgetLoading(false);
      }
    };

    fetchHealth();
    // Optional: Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "degraded": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "unhealthy": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-muted-foreground bg-muted border-border";
    }
  };

  const HealthSkeleton = () => (
    <div className="grid md:grid-cols-[2fr_1fr] gap-8 h-full">
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Services</h4>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/50 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex flex-col h-full">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Resources</h4>
        <div className="grid grid-cols-2 gap-4 flex-1">
          <ResourceMetric
            icon={<Cpu />}
            label="CPU Load (1m)"
            isLoading={true}
          />
          <ResourceMetric
            icon={<Layers />}
            label="Memory Usage"
            isLoading={true}
          />
        </div>
      </div>
    </div>
  );

  const showSkeleton = isDashboardLoading || (isWidgetLoading && !healthData);

  if (showSkeleton) {
    return (
      <Card className="flex flex-col border-border bg-card shadow-sm h-full">
        <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold uppercase tracking-wide">
              SYSTEM STATUS
            </CardTitle>
            <CardDescription className="mt-1">Live monitor of system health and performance</CardDescription>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          <HealthSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error && !healthData) {
    return (
      <Card className="flex flex-col border-border bg-card shadow-sm h-full">
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold uppercase tracking-wide">
              SYSTEM STATUS
            </CardTitle>
            <CardDescription className="mt-1">Live monitor of system health and performance</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { status, checks, system } = healthData || {};

  return (
    <Card className="flex flex-col border-border bg-card shadow-sm h-full">
      <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl font-bold uppercase tracking-wide">
            SYSTEM STATUS
          </CardTitle>
          <CardDescription className="mt-1">Live monitor of system health and performance</CardDescription>
        </div>
        <Badge variant="outline" className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${getStatusColor(status)}`}>
          {status}
        </Badge>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1">
        <div className="grid md:grid-cols-[2fr_1fr] gap-8 h-full">
          {/* Service Checks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Services</h4>
            
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/50 shadow-sm transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Database</span>
              </div>
              {getStatusIcon(checks?.database?.status)}
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/50 shadow-sm transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cache</span>
              </div>
              {getStatusIcon(checks?.cache?.status)}
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/50 shadow-sm transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              {getStatusIcon(checks?.storage?.status)}
            </div>
          </div>

          {/* System Resources */}
          <div className="flex flex-col h-full">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Resources</h4>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <ResourceMetric
                icon={<Cpu />}
                label="CPU Load (1m)"
                value={system?.load_average_1m?.toFixed(2)}
                alertIcon={system?.heavy_load ? <AlertTriangle className="h-4 w-4 text-amber-500 ml-1" /> : null}
              />
              <ResourceMetric
                icon={<Layers />}
                label="Memory Usage"
                value={system?.memory_allocated_mb?.toFixed(1)}
                subtext="MB"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
