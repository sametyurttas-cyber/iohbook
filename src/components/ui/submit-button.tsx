"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({ children, disabled, ...props }: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();

  return (
    <Button aria-busy={pending} disabled={disabled || pending} type="submit" {...props}>
      {pending ? "Islem yapiliyor..." : children}
    </Button>
  );
}
