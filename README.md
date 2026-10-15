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

Necesitas Node.js 20+ (probado con Node 24).

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

Al arrancar imprime también la IP de la red local, por si quieres abrir la
app desde otro dispositivo del mismo Wi-Fi (`http://192.168.x.x:3000`).

### 2. Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

El frontend llama a `/api` (**misma URL que la página**, nunca `localhost`
fijo): en desarrollo Vite hace de proxy hacia `http://localhost:3000`, y en
producción la sirve el propio backend. Sólo si la API viviera en otro
dominio se definiría `VITE_API_URL`.

> Desde la raíz también puedes usar `npm run dev:backend` y
> `npm run dev:frontend`.

## Despliegue (Render)

Todo se despliega como **un solo servicio**: Express entrega la API
(`/api/...`) y el build del frontend (`frontend/dist`) en la misma URL, así
que no hay CORS ni configuración extra del frontend.

1. Sube los cambios a GitHub (rama `main`).
2. En Render: **New + → Web Service** → conecta el repositorio
   `XleonGamesX/Tienda`.
3. Configura:
   - **Runtime:** Node
   - **Root Directory:** vacío (la raíz del repo)
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. **Environment → Add Environment Variable:** `MONGODB_URI` con tu cadena
   de MongoDB Atlas.
5. **Create Web Service** y espera el primer deploy.
6. Abre la URL asignada (`https://tu-app.onrender.com`): ya carga desde
   cualquier red.

Notas importantes:

- **MongoDB Atlas → Network Access** debe permitir `0.0.0.0/0`; si sólo
  permite tu IP local, Render no podrá conectar y el deploy falla.
- El **plan gratuito duerme** el servicio tras 15 min sin peticiones: el
  primer request de cada rato tarda ~40-60 s.
- Cada `git push` a `main` vuelve a desplegar automáticamente.
- Las variables del `backend/.env` **no** se suben al repo (están en
  `.gitignore`); en Render van en Environment Variables.

## Documentación

- [`frontend/README.md`](./frontend/README.md): pantallas, stack y decisiones de la interfaz.
- [`frontend/ANALISIS_ESTRUCTURA.md`](./frontend/ANALISIS_ESTRUCTURA.md): documento vivo con fases y pendientes.
- [`backend/README.md`](./backend/README.md): endpoints y estructura de la API.
