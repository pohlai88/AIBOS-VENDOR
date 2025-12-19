import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const switchVariants = cva(
  "relative inline-flex items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const thumbVariants = cva(
  "inline-block transform rounded-full bg-white transition-transform",
  {
    variants: {
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">,
  VariantProps<typeof switchVariants> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      size,
      checked = false,
      onCheckedChange,
      label,
      description,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const switchElement = (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || props["aria-label"]}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          switchVariants({ size }),
          checked ? "bg-primary-600" : "bg-background-elevated",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            thumbVariants({ size }),
            checked
              ? size === "sm"
                ? "translate-x-5"
                : size === "md"
                  ? "translate-x-6"
                  : "translate-x-8"
              : "translate-x-1"
          )}
        />
      </button>
    );

    if (label || description) {
      return (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {label && (
              <label
                className="block text-sm font-medium text-foreground cursor-pointer"
                onClick={!disabled ? handleClick : undefined}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-foreground-muted mt-1">{description}</p>
            )}
          </div>
          <div className="ml-4">{switchElement}</div>
        </div>
      );
    }

    return switchElement;
  }
);

Switch.displayName = "Switch";
