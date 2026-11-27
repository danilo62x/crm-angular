import { ChangeDetectionStrategy, Component, Input, computed, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TAG_COLORS } from '../../data/stages';
import { BadgeComponent } from '../ui/badge.component';

type BadgeColor = 'brand' | 'success' | 'warning' | 'error' | 'gray';

/** Renders a contact tag as a soft badge, translated where a label exists. */
@Component({
  selector: 'app-tag-pill',
  standalone: true,
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-badge [color]="color()">{{ label() }}</app-badge>`,
})
export class TagPillComponent {
  private transloco = inject(TranslocoService);
  private lang = signal(this.transloco.getActiveLang());

  @Input({ required: true }) set tag(v: string) {
    this._tag.set(v);
  }
  private _tag = signal('');

  constructor() {
    this.transloco.langChanges$.subscribe((l) => this.lang.set(l));
  }

  readonly color = computed<BadgeColor>(() => (TAG_COLORS[this._tag()] ?? 'gray') as BadgeColor);
  readonly label = computed(() => {
    this.lang();
    const key = `tags.${this._tag()}`;
    const t = this.transloco.translate(key);
    return t === key ? this._tag() : t;
  });
}
