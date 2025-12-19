import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500",
        secondary:
          "bg-secondary-700 text-white hover:bg-secondary-600 active:bg-secondary-800 focus-visible:ring-secondary-500",
        success:
          "bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500",
        error:
          "bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500",
        warning:
          "bg-warning-600 text-white hover:bg-warning-700 active:bg-warning-800 focus-visible:ring-warning-500",
        outline:
          "border-2 border-border bg-transparent text-foreground hover:bg-background-hover hover:border-border-hover focus-visible:ring-border-focus",
        ghost:
          "bg-transparent text-foreground hover:bg-background-hover focus-visible:ring-border-focus",
        link: "text-primary-500 underline-offset-4 hover:underline focus-visible:ring-primary-500",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
