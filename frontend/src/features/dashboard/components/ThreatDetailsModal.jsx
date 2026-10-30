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
  ArchiveIcon,
  LayersIcon,
  PackageIcon,
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
import { IconStack } from "@/components/reui/icon-stack";
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
        };
      case "MEDIUM":
        return {
          label: "ELEVATED",
          className: "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10",
        };
      default:
        return {
          label: "SECURE / LOW",
          className: "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
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
      <DialogContent 
        className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6"
        closeButtonClassName="text-white hover:text-white/80 hover:bg-white/10 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-muted top-4 right-4"
      >
        <DialogHeader className="-mx-6 -mt-6 mb-2 rounded-t-xl border-b p-4 sm:p-5 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle className="text-lg sm:text-xl font-bold text-white dark:text-foreground">
            Threat Posture & Telemetry Drilldown
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-white/90 dark:text-muted-foreground">
            Root-cause evaluation, affected application endpoints, and suspicious origin telemetry.
          </DialogDescription>
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
            {/* Posture & Evaluation Timeframe in Dialog Body */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Posture Status:
                </span>
                <Badge variant="outline" className={`font-bold ${badgeConfig.className}`}>
                  {badgeConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Clock className="size-3.5 text-muted-foreground" />
                <span>Evaluation Window: <strong className="text-foreground">{details?.eval_timeframe || "Past 24 Hours"}</strong></span>
              </div>
            </div>

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

            {/* Drilldown Tabs - Responsive grid without number count */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-1 gap-1">
                <TabsTrigger value="overview" className="gap-2 text-xs sm:text-sm py-2">
                  <Users className="size-3.5" />
                  <span>Offending Sources</span>
                </TabsTrigger>
                <TabsTrigger value="clients" className="gap-2 text-xs sm:text-sm py-2">
                  <Server className="size-3.5" />
                  <span>Targeted Clients</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2 text-xs sm:text-sm py-2">
                  <Sparkles className="size-3.5" />
                  <span>AI Security Advisory</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Offending Sources */}
              <TabsContent value="overview" className="mt-4 space-y-3">
                {offendingSources.length === 0 ? (
                  <div className="py-12 px-4 text-center border border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center gap-3 bg-muted/10">
                    <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-[#f8d24e]">
                      <ArchiveIcon className="size-4 text-[#7b0d15] dark:text-[#f8d24e]" />
                    </IconStack>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">No Offending Sources Recorded</p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        No offending IP sources or accounts recorded in this window.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-x-auto">
                    <Table className="min-w-[500px]">
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
                  <div className="py-12 px-4 text-center border border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center gap-3 bg-muted/10">
                    <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-[#f8d24e]">
                      <PackageIcon className="size-4 text-[#7b0d15] dark:text-[#f8d24e]" />
                    </IconStack>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">No Targeted Clients</p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        No application clients specifically targeted by authentication friction.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-x-auto">
                    <Table className="min-w-[500px]">
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
                  <div className="py-12 px-4 text-center border border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center gap-3 bg-muted/10 space-y-1">
                    <IconStack aria-hidden="true" className="text-[#7b0d15] dark:text-[#f8d24e]">
                      <LayersIcon className="size-4 text-[#7b0d15] dark:text-[#f8d24e]" />
                    </IconStack>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">No Cached AI Advisory</p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        AI authentication review updates periodically based on scheduled background telemetry cycles.
                      </p>
                    </div>
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
