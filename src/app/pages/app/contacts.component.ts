import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CrmService } from '../../core/services/crm.service';
import { UiService } from '../../core/services/ui.service';
import { filterContacts } from '../../data/query';
import { OWNERS } from '../../data/stages';
import type { Contact, ContactStatus } from '../../data/types';
import { PageHeaderComponent } from '../../components/app/page-header.component';
import { DataTableComponent, DataColumn } from '../../components/ui/data-table.component';
import { AvatarComponent } from '../../components/ui/avatar.component';
import { BadgeComponent } from '../../components/ui/badge.component';
import { TagPillComponent } from '../../components/crm/tag-pill.component';
import { ContactModalComponent } from '../../components/crm/contact-modal.component';
import { IconComponent } from '../../components/ui/icon-base.component';
import { usePageTitle } from '../../core/page-title';

const STATUS_COLOR: Record<ContactStatus, 'brand' | 'success' | 'warning' | 'gray'> = {
  lead: 'warning',
  active: 'brand',
  customer: 'success',
  inactive: 'gray',
};

@Component({
  selector: 'app-contacts-page',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoModule,
    PageHeaderComponent,
    DataTableComponent,
    AvatarComponent,
    BadgeComponent,
    TagPillComponent,
    ContactModalComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      <app-page-header [title]="t('contacts.title')" [subtitle]="t('contacts.subtitle')" [hasAction]="true">
        <button
          type="button"
          (click)="openNew()"
          class="flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <app-icon name="plus" [size]="16" /> {{ t('contacts.new') }}
        </button>
      </app-page-header>

      <div class="mb-4 flex flex-wrap gap-3">
        <select [(ngModel)]="statusFilter" (ngModelChange)="statusFilterS.set($event)" [class]="selectCls">
          <option value="">{{ t('contacts.filters.allStatuses') }}</option>
          @for (s of allStatuses; track s) {
            <option [value]="s">{{ t('contacts.statuses.' + s) }}</option>
          }
        </select>
        <select [(ngModel)]="ownerFilter" (ngModelChange)="ownerFilterS.set($event)" [class]="selectCls">
          <option value="">{{ t('contacts.filters.allOwners') }}</option>
          @for (o of owners; track o) {
            <option [value]="o">{{ o }}</option>
          }
        </select>
        <select [(ngModel)]="tagFilter" (ngModelChange)="tagFilterS.set($event)" [class]="selectCls">
          <option value="">{{ t('contacts.filters.allTags') }}</option>
          @for (tag of allTags(); track tag) {
            <option [value]="tag">{{ tag }}</option>
          }
        </select>
      </div>

      <app-data-table [columns]="columns()" [data]="rows()" [pageSize]="8" />

      <app-contact-modal [open]="modalOpen()" [contact]="editing()" (close)="modalOpen.set(false)" />

      <ng-template #nameCell let-c>
        <button type="button" (click)="router.navigate(['/app/contatos', c.id])" class="flex items-center gap-3 text-left">
          <app-avatar [src]="c.avatar" [name]="c.name" size="sm" />
          <div>
            <p class="font-medium text-heading hover:text-brand-600">{{ c.name }}</p>
            <p class="text-xs text-muted">{{ c.email }}</p>
          </div>
        </button>
      </ng-template>
      <ng-template #titleCell let-c><span class="text-muted">{{ c.title }}</span></ng-template>
      <ng-template #companyCell let-c>{{ companyName(c.companyId) }}</ng-template>
      <ng-template #tagsCell let-c>
        <div class="flex flex-wrap gap-1">
          @for (tag of c.tags.slice(0, 2); track tag) {
            <app-tag-pill [tag]="tag" />
          }
        </div>
      </ng-template>
      <ng-template #statusCell let-c>
        <app-badge [color]="statusColor(c.status)">{{ t('contacts.statuses.' + c.status) }}</app-badge>
      </ng-template>
      <ng-template #actionsCell let-c>
        <div class="flex justify-end gap-1">
          <button type="button" (click)="openEdit(c)" class="rounded-md p-1.5 text-muted hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800" [attr.aria-label]="t('common.edit')">
            <app-icon name="edit" [size]="16" />
          </button>
          <button type="button" (click)="remove(c)" class="rounded-md p-1.5 text-muted hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10" [attr.aria-label]="t('common.delete')">
            <app-icon name="trash" [size]="16" />
          </button>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class ContactsPageComponent {
  crm = inject(CrmService);
  private ui = inject(UiService);
  private transloco = inject(TranslocoService);
  router = inject(Router);

  readonly owners = OWNERS;
  readonly allStatuses: ContactStatus[] = ['lead', 'active', 'customer', 'inactive'];
  readonly selectCls = 'h-10 rounded-lg border border-themed surface-card px-3 text-sm text-body focus-ring';

  statusFilter = '';
  ownerFilter = '';
  tagFilter = '';
  readonly statusFilterS = signal('');
  readonly ownerFilterS = signal('');
  readonly tagFilterS = signal('');

  readonly modalOpen = signal(false);
  readonly editing = signal<Contact | null>(null);

  @ViewChild('nameCell', { static: true }) nameCell!: TemplateRef<{ $implicit: Contact }>;
  @ViewChild('titleCell', { static: true }) titleCell!: TemplateRef<{ $implicit: Contact }>;
  @ViewChild('companyCell', { static: true }) companyCell!: TemplateRef<{ $implicit: Contact }>;
  @ViewChild('tagsCell', { static: true }) tagsCell!: TemplateRef<{ $implicit: Contact }>;
  @ViewChild('statusCell', { static: true }) statusCell!: TemplateRef<{ $implicit: Contact }>;
  @ViewChild('actionsCell', { static: true }) actionsCell!: TemplateRef<{ $implicit: Contact }>;

  readonly allTags = computed(() => Array.from(new Set(this.crm.contacts().flatMap((c) => c.tags))).sort());

  readonly rows = computed(() =>
    filterContacts(this.crm.contacts(), { status: this.statusFilterS(), owner: this.ownerFilterS(), tag: this.tagFilterS() })
  );

  readonly columns = computed<DataColumn<Contact>[]>(() => {
    this.transloco.getActiveLang();
    const t = (k: string) => this.transloco.translate(k);
    return [
      { key: 'name', header: t('contacts.columns.name'), cell: this.nameCell },
      { key: 'title', header: t('contacts.columns.title'), cell: this.titleCell },
      { key: 'companyId', header: t('contacts.columns.company'), cell: this.companyCell },
      { key: 'tags', header: t('contacts.columns.tags'), sortable: false, accessor: () => '', cell: this.tagsCell },
      { key: 'status', header: t('contacts.columns.status'), cell: this.statusCell },
      { key: 'actions', header: '', sortable: false, align: 'right', accessor: () => '', cell: this.actionsCell },
    ];
  });

  constructor() {
    usePageTitle('contacts.title');
  }

  companyName(id: number | null) {
    return this.crm.companies().find((co) => co.id === id)?.name ?? '—';
  }
  statusColor(s: ContactStatus) {
    return STATUS_COLOR[s];
  }
  openNew() {
    this.editing.set(null);
    this.modalOpen.set(true);
  }
  openEdit(c: Contact) {
    this.editing.set(c);
    this.modalOpen.set(true);
  }
  remove(c: Contact) {
    this.crm.removeContact(c.id);
    this.ui.notifySuccess(this.transloco.translate('contacts.removed'));
  }
}
