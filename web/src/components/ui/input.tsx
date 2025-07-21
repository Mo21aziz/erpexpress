import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "email" | "password" | "default";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const focusClasses = {
      email: "focus:border-green-500 focus:ring-green-500/20",
      password: "focus:border-red-500 focus:ring-red-500/20",
      default: "focus:border-green-500 focus:ring-green-500/20",
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          focusClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
