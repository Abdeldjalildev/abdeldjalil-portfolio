import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx.ts'

const spacingClasses = {
  none: '',
  sm: 'py-8 sm:py-10',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-24',
} as const

type SectionSpacing = keyof typeof spacingClasses

export type SectionProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  spacing?: SectionSpacing
  children: ReactNode
}

/**
 * Vertical rhythm boundary. Section spacing lives here and nowhere else,
 * so pages never invent their own vertical padding values.
 */
export function Section({ as, spacing = 'md', className, children, ...rest }: SectionProps) {
  const Component: ElementType = as ?? 'section'

  return (
    <Component className={cx('w-full', spacingClasses[spacing], className)} {...rest}>
      {children}
    </Component>
  )
}