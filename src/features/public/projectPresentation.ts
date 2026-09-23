import { getDownloadURL, getStorage, ref } from 'firebase/storage'
import type { Locale } from '../../data/enums.ts'
import type { LocalizedText, Project } from '../../data/types.ts'
import { getFirebaseApp } from '../../firebase/app.ts'

const storage = getStorage(getFirebaseApp())

export function localizeProjectText(value: LocalizedText, locale: Locale): string {
  return locale === 'ar' && value.ar ? value.ar : value.en
}

export function getProjectDisplayName(project: Project, locale: Locale): string {
  return localizeProjectText(project.title, locale)
}

export async function getPublicMediaUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path))
}

export function getProjectSeoTitle(project: Project, locale: Locale): string {
  return project.seo.title
    ? localizeProjectText(project.seo.title, locale)
    : getProjectDisplayName(project, locale)
}

export function getProjectSeoDescription(project: Project, locale: Locale): string {
  return project.seo.description
    ? localizeProjectText(project.seo.description, locale)
    : localizeProjectText(project.summary, locale)
}
