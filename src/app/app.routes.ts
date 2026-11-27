import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth (blank layout) — matched before the layout shells
  { path: 'login', loadComponent: () => import('./pages/public/login.component').then((m) => m.LoginPageComponent) },
  { path: 'registro', loadComponent: () => import('./pages/public/register.component').then((m) => m.RegisterPageComponent) },
  { path: 'esqueci-senha', loadComponent: () => import('./pages/public/forgot-password.component').then((m) => m.ForgotPasswordPageComponent) },

  // App (guarded, sidebar layout)
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./components/layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./pages/app/dashboard.component').then((m) => m.DashboardPageComponent) },
      { path: 'pipeline', loadComponent: () => import('./pages/app/pipeline.component').then((m) => m.PipelinePageComponent) },
      { path: 'contatos', loadComponent: () => import('./pages/app/contacts.component').then((m) => m.ContactsPageComponent) },
      { path: 'contatos/:id', loadComponent: () => import('./pages/app/contact-detail.component').then((m) => m.ContactDetailPageComponent) },
      { path: 'empresas', loadComponent: () => import('./pages/app/companies.component').then((m) => m.CompaniesPageComponent) },
      { path: 'negocios', loadComponent: () => import('./pages/app/deals.component').then((m) => m.DealsPageComponent) },
      { path: 'atividades', loadComponent: () => import('./pages/app/activities.component').then((m) => m.ActivitiesPageComponent) },
      { path: 'relatorios', loadComponent: () => import('./pages/app/reports.component').then((m) => m.ReportsPageComponent) },
      { path: 'configuracoes', loadComponent: () => import('./pages/app/settings.component').then((m) => m.SettingsPageComponent) },
    ],
  },

  // Public site (navbar + footer)
  {
    path: '',
    loadComponent: () => import('./components/layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./pages/public/landing.component').then((m) => m.LandingPageComponent) },
      { path: 'contato', loadComponent: () => import('./pages/public/contact.component').then((m) => m.ContactPageComponent) },
    ],
  },

  // 404
  { path: '**', loadComponent: () => import('./pages/app/not-found.component').then((m) => m.NotFoundPageComponent) },
];
