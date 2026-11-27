import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CrmService } from '../../core/services/crm.service';
import { UiService } from '../../core/services/ui.service';
import { OWNERS } from '../../data/stages';
import { isToday } from '../../data/query';
import type { Activity, ActivityType } from '../../data/types';
import { PageHeaderComponent } from '../../components/app/page-header.component';
import { ActivityTimelineComponent } from '../../components/crm/activity-timeline.component';
import { ModalComponent } from '../../components/ui/modal.component';
import { FormFieldComponent } from '../../components/ui/form-field.component';
import { IconComponent } from '../../components/ui/icon-base.component';
import { usePageTitle } from '../../core/page-title';

const TYPES: ActivityType[] = ['call', 'email', 'meeting', 'task'];

@Component({
  selector: 'app-activities-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    PageHeaderComponent,
    ActivityTimelineComponent,
    ModalComponent,
    FormFieldComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      <app-page-header [title]="t('activities.title')" [subtitle]="t('activities.subtitle')" [hasAction]="true">
        <button type="button" (click)="modalOpen.set(true)" class="flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600">
          <app-icon name="plus" [size]="16" /> {{ t('activities.new') }}
        </button>
      </app-page-header>

      <div class="mb-4 flex flex-wrap gap-3">
        <select [(ngModel)]="typeFilter" (ngModelChange)="typeFilterS.set($event)" [class]="selectCls">
          <option value="">{{ t('activities.filters.allTypes') }}</option>
          @for (tp of types; track tp) {
            <option [value]="tp">{{ t('activities.types.' + tp) }}</option>
          }
        </select>
      </div>

      <div class="grid gap-5 lg:grid-cols-3">
        @for (sec of sections(); track sec.titleKey) {
          <div class="surface-card rounded-2xl border p-5">
            <div class="mb-4 flex items-center gap-2">
              <h3 class="text-base font-semibold text-heading">{{ t(sec.titleKey) }}</h3>
              <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted dark:bg-gray-800">{{ sec.items.length }}</span>
            </div>
            @if (sec.items.length > 0) {
              <app-activity-timeline [activities]="sec.items" [toggleable]="true" (toggle)="onToggle($event)" />
            } @else {
              <p class="py-4 text-center text-sm text-muted">{{ t('activities.empty') }}</p>
            }
          </div>
        }
      </div>

      <app-modal [open]="modalOpen()" (closed)="modalOpen.set(false)" [title]="t('activities.newTitle')" size="md">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <app-form-field [control]="fc('title')" name="title" [label]="t('activities.columns.title')" [placeholder]="t('activities.titlePlaceholder')" [errorText]="t('activities.errors.title')" />
          <div class="grid grid-cols-2 gap-4">
            <app-form-field [control]="fc('type')" name="type" [label]="t('activities.columns.type')" control-type="select">
              @for (tp of types; track tp) {
                <option [value]="tp">{{ t('activities.types.' + tp) }}</option>
              }
            </app-form-field>
            <app-form-field [control]="fc('date')" name="date" [label]="t('activities.columns.date')" type="date" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <app-form-field [control]="fc('contactId')" name="contactId" [label]="t('activities.columns.contact')" control-type="select">
              <option value="">—</option>
              @for (c of crm.contacts(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </app-form-field>
            <app-form-field [control]="fc('owner')" name="owner" [label]="t('activities.columns.owner')" control-type="select">
              @for (o of owners; track o) {
                <option [value]="o">{{ o }}</option>
              }
            </app-form-field>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" (click)="modalOpen.set(false)" class="rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body hover:bg-gray-50 dark:hover:bg-gray-800">{{ t('common.cancel') }}</button>
            <button type="submit" class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">{{ t('activities.create') }}</button>
          </div>
        </form>
      </app-modal>
    </ng-container>
  `,
})
export class ActivitiesPageComponent {
  crm = inject(CrmService);
  private ui = inject(UiService);
  private transloco = inject(TranslocoService);
  private fb = inject(FormBuilder);

  readonly types = TYPES;
  readonly owners = OWNERS;
  readonly selectCls = 'h-10 rounded-lg border border-themed surface-card px-3 text-sm text-body focus-ring';

  typeFilter = '';
  readonly typeFilterS = signal('');
  readonly modalOpen = signal(false);

  private filtered = computed(() => {
    const tf = this.typeFilterS();
    return tf ? this.crm.activities().filter((a) => a.type === tf) : this.crm.activities();
  });

  readonly sections = computed(() => {
    const f = this.filtered();
    const open = f.filter((a) => a.status === 'open');
    const today = open.filter((a) => isToday(a.date)).sort((a, b) => +new Date(a.date) - +new Date(b.date));
    const upcoming = open
      .filter((a) => !isToday(a.date) && +new Date(a.date) > Date.now())
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
    const done = f.filter((a) => a.status === 'done').sort((a, b) => +new Date(b.date) - +new Date(a.date));
    return [
      { titleKey: 'activities.sections.today', items: today },
      { titleKey: 'activities.sections.upcoming', items: upcoming },
      { titleKey: 'activities.sections.done', items: done },
    ] as { titleKey: string; items: Activity[] }[];
  });

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    type: ['task'],
    contactId: [''],
    owner: [OWNERS[0]],
    date: [new Date().toISOString().slice(0, 10)],
  });

  constructor() {
    usePageTitle('activities.title');
  }

  fc(name: string) {
    return this.form.get(name) as any;
  }
  onToggle(id: number) {
    this.crm.toggleActivity(id);
    this.ui.notifySuccess(this.transloco.translate('activities.updated'));
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.crm.addActivity({
      title: v.title,
      type: v.type,
      status: 'open',
      date: new Date(v.date).toISOString(),
      contactId: v.contactId ? Number(v.contactId) : null,
      dealId: null,
      owner: v.owner,
    });
    this.ui.notifySuccess(this.transloco.translate('activities.created'));
    this.form.reset({ title: '', type: 'task', contactId: '', owner: OWNERS[0], date: new Date().toISOString().slice(0, 10) });
    this.modalOpen.set(false);
  }
}
