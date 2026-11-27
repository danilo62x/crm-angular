import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { IconComponent } from '../ui/icon-base.component';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink, TranslocoModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-themed surface-card" *transloco="let t">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="flex flex-col items-start justify-between gap-8 lg:flex-row">
          <div class="max-w-sm">
            <a routerLink="/" class="flex items-center gap-2.5">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
                <app-icon name="layers" [size]="18" />
              </span>
              <span class="text-lg font-bold text-heading">{{ t('brand') }}</span>
            </a>
            <p class="mt-4 text-sm text-muted">{{ t('landing.footer.tagline') }}</p>
          </div>
          <div class="flex flex-wrap gap-x-10 gap-y-2 text-sm">
            <a routerLink="/contato" class="text-muted transition hover:text-brand-600">{{ t('nav.contact') }}</a>
            <a routerLink="/login" class="text-muted transition hover:text-brand-600">{{ t('nav.login') }}</a>
            <a routerLink="/registro" class="text-muted transition hover:text-brand-600">{{ t('nav.getStarted') }}</a>
            <a href="#" class="text-muted transition hover:text-brand-600">{{ t('landing.footer.privacy') }}</a>
          </div>
        </div>
        <div class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-themed pt-6 sm:flex-row">
          <p class="text-xs text-muted">© {{ year }} {{ t('brand') }}. {{ t('landing.footer.rights') }}</p>
          <div class="flex items-center gap-3">
            @for (icon of socials; track icon) {
              <a [href]="'#'" [attr.aria-label]="icon" class="flex h-9 w-9 items-center justify-center rounded-full border border-themed text-muted transition hover:text-brand-500">
                <app-icon [name]="icon" [size]="16" />
              </a>
            }
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class PublicFooterComponent {
  year = new Date().getFullYear();
  socials = ['github', 'slack', 'globe'];
}
