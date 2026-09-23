import { useEffect, useState } from 'react'
import { getPublicMediaUrl } from './projectPresentation.ts'

type ProjectMediaProps = {
  path: string | null
  alt: string
  priority?: boolean
  className?: string
}

export function ProjectMedia({ path, alt, priority = false, className = '' }: ProjectMediaProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    setUrl(null)
    setFailed(false)

    if (!path) return

    getPublicMediaUrl(path)
      .then(nextUrl => {
        if (active) setUrl(nextUrl)
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
    }
  }, [path])

  if (!path || failed) {
    return (
      <div
        aria-hidden="true"
        className={`grid min-h-40 place-items-center rounded-lg bg-surface-elevated ${className}`}
      />
    )
  }

  if (!url) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={`min-h-40 animate-pulse rounded-lg bg-surface-elevated ${className}`}
      />
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`block w-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
