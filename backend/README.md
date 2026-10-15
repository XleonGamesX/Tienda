# TIENDA — Backend (API REST)

API de la tienda hecha con **Node.js + Express + Mongoose**, con persistencia
en **MongoDB Atlas**. Es la única fuente de verdad de los datos: el frontend
ya no guarda nada en `localStorage`.

## Estructura

```
backend/
├── .env.example          # plantilla de configuración (cópiala como .env)
├── src/
│   ├── server.js         # ENTRADA: lee .env, conecta a Atlas, levanta Express
│   ├── app.js            # Express: CORS, JSON, rutas, frontend estático, 404 y errores
│   ├── config/db.js      # conexión con mongoose
│   ├── models/           # esquemas e índices únicos
│   ├── validations/      # reglas de negocio del body (lanzan error 400)
│   ├── controllers/      # lógica de cada endpoint
│   ├── routes/           # mapa de URLs → controllers
│   ├── middleware/       # errorHandler (todo error → JSON con su código)
│   └── utils/ApiError.js # error con código HTTP (400, 404, 409...)
└── scripts/
    └── verificar-api.mjs # prueba de punta a punta con axios
```

**Responsabilidades** (en este orden fluye cada petición):

`routes` → `validations` → `controller` → `models` → `errorHandler`

## Arranque

```bash
cp .env.example .env      # y completa tu MONGODB_URI de Atlas
npm install
npm run dev               # http://localhost:3000 (con auto-reinicio)
npm run verificar         # prueba la API de punta a punta (debe estar corriendo)
```

Al arrancar imprime la IP de la red local, por si quieres abrir la app desde
otro dispositivo del mismo Wi-Fi.

**En producción** (`npm start`, p. ej. en Render) el servidor escucha en
`0.0.0.0` y, además de la API, entrega el build del frontend
(`../frontend/dist`): una sola URL para toda la app. Ver
[`../README.md`](../README.md) → "Despliegue (Render)".

## Formato de respuestas

- Éxito: `{ "ok": true, "datos": ... }`
- Error: `{ "ok": false, "mensaje": "texto entendible" }` con su código HTTP
  (400 validación, 404 no existe, 409 conflicto, 500 interno).

## Endpoints

### Categorías

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categorias` | lista ordenada por nombre |
| GET | `/api/categorias/:id` | una categoría |
| POST | `/api/categorias` | crea (`{ nombre }`) |
| PUT | `/api/categorias/:id` | actualiza (`{ nombre }`) |
| DELETE | `/api/categorias/:id` | elimina; **409** si tiene productos asociados |

### Proveedores

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/proveedores` | lista ordenada por nombre |
| GET | `/api/proveedores/:id` | uno por **UUID** |
| POST | `/api/proveedores` | crea (`{ nombre, telefono, email, direccion }`) |
| PUT | `/api/proveedores/:id` | actualiza |
| DELETE | `/api/proveedores/:id` | elimina; **409** si tiene productos asociados |

> **Identificador único**: el `_id` de un proveedor es un **UUID** generado por
> el servidor (`crypto.randomUUID()`), no un número consecutivo. El nombre es
> único aunque cambie la combinación de mayúsculas (índice con collation `es`).

### Productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | lista ordenada por código |
| GET | `/api/productos/:id` | un producto |
| POST | `/api/productos` | crea; si no trae `codigo`, se autogenera `PRD-###` |
| PUT | `/api/productos/:id` | actualiza (el `codigo` nunca cambia) |
| DELETE | `/api/productos/:id` | elimina |

Cuerpo de un producto:

```json
{
  "nombre": "Arroz 1 kg",
  "categoriaId": "665f... (ObjectId o vacío)",
  "proveedorId": "b3f1c2... (UUID o vacío)",
  "precioCompra": 3500,
  "precioVenta": 5000,
  "cantidad": 25,
  "stockMinimo": 8
}
```

### Movimientos de inventario

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/movimientos` | lista (filtro opcional `?productoId=...`) |
| GET | `/api/movimientos/:id` | un movimiento |
| POST | `/api/movimientos` | registra y actualiza el stock |

```json
{ "productoId": "665f...", "tipo": "entrada", "cantidad": 10 }
```

- `entrada`: suma stock (cantidad > 0).
- `salida`: resta stock (cantidad > 0); **400** si no alcanza. La condición es
  atómica, así que dos salidas simultáneas nunca dejan el stock negativo.
- `ajuste`: fija el stock final (cantidad >= 0).
- Si la creación del movimiento falla, el stock aplicado se revierte.

## Reglas de negocio (resumen)

- Campos obligatorios: nombre de categoría; los 4 del proveedor; nombre,
  precios, stock y stock mínimo del producto; producto y cantidad del movimiento.
- Precios, stock y stock mínimo deben ser números **>= 0** (stock negativo jamás).
- Nombres duplicados (categoría y proveedor) → **409**.
- Código de producto duplicado → **409**.
- Referencia a categoría/proveedor inexistente al crear o editar un producto → **400**.
