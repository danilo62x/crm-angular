# CRM / Angular

[Leia em português](./README.pt-BR.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Free](https://img.shields.io/badge/price-free-brightgreen)

A full CRM: dashboard with KPIs and charts, a drag-and-drop Kanban deal pipeline, contacts, companies, activities and tasks, reports and settings.

Everything runs on mock data, so no backend, external API or service is needed.

## Highlights

- Internationalisation in Portuguese (pt-BR), English and Spanish
- Installable PWA
- Light and dark themes
- Responsive layout from phone to desktop
- Mock data in Portuguese (Brazil), easy to replace with a real API

## Tech stack

- Angular 19
- TypeScript
- Tailwind CSS v4
- Transloco
- ApexCharts
- RxJS

## Requirements

- Node.js 20 or newer and npm

## Getting started

```bash
npm install
npm run dev
```

The dev server prints the local URL to open.

Demo account:

- `admin@crm.com` / `demo123`

## Build for production

```bash
npm run build
```

Writes the production bundle to `dist/`; preview it locally with `npm run preview`. Any static host works; for client-side routes, point unknown paths to `index.html`.

## Project structure

```
src/app/
├── components/  app, crm, layout, ui
├── core/  guards, services
├── data/
├── lib/
├── pages/  app, public
```

## Other stacks

This template also exists in 4 other stacks, with the same screens and visual identity. All of them are free:

- React 19: https://github.com/danilo62x/crm-react
- Vue 3: https://github.com/danilo62x/crm-vue3
- Laravel 11: https://github.com/danilo62x/crm-laravel
- Static HTML: https://github.com/danilo62x/crm-html

More free templates (admin dashboards, vertical systems and Flutter apps): https://github.com/danilo62x?tab=repositories

## License

[MIT](./LICENSE), copyright 2026 Danilo Quinelato.
