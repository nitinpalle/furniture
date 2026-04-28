import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-fg)] text-[var(--color-bg)] hover:bg-[var(--color-fg-muted)]",
        secondary:
          "border border-[var(--color-border-strong)] text-[var(--color-fg)] hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)]",
        ghost:
          "text-[var(--color-fg)] hover:bg-[var(--color-bg)]/40",
        whatsapp:
          "bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp-hover)] shadow-sm hover:shadow-md",
        link:
          "text-[var(--color-fg)] underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
