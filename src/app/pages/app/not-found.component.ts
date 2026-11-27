import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { usePageTitle } from '../../core/page-title';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *transloco="let t" class="flex min-h-screen flex-col items-center justify-center px-4 text-center" style="background-color: var(--tx-body-bg)">
      <p class="text-7xl font-bold text-brand-500">404</p>
      <h1 class="mt-4 text-2xl font-bold text-heading">{{ t('notFound.title') }}</h1>
      <p class="mt-2 max-w-sm text-sm text-muted">{{ t('notFound.desc') }}</p>
      <div class="mt-8 flex gap-3">
        <a routerLink="/" class="flex h-11 items-center rounded-lg border border-themed px-5 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800">
          {{ t('notFound.home') }}
        </a>
        @if (isAuth()) {
          <a routerLink="/app" class="flex h-11 items-center rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600">
            {{ t('notFound.dashboard') }}
          </a>
        }
      </div>
    </div>
  `,
})
export class NotFoundPageComponent {
  private auth = inject(AuthService);
  readonly isAuth = this.auth.isAuthenticated;

  constructor() {
    usePageTitle();
    document.title = '404 · CRM — Vendas & Contatos';
  }
}
