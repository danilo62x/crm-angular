import type { Activity, Company, Contact, Deal, Note, SalesRep } from './types'

const PEOPLE = ['1500648767791-00dcc994a43e', '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1438761681033-6461ffad8d80', '1633332755192-727a05c4013d', '1573496359142-b8d87734a5a2']
function imgHash(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function unsplash(id: string, w: number, h: number): string { return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=70&auto=format`; }
const av = (seed: number) => unsplash(PEOPLE[imgHash('person-' + seed) % PEOPLE.length], 96, 96)

export const COMPANIES: Company[] = [
  { id: 1, name: 'Acme Inc.', industry: 'Software', size: 'large', website: 'acme.com', city: 'São Paulo', createdAt: '2024-08-12' },
  { id: 2, name: 'Globex', industry: 'Manufatura', size: 'enterprise', website: 'globex.com', city: 'Campinas', createdAt: '2024-09-03' },
  { id: 3, name: 'Initech', industry: 'Fintech', size: 'medium', website: 'initech.io', city: 'Rio de Janeiro', createdAt: '2024-10-21' },
  { id: 4, name: 'Umbrella', industry: 'Saúde', size: 'enterprise', website: 'umbrella.co', city: 'Belo Horizonte', createdAt: '2024-11-05' },
  { id: 5, name: 'Hooli', industry: 'Software', size: 'large', website: 'hooli.com', city: 'Florianópolis', createdAt: '2025-01-14' },
  { id: 6, name: 'Pied Piper', industry: 'Software', size: 'small', website: 'piedpiper.com', city: 'Curitiba', createdAt: '2025-02-02' },
  { id: 7, name: 'Stark Industries', industry: 'Indústria', size: 'enterprise', website: 'stark.com', city: 'São Paulo', createdAt: '2025-02-18' },
  { id: 8, name: 'Wayne Enterprises', industry: 'Holding', size: 'enterprise', website: 'wayne.com', city: 'Porto Alegre', createdAt: '2025-03-09' },
  { id: 9, name: 'Soylent Corp', industry: 'Alimentos', size: 'medium', website: 'soylent.com', city: 'Recife', createdAt: '2025-03-27' },
  { id: 10, name: 'Vehement Capital', industry: 'Investimentos', size: 'small', website: 'vehement.fund', city: 'Brasília', createdAt: '2025-04-11' },
]

export const CONTACTS: Contact[] = [
  { id: 1, name: 'Mariana Alves', email: 'mariana.alves@acme.com', phone: '+55 11 98123-4501', companyId: 1, title: 'Diretora de Operações', tags: ['vip', 'hot'], owner: 'Ana Martins', status: 'customer', avatar: av(1), createdAt: '2025-01-10' },
  { id: 2, name: 'Rafael Teixeira', email: 'rafael@globex.com', phone: '+55 19 99876-2231', companyId: 2, title: 'Gerente de Compras', tags: ['enterprise'], owner: 'Bruno Lima', status: 'active', avatar: av(2), createdAt: '2025-01-22' },
  { id: 3, name: 'Juliana Costa', email: 'juliana.costa@initech.io', phone: '+55 21 98555-7788', companyId: 3, title: 'CFO', tags: ['hot', 'inbound'], owner: 'Carla Souza', status: 'lead', avatar: av(3), createdAt: '2025-02-03' },
  { id: 4, name: 'Felipe Moreira', email: 'felipe.moreira@umbrella.co', phone: '+55 31 97444-1020', companyId: 4, title: 'Head de TI', tags: ['enterprise', 'partner'], owner: 'Diego Rocha', status: 'customer', avatar: av(4), createdAt: '2025-02-15' },
  { id: 5, name: 'Beatriz Lima', email: 'beatriz@hooli.com', phone: '+55 48 98222-3344', companyId: 5, title: 'VP de Vendas', tags: ['vip'], owner: 'Ana Martins', status: 'active', avatar: av(5), createdAt: '2025-02-26' },
  { id: 6, name: 'Gustavo Pereira', email: 'gustavo@piedpiper.com', phone: '+55 41 99111-5566', companyId: 6, title: 'CEO', tags: ['trial', 'inbound'], owner: 'Bruno Lima', status: 'lead', avatar: av(6), createdAt: '2025-03-04' },
  { id: 7, name: 'Camila Rodrigues', email: 'camila@stark.com', phone: '+55 11 98777-8899', companyId: 7, title: 'Diretora de Marketing', tags: ['enterprise', 'referral'], owner: 'Carla Souza', status: 'customer', avatar: av(7), createdAt: '2025-03-12' },
  { id: 8, name: 'Lucas Fernandes', email: 'lucas@wayne.com', phone: '+55 51 99333-1122', companyId: 8, title: 'Gerente Financeiro', tags: ['newsletter'], owner: 'Diego Rocha', status: 'active', avatar: av(8), createdAt: '2025-03-20' },
  { id: 9, name: 'Patrícia Gomes', email: 'patricia@soylent.com', phone: '+55 81 98666-4455', companyId: 9, title: 'Compradora', tags: ['inbound'], owner: 'Ana Martins', status: 'lead', avatar: av(9), createdAt: '2025-04-01' },
  { id: 10, name: 'André Carvalho', email: 'andre@vehement.fund', phone: '+55 61 99888-7766', companyId: 10, title: 'Sócio', tags: ['vip', 'partner'], owner: 'Bruno Lima', status: 'customer', avatar: av(10), createdAt: '2025-04-08' },
  { id: 11, name: 'Renata Dias', email: 'renata.dias@acme.com', phone: '+55 11 98234-5610', companyId: 1, title: 'Analista de Projetos', tags: ['newsletter'], owner: 'Carla Souza', status: 'active', avatar: av(11), createdAt: '2025-04-14' },
  { id: 12, name: 'Thiago Barbosa', email: 'thiago@initech.io', phone: '+55 21 97123-9900', companyId: 3, title: 'CTO', tags: ['hot'], owner: 'Diego Rocha', status: 'lead', avatar: av(12), createdAt: '2025-04-19' },
  { id: 13, name: 'Fernanda Ribeiro', email: 'fernanda@globex.com', phone: '+55 19 98345-1188', companyId: 2, title: 'Diretora de RH', tags: ['enterprise'], owner: 'Ana Martins', status: 'inactive', avatar: av(13), createdAt: '2025-04-23' },
  { id: 14, name: 'Marcelo Nunes', email: 'marcelo@hooli.com', phone: '+55 48 99456-2277', companyId: 5, title: 'Product Manager', tags: ['referral'], owner: 'Bruno Lima', status: 'active', avatar: av(14), createdAt: '2025-04-28' },
  { id: 15, name: 'Larissa Cardoso', email: 'larissa@stark.com', phone: '+55 11 98567-3366', companyId: 7, title: 'Coordenadora Comercial', tags: ['vip', 'hot'], owner: 'Carla Souza', status: 'customer', avatar: av(15), createdAt: '2025-05-02' },
  { id: 16, name: 'Eduardo Santos', email: 'eduardo@wayne.com', phone: '+55 51 97678-4455', companyId: 8, title: 'Diretor de Inovação', tags: ['partner'], owner: 'Diego Rocha', status: 'lead', avatar: av(16), createdAt: '2025-05-07' },
]

export const DEALS: Deal[] = [
  { id: 1, title: 'Plano Enterprise — Acme', value: 84000, contactId: 1, companyId: 1, stage: 'negotiation', probability: 75, owner: 'Ana Martins', expectedClose: '2025-06-20', createdAt: '2025-04-02' },
  { id: 2, title: 'Licenças Globex (50)', value: 42000, contactId: 2, companyId: 2, stage: 'proposal', probability: 55, owner: 'Bruno Lima', expectedClose: '2025-06-15', createdAt: '2025-04-05' },
  { id: 3, title: 'Implantação Initech', value: 28500, contactId: 3, companyId: 3, stage: 'qualified', probability: 30, owner: 'Carla Souza', expectedClose: '2025-07-01', createdAt: '2025-04-10' },
  { id: 4, title: 'Suporte Premium Umbrella', value: 36000, contactId: 4, companyId: 4, stage: 'won', probability: 100, owner: 'Diego Rocha', expectedClose: '2025-05-10', createdAt: '2025-03-15' },
  { id: 5, title: 'Upgrade Hooli', value: 19800, contactId: 5, companyId: 5, stage: 'lead', probability: 10, owner: 'Ana Martins', expectedClose: '2025-07-12', createdAt: '2025-05-01' },
  { id: 6, title: 'Trial Pied Piper', value: 9600, contactId: 6, companyId: 6, stage: 'lead', probability: 10, owner: 'Bruno Lima', expectedClose: '2025-07-20', createdAt: '2025-05-03' },
  { id: 7, title: 'Contrato anual Stark', value: 120000, contactId: 7, companyId: 7, stage: 'negotiation', probability: 80, owner: 'Carla Souza', expectedClose: '2025-06-28', createdAt: '2025-04-18' },
  { id: 8, title: 'Renovação Wayne', value: 54000, contactId: 8, companyId: 8, stage: 'proposal', probability: 60, owner: 'Diego Rocha', expectedClose: '2025-06-30', createdAt: '2025-04-22' },
  { id: 9, title: 'Expansão Soylent', value: 22400, contactId: 9, companyId: 9, stage: 'qualified', probability: 35, owner: 'Ana Martins', expectedClose: '2025-07-08', createdAt: '2025-04-25' },
  { id: 10, title: 'Consultoria Vehement', value: 31000, contactId: 10, companyId: 10, stage: 'proposal', probability: 50, owner: 'Bruno Lima', expectedClose: '2025-06-22', createdAt: '2025-04-29' },
  { id: 11, title: 'Onboarding Initech', value: 14500, contactId: 12, companyId: 3, stage: 'lost', probability: 0, owner: 'Diego Rocha', expectedClose: '2025-05-05', createdAt: '2025-03-28' },
  { id: 12, title: 'Add-on Analytics Acme', value: 17600, contactId: 11, companyId: 1, stage: 'qualified', probability: 30, owner: 'Carla Souza', expectedClose: '2025-07-15', createdAt: '2025-05-04' },
  { id: 13, title: 'Pacote Hooli Pro', value: 26800, contactId: 14, companyId: 5, stage: 'won', probability: 100, owner: 'Bruno Lima', expectedClose: '2025-05-08', createdAt: '2025-03-30' },
  { id: 14, title: 'Stark — Módulo extra', value: 38000, contactId: 15, companyId: 7, stage: 'negotiation', probability: 70, owner: 'Carla Souza', expectedClose: '2025-06-25', createdAt: '2025-05-06' },
  { id: 15, title: 'Wayne — POC', value: 8200, contactId: 16, companyId: 8, stage: 'lead', probability: 15, owner: 'Diego Rocha', expectedClose: '2025-07-30', createdAt: '2025-05-09' },
]

// Activities reference the current week relative to "today" for realistic UI.
const today = new Date()
const day = (offset: number, h = 9, m = 0) => {
  const d = new Date(today)
  d.setDate(d.getDate() + offset)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

export const ACTIVITIES: Activity[] = [
  { id: 1, type: 'call', title: 'Ligar para Mariana sobre a proposta', status: 'open', date: day(0, 10, 30), contactId: 1, dealId: 1, owner: 'Ana Martins' },
  { id: 2, type: 'meeting', title: 'Reunião de alinhamento Stark', status: 'open', date: day(0, 14, 0), contactId: 7, dealId: 7, owner: 'Carla Souza' },
  { id: 3, type: 'email', title: 'Enviar contrato para Globex', status: 'open', date: day(0, 16, 0), contactId: 2, dealId: 2, owner: 'Bruno Lima' },
  { id: 4, type: 'task', title: 'Preparar deck de apresentação', status: 'open', date: day(1, 9, 0), contactId: null, dealId: 8, owner: 'Diego Rocha' },
  { id: 5, type: 'call', title: 'Follow-up Initech', status: 'open', date: day(1, 11, 0), contactId: 3, dealId: 3, owner: 'Carla Souza' },
  { id: 6, type: 'meeting', title: 'Demo do produto para Hooli', status: 'open', date: day(2, 15, 30), contactId: 5, dealId: 5, owner: 'Ana Martins' },
  { id: 7, type: 'email', title: 'Resposta de dúvidas Vehement', status: 'done', date: day(-1, 13, 0), contactId: 10, dealId: 10, owner: 'Bruno Lima' },
  { id: 8, type: 'task', title: 'Atualizar CRM com novos leads', status: 'done', date: day(-1, 17, 0), contactId: null, dealId: null, owner: 'Diego Rocha' },
  { id: 9, type: 'call', title: 'Negociação final Wayne', status: 'open', date: day(3, 10, 0), contactId: 8, dealId: 8, owner: 'Diego Rocha' },
  { id: 10, type: 'meeting', title: 'Kickoff Umbrella', status: 'done', date: day(-2, 9, 30), contactId: 4, dealId: 4, owner: 'Diego Rocha' },
  { id: 11, type: 'task', title: 'Enviar NPS para clientes ativos', status: 'open', date: day(2, 11, 0), contactId: null, dealId: null, owner: 'Ana Martins' },
  { id: 12, type: 'email', title: 'Proposta revisada Soylent', status: 'open', date: day(4, 14, 0), contactId: 9, dealId: 9, owner: 'Ana Martins' },
]

export const NOTES: Note[] = [
  { id: 1, body: 'Cliente pediu desconto de 10% para fechar ainda este mês. Avaliar com diretoria.', contactId: 1, dealId: 1, author: 'Ana Martins', createdAt: day(-1, 11, 0) },
  { id: 2, body: 'Decisor confirmou orçamento aprovado. Enviar contrato com prazo de 30 dias.', contactId: 7, dealId: 7, author: 'Carla Souza', createdAt: day(-2, 16, 0) },
  { id: 3, body: 'Primeiro contato veio por indicação. Demonstrou interesse no módulo de analytics.', contactId: 3, dealId: 3, author: 'Carla Souza', createdAt: day(-3, 10, 0) },
  { id: 4, body: 'Renovação garantida — cliente muito satisfeito com o suporte premium.', contactId: 4, dealId: 4, author: 'Diego Rocha', createdAt: day(-5, 9, 0) },
  { id: 5, body: 'Aguardando retorno do financeiro. Reforçar urgência na próxima ligação.', contactId: 8, dealId: 8, author: 'Diego Rocha', createdAt: day(-1, 15, 0) },
]

// ---- Dashboard / report metrics ----------------------------------------

export const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'] as const

/** Monthly won revenue (closed) and forecast (weighted pipeline). */
export const REVENUE_SERIES = {
  categories: [...MONTHS],
  closed: [62000, 71000, 58000, 84000, 96000, 73000],
  forecast: [48000, 53000, 61000, 72000, 88000, 102000],
}

/** Activities logged per weekday (current week). */
export const ACTIVITY_SERIES = {
  categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  calls: [8, 12, 9, 14, 11, 3, 1],
  emails: [14, 18, 16, 22, 19, 6, 2],
  meetings: [3, 5, 4, 6, 5, 1, 0],
}

export const SALES_RANKING: SalesRep[] = [
  { name: 'Carla Souza', avatar: av(101), revenue: 184000, deals: 9 },
  { name: 'Ana Martins', avatar: av(102), revenue: 156000, deals: 8 },
  { name: 'Diego Rocha', avatar: av(103), revenue: 132000, deals: 7 },
  { name: 'Bruno Lima', avatar: av(104), revenue: 98000, deals: 5 },
]

/** A few avatars for the header notifications / team. */
export const TEAM_AVATARS = [av(102), av(104), av(101), av(103)]
