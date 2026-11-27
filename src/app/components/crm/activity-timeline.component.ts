import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { fromNow } from '../../lib/format';
import { IconComponent } from '../ui/icon-base.component';
import type { Activity, ActivityType } from '../../data/types';

const TYPE_ICON: Record<ActivityType, string> = {
  call: 'phone',
  email: 'mail',
  meeting: 'users',
  task: 'check-circle',
};

const TYPE_COLOR: Record<ActivityType, string> = {
  call: 'text-brand-500 bg-brand-50 dark:bg-brand-500/15',
  email: 'text-blue-light-500 bg-blue-light-50 dark:bg-blue-light-500/15',
  meeting: 'text-warning-600 bg-warning-50 dark:bg-warning-500/15',
  task: 'text-success-600 bg-success-50 dark:bg-success-500/15',
};

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [TranslocoModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      @if (activities.length === 0) {
        <p class="py-6 text-center text-sm text-muted">{{ t('activities.empty') }}</p>
      } @else {
        <ol
          class="relative space-y-5 before:absolute before:left-[18px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--tx-border)]"
        >
          @for (a of activities; track a.id) {
            <li class="relative flex gap-4">
              <span
                [class]="
                  'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ' + typeColor(a.type)
                "
              >
                <app-icon [name]="typeIcon(a.type)" [size]="16" />
              </span>
              <div class="flex-1 pt-0.5">
                <div class="flex items-start justify-between gap-3">
                  <p
                    [class]="
                      'text-sm font-medium ' +
                      (a.status === 'done' ? 'text-muted line-through' : 'text-heading')
                    "
                  >
                    {{ a.title }}
                  </p>
                  @if (toggleable) {
                    <button
                      type="button"
                      (click)="toggle.emit(a.id)"
                      [class]="
                        'shrink-0 rounded-md border px-2 py-0.5 text-xs transition ' +
                        (a.status === 'done'
                          ? 'border-success-200 text-success-600 dark:border-success-500/30'
                          : 'border-themed text-muted hover:border-brand-300 hover:text-brand-600')
                      "
                    >
                      {{ a.status === 'done' ? t('activities.done') : t('activities.markDone') }}
                    </button>
                  }
                </div>
                <p class="mt-0.5 text-xs text-muted">
                  {{ t('activities.types.' + a.type) }} · {{ a.owner }} · {{ relTime(a.date) }}
                </p>
              </div>
            </li>
          }
        </ol>
      }
    </ng-container>
  `,
})
export class ActivityTimelineComponent {
  private transloco = inject(TranslocoService);
  private lang = signal(this.transloco.getActiveLang());

  @Input() activities: Activity[] = [];
  /** Whether to render the mark-done toggle button. */
  @Input() toggleable = false;
  @Output() toggle = new EventEmitter<number>();

  constructor() {
    this.transloco.langChanges$.subscribe((l) => this.lang.set(l));
  }

  typeIcon(t: ActivityType) {
    return TYPE_ICON[t];
  }
  typeColor(t: ActivityType) {
    return TYPE_COLOR[t];
  }
  relTime(date: string) {
    return fromNow(date, this.lang());
  }
}
