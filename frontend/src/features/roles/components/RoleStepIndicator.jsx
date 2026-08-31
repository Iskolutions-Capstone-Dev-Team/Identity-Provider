import { Fragment } from "react";
import { FileText, Shield } from "lucide-react";

export default function RoleStepIndicator({ currentStep, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const activeStepClassName = "border-primary bg-primary/10 text-primary";
  const inactiveStepClassName = "border-border bg-muted/50 text-muted-foreground";
  const activeLabelClassName = "text-primary";
  const inactiveLabelClassName = "text-muted-foreground";
  const lineClassName = currentStep >= 2 ? "border-primary/50" : "border-border";

  const steps = [
    {
      label: "Role Details",
      shortLabel: "Details",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Permissions",
      shortLabel: "Permissions",
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  const getStepIconClassName = (isActive) =>
    `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border transition-colors duration-300 ${
      isActive ? activeStepClassName : inactiveStepClassName
    }`;
  const getStepLabelClassName = (isActive) =>
    `text-center text-xs font-semibold leading-tight transition-colors duration-300 sm:text-sm ${
      isActive ? activeLabelClassName : inactiveLabelClassName
    }`;

  return (
    <div className="mx-auto grid w-full max-w-[32rem] grid-cols-[minmax(5.75rem,auto)_1fr_minmax(5.75rem,auto)] items-start gap-2 px-3 py-4 sm:gap-3 sm:px-4">
      {steps.map((stepItem, index) => {
        const isActive = currentStep >= index + 1;
        return (
          <Fragment key={stepItem.label}>
            <div className="flex min-w-0 flex-col items-center gap-2">
              <span className={getStepIconClassName(isActive)}>
                {stepItem.icon}
              </span>
              <span className={getStepLabelClassName(isActive)}>
                <span className="sm:hidden">{stepItem.shortLabel}</span>
                <span className="hidden sm:inline">{stepItem.label}</span>
              </span>
            </div>

            {index === 0 && (
              <span className={`mt-5 h-px flex-1 border-t-2 border-dotted ${lineClassName}`} aria-hidden="true" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
