import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const checkboxVariants = cva(
  "flex items-center justify-center rounded border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
      variant: {
        default: "border-border bg-background-elevated",
        error: "border-error-500 bg-background-elevated",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const checkIconSizes = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      size,
      variant,
      label,
      description,
      error,
      indeterminate,
      id,
      checked,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const descriptionId = description ? `${checkboxId}-description` : undefined;
    const ariaDescribedBy = [errorId, descriptionId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              checked={checked}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={ariaDescribedBy}
              className="sr-only"
              {...props}
            />
            <label
              htmlFor={checkboxId}
              className={cn(
                checkboxVariants({ size, variant: error ? "error" : variant }),
                checked && "bg-primary-600 border-primary-600",
                indeterminate && "bg-primary-600 border-primary-600",
                "cursor-pointer hover:bg-background-hover",
                className
              )}
            >
              {checked && !indeterminate && (
                <svg
                  className={cn("text-white", checkIconSizes[size || "md"])}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {indeterminate && (
                <svg
                  className={cn("text-white", checkIconSizes[size || "md"])}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 12h14"
                  />
                </svg>
              )}
            </label>
          </div>
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className="block text-sm font-medium text-foreground cursor-pointer"
                >
                  {label}
                </label>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="text-sm text-foreground-muted mt-1"
                >
                  {description}
                </p>
              )}
              {error && (
                <p
                  id={errorId}
                  className="mt-1.5 text-sm text-error-500 font-medium"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
