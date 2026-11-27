import type { Stage, StageId } from './types'

/** Pipeline stages, in order. Won/Lost are terminal. */
export const STAGES: Stage[] = [
  { id: 'lead', nameKey: 'lead', color: '#465fff', probability: 10 },
  { id: 'qualified', nameKey: 'qualified', color: '#0ba5ec', probability: 30 },
  { id: 'proposal', nameKey: 'proposal', color: '#f79009', probability: 55 },
  { id: 'negotiation', nameKey: 'negotiation', color: '#7592ff', probability: 75 },
  { id: 'won', nameKey: 'won', color: '#12b76a', probability: 100 },
  { id: 'lost', nameKey: 'lost', color: '#f04438', probability: 0 },
]

/** Stages shown as Kanban columns (terminal stages stay visible to drop into). */
export const PIPELINE_STAGES: Stage[] = STAGES

export function getStage(id: StageId): Stage {
  return STAGES.find((s) => s.id === id) ?? STAGES[0]
}

export const OWNERS = ['Ana Martins', 'Bruno Lima', 'Carla Souza', 'Diego Rocha'] as const
export type Owner = (typeof OWNERS)[number]

/** Tag palette used by contact tag pills. */
export const TAG_COLORS: Record<string, string> = {
  vip: 'brand',
  hot: 'error',
  newsletter: 'gray',
  partner: 'success',
  enterprise: 'warning',
  trial: 'gray',
  referral: 'success',
  inbound: 'brand',
}
