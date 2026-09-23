import type { ReactNode } from 'react'

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="grid gap-2">
      <span className="text-label font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="text-caption text-foreground-muted">{hint}</span> : null}
    </label>
  )
}

export const inputClass =
  'min-h-11 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-body text-foreground outline-none transition-standard focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/40'

export const textareaClass = `${inputClass} min-h-32 resize-y`

export function SaveState({ message, error }: { message?: string; error?: string }) {
  if (!message && !error) return null
  return (
    <p
      role={error ? 'alert' : 'status'}
      className={error ? 'text-body text-danger' : 'text-body text-accent'}
    >
      {error ?? message}
    </p>
  )
}
