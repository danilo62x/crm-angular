import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { ApexOptions } from 'apexcharts';
import { AuthService } from '../../core/services/auth.service';
import { CrmService } from '../../core/services/crm.service';
import { REVENUE_SERIES, ACTIVITY_SERIES, SALES_RANKING } from '../../data/mock';
import { computeMetrics, pendingTasks, funnelByStage, isToday, contactName } from '../../data/query';
import { formatCurrency, formatCompact, fromNow } from '../../lib/format';
import { PageHeaderComponent } from '../../components/app/page-header.component';
import { StatsCardComponent } from '../../components/ui/stats-card.component';
import { ApexChartComponent } from '../../components/ui/apex-chart.component';
import { AvatarComponent } from '../../components/ui/avatar.component';
import { StagePillComponent } from '../../components/crm/stage-pill.component';
import { IconComponent } from '../../components/ui/icon-base.component';
import { usePageTitle } from '../../core/page-title';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoModule,
    PageHeaderComponent,
    StatsCardComponent,
    ApexChartComponent,
    AvatarComponent,
    StagePillComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t">
      <app-page-header [title]="t('dashboard.title')" [subtitle]="t('dashboard.welcome', { name: auth.user()?.name ?? '' })" />

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <app-stats-card [title]="t('dashboard.kpis.pipeline')" [value]="cur(m().pipelineValue)" icon="dollar" accent="brand" trend="up" trendValue="12%" />
        <app-stats-card [title]="t('dashboard.kpis.openDeals')" [value]="m().openDeals" icon="layers" accent="info" trend="up" trendValue="5%" />
        <app-stats-card [title]="t('dashboard.kpis.conversion')" [value]="m().conversionRate + '%'" icon="trending-up" accent="success" trend="up" trendValue="3%" />
        <app-stats-card [title]="t('dashboard.kpis.tasks')" [value]="tasks()" icon="check-circle" accent="warning" />
      </div>

      <div class="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div class="surface-card rounded-2xl border p-5 xl:col-span-2">
          <h3 class="text-base font-semibold text-heading">{{ t('dashboard.revenueTitle') }}</h3>
          <div class="mt-4">
            <app-apex-chart
              type="area"
              [height]="300"
              [series]="[
                { name: t('dashboard.revenueLegend.closed'), data: revenue.closed },
                { name: t('dashboard.revenueLegend.forecast'), data: revenue.forecast }
              ]"
              [options]="revenueOptions()"
            />
          </div>
        </div>

        <div class="surface-card rounded-2xl border p-5">
          <h3 class="text-base font-semibold text-heading">{{ t('dashboard.funnelTitle') }}</h3>
          <div class="mt-4">
            <app-apex-chart type="bar" [height]="300" [series]="[{ name: t('appNav.deals'), data: funnelCounts() }]" [options]="funnelOptions()" />
          </div>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div class="surface-card rounded-2xl border p-5 xl:col-span-2">
          <h3 class="text-base font-semibold text-heading">{{ t('dashboard.activityTitle') }}</h3>
          <div class="mt-4">
            <app-apex-chart
              type="bar"
              [height]="280"
              [series]="[
                { name: t('activities.types.call'), data: activity.calls },
                { name: t('activities.types.email'), data: activity.emails },
                { name: t('activities.types.meeting'), data: activity.meetings }
              ]"
              [options]="activityOptions()"
            />
          </div>
        </div>

        <div class="surface-card rounded-2xl border p-5">
          <h3 class="text-base font-semibold text-heading">{{ t('dashboard.rankingTitle') }}</h3>
          <ul class="mt-4 space-y-4">
            @for (rep of ranking; track rep.name; let i = $index) {
              <li class="flex items-center gap-3">
                <span class="text-sm font-bold text-muted">{{ i + 1 }}</span>
                <app-avatar [src]="rep.avatar" [name]="rep.name" size="sm" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-heading">{{ rep.name }}</p>
                  <p class="text-xs text-muted">{{ t('dashboard.dealsWon', { count: rep.deals }) }}</p>
                </div>
                <span class="text-sm font-semibold text-brand-600 dark:text-brand-400">{{ compact(rep.revenue) }}</span>
              </li>
            }
          </ul>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div class="surface-card rounded-2xl border p-5 xl:col-span-2">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-heading">{{ t('dashboard.recentDeals') }}</h3>
            <a routerLink="/app/negocios" class="text-sm font-medium text-brand-600 hover:text-brand-700">{{ t('common.viewAll') }}</a>
          </div>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-themed text-muted">
                  <th class="pb-2 pr-4 font-medium">{{ t('deals.columns.title') }}</th>
                  <th class="pb-2 pr-4 font-medium">{{ t('deals.columns.stage') }}</th>
                  <th class="pb-2 pr-4 font-medium">{{ t('deals.columns.contact') }}</th>
                  <th class="pb-2 text-right font-medium">{{ t('deals.columns.value') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (d of recentDeals(); track d.id) {
                  <tr class="border-b border-themed last:border-0">
                    <td class="py-3 pr-4 font-medium text-heading">{{ d.title }}</td>
                    <td class="py-3 pr-4"><app-stage-pill [stage]="d.stage" size="sm" /></td>
                    <td class="py-3 pr-4 text-muted">{{ contactLabel(d.contactId) }}</td>
                    <td class="py-3 text-right font-semibold text-heading">{{ cur(d.value) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="surface-card rounded-2xl border p-5">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-heading">{{ t('dashboard.todayTasks') }}</h3>
            <a routerLink="/app/atividades" class="text-sm font-medium text-brand-600 hover:text-brand-700">{{ t('common.viewAll') }}</a>
          </div>
          @if (todayTasks().length === 0) {
            <p class="mt-6 text-center text-sm text-muted">{{ t('dashboard.noTasks') }}</p>
          } @else {
            <ul class="mt-4 divide-y divide-themed">
              @for (a of todayTasks(); track a.id) {
                <li class="flex items-center gap-3 py-3">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                    <app-icon [name]="taskIcon(a.type)" [size]="15" />
                  </span>
                  <p class="flex-1 text-sm text-body">{{ a.title }}</p>
                  <span class="text-xs text-muted">{{ rel(a.date) }}</span>
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </ng-container>
  `,
})
export class DashboardPageComponent {
  auth = inject(AuthService);
  private crm = inject(CrmService);
  private transloco = inject(TranslocoService);
  private lang = signal(this.transloco.getActiveLang());

  readonly revenue = REVENUE_SERIES;
  readonly activity = ACTIVITY_SERIES;
  readonly ranking = SALES_RANKING;

  readonly m = computed(() => computeMetrics(this.crm.deals(), this.crm.activities()));
  readonly tasks = computed(() => pendingTasks(this.crm.activities()));
  readonly funnel = computed(() => funnelByStage(this.crm.deals()));
  readonly funnelCounts = computed(() => this.funnel().map((f) => f.count));
  readonly recentDeals = computed(() =>
    [...this.crm.deals()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5)
  );
  readonly todayTasks = computed(() =>
    this.crm.activities().filter((a) => isToday(a.date) && a.status === 'open').slice(0, 5)
  );

  readonly revenueOptions = computed<ApexOptions>(() => ({
    chart: { stacked: false },
    xaxis: { categories: this.revenue.categories },
    yaxis: { labels: { formatter: (v: number) => formatCompact(v, this.lang()) } },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    legend: { show: true, position: 'top' },
    colors: ['#12b76a', '#465fff'],
  }));

  readonly funnelOptions = computed<ApexOptions>(() => ({
    chart: { type: 'bar' },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true, barHeight: '60%' } },
    xaxis: { categories: this.funnel().map((f) => String(this.transloco.translate(`stages.${f.stage.nameKey}`))) },
    colors: this.funnel().map((f) => f.stage.color),
    legend: { show: false },
    dataLabels: { enabled: true },
  }));

  readonly activityOptions = computed<ApexOptions>(() => ({
    chart: { type: 'bar', stacked: true },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 3 } },
    xaxis: { categories: this.activity.categories },
    legend: { show: true, position: 'top' },
    colors: ['#465fff', '#0ba5ec', '#f79009'],
  }));

  constructor() {
    usePageTitle('dashboard.title');
    this.transloco.langChanges$.subscribe((l) => this.lang.set(l));
  }

  cur(v: number) {
    return formatCurrency(v, this.lang());
  }
  compact(v: number) {
    return formatCompact(v, this.lang());
  }
  rel(d: string) {
    return fromNow(d, this.lang());
  }
  contactLabel(id: number | null) {
    return contactName(this.crm.contacts(), id);
  }
  taskIcon(type: string) {
    return type === 'call' ? 'phone' : type === 'email' ? 'mail' : type === 'meeting' ? 'users' : 'check-circle';
  }
}
