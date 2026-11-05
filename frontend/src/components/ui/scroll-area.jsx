import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@/lib/utils"

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-0.5 transition-opacity select-none data-hidden:opacity-0 data-hidden:pointer-events-none",
        orientation === "horizontal"
          ? "h-2 w-full flex-col border-t border-t-transparent"
          : "h-full w-2 border-l border-l-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border hover:bg-muted-foreground/40 transition-colors"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

function ScrollArea({
  className,
  children,
  ...props
}) {
  const content = [];
  const scrollbars = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && (child.type === ScrollBar || child.props?.["data-slot"] === "scroll-area-scrollbar")) {
      scrollbars.push(child);
    } else {
      content.push(child);
    }
  });

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {content}
      </ScrollAreaPrimitive.Viewport>
      {scrollbars.length > 0 ? scrollbars : <ScrollBar orientation="vertical" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

export { ScrollArea, ScrollBar }
