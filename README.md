# Transnet PPE Management System

A Vue 3 + Vite POC for the Transnet PPE & Uniform Management System.

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Login Credentials

| Username    | Password       | Role                    |
|-------------|----------------|-------------------------|
| admin       | transnet2025   | System Administrator    |
| depot.jhb   | depot123       | Depot Manager – JHB     |

## Build for Production / Deploy

```bash
npm run build
```

This outputs a `dist/` folder. To deploy to Netlify:

1. Run `npm run build`
2. Drag the `dist/` folder to https://app.netlify.com/drop
3. Netlify gives you a live URL immediately (e.g. `https://transnet-ppe.netlify.app`)

To set a custom subdomain: Site settings → Domain management → Options → Edit site name.

## Tech Stack

- **Vue 3** (Composition API + `<script setup>`)
- **Vue Router 4** (history mode — clean URLs, no `.html`)
- **Pinia** (state management)
- **Vite** (build tool)
- **JsBarcode** (barcode generation)
- **Font Awesome 6** (icons)

## Project Structure

```
src/
├── assets/       # Global CSS
├── components/   # Reusable components
│   ├── AppLayout.vue
│   ├── BarcodeDisplay.vue
│   ├── BarcodeViewerModal.vue
│   ├── GrnModal.vue
│   ├── IssueItemModal.vue
│   └── ScannerModal.vue
├── stores/       # Pinia stores
│   ├── auth.js
│   └── ppe.js
├── views/        # Page components
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── EmployeesView.vue
│   ├── EmployeeDetailView.vue
│   ├── InventoryView.vue
│   └── CatalogueView.vue
├── router/       # Vue Router
├── data.js       # Mock data & seed data
└── main.js
```
