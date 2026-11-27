import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UiService } from '../../core/services/ui.service';
import { FormFieldComponent } from '../../components/ui/form-field.component';
import { IconComponent } from '../../components/ui/icon-base.component';
import { usePageTitle } from '../../core/page-title';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoModule, FormFieldComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *transloco="let t" class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <h1 class="text-3xl font-bold text-heading sm:text-4xl">{{ t('contact.title') }}</h1>
        <p class="mt-3 text-muted">{{ t('contact.subtitle') }}</p>
      </div>

      <div class="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div class="space-y-4">
          @for (i of info; track i.label) {
            <div class="surface-card flex items-start gap-4 rounded-2xl border p-5">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                <app-icon [name]="i.icon" [size]="20" />
              </span>
              <div>
                <p class="text-sm font-medium text-heading">{{ t(i.label) }}</p>
                <p class="mt-0.5 text-sm text-muted">{{ i.value.startsWith('contact.') ? t(i.value) : i.value }}</p>
              </div>
            </div>
          }
        </div>

        <div class="surface-card rounded-2xl border p-6 md:p-8">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div class="grid gap-5 sm:grid-cols-2">
              <app-form-field [control]="fc('name')" name="name" [label]="t('contact.form.name')" placeholder="Maria Silva" [errorText]="t('contact.form.errors.name')" />
              <app-form-field [control]="fc('email')" name="email" [label]="t('contact.form.email')" type="email" placeholder="seu@email.com" [errorText]="t('contact.form.errors.email')" />
            </div>
            <app-form-field [control]="fc('subject')" name="subject" [label]="t('contact.form.subject')" [placeholder]="t('contact.form.subject')" [errorText]="t('contact.form.errors.subject')" />
            <app-form-field [control]="fc('message')" name="message" [label]="t('contact.form.message')" control-type="textarea" [rows]="5" [placeholder]="t('contact.form.message')" [errorText]="t('contact.form.errors.message')" />
            <button
              type="submit"
              [disabled]="submitting()"
              class="flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600 focus-ring disabled:opacity-60"
            >
              {{ submitting() ? t('contact.form.sending') : t('contact.form.send') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ContactPageComponent {
  private ui = inject(UiService);
  private transloco = inject(TranslocoService);
  private fb = inject(FormBuilder);

  readonly submitting = signal(false);

  readonly info = [
    { icon: 'mail', label: 'contact.info.email', value: 'vendas@nimbuscrm.com' },
    { icon: 'phone', label: 'contact.info.phone', value: '+55 11 4000-1234' },
    { icon: 'map-pin', label: 'contact.info.address', value: 'contact.info.addressValue' },
  ];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    usePageTitle('contact.title');
  }

  fc(name: string) {
    return this.form.get(name) as any;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    setTimeout(() => {
      this.ui.notifySuccess(this.transloco.translate('contact.form.success'));
      this.form.reset({ name: '', email: '', subject: '', message: '' });
      this.submitting.set(false);
    }, 500);
  }
}
