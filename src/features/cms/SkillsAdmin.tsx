import { useEffect, useState, type FormEvent } from 'react'
import type { Skill, SkillInput } from '../../data/index.ts'
import { SKILL_GROUPS } from '../../data/index.ts'
import { useI18n } from '../../i18n/context.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Field, inputClass, SaveState } from './fields.tsx'
import { deleteSkill, listSkills, saveSkill, type SkillRecord } from './data.ts'
import { getErrorMessage } from './errors.ts'

const blank: SkillInput = { name: '', group: 'frontend', iconPath: null, published: false, order: 0 }

export default function SkillsAdmin() {
  const { t } = useI18n()
  const [items, setItems] = useState<SkillRecord[]>([])
  const [editing, setEditing] = useState<SkillRecord | null>(null)
  const [form, setForm] = useState<SkillInput>(blank)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [invalidCount, setInvalidCount] = useState(0)

  async function load() {
    setLoading(true); setError('')
    try { const result=await listSkills(false); setItems(result.items); setInvalidCount(result.invalidCount) }
    catch { setError(t('cms_load_error')) } finally { setLoading(false) }
  }
  useEffect(()=>{void load()},[])

  function edit(item: SkillRecord) { setEditing(item); setForm({name:item.name,group:item.group,iconPath:item.iconPath,published:item.published,order:item.order});setError('');setSaved('') }
  function reset(){setEditing(null);setForm(blank);setError('');setSaved('')}

  async function submit(event: FormEvent) {
    event.preventDefault();setBusy(true);setError('');setSaved('')
    try { await saveSkill(form,editing?.id,editing?.updatedAt); setSaved(t('cms_saved'));reset();await load() }
    catch(cause){setError(getErrorMessage(cause,t('cms_save_error')))}finally{setBusy(false)}
  }
  async function remove(item: SkillRecord){
    if(!window.confirm(t('cms_confirm_delete')))return
    setBusy(true);setError('')
    try{await deleteSkill(item);if(editing?.id===item.id)reset();await load()}catch(cause){setError(getErrorMessage(cause,t('cms_delete_error')))}finally{setBusy(false)}
  }

  return <div className="grid gap-6">
    <Heading title={t('route_skills')} subtitle={t('cms_skills_subtitle')} />
    <SaveState message={saved} error={error}/>
    {invalidCount>0&&<p role="alert" className="text-body text-danger">{t('cms_invalid_items',{count:invalidCount})}</p>}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
      <Surface as="section" padding="lg"><div className="grid gap-4">
        {loading?<p className="text-body text-foreground-muted">{t('loading_label')}</p>:items.length===0?<p className="text-body text-foreground-muted">{t('cms_empty_skills')}</p>:items.map(item=><article key={item.id} className="grid gap-3 rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-h3 font-semibold text-foreground">{item.name}</h2><p className="text-body text-foreground-muted">{t(`skill_group_${item.group}` as Parameters<typeof t>[0])}</p></div><span className="text-caption text-foreground-subtle">{item.published?t('cms_published'):t('cms_draft')}</span></div>
          <div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>edit(item)}>{t('cms_edit')}</Button><Button size="sm" variant="ghost" onClick={()=>void remove(item)} disabled={busy}>{t('cms_delete')}</Button></div>
        </article>)}
      </div></Surface>
      <Surface as="section" padding="lg"><form className="grid gap-4" onSubmit={submit}>
        <h2 className="text-h3 font-semibold text-foreground">{editing?t('cms_edit'):t('cms_add_skill')}</h2>
        <Field label={t('cms_skill_name')} htmlFor="skill-name"><input id="skill-name" className={inputClass} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></Field>
        <Field label={t('cms_skill_group')} htmlFor="skill-group"><select id="skill-group" className={inputClass} value={form.group} onChange={e=>setForm({...form,group:e.target.value as SkillInput['group']})}>{SKILL_GROUPS.map(group=><option key={group} value={group}>{t(`skill_group_${group}` as Parameters<typeof t>[0])}</option>)}</select></Field>
        <Field label={t('cms_icon_path')} htmlFor="skill-icon"><input id="skill-icon" className={inputClass} value={form.iconPath??''} onChange={e=>setForm({...form,iconPath:e.target.value||null})}/></Field>
        <Field label={t('cms_order')} htmlFor="skill-order"><input id="skill-order" type="number" min="0" max="100000" className={inputClass} value={form.order} onChange={e=>setForm({...form,order:Number(e.target.value)})}/></Field>
        <label className="flex items-center gap-3 text-body text-foreground"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/>{t('cms_published')}</label>
        <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy?t('cms_saving'):t('cms_save')}</Button><Button type="button" variant="outline" onClick={reset} disabled={busy}>{t('cms_cancel')}</Button></div>
      </form></Surface>
    </div>
  </div>
}
