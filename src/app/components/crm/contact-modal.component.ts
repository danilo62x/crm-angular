import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CrmService } from '../../core/services/crm.service';
import { UiService } from '../../core/services/ui.service';
import { OWNERS } from '../../data/stages';
import { ModalComponent } from '../ui/modal.component';
import { FormFieldComponent } from '../ui/form-field.component';
import type { Contact, ContactStatus } from '../../data/types';

const STATUSES: ContactStatus[] = ['lead', 'active', 'customer', 'inactive'];

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoModule, ModalComponent, FormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      *transloco="let t"
      [open]="open"
      (closed)="close.emit()"
      [title]="editing() ? t('contacts.editTitle') : t('contacts.newTitle')"
      size="lg"
    >
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field
            [control]="fc('name')"
            name="name"
            [label]="t('contacts.columns.name')"
            placeholder="Maria Silva"
            [errorText]="t('contacts.errors.name')"
          />
          <app-form-field
            [control]="fc('email')"
            name="email"
            [label]="t('contacts.columns.email')"
            type="email"
            placeholder="maria@empresa.com"
            [errorText]="t('contacts.errors.email')"
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field [control]="fc('phone')" name="phone" [label]="t('contacts.columns.phone')" placeholder="+55 11 90000-0000" />
          <app-form-field [control]="fc('title')" name="title" [label]="t('contacts.columns.title')" [placeholder]="t('contacts.columns.title')" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field [control]="fc('companyId')" name="companyId" [label]="t('contacts.columns.company')" control-type="select">
            <option value="">—</option>
            @for (c of crm.companies(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </app-form-field>
          <app-form-field [control]="fc('owner')" name="owner" [label]="t('contacts.columns.owner')" control-type="select">
            @for (o of owners; track o) {
              <option [value]="o">{{ o }}</option>
            }
          </app-form-field>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field [control]="fc('status')" name="status" [label]="t('contacts.columns.status')" control-type="select">
            @for (s of statuses; track s) {
              <option [value]="s">{{ t('contacts.statuses.' + s) }}</option>
            }
          </app-form-field>
          <app-form-field [control]="fc('tags')" name="tags" [label]="t('contacts.tagsLabel')" [hint]="t('contacts.tagsHint')" placeholder="vip, hot" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" (click)="close.emit()" class="rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body hover:bg-gray-50 dark:hover:bg-gray-800">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            {{ t('common.save') }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class ContactModalComponent {
  crm = inject(CrmService);
  private ui = inject(UiService);
  private transloco = inject(TranslocoService);
  private fb = inject(FormBuilder);

  readonly owners = OWNERS;
  readonly statuses = STATUSES;

  @Input() open = false;
  @Input() set contact(v: Contact | null | undefined) {
    this._contact.set(v ?? null);
    this.reset();
  }
  private _contact = signal<Contact | null>(null);
  readonly editing = computed(() => this._contact() !== null);

  @Output() close = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    title: [''],
    companyId: [''],
    owner: [OWNERS[0]],
    status: ['lead'],
    tags: [''],
  });

  fc(name: string) {
    return this.form.get(name) as any;
  }

  private reset() {
    const c = this._contact();
    this.form.reset({
      name: c?.name ?? '',
      email: c?.email ?? '',
      phone: c?.phone ?? '',
      title: c?.title ?? '',
      companyId: c?.companyId != null ? String(c.companyId) : '',
      owner: c?.owner ?? OWNERS[0],
      status: c?.status ?? 'lead',
      tags: c?.tags.join(', ') ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const tags = String(v.tags)
      .split(',')
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean);
    const payload = {
      name: v.name,
      email: v.email,
      phone: v.phone,
      title: v.title,
      companyId: v.companyId ? Number(v.companyId) : null,
      owner: v.owner,
      status: v.status as ContactStatus,
      tags,
    };
    const c = this._contact();
    if (this.editing() && c) {
      this.crm.updateContact(c.id, payload);
      this.ui.notifySuccess(this.transloco.translate('contacts.updated'));
    } else {
      this.crm.addContact(payload);
      this.ui.notifySuccess(this.transloco.translate('contacts.created'));
    }
    this.close.emit();
  }
}
