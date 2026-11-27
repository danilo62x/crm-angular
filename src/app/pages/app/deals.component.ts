import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CrmService } from '../../core/services/crm.service';
import { UiService } from '../../core/services/ui.service';
import { filterDeals, companyName, contactName } from '../../data/query';
import { STAGES, OWNERS, getStage } from '../../data/stages';
import { formatCurrency, formatDate } from '../../lib/format';
import type { Deal, StageId } from '../../data/types';
import { PageHeaderComponent } from '../../components/app/page-header.component';
import { DataTableComponent, DataColumn } from '../../components/ui/data-table.component';
import { ModalComponent } from '../../components/ui/modal.component';
import { StagePillComponent } from '../../components/crm/stage-pill.component';
import { IconComponent } from '../../components/ui/icon-base.component';
import { usePageTitle } from '../../core/page-title';

@Component({
  selector: 'app-deals-page',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoModule,
    PageHeaderComponent,
    DataTableComponent,
    ModalComponent,
    StagePillComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      <app-page-header [title]="t('deals.title')" [subtitle]="t('deals.subtitle')" />

      <div class="mb-4 flex flex-wrap gap-3">
        <select [(ngModel)]="stageFilter" (ngModelChange)="stageFilterS.set($event)" [class]="selectCls">
          <option value="">{{ t('deals.filters.allStages') }}</option>
          @for (s of stages; track s.id) {
            <option [value]="s.id">{{ t('stages.' + s.nameKey) }}</option>
          }
        </select>
        <select [(ngModel)]="ownerFilter" (ngModelChange)="ownerFilterS.set($event)" [class]="selectCls">
          <option value="">{{ t('deals.filters.allOwners') }}</option>
          @for (o of owners; track o) {
            <option [value]="o">{{ o }}</option>
          }
        </select>
      </div>

      <app-data-table [columns]="columns()" [data]="rows()" [pageSize]="10" />

      <app-modal [open]="!!selected()" (closed)="selected.set(null)" [title]="selected()?.title" size="md">
        @if (selected(); as d) {
          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-4 text-sm">
              @for (f of detailFields(d); track f.label) {
                <div class="rounded-lg border border-themed p-3">
                  <p class="text-xs text-muted">{{ f.label }}</p>
                  <p class="mt-0.5 font-medium text-heading">{{ f.value }}</p>
                </div>
              }
            </div>
            <div>
              <p class="mb-2 text-sm font-medium text-heading">{{ t('deals.moveStage') }}</p>
              <div class="flex flex-wrap gap-2">
                @for (s of stages; track s.id) {
                  <button
                    type="button"
                    (click)="moveStage(d, s.id)"
                    [class]="
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition ' +
                      (d.stage === s.id ? 'border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-500/15' : 'border-themed text-muted hover:border-brand-300')
                    "
                  >
                    {{ t('stages.' + s.nameKey) }}
                  </button>
                }
              </div>
            </div>
            <div class="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-xs text-muted dark:bg-gray-900/40">
              <app-icon name="info" [size]="14" /> {{ t('deals.detailHint') }}
            </div>
          </div>
        }
      </app-modal>

      <ng-template #titleCell let-d>
        <button type="button" (click)="selected.set(d)" class="text-left font-medium text-heading hover:text-brand-600">{{ d.title }}</button>
      </ng-template>
      <ng-template #companyCell let-d>{{ companyLabel(d.companyId) }}</ng-template>
      <ng-template #stageCell let-d><app-stage-pill [stage]="d.stage" size="sm" /></ng-template>
      <ng-template #valueCell let-d><span class="font-semibold text-heading">{{ cur(d.value) }}</span></ng-template>
      <ng-template #probCell let-d>{{ d.probability }}%</ng-template>
    </ng-container>
  `,
})
export class DealsPageComponent {
  crm = inject(CrmService);
  private ui = inject(UiService);
  private transloco = inject(TranslocoService);
  private lang = signal(this.transloco.getActiveLang());

  readonly stages = STAGES;
  readonly owners = OWNERS;
  readonly selectCls = 'h-10 rounded-lg border border-themed surface-card px-3 text-sm text-body focus-ring';

  stageFilter = '';
  ownerFilter = '';
  readonly stageFilterS = signal('');
  readonly ownerFilterS = signal('');
  readonly selected = signal<Deal | null>(null);

  @ViewChild('titleCell', { static: true }) titleCell!: TemplateRef<{ $implicit: Deal }>;
  @ViewChild('companyCell', { static: true }) companyCell!: TemplateRef<{ $implicit: Deal }>;
  @ViewChild('stageCell', { static: true }) stageCell!: TemplateRef<{ $implicit: Deal }>;
  @ViewChild('valueCell', { static: true }) valueCell!: TemplateRef<{ $implicit: Deal }>;
  @ViewChild('probCell', { static: true }) probCell!: TemplateRef<{ $implicit: Deal }>;

  readonly rows = computed(() =>
    filterDeals(this.crm.deals(), { stage: this.stageFilterS(), owner: this.ownerFilterS() })
  );

  readonly columns = computed<DataColumn<Deal>[]>(() => {
    this.transloco.getActiveLang();
    const t = (k: string) => this.transloco.translate(k);
    return [
      { key: 'title', header: t('deals.columns.title'), cell: this.titleCell },
      { key: 'company', header: t('deals.columns.company'), sortable: false, accessor: () => '', cell: this.companyCell },
      { key: 'stage', header: t('deals.columns.stage'), cell: this.stageCell },
      { key: 'owner', header: t('deals.columns.owner') },
      { key: 'value', header: t('deals.columns.value'), cell: this.valueCell },
      { key: 'probability', header: t('deals.columns.probability'), cell: this.probCell },
    ];
  });

  constructor() {
    usePageTitle('deals.title');
    this.transloco.langChanges$.subscribe((l) => this.lang.set(l));
  }

  cur(v: number) {
    return formatCurrency(v, this.lang());
  }
  companyLabel(id: number | null) {
    return companyName(this.crm.companies(), id);
  }
  detailFields(d: Deal) {
    const t = (k: string) => this.transloco.translate(k);
    return [
      { label: t('deals.columns.value'), value: this.cur(d.value) },
      { label: t('deals.columns.probability'), value: `${d.probability}%` },
      { label: t('deals.columns.contact'), value: contactName(this.crm.contacts(), d.contactId) },
      { label: t('deals.columns.company'), value: companyName(this.crm.companies(), d.companyId) },
      { label: t('deals.columns.owner'), value: d.owner },
      { label: t('deals.expectedClose'), value: formatDate(d.expectedClose, this.lang()) },
    ];
  }
  moveStage(d: Deal, stage: StageId) {
    this.crm.moveDealStage(d.id, stage);
    this.selected.set({ ...d, stage, probability: getStage(stage).probability });
    this.ui.notifySuccess(this.transloco.translate('deals.stageChanged', { stage: this.transloco.translate(`stages.${getStage(stage).nameKey}`) }));
  }
}
