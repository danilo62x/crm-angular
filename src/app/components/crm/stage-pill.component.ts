import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { getStage } from '../../data/stages';
import type { StageId } from '../../data/types';

/** Colored pill for a deal stage, using the stage's accent color. */
@Component({
  selector: 'app-stage-pill',
  standalone: true,
  imports: [TranslocoModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      *transloco="let t"
      [class]="'inline-flex items-center gap-1.5 rounded-full font-medium ' + pad()"
      [style.backgroundColor]="bg()"
      [style.color]="s().color"
    >
      <span class="h-1.5 w-1.5 rounded-full" [style.backgroundColor]="s().color"></span>
      {{ t('stages.' + s().nameKey) }}
    </span>
  `,
})
export class StagePillComponent {
  @Input({ required: true }) set stage(v: StageId) {
    this._stage.set(v);
  }
  private _stage = signal<StageId>('lead');
  @Input() set size(v: 'sm' | 'md') {
    this._size.set(v);
  }
  private _size = signal<'sm' | 'md'>('md');

  readonly s = computed(() => getStage(this._stage()));
  readonly bg = computed(() => `${this.s().color}1f`);
  readonly pad = computed(() =>
    this._size() === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  );
}
