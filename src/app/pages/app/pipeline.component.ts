import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CrmService } from '../../core/services/crm.service';
import { UiService } from '../../core/services/ui.service';
import { PIPELINE_STAGES, getStage, OWNERS } from '../../data/stages';
import { dealsByStage } from '../../data/query';
import { formatCurrency } from '../../lib/format';
import type { StageId } from '../../data/types';
import { PageHeaderComponent } from '../../components/app/page-header.component';
import { DealCardComponent } from '../../components/crm/deal-card.component';
import { ModalComponent } from '../../components/ui/modal.component';
import { FormFieldComponent } from '../../components/ui/form-field.component';
import { IconComponent } from '../../components/ui/icon-base.component';
import { usePageTitle } from '../../core/page-title';

@Component({
  selector: 'app-pipeline-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    PageHeaderComponent,
    DealCardComponent,
    ModalComponent,
    FormFieldComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      <app-page-header [title]="t('pipeline.title')" [subtitle]="t('pipeline.subtitle')" [hasAction]="true">
        <button
          type="button"
          (click)="modalOpen.set(true)"
          class="flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <app-icon name="plus" [size]="16" /> {{ t('deals.new') }}
        </button>
      </app-page-header>

      <div class="flex gap-4 overflow-x-auto pb-4">
        @for (stage of stages; track stage.id) {
          <div
            (dragover)="onDragOver($event, stage.id)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop(stage.id)"
            [class]="
              'flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition ' +
              (overStage() === stage.id ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-500/10' : 'border-themed surface-card')
            "
          >
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full" [style.backgroundColor]="stage.color"></span>
                <span class="text-sm font-semibold text-heading">{{ t('stages.' + stage.nameKey) }}</span>
                <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted dark:bg-gray-800">{{ listFor(stage.id).length }}</span>
              </div>
            </div>
            <p class="mb-3 text-xs font-medium text-muted">{{ cur(totalFor(stage.id)) }}</p>

            <div class="flex flex-1 flex-col gap-2.5 overflow-y-auto no-scrollbar" style="min-height: 80px">
              @for (deal of listFor(stage.id); track deal.id) {
                <app-deal-card
                  [deal]="deal"
                  [dragging]="dragId() === deal.id"
                  (dragStart)="dragId.set(deal.id)"
                  (dragEnd)="endDrag()"
                  (cardClick)="router.navigate(['/app/negocios'])"
                />
              }
              @if (listFor(stage.id).length === 0) {
                <div class="flex flex-1 items-center justify-center rounded-xl border border-dashed border-themed py-6 text-xs text-muted">
                  {{ t('pipeline.dropHere') }}
                </div>
              }
            </div>
          </div>
        }
      </div>

      <app-modal [open]="modalOpen()" (closed)="modalOpen.set(false)" [title]="t('deals.newModalTitle')" size="md">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <app-form-field [control]="fc('title')" name="title" [label]="t('deals.columns.title')" [placeholder]="t('deals.titlePlaceholder')" [errorText]="t('deals.errors.title')" />
          <div class="grid grid-cols-2 gap-4">
            <app-form-field [control]="fc('value')" name="value" [label]="t('deals.columns.value')" type="number" [min]="0" [errorText]="t('deals.errors.value')" />
            <app-form-field [control]="fc('stage')" name="stage" [label]="t('deals.columns.stage')" control-type="select">
              @for (s of stages; track s.id) {
                <option [value]="s.id">{{ t('stages.' + s.nameKey) }}</option>
              }
            </app-form-field>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <app-form-field [control]="fc('contactId')" name="contactId" [label]="t('deals.columns.contact')" control-type="select">
              <option value="">—</option>
              @for (c of crm.contacts(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </app-form-field>
            <app-form-field [control]="fc('companyId')" name="companyId" [label]="t('deals.columns.company')" control-type="select">
              <option value="">—</option>
              @for (c of crm.companies(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </app-form-field>
          </div>
          <app-form-field [control]="fc('owner')" name="owner" [label]="t('deals.columns.owner')" control-type="select">
            @for (o of owners; track o) {
              <option [value]="o">{{ o }}</option>
            }
          </app-form-field>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="modalOpen.set(false)" class="rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body hover:bg-gray-50 dark:hover:bg-gray-800">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              {{ t('deals.create') }}
            </button>
          </div>
        </form>
      </app-modal>
    </ng-container>
  `,
})
export class PipelinePageComponent {
  crm = inject(CrmService);
  private ui = inject(UiService);
  private transloco = inject(TranslocoService);
  router = inject(Router);
  private fb = inject(FormBuilder);
  private lang = signal(this.transloco.getActiveLang());

  readonly stages = PIPELINE_STAGES;
  readonly owners = OWNERS;

  readonly dragId = signal<number | null>(null);
  readonly overStage = signal<StageId | null>(null);
  readonly modalOpen = signal(false);

  private grouped = computed(() => dealsByStage(this.crm.deals()));

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    value: [0, [Validators.required, Validators.min(0)]],
    stage: ['lead'],
    contactId: [''],
    companyId: [''],
    owner: [OWNERS[0]],
  });

  constructor() {
    usePageTitle('pipeline.title');
    this.transloco.langChanges$.subscribe((l) => this.lang.set(l));
  }

  fc(name: string) {
    return this.form.get(name) as any;
  }
  listFor(stage: StageId) {
    return this.grouped()[stage] ?? [];
  }
  totalFor(stage: StageId) {
    return this.listFor(stage).reduce((s, d) => s + d.value, 0);
  }
  cur(v: number) {
    return formatCurrency(v, this.lang());
  }

  onDragOver(e: DragEvent, stage: StageId) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    if (this.overStage() !== stage) this.overStage.set(stage);
  }
  onDragLeave(e: DragEvent) {
    const related = e.relatedTarget as Node | null;
    if (!(e.currentTarget as HTMLElement).contains(related)) this.overStage.set(null);
  }
  onDrop(stage: StageId) {
    const id = this.dragId();
    if (id != null) {
      const deal = this.crm.deals().find((d) => d.id === id);
      if (deal && deal.stage !== stage) {
        this.crm.moveDealStage(id, stage);
        this.ui.notifySuccess(this.transloco.translate('pipeline.moved', { stage: this.transloco.translate(`stages.${getStage(stage).nameKey}`) }));
      }
    }
    this.endDrag();
  }
  endDrag() {
    this.dragId.set(null);
    this.overStage.set(null);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.crm.addDeal({
      title: v.title,
      value: Number(v.value),
      stage: v.stage,
      probability: getStage(v.stage).probability,
      contactId: v.contactId ? Number(v.contactId) : null,
      companyId: v.companyId ? Number(v.companyId) : null,
      owner: v.owner,
      expectedClose: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    });
    this.ui.notifySuccess(this.transloco.translate('deals.created'));
    this.form.reset({ title: '', value: 0, stage: 'lead', contactId: '', companyId: '', owner: OWNERS[0] });
    this.modalOpen.set(false);
  }
}
