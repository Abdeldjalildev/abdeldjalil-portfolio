import { useEffect, useState } from 'react'
import type { ContactLink } from '../../data/types.ts'
import { listContactLinks } from '../cms/contactLinks.ts'
import { useI18n } from '../../i18n/context.ts'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'
import { trackEvent } from '../../data/analytics.ts'

type ContactRecord = ContactLink & { id: string }

const hrefFor = (link: ContactLink) => {
  const value = link.value.trim()
  if (link.type === 'email') return value.startsWith('mailto:') ? value : 'mailto:' + value
  if (link.type === 'phone') return value.startsWith('tel:') ? value : 'tel:' + value.replaceAll(' ', '')
  if (link.type === 'whatsapp' && !value.startsWith('https://')) return 'https://wa.me/' + value.replace(/[^0-9]/g, '')
  return value
}

export default function Contact() {
  const { locale, t } = useI18n()
  const [items, setItems] = useState<ContactRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    listContactLinks(false).then(result => active && setItems(result.items)).catch(() => active && setError(true)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  if (loading) return <p className="text-body text-foreground-muted">{t('loading_label')}</p>
  return (
    <div className="grid gap-8">
      <header className="grid gap-2"><Heading level={1}>{t('contact_title')}</Heading><Text variant="lead">{t('contact_subtitle')}</Text></header>
      {error && <Surface role="alert"><Text variant="muted">{t('contact_load_error')}</Text></Surface>}
      {!error && items.length === 0 && <Surface><Text variant="muted">{t('contact_empty')}</Text></Surface>}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(link => {
          const href = hrefFor(link)
          const external = href.startsWith('https://')
          return <Surface as="article" key={link.id} className="flex items-center justify-between gap-4">
            <div className="min-w-0"><Heading level={2}>{link.label[locale] || link.label.en}</Heading><Text variant="muted" className="truncate">{link.value}</Text></div>
            <a href={href}
              onClick={() => trackEvent(link.type === 'email' || link.type === 'phone' || link.type === 'whatsapp' ? 'contact_click' : 'social_click')} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-accent px-5 text-body font-medium text-accent-foreground transition-standard hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{t('contact_open')}</a>
          </Surface>
        })}
      </div>
    </div>
  )
}
