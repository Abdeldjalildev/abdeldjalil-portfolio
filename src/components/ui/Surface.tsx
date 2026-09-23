import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx.ts'

const variantClasses = {
  default: 'bg-surface border border-border',
  elevated: 'bg-surface-elevated border border-border shadow-elevated',
  glass: 'glass-surface',
  outline: 'bg-transparent border border-border-strong',
} as const

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
} as const

const roundedClasses = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
} as const

type SurfaceVariant = keyof typeof variantClasses
type SurfacePadding = keyof typeof paddingClasses
type SurfaceRounded = keyof typeof roundedClasses

export type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  variant?: SurfaceVariant
  padding?: SurfacePadding
  rounded?: SurfaceRounded
  children: ReactNode
}

/**
 * The single surface primitive. Every panel, card and glass layer in later phases
 * must be one of these variants instead of a bespoke background/border combination.
 */
export function Surface({
  as,
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  className,
  children,
  ...rest
}: SurfaceProps) {
  const Component: ElementType = as ?? 'div'

  return (
    <Component
      className={cx(
        variantClasses[variant],
        paddingClasses[padding],
        roundedClasses[rounded],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}