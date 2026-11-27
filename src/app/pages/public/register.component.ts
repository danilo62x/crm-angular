import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';
import { IconComponent } from '../../components/ui/icon-base.component';
import { AuthShellComponent } from '../../components/layout/auth-shell.component';
import { usePageTitle } from '../../core/page-title';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoModule, IconComponent, AuthShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-shell *transloco="let t" [title]="t('auth.registerTitle')" [subtitle]="t('auth.registerSubtitle')" [hasFooter]="true">
      <form (ngSubmit)="submit()" class="space-y-5">
        <div>
          <label class="mb-2 block text-sm font-medium text-heading" for="name">{{ t('auth.name') }}</label>
          <div class="relative">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><app-icon name="user" [size]="18" /></span>
            <input id="name" required [(ngModel)]="name" name="name" placeholder="Maria Silva" [class]="field" />
          </div>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-heading" for="email">{{ t('auth.email') }}</label>
          <div class="relative">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><app-icon name="mail" [size]="18" /></span>
            <input id="email" type="email" required [(ngModel)]="email" name="email" placeholder="seu@email.com" [class]="field" />
          </div>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-heading" for="password">{{ t('auth.password') }}</label>
          <div class="relative">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><app-icon name="lock" [size]="18" /></span>
            <input id="password" type="password" required [(ngModel)]="password" name="password" placeholder="••••••••" [class]="field" />
          </div>
        </div>

        <label class="flex items-start gap-2 text-sm text-body">
          <input type="checkbox" [(ngModel)]="agree" name="agree" class="mt-0.5 h-4 w-4 rounded border-themed accent-brand-500" />
          {{ t('auth.agree') }}
        </label>

        <button
          type="submit"
          [disabled]="loading()"
          class="flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 focus-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          @if (loading()) {
            <span class="flex items-center gap-2">
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
              {{ t('auth.registering') }}
            </span>
          } @else {
            {{ t('auth.registerCta') }}
          }
        </button>

        @if (error()) {
          <p class="rounded-lg bg-error-50 px-4 py-2 text-center text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">{{ error() }}</p>
        }
      </form>

      <ng-container authFooter>
        {{ t('auth.hasAccount') }}
        <a routerLink="/login" class="font-medium text-brand-500 hover:text-brand-600">{{ t('auth.loginCta') }}</a>
      </ng-container>
    </app-auth-shell>
  `,
})
export class RegisterPageComponent {
  private auth = inject(AuthService);
  private ui = inject(UiService);
  private transloco = inject(TranslocoService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  agree = false;
  readonly loading = signal(false);
  readonly error = signal('');

  readonly field =
    'h-11 w-full rounded-lg border border-themed bg-gray-50 pl-10 pr-3 text-sm text-body outline-none focus:border-brand-300 focus-ring dark:bg-gray-900';

  constructor() {
    usePageTitle('auth.registerTitle');
  }

  async submit() {
    this.error.set('');
    if (!this.agree) {
      this.error.set(this.transloco.translate('auth.errors.agree'));
      return;
    }
    this.loading.set(true);
    const ok = await this.auth.register(this.name, this.email, this.password);
    this.loading.set(false);
    if (!ok) {
      this.error.set(this.transloco.translate('auth.loginError'));
      return;
    }
    this.ui.notifySuccess(this.transloco.translate('auth.registerSuccess'));
    this.router.navigateByUrl('/app');
  }
}
