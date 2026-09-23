import { useEffect, useState } from 'react'
import type { ContactLink, ContactLinkInput } from '../../data/types.ts'
import { CONTACT_LINK_TYPES } from '../../data/enums.ts'
import { deleteContactLink, listContactLinks, saveContactLink, validateContactTarget } from './contactLinks.ts'
import { useI18n } from '../../i18n/context.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Heading } from '../../components/ui/Heading.tsx'
import { Text } from '../../components/ui/Text.tsx'

type RecordType = ContactLink & { id: string }
const blank = (id: string): RecordType => ({
  id, type: 'email', label: { en: 'Contact', ar: 'اتصال' }, value: '', published: false, order: 0,
  createdAt: {} as ContactLink['createdAt'], updatedAt: {} as ContactLink['updatedAt'],
})

export default function ContactLinksAdmin() {
  const { t } = useI18n()
  const [items, setItems] = useState<RecordType[]>([])
  const [editing, setEditing] = useState<RecordType | null>(null)
  const [error, setError] = useState('')
  const reload = () => listContactLinks(true).then(r => setItems(r.items)).catch(() => setError(t('cms_load_error')))
  useEffect(() => { void reload() }, [])

  const save = async () => {
    if (!editing || !validateContactTarget(editing.type, editing.value)) { setError(t('cms_contact_invalid')); return }
    const input: ContactLinkInput = { type: editing.type, label: editing.label, value: editing.value.trim(), published: editing.published, order: editing.order }
    try { await saveContactLink(editing.id, input, editing.updatedAt); setEditing(null); await reload() }
    catch (e) { setError(e instanceof Error ? e.message : t('cms_save_error')) }
  }

  return <div className="grid gap-6">
    <header><Heading level={1}>{t('route_contact')}</Heading><Text variant="muted">{t('cms_contact_subtitle')}</Text></header>
    {error && <Surface role="alert"><Text variant="muted">{error}</Text></Surface>}
    <Button onClick={() => setEditing(blank('link-' + Date.now()))}>{t('cms_add_contact')}</Button>
    {editing && <Surface className="grid gap-4">
      <select className="field" value={editing.type} onChange={e => setEditing({...editing,type:e.target.value as ContactLink['type']})}>
        {CONTACT_LINK_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
      </select>
      <input className="field" placeholder={t('cms_contact_value')} value={editing.value} onChange={e => setEditing({...editing,value:e.target.value})} />
      <input className="field" placeholder={t('cms_label_en')} value={editing.label.en} onChange={e => setEditing({...editing,label:{...editing.label,en:e.target.value}})} />
      <input className="field" placeholder={t('cms_label_ar')} value={editing.label.ar} onChange={e => setEditing({...editing,label:{...editing.label,ar:e.target.value}})} />
      <input className="field" type="number" min={0} value={editing.order} onChange={e => setEditing({...editing,order:Number(e.target.value)})} />
      <label className="flex items-center gap-2"><input type="checkbox" checked={editing.published} onChange={e => setEditing({...editing,published:e.target.checked})} />{t('cms_published')}</label>
      <div className="flex gap-3"><Button onClick={() => void save()}>{t('cms_save')}</Button><Button variant="ghost" onClick={() => setEditing(null)}>{t('cms_cancel')}</Button></div>
    </Surface>}
    <div className="grid gap-4">{items.map(item => <Surface as="article" key={item.id} className="flex flex-wrap items-center justify-between gap-3">
      <div><Heading level={2}>{item.label.en}</Heading><Text variant="muted">{item.type} · {item.value}</Text></div>
      <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(item)}>{t('cms_edit')}</Button><Button size="sm" variant="ghost" onClick={() => window.confirm(t('cms_confirm_delete')) && void deleteContactLink(item.id).then(reload)}>{t('cms_delete')}</Button></div>
    </Surface>)}</div>
  </div>
