"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/cn";
import { Input, type InputProps } from "./Input";

/**
 * Password field with a show/hide toggle.
 *
 * The toggle is `tabIndex={-1}` + `aria-hidden` on the icon because it is a
 * convenience, not a required control: keyboard users can already reveal the
 * value through their password manager or browser. Keeping it out of the tab
 * order stops it from interrupting the natural form flow.
 */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          {...props}
          className={cn("pr-12", props.className)}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute top-[2.15rem] right-3 text-muted transition-colors hover:text-primary-600"
        >
          {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        </button>
      </div>
    );
  },
);
