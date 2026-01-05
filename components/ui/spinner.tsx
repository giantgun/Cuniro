import type React from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const spinnerVariants = cva("animate-spin text-primary", {
  variants: {
    size: {
      default: "size-4",
      sm: "size-3",
      lg: "size-8",
      xl: "size-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// Use Omit to remove 'size' from the Lucide props
interface SpinnerProps
  extends
    Omit<React.ComponentProps<typeof Loader2Icon>, "size">,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      // Pass the size variant to the CVA function
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  );
}

export { Spinner, spinnerVariants };
