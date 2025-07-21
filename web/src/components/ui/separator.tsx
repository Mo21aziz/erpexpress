import * as React from "react";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "shrink-0 bg-gradient-to-r from-green-200 via-gray-200 to-red-200 h-[1px] w-full",
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
