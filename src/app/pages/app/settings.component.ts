import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';
import { STAGES, OWNERS } from '../../data/stages';
import { TEAM_AVATARS } from '../../data/mock';
import { PageHeaderComponent } from '../../components/app/page-header.component';
import { TabsComponent } from '../../components/ui/tabs.component';
import { AvatarComponent } from '../../components/ui/avatar.component';
import { BadgeComponent } from '../../components/ui/badge.component';
import { SwitchToggleComponent } from '../../components/ui/switch-toggle.component';
import { FormFieldComponent } from '../../components/ui/form-field.component';
import { usePageTitle } from '../../core/page-title';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    PageHeaderComponent,
    TabsComponent,
    AvatarComponent,
    BadgeComponent,
    SwitchToggleComponent,
    FormFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      <app-page-header [title]="t('settings.title')" [subtitle]="t('settings.subtitle')" />
      <div class="surface-card rounded-2xl border p-6">
        <app-tabs
          [tabs]="[
            { label: t('settings.tabs.profile'), icon: 'user' },
            { label: t('settings.tabs.account'), icon: 'lock' },
            { label: t('settings.tabs.team'), icon: 'users' },
            { label: t('settings.tabs.pipeline'), icon: 'layers' },
            { label: t('settings.tabs.notifications'), icon: 'bell' }
          ]"
          [value]="tab()"
          (onChange)="tab.set($event)"
        >
          @switch (tab()) {
            @case (0) {
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="max-w-xl space-y-4">
                <div class="flex items-center gap-4">
                  <app-avatar [name]="auth.user()?.name" size="lg" />
                  <button type="button" class="rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body hover:bg-gray-50 dark:hover:bg-gray-800">{{ t('settings.profile.changePhoto') }}</button>
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                  <app-form-field [control]="pfc('name')" name="name" [label]="t('settings.profile.name')" />
                  <app-form-field [control]="pfc('email')" name="email" [label]="t('settings.profile.email')" type="email" />
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                  <app-form-field [control]="pfc('role')" name="role" [label]="t('settings.profile.role')" />
                  <app-form-field [control]="pfc('company')" name="company" [label]="t('settings.profile.company')" />
                </div>
                <button type="submit" class="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">{{ t('settings.profile.save') }}</button>
              </form>
            }
            @case (1) {
              <form [formGroup]="accountForm" (ngSubmit)="saveAccount()" class="max-w-xl space-y-4">
                <app-form-field [control]="afc('current')" name="current" [label]="t('settings.account.current')" type="password" />
                <div class="grid gap-4 sm:grid-cols-2">
                  <app-form-field [control]="afc('next')" name="next" [label]="t('settings.account.new')" type="password" />
                  <app-form-field [control]="afc('confirm')" name="confirm" [label]="t('settings.account.confirm')" type="password" />
                </div>
                <button type="submit" class="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">{{ t('settings.account.update') }}</button>
                <div class="mt-6 rounded-xl border border-error-200 p-5 dark:border-error-500/30">
                  <h4 class="text-sm font-semibold text-error-600">{{ t('settings.account.dangerTitle') }}</h4>
                  <p class="mt-1 text-sm text-muted">{{ t('settings.account.dangerDesc') }}</p>
                  <button type="button" class="mt-3 rounded-lg border border-error-300 px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10">{{ t('settings.account.deleteAccount') }}</button>
                </div>
              </form>
            }
            @case (2) {
              <div>
                <ul class="divide-y divide-themed">
                  @for (o of owners; track o; let i = $index) {
                    <li class="flex items-center gap-3 py-3">
                      <app-avatar [src]="teamAvatars[i % teamAvatars.length]" [name]="o" size="sm" />
                      <div class="flex-1">
                        <p class="text-sm font-medium text-heading">{{ o }}</p>
                        <p class="text-xs text-muted">{{ teamEmail(o) }}</p>
                      </div>
                      <app-badge [color]="i === 0 ? 'brand' : 'gray'">{{ i === 0 ? t('settings.team.admin') : t('settings.team.member') }}</app-badge>
                    </li>
                  }
                </ul>
                <button type="button" class="mt-4 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">{{ t('settings.team.invite') }}</button>
              </div>
            }
            @case (3) {
              <div>
                <p class="mb-4 text-sm text-muted">{{ t('settings.pipeline.desc') }}</p>
                <ul class="space-y-2">
                  @for (s of stages; track s.id) {
                    <li class="flex items-center gap-3 rounded-xl border border-themed p-3">
                      <span class="h-3 w-3 rounded-full" [style.backgroundColor]="s.color"></span>
                      <span class="flex-1 text-sm font-medium text-heading">{{ t('stages.' + s.nameKey) }}</span>
                      <span class="text-xs text-muted">{{ t('settings.pipeline.probability') }}: {{ s.probability }}%</span>
                    </li>
                  }
                </ul>
              </div>
            }
            @case (4) {
              <div class="max-w-xl">
                @for (row of notifRows; track row.k) {
                  <div class="flex items-center justify-between border-b border-themed py-4 last:border-0">
                    <div>
                      <p class="text-sm font-medium text-heading">{{ t('settings.notifications.' + row.k) }}</p>
                      <p class="text-xs text-muted">{{ t('settings.notifications.' + row.k + 'Desc') }}</p>
                    </div>
                    <app-switch-toggle [checked]="notif()[row.k]" (changed)="setNotif(row.k, $event)" />
                  </div>
                }
                <button type="button" (click)="saveNotifications()" class="mt-5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">{{ t('common.save') }}</button>
              </div>
            }
          }
        </app-tabs>
      </div>
    </ng-container>
  `,
})
export class SettingsPageComponent {
  auth = inject(AuthService);
  private ui = inject(UiService);
  private transloco = inject(TranslocoService);
  private fb = inject(FormBuilder);

  readonly tab = signal(0);
  readonly owners = OWNERS;
  readonly stages = STAGES;
  readonly teamAvatars = TEAM_AVATARS;
  readonly notifRows = [{ k: 'email' as const }, { k: 'push' as const }, { k: 'deals' as const }, { k: 'tasks' as const }];

  readonly notif = signal<Record<string, boolean>>({ email: true, push: false, deals: true, tasks: true });

  profileForm: FormGroup = this.fb.group({
    name: [this.auth.user()?.name ?? ''],
    email: [this.auth.user()?.email ?? ''],
    role: [this.auth.user()?.role ?? ''],
    company: [this.auth.user()?.company ?? ''],
  });

  accountForm: FormGroup = this.fb.group({ current: [''], next: [''], confirm: [''] });

  constructor() {
    usePageTitle('settings.title');
  }

  pfc(name: string) {
    return this.profileForm.get(name) as any;
  }
  afc(name: string) {
    return this.accountForm.get(name) as any;
  }
  teamEmail(o: string) {
    return o.toLowerCase().replace(' ', '.') + '@nimbuscrm.com';
  }
  setNotif(k: string, v: boolean) {
    this.notif.update((n) => ({ ...n, [k]: v }));
  }
  saveProfile() {
    this.auth.updateProfile(this.profileForm.value);
    this.ui.notifySuccess(this.transloco.translate('settings.profile.saved'));
  }
  saveAccount() {
    this.ui.notifySuccess(this.transloco.translate('settings.account.updated'));
    this.accountForm.reset({ current: '', next: '', confirm: '' });
  }
  saveNotifications() {
    this.ui.notifySuccess(this.transloco.translate('settings.notifications.saved'));
  }
}
