# TIENDA — SENA Market

Software de gestión de inventario para tienda, dividido en dos partes:

```
TIENDA/
├── frontend/   # Vue 3 + Vite + Pinia + Quasar (la interfaz)
├── backend/    # API REST en Node.js + Express + Mongoose (MongoDB Atlas)
├── .gitignore
└── REQUERIMIENTOS TIENDA.docx   # requisitos del proyecto
```

## Cómo ejecutar

Necesitas Node.js 18+ (probado con Node 24).

### 1. Backend (`backend/`)

```bash
cd backend
cp .env.example .env      # Windows: copia el archivo y renómbralo
#   edita .env y pega tu MONGODB_URI de MongoDB Atlas
npm install
npm run dev               # http://localhost:3000
```

Comprobación rápida: abre <http://localhost:3000/api/salud> y debe responder
`{"ok":true,"mensaje":"API de la tienda funcionando."}`.

### 2. Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

El frontend habla con la API en `http://localhost:3000/api` (configurable con
la variable `VITE_API_URL`).

## Documentación

- [`frontend/README.md`](./frontend/README.md): pantallas, stack y decisiones de la interfaz.
- [`frontend/ANALISIS_ESTRUCTURA.md`](./frontend/ANALISIS_ESTRUCTURA.md): documento vivo con fases y pendientes.
- [`backend/README.md`](./backend/README.md): endpoints y estructura de la API.
