import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../ui/icon-base.component';
import { LanguageSwitcherComponent } from '../ui/language-switcher.component';

const NOTIFICATIONS = [
  { id: 1, key: 'dealWon', name: 'Stark Industries', time: 'Há 8 min', read: false },
  { id: 2, key: 'newLead', name: 'Gustavo Pereira', time: 'Há 41 min', read: false },
  { id: 3, key: 'taskDue', name: 'Ligar para Mariana', time: 'Há 1 hora', read: false },
];

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [RouterLink, TranslocoModule, IconComponent, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="surface-header sticky top-0 z-30 flex w-full border-b" *transloco="let t">
      <div class="flex flex-grow items-center justify-between gap-4 px-4 py-3 md:px-6 2xl:px-10">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-themed text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
            (click)="onToggleSidebar()"
            aria-label="Toggle sidebar"
          >
            <app-icon name="menu" [size]="20" />
          </button>

          <div class="hidden md:block">
            <div class="relative">
              <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <app-icon name="search" [size]="18" />
              </span>
              <input
                type="text"
                [placeholder]="t('appNav.searchPlaceholder')"
                class="h-10 w-[260px] rounded-lg border border-themed bg-gray-50 pl-10 pr-12 text-sm text-body placeholder-gray-400 outline-none focus:border-brand-300 focus-ring dark:bg-gray-900 xl:w-[360px]"
              />
              <kbd class="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-themed bg-white px-1.5 py-0.5 text-xs text-muted dark:bg-gray-900">⌘ K</kbd>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <app-language-switcher />
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-themed text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
            (click)="ui.toggleDarkMode()"
            aria-label="Toggle dark mode"
          >
            <app-icon [name]="ui.darkMode() ? 'sun' : 'moon'" [size]="18" />
          </button>

          <div class="relative" data-dropdown="notif">
            <button
              type="button"
              class="relative flex h-10 w-10 items-center justify-center rounded-full border border-themed text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="Notifications"
              (click)="notifOpen.set(!notifOpen())"
            >
              <app-icon name="bell" [size]="18" />
              <span class="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-error-400 opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-error-500"></span>
              </span>
            </button>
            @if (notifOpen()) {
              <div class="surface-card absolute right-0 mt-3 w-80 rounded-xl border shadow-theme-lg">
                <div class="flex items-center justify-between border-b border-themed px-4 py-3">
                  <p class="text-sm font-semibold text-heading">{{ t('appNav.notifications') }}</p>
                </div>
                <ul class="max-h-72 divide-y divide-themed overflow-y-auto">
                  @for (n of notifications; track n.id) {
                    <li class="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span [class]="'mt-1 flex h-2 w-2 shrink-0 rounded-full ' + (n.read ? 'bg-gray-300' : 'bg-brand-500')"></span>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-heading">{{ t('notifications.' + n.key, { name: n.name }) }}</p>
                        <p class="text-xs text-muted">{{ n.time }}</p>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>

          <div class="relative" data-dropdown="profile">
            <button type="button" class="ml-1 flex items-center gap-3" (click)="dropdownOpen.set(!dropdownOpen())">
              <span class="hidden text-right lg:block">
                <span class="block text-sm font-medium text-heading">{{ auth.user()?.name || 'Convidado' }}</span>
                <span class="block text-xs text-muted">{{ auth.user()?.role || '—' }}</span>
              </span>
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-semibold text-white">{{ initials() }}</span>
              <app-icon name="chevron-down" [size]="16" class="text-muted" />
            </button>

            @if (dropdownOpen()) {
              <div class="surface-card absolute right-0 mt-3 w-56 rounded-xl border shadow-theme-lg">
                <div class="border-b border-themed px-4 py-3">
                  <p class="text-sm font-medium text-heading">{{ auth.user()?.name || 'Convidado' }}</p>
                  <p class="text-xs text-muted">{{ auth.user()?.email || '' }}</p>
                </div>
                <ul class="py-1">
                  <li>
                    <a routerLink="/app/configuracoes" class="flex items-center gap-2 px-4 py-2 text-sm text-body hover:bg-gray-50 dark:hover:bg-gray-800" (click)="dropdownOpen.set(false)">
                      <app-icon name="settings" [size]="16" /> {{ t('appNav.settings') }}
                    </a>
                  </li>
                </ul>
                <div class="border-t border-themed py-1">
                  <button type="button" class="flex w-full items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10" (click)="handleLogout()">
                    <app-icon name="logout" [size]="16" /> {{ t('appNav.logout') }}
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class AppHeaderComponent {
  ui = inject(UiService);
  auth = inject(AuthService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  readonly notifications = NOTIFICATIONS;
  readonly dropdownOpen = signal(false);
  readonly notifOpen = signal(false);

  readonly initials = computed(() => {
    const user = this.auth.user();
    if (!user) return '?';
    return user.name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  });

  onToggleSidebar() {
    if (window.innerWidth < 1024) this.ui.toggleSidebarMobile();
    else this.ui.toggleSidebar();
  }

  handleLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.dropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as Node;
    const el = this.host.nativeElement as HTMLElement;
    const notif = el.querySelector('[data-dropdown="notif"]');
    const profile = el.querySelector('[data-dropdown="profile"]');
    if (notif && !notif.contains(target)) this.notifOpen.set(false);
    if (profile && !profile.contains(target)) this.dropdownOpen.set(false);
  }
}
