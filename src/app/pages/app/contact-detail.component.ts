import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CrmService } from '../../core/services/crm.service';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';
import { formatCurrency, formatDate, fromNow } from '../../lib/format';
import { companyName } from '../../data/query';
import { PageHeaderComponent } from '../../components/app/page-header.component';
import { AvatarComponent } from '../../components/ui/avatar.component';
import { BadgeComponent } from '../../components/ui/badge.component';
import { TabsComponent } from '../../components/ui/tabs.component';
import { EmptyStateComponent } from '../../components/ui/empty-state.component';
import { TagPillComponent } from '../../components/crm/tag-pill.component';
import { StagePillComponent } from '../../components/crm/stage-pill.component';
import { ActivityTimelineComponent } from '../../components/crm/activity-timeline.component';
import { IconComponent } from '../../components/ui/icon-base.component';
import { setLiteralTitle } from '../../core/page-title';

@Component({
  selector: 'app-contact-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoModule,
    PageHeaderComponent,
    AvatarComponent,
    BadgeComponent,
    TabsComponent,
    EmptyStateComponent,
    TagPillComponent,
    StagePillComponent,
    ActivityTimelineComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      @if (!contact()) {
        <app-empty-state icon="users" [title]="t('contacts.notFound')">
          <a routerLink="/app/contatos" class="text-sm font-medium text-brand-600">{{ t('common.back') }}</a>
        </app-empty-state>
      } @else {
        <app-page-header
          [title]="contact()!.name"
          [crumbs]="[{ label: t('appNav.contacts'), href: '/app/contatos', icon: 'users' }, { label: contact()!.name }]"
        />

        <div class="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside class="surface-card h-fit rounded-2xl border p-6 text-center">
            <div class="flex justify-center">
              <app-avatar [src]="contact()!.avatar" [name]="contact()!.name" size="xl" />
            </div>
            <h2 class="mt-4 text-lg font-bold text-heading">{{ contact()!.name }}</h2>
            <p class="text-sm text-muted">{{ contact()!.title }}</p>
            <div class="mt-3 flex justify-center">
              <app-badge [color]="statusColor()">{{ t('contacts.statuses.' + contact()!.status) }}</app-badge>
            </div>
            @if (contact()!.tags.length > 0) {
              <div class="mt-4 flex flex-wrap justify-center gap-1.5">
                @for (tag of contact()!.tags; track tag) {
                  <app-tag-pill [tag]="tag" />
                }
              </div>
            }
            <div class="mt-5 flex justify-center gap-2">
              <a [href]="'mailto:' + contact()!.email" class="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-themed text-sm font-medium text-body hover:bg-gray-50 dark:hover:bg-gray-800">
                <app-icon name="mail" [size]="16" /> {{ t('contacts.email') }}
              </a>
              <a [href]="'tel:' + contact()!.phone" class="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600">
                <app-icon name="phone" [size]="16" /> {{ t('contacts.call') }}
              </a>
            </div>
          </aside>

          <div class="surface-card rounded-2xl border p-6">
            <app-tabs
              [tabs]="[
                { label: t('contacts.tabs.overview'), icon: 'info' },
                { label: t('contacts.tabs.activities'), icon: 'activity' },
                { label: t('contacts.tabs.notes'), icon: 'file-text' },
                { label: t('contacts.tabs.deals'), icon: 'dollar' }
              ]"
              [value]="tab()"
              (onChange)="tab.set($event)"
            >
              @switch (tab()) {
                @case (0) {
                  <div class="grid gap-5 sm:grid-cols-2">
                    @for (f of overviewFields(); track f.label) {
                      <div class="flex items-center gap-3 rounded-xl border border-themed p-4">
                        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                          <app-icon [name]="f.icon" [size]="18" />
                        </span>
                        <div>
                          <p class="text-xs text-muted">{{ f.label }}</p>
                          <p class="text-sm font-medium text-heading">{{ f.value }}</p>
                        </div>
                      </div>
                    }
                  </div>
                }
                @case (1) {
                  @if (contactActivities().length > 0) {
                    <app-activity-timeline [activities]="contactActivities()" [toggleable]="true" (toggle)="onToggle($event)" />
                  } @else {
                    <app-empty-state icon="activity" [title]="t('activities.empty')" />
                  }
                }
                @case (2) {
                  <div>
                    <div class="flex gap-2">
                      <textarea
                        [value]="noteText()"
                        (input)="noteText.set($any($event.target).value)"
                        rows="2"
                        [placeholder]="t('notes.placeholder')"
                        class="focus-ring flex-1 rounded-lg border border-themed bg-transparent px-3 py-2 text-sm text-body"
                      ></textarea>
                      <button type="button" (click)="submitNote()" class="self-end rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                        {{ t('notes.add') }}
                      </button>
                    </div>
                    @if (contactNotes().length > 0) {
                      <ul class="mt-5 space-y-3">
                        @for (n of contactNotes(); track n.id) {
                          <li class="rounded-xl border border-themed p-4">
                            <p class="text-sm text-body">{{ n.body }}</p>
                            <p class="mt-2 text-xs text-muted">{{ n.author }} · {{ rel(n.createdAt) }}</p>
                          </li>
                        }
                      </ul>
                    } @else {
                      <p class="mt-6 text-center text-sm text-muted">{{ t('notes.empty') }}</p>
                    }
                  </div>
                }
                @case (3) {
                  @if (contactDeals().length > 0) {
                    <ul class="space-y-3">
                      @for (d of contactDeals(); track d.id) {
                        <li class="flex items-center justify-between rounded-xl border border-themed p-4">
                          <div>
                            <p class="text-sm font-medium text-heading">{{ d.title }}</p>
                            <p class="mt-1"><app-stage-pill [stage]="d.stage" size="sm" /></p>
                          </div>
                          <span class="text-sm font-semibold text-heading">{{ cur(d.value) }}</span>
                        </li>
                      }
                    </ul>
                  } @else {
                    <app-empty-state icon="dollar" [title]="t('deals.empty')" />
                  }
                }
              }
            </app-tabs>
          </div>
        </div>
      }
    </ng-container>
  `,
})
export class ContactDetailPageComponent {
  private crm = inject(CrmService);
  private ui = inject(UiService);
  private auth = inject(AuthService);
  private transloco = inject(TranslocoService);
  private route = inject(ActivatedRoute);
  private lang = signal(this.transloco.getActiveLang());

  private cid = signal(Number(this.route.snapshot.paramMap.get('id')));
  readonly tab = signal(0);
  readonly noteText = signal('');

  readonly contact = computed(() => this.crm.contacts().find((c) => c.id === this.cid()));

  readonly contactActivities = computed(() =>
    this.crm.activities().filter((a) => a.contactId === this.cid()).sort((a, b) => +new Date(b.date) - +new Date(a.date))
  );
  readonly contactDeals = computed(() => this.crm.deals().filter((d) => d.contactId === this.cid()));
  readonly contactNotes = computed(() =>
    this.crm.notes().filter((n) => n.contactId === this.cid()).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  );

  readonly statusColor = computed(() => {
    const s = this.contact()?.status;
    return s === 'customer' ? 'success' : s === 'inactive' ? 'gray' : 'brand';
  });

  readonly overviewFields = computed(() => {
    const c = this.contact();
    if (!c) return [];
    const t = (k: string) => this.transloco.translate(k);
    return [
      { icon: 'mail', label: t('contacts.columns.email'), value: c.email },
      { icon: 'phone', label: t('contacts.columns.phone'), value: c.phone },
      { icon: 'briefcase', label: t('contacts.columns.company'), value: companyName(this.crm.companies(), c.companyId) },
      { icon: 'user', label: t('contacts.columns.title'), value: c.title },
      { icon: 'users', label: t('contacts.columns.owner'), value: c.owner },
      { icon: 'clock', label: t('contacts.createdAt'), value: formatDate(c.createdAt, this.lang()) },
    ];
  });

  constructor() {
    this.route.paramMap.subscribe((p) => this.cid.set(Number(p.get('id'))));
    this.transloco.langChanges$.subscribe((l) => this.lang.set(l));
    setLiteralTitle(this.contact()?.name ?? '');
  }

  cur(v: number) {
    return formatCurrency(v, this.lang());
  }
  rel(d: string) {
    return fromNow(d, this.lang());
  }
  onToggle(id: number) {
    this.crm.toggleActivity(id);
    this.ui.notifySuccess(this.transloco.translate('activities.updated'));
  }
  submitNote() {
    const text = this.noteText().trim();
    if (!text) return;
    this.crm.addNote({ body: text, contactId: this.cid(), dealId: null, author: this.auth.user()?.name ?? 'Você' });
    this.noteText.set('');
    this.ui.notifySuccess(this.transloco.translate('notes.added'));
  }
}
