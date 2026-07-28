import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('relative w-full rounded-xl border p-4 text-sm flex gap-3', {
  variants: {
    variant: {
      default: 'bg-card border-border text-foreground',
      warning: 'bg-warning/10 border-warning/40 text-warning-foreground',
      destructive: 'bg-destructive/10 border-destructive/30 text-destructive',
      success: 'bg-success/10 border-success/30 text-success',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
