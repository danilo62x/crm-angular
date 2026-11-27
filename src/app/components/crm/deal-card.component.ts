import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CrmService } from '../../core/services/crm.service';
import { formatCurrency, formatDate } from '../../lib/format';
import { companyName, contactName } from '../../data/query';
import { AvatarComponent } from '../ui/avatar.component';
import { IconComponent } from '../ui/icon-base.component';
import type { Deal } from '../../data/types';

@Component({
  selector: 'app-deal-card',
  standalone: true,
  imports: [TranslocoModule, AvatarComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *transloco="let t"
      draggable="true"
      (dragstart)="onDragStart($event)"
      (dragend)="dragEnd.emit()"
      (click)="cardClick.emit()"
      [class]="
        'surface-card cursor-grab rounded-xl border p-3 shadow-theme-xs transition active:cursor-grabbing hover:shadow-theme-md ' +
        (dragging ? 'opacity-40' : '')
      "
    >
      <div class="flex items-start justify-between gap-2">
        <p class="text-sm font-semibold text-heading">{{ deal.title }}</p>
        <app-icon name="dots-vertical" [size]="16" class="text-gray-400" />
      </div>
      <p class="mt-1 text-xs text-muted">{{ company() }}</p>

      <p class="mt-3 text-base font-bold text-brand-600 dark:text-brand-400">{{ value() }}</p>

      <div class="mt-3 flex items-center justify-between border-t border-themed pt-3">
        <div class="flex items-center gap-2">
          <app-avatar [src]="contact()?.avatar" [name]="contactLabel()" size="xs" />
          <span class="text-xs text-muted">{{ deal.probability }}%</span>
        </div>
        <span class="flex items-center gap-1 text-xs text-muted">
          <app-icon name="clock" [size]="13" />
          {{ closeDate() }}
        </span>
      </div>
      <span class="sr-only">{{ t('pipeline.dragHint') }}</span>
    </div>
  `,
})
export class DealCardComponent {
  private crm = inject(CrmService);
  private transloco = inject(TranslocoService);
  private lang = signal(this.transloco.getActiveLang());

  @Input({ required: true }) deal!: Deal;
  @Input() dragging = false;
  @Output() dragStart = new EventEmitter<DragEvent>();
  @Output() dragEnd = new EventEmitter<void>();
  @Output() cardClick = new EventEmitter<void>();

  constructor() {
    this.transloco.langChanges$.subscribe((l) => this.lang.set(l));
  }

  readonly contact = computed(() => this.crm.contacts().find((c) => c.id === this.deal.contactId));
  readonly contactLabel = computed(() => contactName(this.crm.contacts(), this.deal.contactId));
  readonly company = computed(() => companyName(this.crm.companies(), this.deal.companyId));
  readonly value = computed(() => formatCurrency(this.deal.value, this.lang()));
  readonly closeDate = computed(() => formatDate(this.deal.expectedClose, this.lang()));

  onDragStart(e: DragEvent) {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(this.deal.id));
    }
    this.dragStart.emit(e);
  }
}
