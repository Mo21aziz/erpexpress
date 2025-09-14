import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "link" |"variant";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";
    
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-gradient-to-r from-green-600 to-red-600 text-white hover:from-green-700 hover:to-red-700 shadow-md":
              variant === "default",
            "hover:bg-gray-100 hover:text-gray-900": variant === "ghost",
            "underline-offset-4 hover:underline text-green-600 hover:text-green-700":
              variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
          },
          !asChild && className
        )}
        ref={asChild ? undefined : ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };