import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CrmService } from '../../core/services/crm.service';
import { UiService } from '../../core/services/ui.service';
import { formatCurrency } from '../../lib/format';
import type { Company, CompanySize } from '../../data/types';
import { PageHeaderComponent } from '../../components/app/page-header.component';
import { DataTableComponent, DataColumn } from '../../components/ui/data-table.component';
import { BadgeComponent } from '../../components/ui/badge.component';
import { ModalComponent } from '../../components/ui/modal.component';
import { FormFieldComponent } from '../../components/ui/form-field.component';
import { IconComponent } from '../../components/ui/icon-base.component';
import { usePageTitle } from '../../core/page-title';

const SIZES: CompanySize[] = ['small', 'medium', 'large', 'enterprise'];

@Component({
  selector: 'app-companies-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    PageHeaderComponent,
    DataTableComponent,
    BadgeComponent,
    ModalComponent,
    FormFieldComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      <app-page-header [title]="t('companies.title')" [subtitle]="t('companies.subtitle')" [hasAction]="true">
        <button type="button" (click)="modalOpen.set(true)" class="flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600">
          <app-icon name="plus" [size]="16" /> {{ t('companies.new') }}
        </button>
      </app-page-header>

      <app-data-table [columns]="columns()" [data]="crm.companies()" [pageSize]="8" />

      <app-modal [open]="modalOpen()" (closed)="modalOpen.set(false)" [title]="t('companies.newTitle')" size="md">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <app-form-field [control]="fc('name')" name="name" [label]="t('companies.columns.name')" placeholder="Acme Inc." [errorText]="t('companies.errors.name')" />
          <div class="grid grid-cols-2 gap-4">
            <app-form-field [control]="fc('industry')" name="industry" [label]="t('companies.columns.industry')" placeholder="Software" />
            <app-form-field [control]="fc('size')" name="size" [label]="t('companies.columns.size')" control-type="select">
              @for (s of sizes; track s) {
                <option [value]="s">{{ t('companies.sizes.' + s) }}</option>
              }
            </app-form-field>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <app-form-field [control]="fc('website')" name="website" [label]="t('companies.columns.website')" placeholder="acme.com" />
            <app-form-field [control]="fc('city')" name="city" [label]="t('companies.columns.city')" placeholder="São Paulo" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="modalOpen.set(false)" class="rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body hover:bg-gray-50 dark:hover:bg-gray-800">{{ t('common.cancel') }}</button>
            <button type="submit" class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">{{ t('common.save') }}</button>
          </div>
        </form>
      </app-modal>

      <ng-template #nameCell let-c>
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 font-bold text-brand-500 dark:bg-brand-500/15">{{ c.name.charAt(0) }}</span>
          <div>
            <p class="font-medium text-heading">{{ c.name }}</p>
            <p class="text-xs text-muted">{{ c.website }}</p>
          </div>
        </div>
      </ng-template>
      <ng-template #sizeCell let-c><app-badge color="gray">{{ t('companies.sizes.' + c.size) }}</app-badge></ng-template>
      <ng-template #contactsCell let-c>{{ contactCount(c.id) }}</ng-template>
      <ng-template #valueCell let-c><span class="font-semibold text-heading">{{ cur(dealTotal(c.id)) }}</span></ng-template>
      <ng-template #actionsCell let-c>
        <div class="flex justify-end">
          <button type="button" (click)="remove(c)" class="rounded-md p-1.5 text-muted hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10" [attr.aria-label]="t('common.delete')">
            <app-icon name="trash" [size]="16" />
          </button>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class CompaniesPageComponent {
  crm = inject(CrmService);
  private ui = inject(UiService);
  private transloco = inject(TranslocoService);
  private fb = inject(FormBuilder);
  private lang = signal(this.transloco.getActiveLang());

  readonly sizes = SIZES;
  readonly modalOpen = signal(false);

  @ViewChild('nameCell', { static: true }) nameCell!: TemplateRef<{ $implicit: Company }>;
  @ViewChild('sizeCell', { static: true }) sizeCell!: TemplateRef<{ $implicit: Company }>;
  @ViewChild('contactsCell', { static: true }) contactsCell!: TemplateRef<{ $implicit: Company }>;
  @ViewChild('valueCell', { static: true }) valueCell!: TemplateRef<{ $implicit: Company }>;
  @ViewChild('actionsCell', { static: true }) actionsCell!: TemplateRef<{ $implicit: Company }>;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    industry: [''],
    size: ['medium'],
    website: [''],
    city: [''],
  });

  readonly columns = computed<DataColumn<Company>[]>(() => {
    this.transloco.getActiveLang();
    const t = (k: string) => this.transloco.translate(k);
    return [
      { key: 'name', header: t('companies.columns.name'), cell: this.nameCell },
      { key: 'industry', header: t('companies.columns.industry') },
      { key: 'size', header: t('companies.columns.size'), cell: this.sizeCell },
      { key: 'contacts', header: t('companies.columns.contacts'), sortable: false, accessor: () => '', cell: this.contactsCell },
      { key: 'value', header: t('companies.columns.value'), sortable: false, accessor: () => '', cell: this.valueCell },
      { key: 'actions', header: '', sortable: false, align: 'right', accessor: () => '', cell: this.actionsCell },
    ];
  });

  constructor() {
    usePageTitle('companies.title');
    this.transloco.langChanges$.subscribe((l) => this.lang.set(l));
  }

  fc(name: string) {
    return this.form.get(name) as any;
  }
  cur(v: number) {
    return formatCurrency(v, this.lang());
  }
  contactCount(id: number) {
    return this.crm.contacts().filter((c) => c.companyId === id).length;
  }
  dealTotal(id: number) {
    return this.crm.deals().filter((d) => d.companyId === id).reduce((s, d) => s + d.value, 0);
  }
  remove(c: Company) {
    this.crm.removeCompany(c.id);
    this.ui.notifySuccess(this.transloco.translate('companies.removed'));
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.crm.addCompany(this.form.value as Omit<Company, 'id' | 'createdAt'>);
    this.ui.notifySuccess(this.transloco.translate('companies.created'));
    this.form.reset({ name: '', industry: '', size: 'medium', website: '', city: '' });
    this.modalOpen.set(false);
  }
}
