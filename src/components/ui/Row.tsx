import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx.ts'

const gapClasses = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
} as const

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  between: 'justify-between',
  end: 'justify-end',
} as const

type Gap = keyof typeof gapClasses
type Align = keyof typeof alignClasses
type Justify = keyof typeof justifyClasses

export type RowProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  gap?: Gap
  align?: Align
  justify?: Justify
  wrap?: boolean
  children: ReactNode
}

/**
 * Horizontal flow. Uses logical flex layout only, so the row order flips correctly in RTL
 * without any direction-specific class.
 */
export function Row({
  as,
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = true,
  className,
  children,
  ...rest
}: RowProps) {
  const Component: ElementType = as ?? 'div'

  return (
    <Component
      className={cx(
        'flex',
        wrap && 'flex-wrap',
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}