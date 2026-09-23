import type { HTMLAttributes } from 'react'
import { cx } from './cx.ts'

export type DividerProps = HTMLAttributes<HTMLHRElement>

/** Horizontal separator drawn from the border token. No direction-dependent styling. */
export function Divider({ className, ...rest }: DividerProps) {
  return <hr className={cx('h-px w-full border-0 bg-border', className)} {...rest} />
}