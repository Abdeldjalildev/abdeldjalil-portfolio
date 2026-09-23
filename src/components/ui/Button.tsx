import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx.ts'

/*
 * Interactive state contract, applied identically to every variant:
 * - hover/active use an opacity step on the fill, which darkens the fill and therefore
 *   keeps label contrast at or above the resting state instead of dropping it.
 * - focus uses the shared --color-focus ring; the global base rule is a fallback only.
 * - disabled keeps the control visible and understandable; it never disappears.
 */
const baseClasses =
  'inline-flex select-none items-center justify-center gap-2 rounded-md font-medium transition-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60'

const variantClasses = {
  primary: 'bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 active:bg-primary/80',
  accent: 'bg-accent text-accent-foreground shadow-soft hover:bg-accent/90 active:bg-accent/80',
  outline:
    'border border-border-strong text-foreground hover:border-accent/70 hover:bg-surface active:bg-surface-elevated',
  ghost:
    'text-foreground-muted hover:bg-surface hover:text-foreground active:bg-surface-elevated',
} as const

/* md and lg meet the 44px minimum touch target; sm is the compact inline size. */
const sizeClasses = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-body',
  lg: 'h-12 px-6 text-lead',
} as const

type ButtonVariant = keyof typeof variantClasses
type ButtonSize = keyof typeof sizeClasses

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    >
      {children}
    </button>
  )
}