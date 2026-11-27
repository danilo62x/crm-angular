# CRM / Angular

[Read in English](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Free](https://img.shields.io/badge/price-free-brightgreen)

CRM completo em Angular 19 + Tailwind: dashboard com KPIs e gráficos, pipeline Kanban de negócios (drag-and-drop), contatos, empresas, atividades/tarefas, relatórios e configurações. i18n pt-BR/en/es, PWA, dark mode.

## Destaques

- Dashboard com KPIs e gráficos (funil, receita, atividades)
- Pipeline Kanban de negócios com drag-and-drop
- Contatos e empresas (tabela, filtros, detalhe com timeline)
- Atividades/tarefas + relatórios
- i18n pt-BR/en/es, PWA, dark mode

## Telas em destaque

- Dashboard: KPIs, funil, receita, atividades
- Pipeline: Kanban de negócios (drag-and-drop)
- Contatos: Tabela, filtros, detalhe
- Relatórios: Conversão e desempenho

## Stack

- Angular 19
- TypeScript
- Tailwind CSS v4
- Transloco
- ApexCharts
- RxJS

## Requisitos

- Node.js 20 ou mais novo, com npm

## Como rodar

```bash
npm install
npm run dev
```

O servidor de desenvolvimento mostra a URL local para abrir.

Conta de demonstração:

- `admin@crm.com` / `demo123`

## Build de produção

```bash
npm run build
```

Gera o pacote de produção em `dist/`; para conferir localmente, `npm run preview`. Qualquer hospedagem estática serve; para as rotas no cliente, redirecione caminhos desconhecidos para `index.html`.

## Estrutura do projeto

```
src/app/
├── components/  app, crm, layout, ui
├── core/  guards, services
├── data/
├── lib/
├── pages/  app, public
```

## Outras tecnologias

Este template também existe em outras 4 tecnologias, com as mesmas telas e a mesma identidade visual. Todas são gratuitas:

- React 19: https://github.com/danilo62x/crm-react
- Vue 3: https://github.com/danilo62x/crm-vue3
- Laravel 11: https://github.com/danilo62x/crm-laravel
- HTML estático: https://github.com/danilo62x/crm-html

Mais templates gratuitos (painéis admin, sistemas por segmento e apps Flutter): https://github.com/danilo62x?tab=repositories

## Licença

[MIT](./LICENSE), copyright 2026 Danilo Quinelato.
