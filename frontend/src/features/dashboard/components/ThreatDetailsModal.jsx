import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Server,
  Users,
  Clock,
  Sparkles,
  Lock,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { metricsService } from "@/services/metricsService";

export default function ThreatDetailsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: details,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["kpiThreatDetails"],
    queryFn: () => metricsService.getKPIThreatDetails(),
    enabled: isOpen,
    staleTime: 30000,
  });

  const getThreatBadge = (level) => {
    switch (level?.toUpperCase()) {
      case "HIGH":
        return {
          label: "HIGH THREAT",
          className: "border-red-500 text-red-600 dark:text-red-400 bg-red-500/10",
          icon: <ShieldAlert className="size-4 text-red-500" />,
        };
      case "MEDIUM":
        return {
          label: "ELEVATED",
          className: "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10",
          icon: <AlertTriangle className="size-4 text-amber-500" />,
        };
      default:
        return {
          label: "SECURE / LOW",
          className: "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
          icon: <ShieldCheck className="size-4 text-emerald-500" />,
        };
    }
  };

  const threatLevel = details?.threat_level || "LOW";
  const badgeConfig = getThreatBadge(threatLevel);
  const triggers = details?.triggers || {};
  const aiAnalysis = details?.ai_analysis;
  const targetedClients = details?.targeted_clients || [];
  const offendingSources = details?.offending_sources || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {badgeConfig.icon}
                <span>Threat Posture & Telemetry Drilldown</span>
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-muted-foreground">
                Root-cause evaluation, affected application endpoints, and suspicious origin telemetry.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`font-bold ${badgeConfig.className}`}>
                {badgeConfig.label}
              </Badge>
              <span className="text-[11px] font-medium text-muted-foreground">
                {details?.eval_timeframe || "Past 24 Hours"}
              </span>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-44 w-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive flex flex-col items-center gap-2">
            <AlertTriangle className="size-8" />
            <p className="font-semibold text-sm">Failed to retrieve threat details.</p>
            <p className="text-xs text-muted-foreground">
              Please verify your connection and permissions.
            </p>
          </div>
        ) : (
          <div className="space-y-5 pt-3">
            {/* Trigger Banner */}
            <div className="p-4 rounded-xl border border-border/70 bg-muted/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Info className="size-3.5 text-primary" />
                  Posture Evaluation Trigger
                </span>
                <p className="text-sm font-medium text-foreground leading-snug">
                  {triggers.trigger_reason || "Authentication activity is within safe operational thresholds."}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 bg-background/80 px-3 py-2 rounded-lg border border-border/60">
                <div className="text-center">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Failed</span>
                  <span className="text-base font-extrabold text-foreground">{triggers.failed_logins ?? 0}</span>
                </div>
                <div className="h-6 w-px bg-border/60" />
                <div className="text-center">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Elevated</span>
                  <span className="text-xs font-semibold text-amber-500">&gt; {triggers.medium_threshold ?? 15}</span>
                </div>
                <div className="h-6 w-px bg-border/60" />
                <div className="text-center">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">High</span>
                  <span className="text-xs font-semibold text-red-500">&gt; {triggers.high_threshold ?? 50}</span>
                </div>
              </div>
            </div>

            {/* Drilldown Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="gap-2">
                  <Users className="size-3.5" />
                  <span>Offending Sources ({offendingSources.length})</span>
                </TabsTrigger>
                <TabsTrigger value="clients" className="gap-2">
                  <Server className="size-3.5" />
                  <span>Targeted Clients ({targetedClients.length})</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2">
                  <Sparkles className="size-3.5" />
                  <span>AI Security Advisory</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Offending Sources */}
              <TabsContent value="overview" className="mt-4 space-y-3">
                {offendingSources.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                    <ShieldCheck className="size-8 mx-auto mb-2 text-emerald-500" />
                    <p className="text-sm font-medium">No offending IP sources or accounts recorded in this window.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="text-xs font-bold uppercase">IP Address</TableHead>
                          <TableHead className="text-xs font-bold uppercase">Account / Actor</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-right">Fail Count</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-right">Last Attempt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offendingSources.map((source, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs font-medium">
                              <div className="flex items-center gap-2">
                                <span>{source.ip || "Unknown IP"}</span>
                                {source.is_masked && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1 text-muted-foreground flex items-center gap-0.5">
                                    <Lock className="size-2.5" /> Masked
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium text-foreground">
                              {source.actor || "(unspecified)"}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-destructive text-right">
                              {source.fail_count}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground text-right">
                              {source.last_attempt ? new Date(source.last_attempt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Tab 2: Targeted Clients */}
              <TabsContent value="clients" className="mt-4 space-y-3">
                {targetedClients.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                    <Server className="size-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">No application clients specifically targeted by authentication friction.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="text-xs font-bold uppercase">Application Client</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-right">Failures</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-right">Successes</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-right">Failure Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {targetedClients.map((client, idx) => {
                          const total = (client.failed_count || 0) + (client.success_count || 0);
                          const failRate = total > 0 ? Math.round(((client.failed_count || 0) / total) * 100) : 0;
                          return (
                            <TableRow key={idx}>
                              <TableCell>
                                <div>
                                  <span className="font-semibold text-xs text-foreground block">{client.client_name}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">{client.client_id}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-bold text-destructive text-right">
                                {client.failed_count}
                              </TableCell>
                              <TableCell className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                                {client.success_count}
                              </TableCell>
                              <TableCell className="text-xs text-right font-medium">
                                <span className={failRate > 30 ? "text-destructive font-bold" : "text-foreground"}>
                                  {failRate}%
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: AI Security Advisory */}
              <TabsContent value="ai" className="mt-4 space-y-4">
                {aiAnalysis ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-border/70 bg-muted/30 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Sparkles className="size-3.5 text-primary" />
                          Gemini Intelligence Posture
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`font-bold ${getThreatBadge(aiAnalysis.threat_level).className}`}>
                            {aiAnalysis.threat_level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Analyzed at: {aiAnalysis.analyzed_at ? new Date(aiAnalysis.analyzed_at).toLocaleString() : "Recent"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-[11px] font-semibold text-muted-foreground">Confidence</span>
                        <span className="text-lg font-bold text-foreground">
                          {Math.round((aiAnalysis.confidence || 0) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Anomalies List */}
                    {aiAnalysis.anomalies && aiAnalysis.anomalies.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Detected Threat Anomalies
                        </span>
                        <ul className="space-y-1.5">
                          {aiAnalysis.anomalies.map((anomaly, idx) => (
                            <li
                              key={idx}
                              className="text-xs p-2.5 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2"
                            >
                              <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
                              <span className="text-foreground">{anomaly}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Advisory */}
                    {aiAnalysis.advisory && (
                      <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          Recommended Mitigation Advisory
                        </span>
                        <p className="text-xs text-foreground leading-relaxed">
                          {aiAnalysis.advisory}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg space-y-2">
                    <Sparkles className="size-8 mx-auto text-muted-foreground opacity-60" />
                    <p className="text-sm font-medium">No cached AI security model review available.</p>
                    <p className="text-xs">
                      AI authentication review updates periodically based on scheduled background telemetry cycles.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
