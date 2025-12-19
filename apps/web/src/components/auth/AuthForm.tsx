import { ReactNode, FormHTMLAttributes } from "react";

interface AuthFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  title: string;
  subtitle?: string;
  error?: string;
  footer?: ReactNode;
}

export function AuthForm({
  children,
  title,
  subtitle,
  error,
  footer,
  ...formProps
}: AuthFormProps) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-3 font-normal">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-foreground-muted font-light font-brand font-normal">
            {subtitle}
          </p>
        )}
      </div>

      <div className="bg-background-elevated border border-border p-8 md:p-12">
        <form {...formProps} className="space-y-6">
          {children}

          {error && (
            <div
              className="bg-error-900/50 border border-error-700 text-error-200 px-4 py-3 rounded-lg text-sm"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}
        </form>

        {footer && (
          <div className="mt-8 pt-8 border-t border-border space-y-3 text-center">{footer}</div>
        )}
      </div>
    </div>
  );
}
