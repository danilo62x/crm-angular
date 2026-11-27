import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { filter } from 'rxjs';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../ui/icon-base.component';
import { LanguageSwitcherComponent } from '../ui/language-switcher.component';

const LINKS = [
  { href: 'features', key: 'nav.features' },
  { href: 'how', key: 'nav.how' },
  { href: 'faq', key: 'nav.faq' },
];

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [RouterLink, TranslocoModule, IconComponent, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      *transloco="let t"
      [class]="
        'sticky top-0 z-40 border-b transition-colors ' +
        (scrolled() ? 'surface-header border-themed backdrop-blur' : 'border-transparent bg-transparent')
      "
    >
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <a routerLink="/" class="flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-theme-md">
            <app-icon name="layers" [size]="18" />
          </span>
          <span class="text-lg font-bold text-heading">{{ t('brand') }}</span>
        </a>

        <nav class="ml-6 hidden items-center gap-1 lg:flex">
          @if (isHome()) {
            @for (l of links; track l.href) {
              <a [href]="'#' + l.href" class="rounded-lg px-3 py-2 text-sm font-medium text-body transition hover:text-heading">{{ t(l.key) }}</a>
            }
          }
          <a routerLink="/contato" class="rounded-lg px-3 py-2 text-sm font-medium text-body transition hover:text-heading">{{ t('nav.contact') }}</a>
        </nav>

        <div class="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            (click)="ui.toggleDarkMode()"
            [attr.aria-label]="t('common.theme')"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-themed text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <app-icon [name]="ui.darkMode() ? 'sun' : 'moon'" [size]="18" />
          </button>
          <app-language-switcher />

          @if (isAuth()) {
            <a routerLink="/app" class="hidden h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 sm:flex">
              {{ t('nav.dashboard') }}
            </a>
          } @else {
            <a routerLink="/login" class="hidden h-10 items-center rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800 sm:flex">
              {{ t('nav.login') }}
            </a>
            <a routerLink="/registro" class="hidden h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 sm:flex">
              {{ t('nav.getStarted') }}
            </a>
          }

          <button
            type="button"
            (click)="mobileOpen.set(!mobileOpen())"
            class="flex h-10 w-10 items-center justify-center rounded-lg text-body lg:hidden"
            aria-label="Menu"
          >
            <app-icon [name]="mobileOpen() ? 'x' : 'menu'" [size]="22" />
          </button>
        </div>
      </div>

      @if (mobileOpen()) {
        <div class="surface-card border-t border-themed lg:hidden">
          <nav class="flex flex-col gap-1 px-4 py-4 sm:px-6">
            @if (isHome()) {
              @for (l of links; track l.href) {
                <a [href]="'#' + l.href" class="rounded-lg px-3 py-2.5 text-sm font-medium text-body hover:bg-gray-50 dark:hover:bg-gray-800">{{ t(l.key) }}</a>
              }
            }
            <a routerLink="/contato" class="rounded-lg px-3 py-2.5 text-sm font-medium text-body hover:bg-gray-50 dark:hover:bg-gray-800">{{ t('nav.contact') }}</a>
            <div class="mt-2 flex flex-col gap-2 border-t border-themed pt-3">
              @if (isAuth()) {
                <a routerLink="/app" class="flex h-11 items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white">{{ t('nav.dashboard') }}</a>
              } @else {
                <a routerLink="/login" class="flex h-11 items-center justify-center rounded-lg border border-themed text-sm font-medium text-body">{{ t('nav.login') }}</a>
                <a routerLink="/registro" class="flex h-11 items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white">{{ t('nav.getStarted') }}</a>
              }
            </div>
          </nav>
        </div>
      }
    </header>
  `,
})
export class PublicNavbarComponent {
  ui = inject(UiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly links = LINKS;
  readonly mobileOpen = signal(false);
  readonly scrolled = signal(false);
  readonly isHome = signal(this.router.url === '/' || this.router.url.startsWith('/?') || this.router.url.startsWith('/#'));
  readonly isAuth = this.auth.isAuthenticated;

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      this.isHome.set(url === '/' || url.startsWith('/?') || url.startsWith('/#'));
      this.mobileOpen.set(false);
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 8);
  }
}
