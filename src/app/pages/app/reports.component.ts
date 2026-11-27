import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { ApexOptions } from 'apexcharts';
import { CrmService } from '../../core/services/crm.service';
import { REVENUE_SERIES, SALES_RANKING } from '../../data/mock';
import { funnelByStage } from '../../data/query';
import { formatCompact, formatCurrency } from '../../lib/format';
import { OWNERS } from '../../data/stages';
import { PageHeaderComponent } from '../../components/app/page-header.component';
import { ApexChartComponent } from '../../components/ui/apex-chart.component';
import { usePageTitle } from '../../core/page-title';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [FormsModule, TranslocoModule, PageHeaderComponent, ApexChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      <app-page-header [title]="t('reports.title')" [subtitle]="t('reports.subtitle')" />

      <div class="mb-5 flex flex-wrap gap-3">
        <select [(ngModel)]="period" (ngModelChange)="periodS.set($event)" [class]="selectCls">
          <option value="3m">{{ t('reports.periods.3m') }}</option>
          <option value="6m">{{ t('reports.periods.6m') }}</option>
        </select>
        <select [(ngModel)]="owner" (ngModelChange)="ownerS.set($event)" [class]="selectCls">
          <option value="">{{ t('reports.allReps') }}</option>
          @for (o of owners; track o) {
            <option [value]="o">{{ o }}</option>
          }
        </select>
      </div>

      <div class="grid gap-5 xl:grid-cols-2">
        <div class="surface-card rounded-2xl border p-5">
          <h3 class="text-base font-semibold text-heading">{{ t('reports.conversionTitle') }}</h3>
          <div class="mt-4">
            <app-apex-chart type="bar" [height]="300" [series]="[{ name: t('appNav.deals'), data: funnelCounts() }]" [options]="conversionOptions()" />
          </div>
        </div>

        <div class="surface-card rounded-2xl border p-5">
          <h3 class="text-base font-semibold text-heading">{{ t('reports.revenueTitle') }}</h3>
          <div class="mt-4">
            <app-apex-chart type="bar" [height]="300" [series]="[{ name: t('reports.revenueTitle'), data: revenueData() }]" [options]="revenueOptions()" />
          </div>
        </div>

        <div class="surface-card rounded-2xl border p-5 xl:col-span-2">
          <h3 class="text-base font-semibold text-heading">{{ t('reports.repTitle') }}</h3>
          <div class="mt-4">
            <app-apex-chart type="bar" [height]="300" [series]="[{ name: t('reports.repTitle'), data: repData }]" [options]="repOptions()" />
          </div>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-themed text-muted">
                  <th class="pb-2 pr-4 font-medium">{{ t('reports.repColumns.name') }}</th>
                  <th class="pb-2 pr-4 font-medium">{{ t('reports.repColumns.deals') }}</th>
                  <th class="pb-2 text-right font-medium">{{ t('reports.repColumns.revenue') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (r of ranking; track r.name) {
                  <tr class="border-b border-themed last:border-0">
                    <td class="py-3 pr-4 font-medium text-heading">{{ r.name }}</td>
                    <td class="py-3 pr-4 text-muted">{{ r.deals }}</td>
                    <td class="py-3 text-right font-semibold text-heading">{{ cur(r.revenue) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ng-container>
  `,
})
export class ReportsPageComponent {
  private crm = inject(CrmService);
  private transloco = inject(TranslocoService);
  private lang = signal(this.transloco.getActiveLang());

  readonly owners = OWNERS;
  readonly ranking = SALES_RANKING;
  readonly repData = SALES_RANKING.map((r) => r.revenue);
  readonly selectCls = 'h-10 rounded-lg border border-themed surface-card px-3 text-sm text-body focus-ring';

  period = '6m';
  owner = '';
  readonly periodS = signal('6m');
  readonly ownerS = signal('');

  private scoped = computed(() => {
    const o = this.ownerS();
    return o ? this.crm.deals().filter((d) => d.owner === o) : this.crm.deals();
  });
  private funnel = computed(() => funnelByStage(this.scoped()));
  readonly funnelCounts = computed(() => this.funnel().map((f) => f.count));
  private months = computed(() => (this.periodS() === '3m' ? 3 : 6));
  readonly revenueData = computed(() => REVENUE_SERIES.closed.slice(-this.months()));

  readonly conversionOptions = computed<ApexOptions>(() => ({
    chart: { type: 'bar' },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true, barHeight: '55%' } },
    xaxis: { categories: this.funnel().map((f) => String(this.transloco.translate(`stages.${f.stage.nameKey}`))) },
    colors: this.funnel().map((f) => f.stage.color),
    legend: { show: false },
    dataLabels: { enabled: true, formatter: (v: number) => `${v}` },
  }));

  readonly revenueOptions = computed<ApexOptions>(() => ({
    chart: { type: 'bar' },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 4 } },
    xaxis: { categories: REVENUE_SERIES.categories.slice(-this.months()) },
    yaxis: { labels: { formatter: (v: number) => formatCompact(v, this.lang()) } },
    colors: ['#465fff'],
  }));

  readonly repOptions = computed<ApexOptions>(() => ({
    chart: { type: 'bar' },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 4, distributed: true } },
    xaxis: { categories: SALES_RANKING.map((r) => r.name.split(' ')[0]) },
    yaxis: { labels: { formatter: (v: number) => formatCompact(v, this.lang()) } },
    colors: ['#465fff', '#12b76a', '#f79009', '#0ba5ec'],
    legend: { show: false },
  }));

  constructor() {
    usePageTitle('reports.title');
    this.transloco.langChanges$.subscribe((l) => this.lang.set(l));
  }

  cur(v: number) {
    return formatCurrency(v, this.lang());
  }
}
