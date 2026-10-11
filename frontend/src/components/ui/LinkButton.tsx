"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { buttonClasses, type ButtonSize, type ButtonVariant } from "./Button";

export interface LinkButtonProps
  extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * A navigation target that *looks* like a Button.
 *
 * We need this because `<button><a/></button>` and `<a><button/></a>` are both
 * invalid HTML and break keyboard/AT behaviour. Styling the anchor directly
 * keeps semantics correct (it is a link, because it navigates).
 */
export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses(variant, size, fullWidth, className)} {...props}>
      {children}
    </Link>
  );
}
