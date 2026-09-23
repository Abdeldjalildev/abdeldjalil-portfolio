import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx.ts'

const widthClasses = {
  content: 'max-w-content',
  wide: 'max-w-wide',
  full: 'max-w-none',
} as const

type ContainerWidth = keyof typeof widthClasses

export type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  width?: ContainerWidth
  children: ReactNode
}

/**
 * Horizontal layout boundary: consistent page gutters plus a single maximum width.
 * Gutters use padding utilities only, so direction changes need no override.
 */
export function Container({
  as,
  width = 'content',
  className,
  children,
  ...rest
}: ContainerProps) {
  const Component: ElementType = as ?? 'div'

  return (
    <Component
      className={cx('mx-auto w-full px-4 sm:px-6 lg:px-8', widthClasses[width], className)}
      {...rest}
    >
      {children}
    </Component>
  )
}