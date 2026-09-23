import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx.ts'

const gapClasses = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
} as const

type Gap = keyof typeof gapClasses

export type StackProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  gap?: Gap
  children: ReactNode
}

/** Vertical flow. Gaps come from the shared scale, keeping spacing consistent. */
export function Stack({ as, gap = 'md', className, children, ...rest }: StackProps) {
  const Component: ElementType = as ?? 'div'

  return (
    <Component className={cx('flex flex-col', gapClasses[gap], className)} {...rest}>
      {children}
    </Component>
  )
}