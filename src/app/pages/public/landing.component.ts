import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { IconComponent } from '../../components/ui/icon-base.component';
import { usePageTitle } from '../../core/page-title';

const FEATURES = [
  { icon: 'layers', key: 'pipeline' },
  { icon: 'users', key: 'contacts' },
  { icon: 'activity', key: 'activities' },
  { icon: 'bar-chart', key: 'reports' },
  { icon: 'zap', key: 'automation' },
  { icon: 'shield-check', key: 'security' },
];

const STEPS = ['s1', 's2', 's3'];
const FAQ = [
  { q: 'q1', a: 'a1' },
  { q: 'q2', a: 'a2' },
  { q: 'q3', a: 'a3' },
];
const STATS = [
  { value: '38%', key: 'conversion' },
  { value: '2.4x', key: 'velocity' },
  { value: '12k+', key: 'teams' },
  { value: '99.9%', key: 'uptime' },
];

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, TranslocoModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      <!-- Hero -->
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 -z-10">
          <div class="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-500/10"></div>
        </div>
        <div class="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <div class="mx-auto max-w-3xl text-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-themed surface-card px-3 py-1 text-xs font-medium text-brand-600">
              <span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
              {{ t('landing.hero.badge') }}
            </span>
            <h1 class="mt-6 text-4xl font-bold tracking-tight text-heading sm:text-5xl lg:text-6xl">{{ t('landing.hero.title') }}</h1>
            <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">{{ t('landing.hero.subtitle') }}</p>
            <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a routerLink="/login" class="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white shadow-theme-md transition hover:bg-brand-600">
                {{ t('landing.hero.ctaPrimary') }}
                <app-icon name="arrow-right" [size]="18" />
              </a>
              <a routerLink="/contato" class="flex h-12 items-center justify-center rounded-lg border border-themed surface-card px-6 text-sm font-semibold text-body transition hover:bg-gray-50 dark:hover:bg-gray-800">
                {{ t('landing.hero.ctaSecondary') }}
              </a>
            </div>
            <p class="mt-4 text-xs text-muted">{{ t('landing.hero.noCard') }}</p>
          </div>

          <div class="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            @for (s of stats; track s.key) {
              <div class="surface-card rounded-2xl border p-5 text-center">
                <p class="text-2xl font-bold text-heading sm:text-3xl">{{ s.value }}</p>
                <p class="mt-1 text-xs text-muted">{{ t('landing.stats.' + s.key) }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold text-heading">{{ t('landing.features.title') }}</h2>
          <p class="mt-3 text-muted">{{ t('landing.features.subtitle') }}</p>
        </div>
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (f of features; track f.key) {
            <div class="surface-card rounded-2xl border p-6 transition hover:shadow-theme-md">
              <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                <app-icon [name]="f.icon" [size]="24" />
              </span>
              <h3 class="mt-5 text-lg font-semibold text-heading">{{ t('landing.features.items.' + f.key + '.title') }}</h3>
              <p class="mt-2 text-sm text-muted">{{ t('landing.features.items.' + f.key + '.desc') }}</p>
            </div>
          }
        </div>
      </section>

      <!-- How it works -->
      <section id="how" class="border-y border-themed surface-card">
        <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div class="mx-auto max-w-2xl text-center">
            <h2 class="text-3xl font-bold text-heading">{{ t('landing.how.title') }}</h2>
            <p class="mt-3 text-muted">{{ t('landing.how.subtitle') }}</p>
          </div>
          <div class="mt-12 grid gap-8 md:grid-cols-3">
            @for (s of steps; track s; let i = $index) {
              <div class="text-center">
                <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-lg font-bold text-white">{{ i + 1 }}</span>
                <h3 class="mt-5 text-lg font-semibold text-heading">{{ t('landing.how.steps.' + s + '.title') }}</h3>
                <p class="mt-2 text-sm text-muted">{{ t('landing.how.steps.' + s + '.desc') }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 class="text-center text-3xl font-bold text-heading">{{ t('landing.faqTitle') }}</h2>
        <div class="mt-10 space-y-4">
          @for (item of faq; track item.q) {
            <div class="surface-card rounded-2xl border p-6">
              <h3 class="text-base font-semibold text-heading">{{ t('landing.faq.' + item.q) }}</h3>
              <p class="mt-2 text-sm text-muted">{{ t('landing.faq.' + item.a) }}</p>
            </div>
          }
        </div>
      </section>

      <!-- CTA -->
      <section class="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div class="overflow-hidden rounded-3xl bg-brand-500 px-6 py-14 text-center">
          <h2 class="text-3xl font-bold text-white">{{ t('landing.cta.title') }}</h2>
          <p class="mx-auto mt-3 max-w-xl text-brand-50">{{ t('landing.cta.subtitle') }}</p>
          <a routerLink="/registro" class="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-brand-600 transition hover:bg-brand-50">
            {{ t('landing.cta.button') }}
          </a>
        </div>
      </section>
    </ng-container>
  `,
})
export class LandingPageComponent {
  readonly features = FEATURES;
  readonly steps = STEPS;
  readonly faq = FAQ;
  readonly stats = STATS;

  constructor() {
    usePageTitle();
  }
}
