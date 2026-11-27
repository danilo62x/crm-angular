import { Injectable, effect, signal } from '@angular/core';
import { ACTIVITIES, COMPANIES, CONTACTS, DEALS, NOTES } from '../../data/mock';
import type { Activity, Company, Contact, Deal, Note, StageId } from '../../data/types';
import { getStage } from '../../data/stages';

const PEOPLE = ['1500648767791-00dcc994a43e', '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1438761681033-6461ffad8d80', '1633332755192-727a05c4013d', '1573496359142-b8d87734a5a2'];
function imgHash(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function unsplash(id: string, w: number, h: number): string { return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=70&auto=format`; }
const av = (seed: number) => unsplash(PEOPLE[imgHash('person-' + seed) % PEOPLE.length], 96, 96);

const STORAGE_KEY = 'crm-data';

interface Persisted {
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  activities: Activity[];
  notes: Note[];
}

function load(): Persisted {
  const fallback: Persisted = {
    contacts: CONTACTS,
    companies: COMPANIES,
    deals: DEALS,
    activities: ACTIVITIES,
    notes: NOTES,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: Partial<Persisted> } & Partial<Persisted>;
      const s = parsed.state ?? parsed;
      return { ...fallback, ...s };
    }
  } catch {}
  return fallback;
}

let seq = 1000;
const nextId = () => ++seq;

@Injectable({ providedIn: 'root' })
export class CrmService {
  private initial = load();

  readonly contacts = signal<Contact[]>(this.initial.contacts);
  readonly companies = signal<Company[]>(this.initial.companies);
  readonly deals = signal<Deal[]>(this.initial.deals);
  readonly activities = signal<Activity[]>(this.initial.activities);
  readonly notes = signal<Note[]>(this.initial.notes);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            contacts: this.contacts(),
            companies: this.companies(),
            deals: this.deals(),
            activities: this.activities(),
            notes: this.notes(),
          })
        );
      } catch {}
    });
  }

  // ---- Contacts ----------------------------------------------------------
  addContact(c: Omit<Contact, 'id' | 'avatar' | 'createdAt'>): Contact {
    const id = nextId();
    const contact: Contact = { ...c, id, avatar: av(id), createdAt: new Date().toISOString().slice(0, 10) };
    this.contacts.update((arr) => [contact, ...arr]);
    return contact;
  }
  updateContact(id: number, patch: Partial<Contact>) {
    this.contacts.update((arr) => arr.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  removeContact(id: number) {
    this.contacts.update((arr) => arr.filter((c) => c.id !== id));
  }

  // ---- Companies ---------------------------------------------------------
  addCompany(c: Omit<Company, 'id' | 'createdAt'>): Company {
    const id = nextId();
    const company: Company = { ...c, id, createdAt: new Date().toISOString().slice(0, 10) };
    this.companies.update((arr) => [company, ...arr]);
    return company;
  }
  updateCompany(id: number, patch: Partial<Company>) {
    this.companies.update((arr) => arr.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  removeCompany(id: number) {
    this.companies.update((arr) => arr.filter((c) => c.id !== id));
  }

  // ---- Deals -------------------------------------------------------------
  addDeal(d: Omit<Deal, 'id' | 'createdAt'>): Deal {
    const id = nextId();
    const deal: Deal = { ...d, id, createdAt: new Date().toISOString().slice(0, 10) };
    this.deals.update((arr) => [deal, ...arr]);
    return deal;
  }
  updateDeal(id: number, patch: Partial<Deal>) {
    this.deals.update((arr) => arr.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }
  removeDeal(id: number) {
    this.deals.update((arr) => arr.filter((d) => d.id !== id));
  }
  /** Kanban: move a deal to a new stage, syncing the suggested probability. */
  moveDealStage(id: number, stage: StageId) {
    this.deals.update((arr) =>
      arr.map((d) => (d.id === id ? { ...d, stage, probability: getStage(stage).probability } : d))
    );
  }

  // ---- Activities / tasks ------------------------------------------------
  addActivity(a: Omit<Activity, 'id'>): Activity {
    const id = nextId();
    const activity: Activity = { ...a, id };
    this.activities.update((arr) => [activity, ...arr]);
    return activity;
  }
  updateActivity(id: number, patch: Partial<Activity>) {
    this.activities.update((arr) => arr.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  toggleActivity(id: number) {
    this.activities.update((arr) =>
      arr.map((a) => (a.id === id ? { ...a, status: a.status === 'done' ? 'open' : 'done' } : a))
    );
  }
  removeActivity(id: number) {
    this.activities.update((arr) => arr.filter((a) => a.id !== id));
  }

  // ---- Notes -------------------------------------------------------------
  addNote(n: Omit<Note, 'id' | 'createdAt'>): Note {
    const id = nextId();
    const note: Note = { ...n, id, createdAt: new Date().toISOString() };
    this.notes.update((arr) => [note, ...arr]);
    return note;
  }

  reset() {
    this.contacts.set(CONTACTS);
    this.companies.set(COMPANIES);
    this.deals.set(DEALS);
    this.activities.set(ACTIVITIES);
    this.notes.set(NOTES);
  }
}
