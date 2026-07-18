import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { CheckIcon, ClockIcon, FingerprintIcon, InfoIcon, QuestionIcon, ShieldIcon } from "./DashboardIcons";

function SecurityMetric({ icon, label, value, isLoading = false }) {
  return (
    <Card className="shadow-none bg-muted/30">
      <CardContent className="flex flex-col items-start gap-3 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="mt-2 h-6 w-24" />
          ) : (
            <p className="mt-1 text-lg font-bold text-foreground">
              {value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityMeaningDropdown() {
  return (
    <div className="dropdown dropdown-end">
      <button type="button" tabIndex={0} aria-label="Open security analysis explanation" className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition hover:bg-muted text-muted-foreground">
        <QuestionIcon className="h-4 w-4" />
      </button>
      <div tabIndex={0} className="dropdown-content z-50 mt-2 w-80 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-md">
        <p className="font-semibold text-sm">What does this mean?</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          The system analyzed authentication activity and user behavior. An anomaly count of zero indicates that no suspicious or unusual activity was detected.
        </p>
      </div>
    </div>
  );
}

export default function SecurityAnalysisPanel({ analysis, analyzedAt, isLoading = false }) {
  const anomalies = Array.isArray(analysis?.anomalies) ? analysis.anomalies : [];
  const confidencePercent = Math.round((Number(analysis?.confidence) || 0) * 100);
  const threatLevel = analysis?.threat_level || "UNKNOWN";

  // Use a softer color for low threat, destructive for high
  const threatLevelColor = threatLevel === "LOW" ? "text-emerald-500" : threatLevel === "HIGH" ? "text-destructive" : "text-amber-500";

  return (
    <Card className="flex flex-col border-border bg-card shadow-sm h-full">
      <CardHeader className="pb-4 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl font-bold uppercase tracking-wide">Security Analysis</CardTitle>
          <CardDescription className="mt-1">AI-assisted authentication review</CardDescription>
        </div>
        <SecurityMeaningDropdown />
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <Alert className="bg-primary/5 text-primary border-primary/20">
          <InfoIcon className="h-4 w-4 stroke-primary" />
          <AlertTitle className="text-primary font-bold">AI Analysis</AlertTitle>
          <AlertDescription className="text-primary/80">Updates every 2 hours.</AlertDescription>
        </Alert>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <SecurityMetric
            icon={<ShieldIcon />}
            label="Threat Level"
            value={<span className={threatLevelColor}>{threatLevel}</span>}
            isLoading={isLoading}
          />
          <SecurityMetric
            icon={<FingerprintIcon />}
            label="Confidence"
            value={`${confidencePercent}%`}
            isLoading={isLoading}
          />
          <SecurityMetric
            icon={<ClockIcon />}
            label="Analyzed At"
            value={<span className="text-sm">{analyzedAt}</span>}
            isLoading={isLoading}
          />
        </div>

        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
          <CheckIcon className="h-4 w-4 !text-emerald-500 dark:!text-emerald-400" />
          <AlertTitle className="font-bold uppercase tracking-wider text-xs">AI Summary</AlertTitle>
          <AlertDescription className="mt-1 text-sm text-foreground">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              analysis?.advisory || "No security advisory is available."
            )}
          </AlertDescription>
        </Alert>

        <div className="pt-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
              Anomalies
            </h3>
            {isLoading ? (
              <Skeleton className="h-6 w-8 rounded-full" />
            ) : (
              <Badge variant="secondary" className="rounded-full font-bold">
                {anomalies.length}
              </Badge>
            )}
          </div>

          {isLoading ? (
            <Skeleton className="mt-3 h-4 w-48" />
          ) : anomalies.length > 0 ? (
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {anomalies.map((anomaly) => (
                <li key={String(anomaly)}>{String(anomaly)}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No anomalies detected in the selected period.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}