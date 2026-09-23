import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx.ts'

/* Tinted variants: the border and background are light washes of the same
   semantic colour that the label uses, so a status never needs new values. */
const variantClasses = {
  neutral: 'border-border bg-surface text-foreground-muted',
  primary: 'border-primary-subtle/40 bg-primary-subtle/15 text-primary-subtle',
  accent: 'border-accent/40 bg-accent/15 text-accent',
  success: 'border-success/40 bg-success/15 text-success',
  warning: 'border-warning/40 bg-warning/15 text-warning',
  error: 'border-error/40 bg-error/15 text-error',
  info: 'border-info/40 bg-info/15 text-info',
} as const

type BadgeVariant = keyof typeof variantClasses

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({ variant = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-label font-medium uppercase',
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}