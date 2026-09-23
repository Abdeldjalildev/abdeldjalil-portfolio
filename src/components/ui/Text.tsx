import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx.ts'

const variantClasses = {
  body: 'text-body text-foreground',
  lead: 'text-lead text-foreground-muted',
  muted: 'text-body text-foreground-muted',
  subtle: 'text-caption text-foreground-subtle',
  label: 'text-label uppercase text-foreground-muted',
  code: 'text-code font-mono text-accent',
} as const

type TextVariant = keyof typeof variantClasses

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  variant?: TextVariant
  children: ReactNode
}

/** Text roles. Colour and scale always come from a token, never from a raw value. */
export function Text({ as, variant = 'body', className, children, ...rest }: TextProps) {
  const Component: ElementType = as ?? 'p'

  return (
    <Component className={cx(variantClasses[variant], className)} {...rest}>
      {children}
    </Component>
  )
}