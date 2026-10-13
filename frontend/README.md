# TIENDA — SENA Market (frontend)

Aplicación de gestión de inventario para tienda (Vue 3 + Vite + Pinia + Quasar).

> Esta carpeta contiene SÓLO la interfaz. La API REST vive en
> [`../backend`](../backend) (Node.js + Express + MongoDB Atlas) y se ejecuta
> por separado.

## Pantallas

| Ruta | Contenido |
|---|---|
| `/#/` | Bienvenida (sin menú, cuadro animado S→E→N→A) |
| `/#/dashboard` | Panel con indicadores y alertas de stock |
| `/#/inventario` | Productos: crear, editar, eliminar, buscar y filtrar |
| `/#/movimientos` | Entradas, salidas y ajustes de inventario |
| `/#/categorias` | Categorías de productos |
| `/#/proveedores` | Proveedores |
| `/#/reportes` | Valorización e indicadores, exportación CSV y PDF |

Al entrar desde la bienvenida se activa el menú hamburguesa con la navegación
del sistema.

## Stack

- **Vue 3** (`<script setup>`) + **Vite**
- **Pinia** (estado reactivo SIN persistencia local: los datos viven en el
  backend y llegan por axios)
- **axios** (capa de servicios en `src/services/`)
- **Quasar** (componentes y layout)
- **Vue Router** con historial por hash (`/#/...`)
- **GSAP** (animación 3D de la bienvenida)
- **SweetAlert2** (único sistema de alertas: `src/utils/alertas.js`)
- **jsPDF** (exportación de reportes en PDF; CSV se genera a mano)

## Ejecutar en local

Los comandos se ejecutan desde ESTA carpeta (`frontend/`); el backend debe
estar corriendo por separado (ver [`../README.md`](../README.md)).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve dist/ en producción
```

La API se consume en `http://localhost:3000/api`; para apuntar a otra URL se
crea un `.env` con `VITE_API_URL=https://tu-backend/api`.

## Arquitectura de datos

```
vista (views/)  →  store (stores/)  →  servicio (services/)  →  API (backend)
```

- **Los stores son sólo estado**: cargan con `cargarX()` al montar la vista y
  exponen getters y actions `async` que llaman a los services. Si el backend
  responde con error (400/409), la action lanza la excepción y la vista la
  muestra con SweetAlert2.
- **Los ids son strings** (ObjectId de Mongo y UUID de los proveedores): el
  servicio los normaliza con `conId()` a `fila.id`, y toda comparación se hace
  con `String()` (nunca `Number()`).
- **Los errores los traduce `src/services/api.js`** (interceptor): cada
  respuesta fallida se convierte en un `Error` con mensaje legible.

## Decisiones transversales

- **Moneda en COP**: toda la presentación de dinero pasa por
  `src/utils/moneda.js` → `formatearMoneda()` (ej. `$1.250.000 COP`).
  Los stores guardan números crudos, sin `$` ni `COP`.
- **Alertas**: sin `alert()`, `confirm()` ni `prompt()` nativos; todo por
  `src/utils/alertas.js` (SweetAlert2).
- **Sin cantidades "monetizadas"**: stock, cantidades, códigos e IDs se
  muestran como números simples.

## Pruebas

> **PENDIENTE:** las pruebas de la fase 7 (`fase7.*.mjs`) se escribieron con
> los stores síncronos y con datos de ejemplo en memoria; desde la migración
> al backend quedaron **desactualizadas** y fallan. Hay que adaptarlas para
> que esperen las actions `async` y usen un mock de `src/services/`.

```bash
node fase7.test.mjs        # stores y utilidades (NO funciona aún)
node fase7.form.test.mjs   # formulario de productos (NO funciona aún)
```

La verificación de la API vive en el backend: `cd ../backend && npm run verificar`.

## Análisis del proyecto

El documento viviente con fases, decisiones y pendientes es
[`ANALISIS_ESTRUCTURA.md`](./ANALISIS_ESTRUCTURA.md).

## Despliegue (Render)

Sitio estático:

- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`

## Pendiente

- Adaptar las pruebas de la fase 7 (`fase7.*.mjs`) a los stores `async` con
  un mock de la capa de servicios.
