import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva([
  "relative w-full text-sm border grid items-center rounded-lg px-3 py-2.5 has-[>svg]:gap-x-2.5",
  "has-[>svg]:grid-cols-[1rem_1fr] grid-cols-[1fr]",
  "has-[>[data-slot=alert-action]]:pr-9",
  "[&>svg:not([class*=size-])]:size-4",
  "has-[>[data-slot=alert-title]+[data-slot=alert-description]]:items-start",
  "has-[>[data-slot=alert-title]+[data-slot=alert-description]]:[&_svg]:translate-y-0.5",
], {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      destructive:
        "border-destructive/30 bg-destructive/4 [&>svg]:text-destructive",
      info: "border-info/30 bg-info/4 [&>svg]:text-info",
      success: "border-success/30 bg-success/4 [&>svg]:text-success",
      warning: "border-warning/30 bg-warning/4 [&>svg]:text-warning",
      invert:
        "border-invert bg-invert text-invert-foreground [&_[data-slot=alert-description]]:text-invert-foreground/70",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Alert({
  className,
  variant,
  ...props
}) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props} />
  );
}

function AlertTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      {...props} />
  );
}

function AlertDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 text-sm leading-relaxed",
        className
      )}
      {...props} />
  );
}

function AlertAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center",
        className
      )}
      {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction }