import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';

const BASE = 'CRM — Vendas & Contatos';

/**
 * Sets the document title to "<translated titleKey> · <base>" and keeps it in
 * sync with the active language. Call from a component constructor / injection
 * context. Pass no key to use just the base title.
 */
export function usePageTitle(titleKey?: string) {
  const transloco = inject(TranslocoService);
  const destroyRef = inject(DestroyRef);

  const apply = () => {
    const title = titleKey ? transloco.translate(titleKey) : '';
    document.title = title ? `${title} · ${BASE}` : BASE;
  };

  apply();
  transloco.langChanges$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => apply());
}

/** Sets a literal (already-resolved) title string. */
export function setLiteralTitle(title: string) {
  document.title = title ? `${title} · ${BASE}` : BASE;
}
