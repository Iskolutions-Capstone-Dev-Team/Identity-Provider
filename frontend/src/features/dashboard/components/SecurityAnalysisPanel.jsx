import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../../components/reui/alert";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Button } from "../../../components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "../../../components/reui/frame";
import { ArrowLeftIcon, ArrowRightIcon, MessageCircleQuestionMark, ShieldCheck, Fingerprint, Clock, CircleCheckIcon, ChevronRightIcon } from "lucide-react";
import { CheckIcon } from "./DashboardIcons";

function SecurityMetric({ icon, label, value, isLoading = false }) {
  return (
    <Card className="w-full shadow-none bg-muted/30">
      <CardContent className="flex flex-col gap-3 px-4 py-2.5">
        <div className="bg-primary rounded-md [&_svg]:text-primary-foreground flex size-11 items-center justify-center [&_svg]:size-5">
          {icon}
        </div>
        <span className="text-foreground block text-sm leading-tight font-medium">
          {label}
        </span>
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <p className="text-foreground text-base leading-relaxed font-bold">
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SecurityMeaningPopover() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "What does this mean?",
      description: "The system analyzed authentication activity and user behavior. An anomaly count of zero indicates that no suspicious or unusual activity was detected.",
    },
    {
      title: "AI Analysis",
      description: "Updates every 2 hours.",
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground transition hover:bg-muted" aria-label="Open security analysis explanation">
          <MessageCircleQuestionMark className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 gap-2 px-3 pt-3 pb-2"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-2">
          <p className="leading-tight font-medium text-foreground">
            {steps[currentStep].title}
          </p>
          <p className="text-muted-foreground text-sm">
            {steps[currentStep].description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-muted-foreground text-xs font-medium">
            {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-0.5">
            <Button aria-label="Previous step" className="h-6 w-6" disabled={isFirst} onClick={handlePrev} size="icon" variant="ghost">
              <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button aria-label="Next step" className="h-6 w-6" disabled={isLast} onClick={handleNext} size="icon" variant="ghost">
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
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
        <SecurityMeaningPopover />
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-2">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <SecurityMetric
            icon={<ShieldCheck aria-hidden="true" />}
            label="Threat Level"
            value={<span className={threatLevelColor}>{threatLevel}</span>}
            isLoading={isLoading}
          />
          <SecurityMetric
            icon={<Fingerprint aria-hidden="true" />}
            label="Confidence"
            value={`${confidencePercent}%`}
            isLoading={isLoading}
          />
          <SecurityMetric
            icon={<Clock aria-hidden="true" />}
            label="Analyzed At"
            value={<span className="text-sm">{analyzedAt}</span>}
            isLoading={isLoading}
          />
        </div>

        <Alert variant="success">
          <CircleCheckIcon />
          <AlertTitle>AI Summary</AlertTitle>
          <AlertDescription>
            {isLoading ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              analysis?.advisory || "No security advisory is available."
            )}
          </AlertDescription>
        </Alert>

        <div className="pt-2">
          <Frame className="w-full" stacked>
            <Collapsible defaultOpen className="group/collapsible">
              <CollapsibleTrigger className="w-full">
                <FrameHeader className="flex grow flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <FrameTitle className="uppercase tracking-wide">ANOMALIES</FrameTitle>
                    {isLoading ? (
                      <Skeleton className="h-6 w-8 rounded-full" />
                    ) : (
                      <Badge variant="secondary" className="rounded-full font-bold">
                        {anomalies.length}
                      </Badge>
                    )}
                  </div>
                  <ChevronRightIcon className="text-muted-foreground size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                </FrameHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <FramePanel>
                  {isLoading ? (
                    <Skeleton className="mt-1 h-4 w-48" />
                  ) : anomalies.length > 0 ? (
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {anomalies.map((anomaly) => (
                        <li key={String(anomaly)}>{String(anomaly)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No anomalies detected in the selected period.
                    </p>
                  )}
                </FramePanel>
              </CollapsibleContent>
            </Collapsible>
          </Frame>
        </div>
      </CardContent>
    </Card>
  );
}