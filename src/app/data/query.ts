import type { Activity, Company, Contact, Deal, StageId } from './types'
import { STAGES } from './stages'

// ---- Contacts -----------------------------------------------------------

export interface ContactFilters {
  query?: string
  status?: string
  tag?: string
  owner?: string
}

export function searchContacts(list: Contact[], query: string): Contact[] {
  const q = query.trim().toLowerCase()
  if (!q) return list
  return list.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
  )
}

export function filterContacts(list: Contact[], f: ContactFilters): Contact[] {
  let out = list
  if (f.query) out = searchContacts(out, f.query)
  if (f.status) out = out.filter((c) => c.status === f.status)
  if (f.tag) out = out.filter((c) => c.tags.includes(f.tag!))
  if (f.owner) out = out.filter((c) => c.owner === f.owner)
  return out
}

// ---- Deals --------------------------------------------------------------

export interface DealFilters {
  query?: string
  stage?: string
  owner?: string
}

export function filterDeals(list: Deal[], f: DealFilters): Deal[] {
  let out = list
  if (f.query) {
    const q = f.query.trim().toLowerCase()
    out = out.filter((d) => d.title.toLowerCase().includes(q))
  }
  if (f.stage) out = out.filter((d) => d.stage === f.stage)
  if (f.owner) out = out.filter((d) => d.owner === f.owner)
  return out
}

/** Deals grouped by stage id, preserving stage order. */
export function dealsByStage(list: Deal[]): Record<StageId, Deal[]> {
  const out = {} as Record<StageId, Deal[]>
  for (const s of STAGES) out[s.id] = []
  for (const d of list) (out[d.stage] ??= []).push(d)
  return out
}

export function stageTotal(list: Deal[], stage: StageId): number {
  return list.filter((d) => d.stage === stage).reduce((sum, d) => sum + d.value, 0)
}

// ---- Derived dashboard metrics -----------------------------------------

const OPEN_STAGES: StageId[] = ['lead', 'qualified', 'proposal', 'negotiation']

export interface CrmMetrics {
  pipelineValue: number
  weightedValue: number
  openDeals: number
  wonValue: number
  conversionRate: number
}

export function computeMetrics(deals: Deal[], activities: Activity[]): CrmMetrics {
  const open = deals.filter((d) => OPEN_STAGES.includes(d.stage))
  const won = deals.filter((d) => d.stage === 'won')
  const lost = deals.filter((d) => d.stage === 'lost')
  const closed = won.length + lost.length
  return {
    pipelineValue: open.reduce((s, d) => s + d.value, 0),
    weightedValue: Math.round(open.reduce((s, d) => s + d.value * (d.probability / 100), 0)),
    openDeals: open.length,
    wonValue: won.reduce((s, d) => s + d.value, 0),
    conversionRate: closed === 0 ? 0 : Math.round((won.length / closed) * 100),
  }
}

export function pendingTasks(activities: Activity[]): number {
  return activities.filter((a) => a.status === 'open').length
}

/** Stage funnel counts for the dashboard / reports (open + won only). */
export function funnelByStage(deals: Deal[]) {
  return STAGES.filter((s) => s.id !== 'lost').map((s) => ({
    stage: s,
    count: deals.filter((d) => d.stage === s.id).length,
    value: deals.filter((d) => d.stage === s.id).reduce((sum, d) => sum + d.value, 0),
  }))
}

export function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

export function companyName(companies: Company[], id: number | null): string {
  if (id == null) return '—'
  return companies.find((c) => c.id === id)?.name ?? '—'
}

export function contactName(contacts: Contact[], id: number | null): string {
  if (id == null) return '—'
  return contacts.find((c) => c.id === id)?.name ?? '—'
}
