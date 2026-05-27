"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
  children: ReactNode;
};

export function SubmitButton({
  pendingText = "Guardando...",
  children,
  className = "",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={disabled || pending}
      className={`${className} disabled:cursor-wait disabled:opacity-70`}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>{pendingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
