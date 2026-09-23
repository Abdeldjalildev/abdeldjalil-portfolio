import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx.ts'

const tagByLevel = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const

const classByLevel = {
  1: 'text-h1',
  2: 'text-h2',
  3: 'text-h3',
  4: 'text-h4',
} as const

type HeadingLevel = keyof typeof tagByLevel

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel
  balance?: boolean
  children: ReactNode
}

/**
 * Heading semantics and heading typography are bound together, so a correct
 * document outline cannot drift away from the type scale.
 * Arabic rules (tracking/leading) come from base.css and are not duplicated here.
 */
export function Heading({
  level = 2,
  balance = true,
  className,
  children,
  ...rest
}: HeadingProps) {
  const Component: ElementType = tagByLevel[level]

  return (
    <Component
      className={cx(
        'font-semibold text-foreground',
        classByLevel[level],
        balance && 'text-balance',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}