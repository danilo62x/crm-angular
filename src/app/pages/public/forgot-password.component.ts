import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UiService } from '../../core/services/ui.service';
import { IconComponent } from '../../components/ui/icon-base.component';
import { AuthShellComponent } from '../../components/layout/auth-shell.component';
import { usePageTitle } from '../../core/page-title';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoModule, IconComponent, AuthShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-shell *transloco="let t" [title]="t('auth.forgotTitle')" [subtitle]="t('auth.forgotSubtitle')" [hasFooter]="true">
      @if (sent()) {
        <div class="flex flex-col items-center text-center">
          <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600 dark:bg-success-500/15">
            <app-icon name="check-circle" [size]="28" />
          </span>
          <p class="mt-4 text-sm text-body">{{ t('auth.forgotSuccess') }}</p>
        </div>
      } @else {
        <form (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label class="mb-2 block text-sm font-medium text-heading" for="email">{{ t('auth.email') }}</label>
            <div class="relative">
              <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><app-icon name="mail" [size]="18" /></span>
              <input
                id="email"
                type="email"
                required
                [(ngModel)]="email"
                name="email"
                placeholder="seu@email.com"
                class="h-11 w-full rounded-lg border border-themed bg-gray-50 pl-10 pr-3 text-sm text-body outline-none focus:border-brand-300 focus-ring dark:bg-gray-900"
              />
            </div>
          </div>
          <button
            type="submit"
            [disabled]="loading()"
            class="flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 focus-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading() ? t('auth.sending') : t('auth.forgotCta') }}
          </button>
        </form>
      }

      <a authFooter routerLink="/login" class="font-medium text-brand-500 hover:text-brand-600">← {{ t('auth.backToLogin') }}</a>
    </app-auth-shell>
  `,
})
export class ForgotPasswordPageComponent {
  private ui = inject(UiService);
  private transloco = inject(TranslocoService);

  email = '';
  readonly loading = signal(false);
  readonly sent = signal(false);

  constructor() {
    usePageTitle('auth.forgotTitle');
  }

  async submit() {
    this.loading.set(true);
    await new Promise((r) => setTimeout(r, 600));
    this.loading.set(false);
    this.sent.set(true);
    this.ui.notifySuccess(this.transloco.translate('auth.forgotSuccess'));
  }
}
