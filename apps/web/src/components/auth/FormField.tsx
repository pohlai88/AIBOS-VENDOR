import { InputHTMLAttributes } from "react";
import { Input } from "@aibos/ui";

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: string;
  helperText?: string;
}

export function FormField({ label, error, helperText, ...inputProps }: FormFieldProps) {
  return (
    <Input
      label={label}
      error={error}
      helperText={helperText}
      {...inputProps}
    />
  );
}
