import { useEffect, useState } from 'react'
import type { Service } from '../../data/index.ts'
import { listServices } from '../cms/data.ts'
import { useI18n } from '../../i18n/context.ts'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'

export default function Services() {
  const { t, locale } = useI18n()
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [invalidCount, setInvalidCount] = useState(0)

  useEffect(() => {
    let active = true
    listServices(true).then(result => {
      if (!active) return
      setItems(result.items); setInvalidCount(result.invalidCount)
    }).catch(() => { if (active) setError(true) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) return <p className="text-body text-foreground-muted">{t('loading_label')}</p>
  if (error) return <Surface role="alert"><p className="text-body text-danger">{t('cms_public_error')}</p></Surface>
  const localized=(value:{en:string;ar:string})=>locale==='ar'&&value.ar?value.ar:value.en
  return <div className="grid gap-8">
    <div className="grid gap-2"><Heading>{t('route_services')}</Heading><p className="text-body text-foreground-muted">{t('cms_services_public_subtitle')}</p></div>
    {invalidCount>0&&<p role="status" className="text-caption text-foreground-muted">{t('cms_invalid_items',{count:invalidCount})}</p>}
    {items.length===0?<Surface><p className="text-body text-foreground-muted">{t('cms_empty_services')}</p></Surface>:<div className="grid gap-5 md:grid-cols-2">{items.map(item=><Surface as="article" key={item.slug} padding="lg"><h2 className="text-h3 font-semibold text-foreground">{localized(item.title)}</h2><p className="mt-2 text-body text-foreground-muted">{localized(item.summary)}</p><Text className="mt-4 whitespace-pre-wrap">{localized(item.description)}</Text></Surface>)}</div>}
  </div>
}
