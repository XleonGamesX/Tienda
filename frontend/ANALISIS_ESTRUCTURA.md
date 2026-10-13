# Proyecto TIENDA — Análisis y planes de implementación

> **Archivo vivo:** se actualiza con cada entrega — **incluso si se pide no tocar archivos**.
> - **Fase 1 — Movimientos:** ✅ implementada y aprobada.
> - **Fase 2 — Categorías:** ✅ **completa** — store + vista + formulario, build verificado.
> - **Fase 3 — Proveedores:** ✅ **implementada** — 2 archivos modificados, 1 eliminado, build verificado.
> - **Fase 4 — Reportes:** ✅ **implementada** — 1 archivo (`views/ReportesView.vue`), build verificado.
> - **Fase 5 — Dashboard:** ✅ **implementada** — 1 archivo (`views/DashboardView.vue`), build verificado.
> - **Fase 6 — Movimientos:** ✅ **implementada** — 3 archivos (store + form + vista), build verificado.
> - **Fase 7 — Inventario/Productos:** ✅ **completa** — 10 problemas corregidos, build verificado.
> - **Fase 8 — Categorías y Proveedores:** ✅ **completa** — 8 problemas corregidos, build verificado.
> - **Fase 9 — Reportes y exportaciones:** ✅ **completa** — CSV/PDF en `utils/exportaciones.js`, build verificado.
> - **Fase 10 — Limpieza, validaciones y SweetAlert2:** ✅ **completa** — 16 archivos + 3 carpetas eliminados, alertas unificadas, build verificado.
> - **Ajuste final — SENA Market (bienvenida, navegación, animación y validaciones):** ✅ **completo** — bienvenida fuera del `MainLayout`, cuadro con una sola letra por giro, nombre unificado, build verificado.
> - **Ajuste final integral — moneda COP + alertas SweetAlert2:** ✅ **completo** — `utils/moneda.js` (fuente única de precios), sin `alert()/confirm()/prompt()` nativos, validaciones de formulario también con SweetAlert2, build verificado.
> - **Fase 11 — Backend API + axios (fin de la persistencia local):** ✅ **completa** — API Express + Mongoose (MongoDB Atlas) en `../backend`, capa `src/services/` con axios, stores sin `persist`, ids normalizados a string, 27/27 pruebas de la API y build verificado.
>   *(Las entradas 7–9 se añadieron al índice en la Fase 10; los detalles de cada una ya existían más abajo.)*

---

# FASE 11 — Backend API + axios ✅ COMPLETA

> **Fecha:** 11 oct 2026
> **Estado:** ✅ **COMPLETA** — frontend conectado al backend; sin persistencia local.
> **Verificación:** backend `npm run verificar` → **27/27 OK** contra MongoDB Atlas · frontend `npm run build` → `✓ built` · CORS preflight 204 con `Allow-Origin: http://localhost:5173`.

## 11.1 Nueva estructura del proyecto

El proyecto se separó en dos carpetas independientes (cada una con su
`package.json`):

```
TIENDA/
├── frontend/    # Vue 3 + Vite + Pinia + Quasar (esta carpeta)
├── backend/     # API REST: Node.js + Express + Mongoose (MongoDB Atlas)
├── README.md    # cómo levantar ambas partes
└── REQUERIMIENTOS TIENDA.docx
```

## 11.2 Backend (`../backend`)

- **Express 5 + Mongoose 8 + MongoDB Atlas** (cadena en `backend/.env`, que no
  se versiona). Arranque: `npm run dev` en `backend/` → `http://localhost:3000`.
- Capas: `routes → validations → controllers → models → middleware/errorHandler`.
  Cualquier error se responde como `{ ok: false, mensaje }` con su código HTTP.
- Endpoints: `GET/POST/PUT/DELETE` en `/api/categorias`, `/api/proveedores`,
  `/api/productos` y `GET/POST /api/movimientos`.
- **Reglas de negocio en el servidor** (antes vivían en los stores):
  campos obligatorios, números `>= 0`, nombres duplicados → **409**, categoría/
  proveedor en uso → **409** con el conteo, referencias inexistentes → **400**.
- **Stock atómico**: las salidas usan `findOneAndUpdate` con condición
  `cantidad >= n`, así que dos salidas simultáneas nunca dejan el stock
  negativo; si la creación del movimiento falla, se revierte el stock.
- **Código `PRD-###`** autogenerado en el servidor (mayor número + 1) con
  índice único.

## 11.3 Proveedores con identificador único (requisito)

El `_id` de cada proveedor es un **UUID** generado por el backend con
`crypto.randomUUID()` (no un consecutivo): no puede repetirse ni siquiera con
varias instancias de la API escribiendo en la misma base. El nombre, además,
es único aunque cambie la combinación de mayúsculas (índice con collation `es`).

## 11.4 Frontend: capa de servicios y stores sin `persist`

- **`src/services/`** (nuevo): `api.js` (instancia axios + interceptor que
  traduce errores a mensajes legibles + `conId()`) y un servicio por entidad.
- **Stores** (`categorias`, `proveedores`, `productos`, `movimientos`):
  state vacío + flag `cargando`, actions `async` que llaman a los services y
  actualizan el state con la respuesta del servidor; si la API responde con
  error, **lanzan** la excepción (nunca guardan datos rechazados).
  Se eliminó `persist: true` y `pinia-plugin-persistedstate` (nada de
  `localStorage`). También se eliminaron `generarId`, `generarCodigo`,
  `normalizarProducto`, `esProductoValido` y `desasociar*`.
- **Vistas**: cargan con `onMounted(() => Promise.all([...]))` y los handlers
  de guardar/eliminar son `async/await` con `try/catch` que muestran el
  mensaje real del backend con SweetAlert2. **Los templates y estilos no
  cambiaron**: el diseño es el mismo de la Fase 10.
- **Ids como string**: el servicio normaliza `_id` → `id` (string). Todas las
  comparaciones pasaron de `Number()` a `String()`, porque un UUID con
  `Number()` se vuelve `NaN` (rompía, por ejemplo, la detección de nombres
  duplicados al editar un proveedor).

## 11.5 Pendiente conocido

- **Pruebas de la fase 7 (`fase7.*.mjs`)**: se escribieron con stores
  síncronos y datos en memoria; quedaron **desactualizadas** y hay que
  adaptarlas para que esperen las actions `async` con un mock de
  `src/services/`.

---

# FASE 4 — Reportes ✅ COMPLETA

> **Fecha:** 29 sep 2026
> **Estado:** ✅ **IMPLEMENTADA** — único archivo modificado: `src/views/ReportesView.vue`.
> **Verificación:** `npm run build` → `✓ built in 836ms` · stores, rutas y componentes **sin tocar**.
> *(Debajo queda el análisis previo aprobado, con las decisiones P1–P9 resueltas — ver 4.16.)*
> **Alcance mínimo propuesto:** 1 archivo (`views/ReportesView.vue`), sin tocar stores ni rutas.

---

## 4.1 Estado actual de `ReportesView.vue`

**8 líneas** — placeholder con `<div><h1>Vista de Reportes</h1></div>`. Ya está enrutada en `/reportes`.
⚠️ A diferencia de las fases anteriores, **el título sí es correcto** (no hay error de copy/paste).
⚠️ **No usa `<q-page>`** como el resto de vistas → inconsistencia de padding/altura.

---

## 4.2 Datos ya disponibles en los stores (sin modificar nada)

| Store | Estado | Getters | Acciones de lectura |
|---|---|---|---|
| `productos` | `productos[]` → `id, codigo, nombre, categoriaId, proveedorId, precioCompra, precioVenta, cantidad, stockMinimo` | `totalProductos`, `productosStockBajo`, `productosAgotados`, `unidadesDisponibles`, `productosConCategoria`, `productosConProveedor`, `productosCompletos` | `obtenerProductos(id)` |
| `movimientos` | `movimientos[]` → `id, fecha(ISO), productoId, cantidad, tipo` | `totalMovimientos`, `entradas`, `salidas`, `ajustes` | `obtenerMovimientoPorId(id)` |
| `categorias` | `categorias[]` → `id, nombre` | `totalCategorias` | `obtenerCategoriaPorId(id)` |
| `proveedores` | `proveedores[]` → `id, nombre, telefono, email, direccion` | `totalProveedores` | `obtenerProveedorPorId(id)` |

---

## 4.3 Estadísticas posibles SIN tocar stores

- **Totales:** productos · unidades · categorías · proveedores · movimientos
- **Stock:** agotados · stock bajo · disponibles · % con stock bajo
- **Valorización:** `Σ(cantidad × precioCompra)` = costo · `Σ(cantidad × precioVenta)` = valor de venta · margen potencial
- **Movimientos:** nº de entradas/salidas/ajustes · unidades entradas vs salidas · **movimiento neto** · últimos N
- **Distribución:** productos y unidades **por categoría** · productos **por proveedor**
- **Rankings:** mayor stock · menor stock · agotados
- **Por fecha:** movimientos agrupados por día (las fechas son ISO) — requiere filtrar en la vista

> ❌ **No posible sin cambio de store:** valor en dinero de los movimientos (no guardan precio), "productos creados este mes" (no hay fecha de creación).

---

## 4.4 Requisitos funcionales propuestos (RF)

| RF | Descripción |
|---|---|
| RF-1 | Ver resumen general en tarjetas |
| RF-2 | Ver inventario agrupado por categoría |
| RF-3 | Ver inventario agrupado por proveedor |
| RF-4 | Ver estado del stock (agotados / bajo / disponibles) |
| RF-5 | Ver resumen de movimientos (entradas / salidas / ajustes) |
| RF-6 | Ver los últimos movimientos |
| RF-7 | Ver valorización del inventario (costo vs venta) |
| RF-8 | Actualización automática por reactividad |
| RF-9 | *(pendiente)* filtros por fecha / categoría |
| RF-10 | *(pendiente)* exportar CSV / PDF |

---

## 4.5 Componentes reutilizables

`ui/PageHeader` · `ui/SummaryCard` · `ui/StatusBadge` · `ui/EmptyState` · `ui/LoadingState` · `dashboard/StockAlertList` · `inventory/ProductTable` · **`movements/MovimientoTable` (reutilizable tal cual)** · `inventory/ProductFilters` (si se añaden filtros).

---

## 4.6 ¿Componentes nuevos?

**Opción A ⭐** — todo dentro de `ReportesView.vue` (patrón de Fase 2/3).
**Opción B** — crear `src/components/reports/*` si se añaden gráficos o muchas tablas.

---

## 4.7 Qué va en tarjetas / tablas / gráficos

- **Tarjetas (`SummaryCard`):** total productos · unidades · valor costo · valor venta · categorías · proveedores · movimientos
- **Tablas:** productos por categoría · productos por proveedor · estado de stock (`ProductTable`) · últimos movimientos (`MovimientoTable`)
- **Gráficos:** barras (unidades por categoría) · dona (estado del stock) · líneas (movimientos por día) → **pendiente, no hay librería**

---

## 4.8 Librería de gráficos

## ❌ NO hay ninguna instalada

`quasar` · `pinia` · `vue` · `vue-router` · `@quasar/extras` · `pinia-plugin-persistedstate` · `gsap` (solo animaciones, usada en `inicio.vue`).
**Quasar no incluye componentes de gráficos.**

---

## 4.9 Relaciones entre entidades

```
categorias.id  ←── productos.categoriaId      (fallback: 'Sin categoría')
proveedores.id ←── productos.proveedorId      (fallback: 'Sin proveedor')
productos.id   ←── movimientos.productoId     (SIN fallback en store → resolver en la vista)
```
- Eliminar categoría/proveedor **no rompe** nada (los getters ya tienen fallback).
- Eliminar un producto **deja movimientos huérfanos** → el reporte debe mostrar *"Producto eliminado"*.
- **Los movimientos no guardan precio** → la valorización sale de los productos, no de los movimientos.

---

## 4.10 Archivos a modificar

| Archivo | Obligatorio |
|---|---|
| **`src/views/ReportesView.vue`** | ✅ único necesario |
| `src/components/reports/*.vue` (nuevos) | solo si se aprueba la Opción B |

## 4.11 Archivos NO modificables

Los 4 `stores/` · `routes/routes.js` · `main.js` · `App.vue` · `layouts/` · `ui/` · `inventory/` · componentes de `movements/` · resto de `views/`.

---

## 4.12 Riesgos e inconsistencias

| # | Riesgo |
|---|---|
| **R1** | `ReportesView` no usa `<q-page>` → ver punto 4.1 |
| **R2** | Sin librería de gráficos |
| **R3** | ⚠️ **`DashboardView` construye `summaryCards` como array plano** (no `computed`) → los valores se congelan al montar y **no se actualizan**. Además la tarjeta 3 dice *"Movimientos"* pero muestra `unidadesDisponibles`. **No copiar ese patrón.** |
| **R4** | Movimientos sin precio → no hay valorización por movimientos |
| **R5** | Movimientos de productos eliminados → resolver nombre con fallback |
| **R6** | Si no hay movimientos, las secciones deben usar `EmptyState` |
| **R7** | `fecha` es ISO/UTC → convertir a zona local |

---

## 4.13 Propuesta de arquitectura

```
ReportesView.vue  (q-page, solo LECTURA, todo con computed reactivos)
├── PageHeader "Reportes"
├── 1. Resumen           → SummaryCard × N
├── 2. Por categoría     → tabla en la vista
├── 3. Por proveedor     → tabla en la vista
├── 4. Estado del stock  → ProductTable (o tabla propia)
├── 5. Movimientos       → resumen (entradas/salidas/ajuste) + MovimientoTable (últimos N)
└── 6. Gráficos          → (opcional, pendiente de decisión)
```

**Sin acciones destructivas** → `ConfirmDialog` no aplica en esta fase.

---

## 4.14 Flujo de usuario

```
/asociar a /reportes → PageHeader
  → 1. lee resumen (tarjetas)
  → 2. revisa distribución por categoría / proveedor
  → 3. revisa estado del stock
  → 4. revisa resumen y últimos movimientos
  → (opcional) filtra por fecha/categoría
  → enlaces rápidos a /inventario o /movimientos
```
Todo **reactivo**: crear/editar/eliminar datos en otra vista actualiza los reportes solos.

---

## 4.15 Decisiones aprobadas (9)

| # | Decisión | Resolución |
|---|---|---|
| **P1** | Alcance | ✅ tarjetas + tablas + gráficos |
| **P2** | Gráficos | ✅ **CSS/HTML puro** — sin instalar chart.js ni tocar `package.json` |
| **P3** | Arquitectura | ✅ todo dentro de `ReportesView.vue` (sin `components/reports/`) |
| **P4** | Componentes | ✅ reutilizar `MovimientoTable` tal cual (sin modificarlo); tablas de reporte dentro de la vista |
| **P5** | Filtros | ✅ fechas (movimientos) + categoría y estado (inventario), sin tocar stores |
| **P6** | Valorización | ✅ costo + venta + margen, en pesos colombianos (`$8.000`) |
| **P7** | Últimos movimientos | ✅ **10**, orden descendente por fecha |
| **P8** | `DashboardView` | ❌ no se corrige en esta fase → pendiente documentado (riesgo R3) |
| **P9** | Exportación CSV/PDF | ❌ no implementada → pendiente futuro |

---

## 4.16 ✅ Entrega de la Fase 4

### Archivo modificado

| Archivo | Acción |
|---|---|
| **`src/views/ReportesView.vue`** | ✅ reescrito (placeholder de 8 líneas → vista completa con `<q-page>`) |

**Ningún otro archivo fue modificado** · **ninguna dependencia instalada** · stores intactos (sin getters ni acciones nuevos).

### Secciones implementadas (10)

| # | Sección | Cómo |
|---|---|---|
| 1 | `PageHeader` | título *"Reportes"* + descripción |
| 2 | Filtros | `q-input type="date"` ×2 · `q-select` categoría · `q-select` estado · botón *Limpiar filtros* |
| 3 | Resumen general | `SummaryCard` ×5 (productos, unidades, categorías, proveedores, movimientos) |
| 4 | Valorización | `SummaryCard` ×3 (costo, venta, margen) formateados con `formatearMoneda()` |
| 5 | Inventario por categoría | `q-table` interna: categoría · productos · unidades · valor costo · valor venta |
| 6 | Inventario por proveedor | `q-table` interna con las mismas columnas |
| 7 | Estado del stock | barra apilada + leyenda con CSS (`--q-positive/warning/negative`), 3 conteos y % |
| 8 | Movimientos | 5 estadísticas: entradas · salidas · ajustes · unidades ingresadas · unidades retiradas |
| 9 | Últimos 10 movimientos | `MovimientoTable` reutilizada tal cual (mueve el corte a 10 en la vista) |
| 10 | Gráfico de movimientos | 3 barras horizontales HTML/CSS con ancho proporcional (entrada/salida/ajuste) |

### `computed` creados

| Computed | Qué calcula |
|---|---|
| `productosFiltrados` | `productosCompletos` filtrado por categoría + estado |
| `movimientosFiltrados` | movimientos dentro del rango de fechas (fecha local vs `YYYY-MM-DD`) |
| `unidadesDisponibles` | Σ `cantidad` de los productos filtrados |
| `valorizacion` | costo · venta · margen = venta − costo |
| `inventarioPorCategoria` | agrupa por `categoriaNombre` (con fallback) → 5 métricas |
| `inventarioPorProveedor` | agrupa por `proveedorNombre` (con fallback) → 5 métricas |
| `estadoStock` | disponibles / bajo / agotados + porcentajes enteros |
| `resumenMovimientos` | conteos por tipo + unidades ingresadas / retiradas |
| `ultimosMovimientos` | copia ordenada `fecha ↓`, `.slice(0, 10)` (no muta el store) |
| `graficoMovimientos` | valor y % de ancho de cada barra (máx = mayor de los 3 tipos) |

### Filtros (solo lectura)

- **Fechas** (`fechaInicio`/`fechaFin`) → afectan **movimientos** (secciones 3-mov, 8, 9, 10).
- **Categoría / estado** → afectan **productos** (secciones 3-prod, 4, 5, 6, 7).
- `limpiarFiltros()` vacía los 4 `ref`. **Ningún filtro escribe en un store.**

### Lógica y fallbacks

- **Estado:** `agotado = cantidad === 0` · `bajo = >0 y ≤ stockMinimo` · `disponible = resto` — misma regla que los getters del store.
- **Fecha:** `fechaLocal()` convierte la fecha ISO (UTC) a `AAAA-MM-DD` local antes de comparar, igual que `MovimientoTable`.
- **Moneda:** `formatearMoneda()` local con `Intl.NumberFormat('es-CO')` → `8000 → $8.000`, `100000 → $100.000` (verificado en Node).
- **Relaciones:** producto → categoría/proveedor resueltas con `productosCompletos` (→ *"Sin categoría"* / *"Sin proveedor"*); movimiento → producto resuelto por `MovimientoTable` (→ *"Producto eliminado"*).

### Verificación

- ✅ `npm run build` → `✓ built in 836ms` (chunk `ReportesView-Dal9zhmh.js` generado)
- ✅ importaciones solo de archivos existentes
- ✅ sin `$q.notify` y sin cambios fuera de `ReportesView.vue` (mtimes verificados)
- ✅ `package.json` sin dependencias nuevas

### Pendientes de esta fase (no implementados a propósito)

1. **`DashboardView` (R3):** `summaryCards` como array plano (no reactivo) + tarjeta *"Movimientos"* que muestra unidades.
2. **Exportación CSV / PDF.**
3. `ProductTable` **no** se reutilizó: el estado del stock se resolvió con `q-table`/CSS propia dentro de la vista (P4).

---

---

# FASE 3 — Proveedores ✅ COMPLETA

> **Fecha:** 29 sep 2026
> **Estado:** ✅ **IMPLEMENTADA** — 2 archivos modificados + 1 eliminado.
> **Verificación:** `npm run build` → `✓ built in 840ms`
> **Archivos:** `providers/ProviderForm.vue` · `views/ProveedoresView.vue` · *eliminado* `suppliers/ProveedorForm..vue`
> **Store:** `stores/proveedores.js` **NO se modificó** (ya estaba completo).

---

## 3.1 Archivos revisados

| Archivo | Estado |
|---|---|
| `src/stores/proveedores.js` | 70 líneas — completo (Options store) |
| `src/views/ProveedoresView.vue` | ⚠️ **132 líneas — YA EXISTE y está implementada** |
| `src/components/providers/ProviderForm.vue` | 175 líneas — creado/modificado recientemente |
| `src/components/providers/ProviderTable.vue` | 89 líneas — creado/modificado recientemente |
| `src/components/suppliers/ProveedorForm..vue` | ⚠️ huérfano (doble punto), **nadie lo importa** |
| `src/components/Products/ProductoForm.vue` | ⚠️ huérfano — nadie lo importa |
| `inventory/*`, `ui/*`, `InventarioView.vue`, `main.js` | referencias |

### 🚨 Situación inesperada
**La sección Proveedores YA está construida** (vista + tabla + formulario, en inglés: `providers/`).
Hay **dos carpetas paralelas**: `suppliers/` (español, huérfana) y `providers/` (inglés, en uso).

---

## 3.2 Estado actual de `stores/proveedores.js`

Sintaxis **Options** (`state`/`getters`/`actions`) — igual que `productos` y `movimientos` (no es setup-store como `categorias`).

| Miembro | Existe | Detalle |
|---|---|---|
| Estado inicial | ✅ | 3 proveedores → **`{ id, nombre, telefono, email, direccion }`** |
| `totalProveedores` | ✅ | getter |
| `crearProveedor(datos)` | ✅ | recibe **objeto**, id = `max(id)+1`, devuelve el nuevo |
| `obtenerProveedorPorId(id)` | ✅ | `Number(id)` |
| `editarProveedor(id, datos)` | ✅ | `Number(id)`, devuelve `null` si no existe, merge con spread |
| `eliminarProveedor(id)` | ✅ | `Number(id)`, devuelve `true`/`false` |
| `persist` | ✅ | `persist: true` |

### ¿Necesita modificaciones para crear → editar → eliminar?

**✅ NO. El store ya tiene todo lo necesario.**

| Comportamiento | Resultado |
|---|---|
| Datos inválidos (id inexistente) | `editar` → `null` · `eliminar` → `false` · sin romper |
| Conversión de ids | ya usa `Number(id)` en las 3 acciones |
| Nombres duplicados | ❌ no valida nada → **hueco** (resoluble en el form) |

> 📌 El modelo **SÍ tiene 4 campos** (`nombre`, `telefono`, `email`, `direccion`), no solo `{id, nombre}`.
> Los campos actuales del formulario **no son inventados**: coinciden con el store.

---

## 3.3 🚨 Hallazgos críticos

> ℹ️ **Histórico** — H1–H6 resueltos en la implementación (ver 3.12). H7 resuelto (archivo eliminado). H8 queda para la fase de limpieza.

| # | Hallazgo | Gravedad |
|---|---|---|
| **H1** | **`$q.notify()` no está registrado** (`main.js` → `plugins: {}`) → al eliminar, `TypeError: $q.notify is not a function`. El borrado ocurre, pero la ejecución falla después. | 🔴 Alto |
| **H2** | Falta `SummaryCard` con `totalProveedores` → requisito 2 | 🟡 |
| **H3** | No hay advertencia de productos asociados → requisitos 6 y 7 | 🟡 |
| **H4** | No valida duplicados (ni form ni store) → requisito 8 | 🟡 |
| **H5** | `ProviderForm` falla en silencio: nombre vacío → `return` sin mensaje | 🟡 |
| **H6** | `watch` solo observa `provider`, no `modelValue` → al cancelar y reabrir queda el texto anterior | 🟡 |
| **H7** | `ProveedorForm..vue` con doble punto → huérfano | 🔵 Limpieza |
| **H8** | Otros huérfanos: `Products/ProductoForm.vue`, `Products/ProductoCard.vue`, `Products/ProductoTable.vue`, `movements/Movement{Form,Table,Filters,Summary}.vue` | 🔵 Limpieza |

---

## 3.4 ♻️ Componentes reutilizables

| Componente | Uso |
|---|---|
| `ui/PageHeader` | ✅ ya usado |
| **`ui/SummaryCard`** | ➕ **por agregar** → `totalProveedores`, `icon="local_shipping"` |
| `ui/ConfirmDialog` | ✅ ya usado → `message` dinámico con advertencia |
| `ui/EmptyState` | opcional (la tabla ya tiene `no-data-label`) |
| `inventory/ProductTable` | referencia estructural |
| `CategoriaForm` / `MovimientoForm` | **referencia de arquitectura** |
| `providers/ProviderTable` | ✅ ya usado |

---

## 3.5 🏗️ Propuesta de arquitectura

```
ProveedorForm.vue  →  presentacional
   · NO importa stores
   · props: modelValue · provider · providers (NUEVA, p/ duplicados)
   · emite: update:modelValue · save
   · valida: nombre obligatorio + trim + duplicados
   · q-banner de error (sin $q.notify)
   · watch sobre [modelValue, provider] → limpia al abrir/cerrar

ProveedoresView.vue  →  orquesta
   · useProveedoresStore + useProductosStore
   · PageHeader + SummaryCard + tabla + form + ConfirmDialog
   · conteo de productos con proveedorId → mensaje de advertencia
   · llama crearProveedor / editarProveedor / eliminarProveedor
   · SIN $q.notify
```

---

## 3.6 📝 Archivos a modificar (propuesta)

| # | Archivo | Cambio |
|---|---|---|
| 1 | **`src/components/providers/ProviderForm.vue`** | prop `providers` + duplicados + `q-banner` (H4, H5) + `watch` sobre `modelValue` (H6) |
| 2 | **`src/views/ProveedoresView.vue`** | `SummaryCard` (H2) + mensaje con productos asociados (H3) + quitar `$q.notify` (H1) + pasar `:providers` |

**No hace falta tocar:** `stores/proveedores.js` ✅ · `ProviderTable.vue` · ningún otro archivo.

---

## 3.7 ✅ Decisiones tomadas (todas aprobadas)

| # | Decisión | Resolución aplicada |
|---|---|---|
| **D1** | `suppliers/ProveedorForm..vue` (doble punto) | ✅ **eliminado** (huérfano, 0 imports) |
| **D2** | Duplicidad `suppliers/` vs `providers/` | ✅ estructura activa = **`providers/`** (sin renombrar nada) |
| **D3** | Tabla | ✅ **conservado `ProviderTable.vue`** sin tocarlo |
| **D4** | `$q.notify` | ✅ **eliminado** de la vista · `main.js` **sin modificar** |
| **D5** | Duplicados | ✅ validados en `ProviderForm` con la prop **`providers`** (store intacto) |
| **D6** | Búsqueda existente | ✅ **conservada** |
| **D7** | Campos del form | ✅ se mantienen los **4**: `nombre`, `telefono`, `email`, `direccion` |

---

## 3.8 🔄 Flujo esperado

```
CREAR
  openCreateForm() → selectedProvider = null → diálogo
  → valida nombre (obligatorio + trim) + duplicados
      · duplicado → q-banner, NO emite save
  → emit('save', { nombre, telefono, email, direccion })
  → saveProvider(data) → proveedoresStore.crearProveedor(data)
  → cerrar + limpiar

EDITAR
  openEditForm(proveedor) → selectedProvider = proveedor → diálogo
  → carga los 4 campos · valida excluyendo su propio id
  → emit('save', {...})
  → proveedoresStore.editarProveedor(id, data)
  → cerrar + limpiar

ELIMINAR (con advertencia)
  confirmDelete(proveedor)
  → contar = productos.filter(p => Number(p.proveedorId) === Number(proveedor.id)).length
  → ConfirmDialog con:
      contar > 0 → "Está asociado a N productos. Si lo eliminas, esos
                    productos quedarán sin proveedor. ¿Deseas continuar?"
      contar = 0 → "¿Deseas eliminar el proveedor 'X'?"
  → confirmar → proveedoresStore.eliminarProveedor(Number(id))
  → cerrar + limpiar · SIN $q.notify
```

---

## 3.9 ⚡ Reactividad con `InventarioView`

**Ya funciona hoy ✅** — `InventarioView.vue:15`:
```vue
<ProductForm ... :suppliers="proveedoresStore.proveedores" ... />
```
Pasa el array vivo del store → al crear/editar/eliminar, el `q-select` de proveedores **se repinta solo**.

**¿Y si se elimina un proveedor en uso?** La arquitectura **lo soporta sin romper nada** ✅:

| Punto | Comportamiento |
|---|---|
| `stores/productos.js` (`productosConProveedor`, `productosCompletos`) | → `'Sin proveedor'` |
| `ProductoDetalleView.vue:73` | → `proveedor?.nombre \|\| 'Sin proveedor'` |
| `Products/ProductInfoCard.vue:35` | → `product.proveedorNombre \|\| 'Sin proveedor'` |

---

## 3.10 ⚠️ Riesgos e inconsistencias

1. **`$q.notify` roto (H1)** → error en runtime al eliminar. Riesgo más concreto.
2. **Dos sistemas de nombres**: `suppliers/` vs `providers/`, componentes en inglés vs español.
3. **Archivos huérfanos acumulados** (H7, H8).
4. **Inconsistencia entre fases**: `ProveedoresView` tiene búsqueda, `CategoriasView` no.
5. **`watch` de `ProviderForm` (H6)** deja datos al reabrir.
6. **Dos estilos de store** conviviendo (Options vs setup).
7. `Products/ProductoForm.vue` (226 líneas) es el mayor huérfano.

---

## 3.11 📄 Resumen ejecutivo (estado tras implementar ✅)

| Requisito | Estado |
|---|---|
| 1. Ver proveedores | ✅ existe (`ProviderTable`) |
| 2. Total de proveedores | ✅ **`SummaryCard` agregado** (`totalProveedores`, `icon="local_shipping"`) |
| 3. Crear | ✅ |
| 4. Editar | ✅ |
| 5. Eliminar | ✅ **`$q.notify` eliminado** (ya no crashea) |
| 6. Confirmar antes de eliminar | ✅ |
| 7. Advertir si está en uso | ✅ **mensaje dinámico con el conteo de productos** |
| 8. Validar duplicados | ✅ **en `ProviderForm` con prop `providers`** |
| 9. Reactividad con Inventario | ✅ ya funcionaba (`:suppliers="proveedoresStore.proveedores"`) |
| 10. Arquitectura de las fases anteriores | ✅ presentacional + orquestador |

---

## 3.12 ✅ Implementación realizada

> **Build:** `npm run build` → `✓ built in 840ms`

### Archivos modificados (2)

| Archivo | Cambios |
|---|---|
| **`src/components/providers/ProviderForm.vue`** | · nueva prop **`providers`** (solo lectura, p/ duplicados)<br>· `localError` + **`q-banner`** de error (sin `$q.notify`)<br>· `validate()`: nombre obligatorio + `string` + `trim()` + **duplicados** (ignora mayúsculas y espacios, excluye el id en edición)<br>· `saveProvider()` ya **no emite `save`** si es inválido<br>· `watch` corregido → observa **`[modelValue, provider]`**: abre → carga o limpia · cierra → limpia todo<br>· conserva sus 4 campos, su estructura visual y **NO importa ningún store** |
| **`src/views/ProveedoresView.vue`** | · **`SummaryCard`** con `totalProveedores`<br>· pasa **`:providers="proveedoresStore.proveedores"`** al formulario<br>· **`contarProductosAsociados()`** → filtra `Number(producto.proveedorId) === Number(proveedor.id)`<br>· **`deleteMessage`** (`computed`) → mensaje con advertencia o confirmación normal<br>· `deleteProvider()` → `eliminarProveedor(Number(id))`<br>· **eliminado `useQuasar` y `$q.notify`**<br>· conserva búsqueda, `PageHeader`, `ProviderTable`, `ProviderForm`, `ConfirmDialog` |

### Archivo eliminado (1)

- `src/components/suppliers/ProveedorForm..vue` — huérfano, vacío, **0 imports**.

### Archivos NO modificados

`stores/proveedores.js` · `stores/productos.js` · `providers/ProviderTable.vue` · `main.js` · `routes` · `App.vue` · `layouts/` · `ui/` · `InventarioView.vue` · `ProductoDetalleView.vue`

### Verificaciones

| Verificación | Resultado |
|---|---|
| Sin `notify` / `useQuasar` en la vista | ✅ |
| `ProviderForm` sin imports de stores | ✅ |
| `main.js` intacto (`plugins: {}`) | ✅ |
| Build sin errores | ✅ `840ms` |
| Duplicados rechazados / conservar propio nombre | ✅ lógica `validate()` |
| Reabrir el form sin datos previos | ✅ `watch` sobre `modelValue` |

### ⏭️ Pendientes a futuro (fuera de alcance)

1. **Carpeta `src/components/suppliers/` quedó vacía** — no se eliminó porque no estaba autorizado.
2. **Fase de limpieza** de huérfanos: `Products/ProductoForm.vue`, `Products/ProductoCard.vue`, `Products/ProductoTable.vue`, `movements/Movement{Form,Table,Filters,Summary}.vue`.
3. `$q.notify` sigue **sin registrar** en `main.js` (si alguna vez se quiere, requiere autorización).

---

---

# FASE 2 — Categorías ✅ COMPLETA

> **Fecha:** 29 sep 2026
> **Estado:** ✅ **IMPLEMENTADA** — los 3 archivos autorizados modificados.
> **Verificación:** `npm run build` → `✓ built in 1.17s`
> **Archivos:** `stores/categorias.js` · `categories/CategoriaForm.vue` · `views/CategoriasView.vue`

---

## 2.1 Archivos revisados

- `src/stores/categorias.js`
- `src/views/CategoriasView.vue`
- `src/components/categories/CategoriaForm.vue` (vacío, 0 líneas)
- Referencias: `InventarioView.vue`, `ProductTable.vue`, `ProductForm.vue`, `ui/PageHeader.vue`, `ui/EmptyState.vue`, `ui/ConfirmDialog.vue`, `ui/SummaryCard.vue`

---

## 2.2 Cómo está hoy `stores/categorias.js`

Usa la sintaxis **setup store** (`() => {}` con `ref`/`computed`), a diferencia de `productos.js` y `movimientos.js` que usan Options (`state`/`getters`/`actions`. Funciona igual, es solo otro estilo.

| Miembro | Tipo | Qué hace |
|---|---|---|
| `categorias` | estado | array de `{ id, nombre }`, 8 iniciales |
| `totalCategorias` | getter | `categorias.length` ✅ |
| `obtenerCategoriaPorId(id)` | acción | `find()` con `Number(id)` |
| `crearCategoria(nombre)` | acción | id = `max(id)+1`, hace `push` — **recibe un string, no un objeto** |
| `eliminarCategoria(id)` | acción | reemplaza el array con `filter()` |
| `persist: true` | — | persiste en localStorage |

---

## 2.3 🚨 Hallazgos críticos

> ℹ️ **Histórico** — todos resueltos dentro de esta fase (ver 2.7 y 2.8).

### 1. NO EXISTE `editarCategoria` → rompe el requisito "Editar una categoría"

| Opción | Cómo | Opinión |
|---|---|---|
| **A** ⭐ | Agregar `editarCategoria(id, nombre)` a `categorias.js` | **La correcta.** Respeta la arquitectura y queda simétrico con `crear`/`eliminar`. Requiere aprobación para tocar el store. |
| B | La vista hace `categoria.nombre = 'x'` | Funciona (Pinia es reactivo), **pero rompe la arquitectura**: la vista muta el estado sin pasar por el store. |
| C | La vista reemplaza todo el array con `.map()` | Peor que B: duplica lógica de negocio fuera del store. |

### 2. `eliminarCategoria(id)` compara con `!==` sin `Number(id)`
Si le llega un string (`"3"`) **no borra nada y no avisa**. `obtenerCategoriaPorId` sí convierte.
➡️ Mitigación sin tocar el store: en la vista pasar siempre `Number(cat.id)`.

### 3. El store no valida nada
- `crearCategoria('')` → crea una categoría **vacía**.
- `crearCategoria('Bebida')` → permite **duplicados**.
➡️ Toda la validación vive en `CategoriaForm`.

### 4. ⚠️ Borrar una categoría en uso
Los productos tienen `categoriaId`. Si se borra la categoría, esos productos quedan mostrando *"Sin categoría"* (el getter `productosConCategoria` ya lo maneja sin romperse). El store **no lo impide**.

### 5. `CategoriasView.vue` tiene el mismo error de copy/paste
```vue
<h1>Vista de Reportes</h1>
```

### 6. `CategoriaForm.vue` está vacío (0 líneas) → se crea desde 0.

### 7. No existe `CategoriaTable` — y se pidieron solo 2 archivos.

---

## 2.4 Componentes a reutilizar (ninguno se modifica)

| Componente | Uso en esta sección |
|---|---|
| `ui/PageHeader.vue` | Título "Categorías" + botón *"Nueva categoría"* en `#actions` |
| `ui/SummaryCard.vue` | Tarjeta con el total → `:value="categoriasStore.totalCategorias"` `icon="category"` |
| `ui/ConfirmDialog.vue` | Confirmación de borrado. Emite `confirm` y cierra solo |
| `ui/EmptyState.vue` | Si no hay categorías |
| `inventory/ProductTable` | Referencia de la tabla (`q-table` + slots de acciones) |
| `inventory/ProductForm` | Referencia del patrón diálogo + validación + `emit('save')` |

---

## 2.5 Plan de implementación (2 archivos)

### Archivo 1 — `src/components/categories/CategoriaForm.vue` *(crear desde 0)*

Misma arquitectura que `MovimientoForm` (Opción 2): **solo muestra, valida y emite. No toca el store.**

- **Props:** `modelValue` · `category` (`null` = crear, objeto = editar) · `categories` (validar duplicados)
- **Emits:** `update:modelValue`, `save`
- Título dinámico: **"Nueva categoría"** / **"Editar categoría"**
- Campo único: `q-input` *"Nombre"* (outlined, `maxlength`)
- `validate()` local: requerido / no vacío tras `trim()` · nombre duplicado (excluyendo la que se edita)
- Banner de error rojo (sin `$q.notify`)
- `watch` → si `category` existe carga su nombre; limpia al abrir/cerrar
- 💬 Comentarios en español en cada bloque

> **Nota:** aquí **no** hace falta la prop `error` de la Fase 1, porque `crearCategoria`/`eliminarCategoria` no devuelven `null` ni pueden fallar.

### Archivo 2 — `src/views/CategoriasView.vue` *(reemplazar)*

```
q-page
├── PageHeader  "Categorías"  +  botón [ + Nueva categoría ]
├── SummaryCard "Total de categorías" → categoriasStore.totalCategorias
├── q-table (en q-card)  ← columnas: # · Nombre · Acciones
│     ├── acciones: [editar] [eliminar]  (icon buttons, estilo ProductTable)
│     └── no-data-label / EmptyState
├── CategoriaForm  v-model + :category + :categories + @save
└── ConfirmDialog  (borrar)
```

**Handlers:**

| Función | Qué hace |
|---|---|
| `openCreateForm()` | `selectedCategory = null` → abre diálogo |
| `openEditForm(cat)` | `selectedCategory = cat` → abre diálogo con el nombre cargado |
| `saveCategory({ nombre })` | si hay `selectedCategory` → **editar** *(ver decisión pendiente)*, si no → `categoriasStore.crearCategoria(nombre)` → cerrar |
| `requestDelete(cat)` | abre `ConfirmDialog` con el nombre |
| `confirmDelete()` | `categoriasStore.eliminarCategoria(Number(cat.id))` → cerrar confirmación |

**Actualización automática ✅** → la tabla, la tarjeta del total y los selects de `InventarioView` se repintan solos porque todo lee `categoriasStore.categorias` / `totalCategorias` (estado reactivo).

---

## 2.6 ✅ Decisiones tomadas

| # | Decisión | Resultado |
|---|---|---|
| **1** | **La edición** | **Opción A)** se agregó `editarCategoria(id, nombre)` a `stores/categorias.js` ✅ |
| **2** | **Categoría en uso al eliminar** | **b)** sí se puede eliminar, pero la interfaz **advertirá** antes de confirmar |
| **3** | **Nombres duplicados** | **sí se validan** ignorando mayúsculas/minúsculas y espacios exteriores |
| **4** | **Tabla de categorías** | **dentro de `CategoriasView.vue`** (solo 2 archivos) |

---

## 2.7 ✅ Paso 1 implementado — `src/stores/categorias.js`

> **Único archivo modificado en esta etapa.** Verificado con `npm run build` → `✓ built in 719ms`.
> Sintaxis setup-store y `persist: true` **sin cambios**.

### Cambios realizados

| # | Cambio | Detalle |
|---|---|---|
| 1 | **Nueva función `editarCategoria(id, nombre)`** | Insertada entre `crearCategoria` y `eliminarCategoria` para respetar el orden existente |
| 2 | **`eliminarCategoria` con `Number(id)`** | Solo la conversión; el comportamiento general no cambia. Antes, un id `"3"` en string **no borraba nada y no avisaba** |
| 3 | **`return` del store** | Se agregó `editarCategoria` a lo que exporta |

**No se tocó:** el estado con las 8 categorías iniciales, `totalCategorias`, `obtenerCategoriaPorId`, `crearCategoria`, `persist: true`, ni ningún otro archivo.

### Cómo funciona `editarCategoria` (5 pasos, sale ante el primer fallo)

```
editarCategoria(id, nombre)
  │
  ├─ 1. Busca con Number(id)      → no encuentra: STOP (no modifica nada)
  │
  ├─ 2. trim() al nombre          → vacío o no string: STOP
  │
  ├─ 3. Compara con las demás     → minúsculas (ignora MAYÚSCULAS)
  │                                 + trim (ignora espacios exteriores)
  │                                 + excluye su propio id
  │     hay duplicado: STOP
  │
  └─ 4. Solo si pasó todo →  categoria.nombre = nombreLimpio
```

El `id` **nunca se modifica**; solo cambia el `nombre`.

### Pruebas ejecutadas contra el archivo real (12/12 ✅)

```
✓ edita y hace trim                      ✓ id inexistente no modifica nada
✓ id string "2" también edita            ✓ nombre vacío no modifica nada
✓ duplicado ignorando mayúsculas NO edita ✓ nombre null no modifica nada
✓ conservar su propio nombre sí permite   ✓ id no numérico no modifica nada
✓ el id nunca cambia                      ✓ eliminar con id string funciona
✓ eliminar con id number funciona         ✓ crearCategoria sigue funcionando
```

*(Test temporal, eliminado después de ejecutar; no quedó ningún archivo extra.)*

### ✅ Alcance de la Fase 2 (completado)

- [x] `src/stores/categorias.js` — `editarCategoria()` + `Number(id)` en `eliminarCategoria`
- [x] `src/components/categories/CategoriaForm.vue` — creado desde 0 (estaba vacío)
- [x] `src/views/CategoriasView.vue` — reemplazado (decía *"Vista de Reportes"*)
- [x] Advertencia en el confirm cuando la categoría tiene productos asociados

---

## 2.8 ✅ Paso 2 implementado — vista y formulario

> **Solo se modificaron 2 archivos:** `categories/CategoriaForm.vue` y `views/CategoriasView.vue`.
> Ningún store, ruta, layout ni componente UI existente fue tocado.
> **Build:** `✓ built in 1.17s`

### `CategoriaForm.vue` — solo muestra, valida y emite (sin stores)

| Aspecto | Implementación |
|---|---|
| Props | `modelValue` · `category` (null = crear / objeto = editar) · `categories` |
| Emits | `update:modelValue` · `save` |
| Interfaz | `q-dialog` + título dinámico ("Nueva categoría" / "Editar categoría") + `q-input` outlined `maxlength=50` + Cancelar/Guardar |
| Validación | obligatorio · `trim()` · sin vacíos · sin duplicados (ignora MAYÚSCULAS y espacios) · excluye la categoría que se edita |
| Error | `q-banner` rojo dentro del diálogo — **sin `$q.notify`** |
| Emerge | `save` con **`{ nombre: nombreLimpio }`** |
| `watch` | al **abrir** → carga `category.nombre` o deja vacío y limpia errores · al **cerrar** → limpia todo |

### `CategoriasView.vue` — orquesta y llama al store

```
q-page
├── PageHeader      "Categorías" + botón [ + Nueva categoría ]
├── SummaryCard     "Total de categorías" → categoriasStore.totalCategorias
├── q-card > q-table   columnas: # · Nombre · Acciones (editar / eliminar)
├── CategoriaForm   v-model + :category + :categories + @save
└── ConfirmDialog   mensaje con advertencia de productos asociados
```

**Estado local:** `showForm` · `selectedCategory` · `showDeleteDialog` · `categoryToDelete`
**`computed` usado:** `deleteMessage` (el único que aporta valor real)

### Flujo de los 3 procesos

```
CREAR
  openCreateForm() → selectedCategory = null → diálogo
  → form valida → emit('save', { nombre })
  → saveCategory() → categoriasStore.crearCategoria(nombre)
  → cerrar + limpiar

EDITAR
  openEditForm(cat) → selectedCategory = cat → diálogo (con nombre cargado)
  → form valida (excluye su propio id) → emit('save', { nombre })
  → saveCategory() → categoriasStore.editarCategoria(id, nombre)
  → cerrar + limpiar

ELIMINAR
  requestDelete(cat) → cuenta productos con ese categoriaId → ConfirmDialog
  → si hay productos: "Está asociada a X productos. Si la eliminas, esos
    productos quedarán sin categoría. ¿Deseas continuar?"
  → si no hay: "¿Deseas eliminar la categoría 'X'?"
  → confirmDelete() → categoriasStore.eliminarCategoria(Number(id))
  → cerrar + limpiar
```

> La vista **nunca** hace `categoria.nombre = ...`: toda modificación pasa por el store.

### Reactividad (sin copias manuales)

La tabla lee `categoriasStore.categorias` directamente y `SummaryCard` usa `totalCategorias`,
por eso **crear, editar y eliminar repintan todo solos**. Los selects de categorías de
`InventarioView` también se actualizan, porque comparten el mismo estado de Pinia.

---

---
---

# FASE 1 — Sección de Movimientos (Opción A) ✅ APROBADA

> **Fecha:** 29 sep 2026
> **Estado:** ✅ **IMPLEMENTADO** — se modificaron únicamente los 3 archivos autorizados.
> **Verificación:** `npm run build` → `✓ built in 1.30s`

---

## 1. Archivos modificados

| Archivo | Estado | Líneas |
|---|---|---|
| `src/components/movements/MovimientoForm.vue` | Creado desde 0 (estaba vacío) | ~330 |
| `src/components/movements/MovimientoTable.vue` | Creado desde 0 (estaba vacío) | ~190 |
| `src/views/MovimientosView.vue` | Reemplazado (decía "Vista de Reportes") | ~140 |

**NO se modificó:** `stores/` · `routes/routes.js` · `main.js` · `App.vue` · `layouts/` · `components/ui/` · `components/inventory/` · ninguna otra carpeta.

---

## 2. Qué hace cada archivo

### `MovimientoForm.vue` — solo muestra, valida y emite

- Diálogo `q-dialog` con el **mismo patrón que `ProductForm`** (`modelValue` + `update:modelValue`).
- **Props:** `modelValue`, `products`, **`error`** (aquí llega el fallo del store).
- **Emits:** `save` y `update:modelValue`. **No importa ningún store.**
- Campos:
  - `q-select` de productos (`emit-value map-options` → emite el `id`).
  - `q-input type="number"` con label dinámico: *"Cantidad a ingresar" / "Cantidad a retirar" / "Stock resultante"*.
  - `q-option-group` radio: `entrada | salida | ajuste`.
  - Ayuda: *"entrada suma el stock · salida lo resta · ajuste fija el stock resultante"*.
  - Indicador del **stock actual** del producto elegido.
- `validate()` local: producto requerido · cantidad > 0 (cubre `NaN`/vacío) · salida ≤ stock.
- Banner `q-banner` rojo con `localError || props.error` → **sin `$q.notify`**.
- `watch(modelValue)` → limpia el formulario al abrir y al cerrar.
- `saveForm()` convierte `cantidad` a `Number` antes de validar (evita `20 + "5" = "205"`).

### `MovimientoTable.vue` — solo presenta

- `q-table` en `q-card`, `row-key="id"`, mismo estilo que `ProductTable`.
- Columnas: **Fecha · Tipo · Producto · Cantidad**.
- `StatusBadge` reutilizado: Entrada `positive` / Salida `negative` / Ajuste `info`.
- Cantidad con signo y color: `+5` verde · `-3` rojo · `= 12` azul.
- Resuelve el producto con `productosStore.obtenerProductos(row.productoId)`; si no existe → *"Producto eliminado"*.
- Fecha ISO → `toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })`.
- `no-data-label="Aún no hay movimientos registrados"`.

### `MovimientosView.vue` — orquesta y llama al store

- `q-page` + `PageHeader` (botón *"Registrar movimiento"*) + `MovimientoTable` + `MovimientoForm`.
- `guardarMovimiento(datos)` → **`movimientosStore.registrarMovimiento(datos)`**.
- `formError` (ref) → se pasa al form por `:error`.
- `movimientosOrdenados` = `[...movimientos].reverse()` (copia antes de invertir).
- `watch(showForm)` → borra el error al cerrar.
- `<style scoped>` con el padding de `InventarioView`.

---

## 3. Flujo completo

```
[Registrar movimiento] → openForm() → showForm = true → diálogo abierto

Usuario llena el form
        │
        ▼
saveForm()
  ├─ convierte cantidad a Number
  ├─ validate() local ── falla ──► banner rojo (NO emite save)
  └─ ok → emit('save', {...form})
              │
              ▼
guardarMovimiento(datos)                ← MovimientosView
  ├─ registrarMovimiento(datos)
  │     ├─ VALIDA producto / cantidad / stock
  │     ├─ ACTUALIZA producto.cantidad        (requisito 8)
  │     ├─ push del movimiento                (requisito 9 + persiste solo)
  │     └─ devuelve movimiento  ó  null
  │
  ├─ null  → formError = describirError() → banner, diálogo ABIERTO,
  │                                            form conserva sus datos
  └─ ok    → showForm = false
               ├─ el form se limpia (watch)
               ├─ se borra formError (watch)
               └─ la tabla se repinta SOLA (reactividad de Pinia)
```

**Clave:** la tabla se actualiza sola porque `movimientosStore.movimientos` es estado reactivo; el `computed` se re-evalúa automáticamente.

---

## 4. Conexión con los stores

| Store | Quién lo usa | Cómo |
|---|---|---|
| `movimientosStore` | `MovimientosView` | `registrarMovimiento(datos)` y `movimientosStore.movimientos` |
| `productosStore` | `MovimientosView` | `productosStore.productos` → `:products` del form; `obtenerProductos(id)` → describir error |
| `productosStore` | `MovimientoTable` | `obtenerProductos(id)` → resolver nombre y código |

- **Vista → Form:** props (`products`, `error`)
- **Form → Vista:** evento (`save`)
- **Vista → Store:** acción (`registrarMovimiento`)
- **Store → Vista → Form:** valor de retorno (`null` → `formError` → prop `error`)

El store de movimientos llama internamente a `useProductosStore()` y muta `producto.cantidad` → **el stock se actualiza sin que la vista toque nada**.

---

## 5. Manejo de un movimiento inválido

### Capa 1 — el formulario (evita enviar datos malos)

| Caso | Mensaje |
|---|---|
| Sin producto | *"Selecciona un producto."* |
| Cantidad vacía / 0 / negativa / texto | *"La cantidad debe ser un número mayor a 0."* |
| Salida mayor al stock | *"Stock insuficiente: {producto} solo tiene {n} unidades."* |

### Capa 2 — el store (fuente de verdad) devuelve `null`

`describirError(datos)` en la vista devuelve:

- producto inexistente → *"El producto seleccionado ya no existe en el inventario."*
- cantidad ≤ 0 → *"La cantidad debe ser un número mayor a 0."*
- `salida` sin stock → *"Stock insuficiente: {nombre} solo tiene {n} unidades disponibles."*
- otro → *"No se pudo registrar el movimiento. Revisa los datos e inténtalo de nuevo."*

### Comportamiento visual

Diálogo **abierto** + banner rojo + formulario **conserva los datos** + tabla **sin cambios** (el store abortó antes de mutar). Al cerrar (éxito o cancelar) se limpia todo.

---

## 6. Cumplimiento de los 9 requisitos

| # | Requisito | Dónde |
|---|---|---|
| 1 | Ver movimientos registrados | `MovimientoTable` |
| 2 | Diferenciar entrada/salida/ajuste | `StatusBadge` + signo/color de la cantidad |
| 3 | Registrar nuevo movimiento | botón en `PageHeader` → diálogo |
| 4 | Seleccionar producto existente | `q-select` con `products` |
| 5 | Indicar la cantidad | `q-input type="number"` |
| 6 | Elegir tipo de movimiento | `q-option-group` radio |
| 7 | Usar `registrarMovimiento()` | `guardarMovimiento()` en la vista |
| 8 | Actualizar stock automáticamente | lo hace el store internamente |
| 9 | Mostrar movimientos en tabla | `MovimientoTable` |

---

## 7. Pendientes / decisiones futuras (no implementadas a propósito)

1. ~~**Ajuste a 0**: `stores/movimientos.js` rechaza `cantidad <= 0`, así que un ajuste no puede dejar el stock en 0.~~ → ✅ **RESUELTO en la Fase 6** (05 oct 2026): la validación ahora es por tipo (`ajuste` admite `0`, nunca negativo).
2. **Toasts con `$q.notify`**: `main.js` tiene `plugins: {}`; habría que registrar `Notify` ahí.
3. **Filtros por tipo**: el store ya expone los getters `entradas`, `salidas` y `ajuste`.

---
---

# FASE 5 — Dashboard ✅ COMPLETADA

> **Fecha:** 05 oct 2026
> **Estado:** ✅ **IMPLEMENTADA** — único archivo de código modificado: `src/views/DashboardView.vue`
> **Verificación:** `npm run build` → `✓ built in 2.39s` · 11/11 pruebas lógicas OK · sin dependencias nuevas.

## 5.1 Problema detectado (análisis previo)

| # | Problema | Línea original | Efecto |
|---|---|---|---|
| **P1** | `summaryCards` era un **array plano**, evaluado una sola vez en `setup()` | L35-59 | Valores **congelados al montar**: crear/eliminar productos o registrar movimientos no actualizaba las tarjetas |
| **P2** | `stockAlerts = productosStore.productosStockBajo` (asignación directa) | L61 | La lista "Alertas de stock" tampoco se repintaba |
| **P3** | Tarjeta 3: rótulo *"Movimientos"* pero valor `productosStore.unidadesDisponibles` | L54-57 | Dato que no correspondía al rótulo |

## 5.2 Decisiones aprobadas

- **Opción B** para la tarjeta 3: se corrige el **dato** → `movimientosStore.totalMovimientos` (se mantiene el rótulo *"Movimientos"*).
- **Respetar la indentación existente** — sin formateo general del archivo.
- Sin refactors adicionales, sin eliminar componentes, sin cambiar estructura.

## 5.3 Cambios realizados (solo `<script setup>` de `DashboardView.vue`)

1. **+ `import { computed } from 'vue'`**
2. **+ `import { useMovimientosStore } from '../stores/movimientos'`** y su instancia.
3. **`summaryCards` → `computed(() => [ … ])`** — array reactivo; cada tarjeta se recalcula cuando cambian los stores.
4. **Tarjeta 3:** `value: movimientosStore.totalMovimientos` · `description: 'Movimientos registrados'` *(icono `swap_horiz` y título `Movimientos` sin cambio)*.
5. **`stockAlerts` → `computed(() => productosStore.productosStockBajo)`**
6. **+ 2 comentarios en español** explicando por qué se usa `computed`.
7. Template, estilos, `quickActions` (constante estática → array plano correcto) y estructura: **sin cambios**.

## 5.4 Validaciones

| Prueba | Resultado |
|---|---|
| `npm run build` | ✅ `✓ built in 2.39s` — sin errores |
| Sintaxis / importaciones | ✅ todos los imports apuntan a archivos existentes |
| `totalProductos = 8` | ✅ ok |
| `productosStockBajo` inicial (2) | ✅ ok |
| `totalMovimientos` existe = 0 | ✅ ok |
| Crear producto → cambia el resumen | ✅ ok |
| Registrar movimiento → sube `totalMovimientos` | ✅ ok |
| Salida → cambia `productosStockBajo` | ✅ ok |
| Tarjeta 3 usa `totalMovimientos` ≠ `unidadesDisponibles` | ✅ ok |
| Eliminar producto → cambia `totalProductos` | ✅ ok |
| `stockAlerts` es array y cumple `>0 y ≤stockMinimo` | ✅ ok |
| **Total** | ✅ **11 pass · 0 fail** (test temporal `temp_fase5_test.mjs`, **eliminado** al terminar) |

## 5.5 Alcance verificado

- **Archivos modificados:** `src/views/DashboardView.vue` (+ este MD).
- **No tocados:** stores (productos, movimientos, categorías, proveedores) · `StockAlertList.vue` · `QuickActions.vue` · `SummaryCard.vue` · `routes.js` · `AppSidebar.vue` · `inicio.vue` · `main.js` · `App.vue` · `layouts/`.
- **Dependencias:** ninguna instalada (`package.json` intacto).
- **Reactividad corregida también en:** la lista "Alertas de stock" (mismo bug P2).

## 5.6 Pendientes conocidos

1. ~~`ANALISIS_ESTRUCTURA.md` fue reemplazado~~ → **RESUELTO**: historial de las Fases 1-4 restaurado y Fase 5 anexada al final (05 oct 2026).
2. **Exportación CSV/PDF** de Reportes (Fase 4, pendiente).
3. **Limpieza de archivos huérfanos** (`Products/*`, `movement/Movement*`, carpeta `suppliers/` vacía).
4. Ajuste a 0 en `stores/movimientos.js` (requiere tocar el store).

---

# ANEXO A — Encargo original de la FASE 5 (histórico, ya ejecutado)

> Texto entregado por el usuario para arrancar la Fase 5. Se conserva como registro del encargo.

Estamos iniciando la **FASE 5 — CORRECCIÓN Y FINALIZACIÓN DEL DASHBOARD** del proyecto TIENDA.

Las fases 1–4 ya están terminadas. En esta fase NO quiero que implementes cambios todavía. Primero necesito que analices el estado actual del Dashboard y me entregues un diagnóstico técnico.

### Objetivo de la Fase 5

Tenemos identificados estos problemas:

1. `DashboardView.vue`

   * `summaryCards` aparentemente está definido de una forma que hace que sus valores queden congelados al montar el componente.
   * Necesitamos que las tarjetas del Dashboard sean realmente reactivas respecto a los datos de los stores.

2. Tarjeta "Movimientos"

   * Actualmente la tarjeta aparece como **"Movimientos"**, pero está mostrando `unidadesDisponibles`.
   * Debemos determinar qué dato debe mostrar realmente y de dónde debe obtenerse.

### Lo que debes hacer

Analiza el código actual del proyecto y específicamente:

* `DashboardView.vue`
* Los stores relacionados con:

  * productos
  * movimientos
  * categorías
  * proveedores, si el Dashboard los utiliza
* Los componentes que utilice actualmente el Dashboard.
* Las rutas o vistas relacionadas, únicamente si son necesarias para entender el flujo.

### Importante

NO modifiques ningún archivo todavía.

NO refactorices código.

NO elimines componentes.

NO cambies la estructura del proyecto.

Primero quiero un análisis.

Tu respuesta debe incluir:

#### 1. Archivos involucrados

Indica exactamente qué archivos intervienen en el problema.

#### 2. Problema de reactividad

Explica por qué `summaryCards` no está reaccionando correctamente y cuál sería la solución técnicamente adecuada en Vue + Pinia.

#### 3. Tarjeta "Movimientos"

Determina:

* qué valor está mostrando actualmente;
* de dónde sale ese valor;
* qué debería mostrar;
* qué store/dato debería utilizarse.

#### 4. Impacto

Indica si corregir esto puede afectar otras partes del Dashboard o del sistema.

#### 5. Archivos que deberían modificarse

Haz una lista exacta de los archivos que consideras necesarios modificar.

#### 6. Archivos que NO deberían tocarse

Indica qué archivos revisaste pero no necesitan cambios.

#### 7. Plan de implementación

Propón los cambios concretos que deberían hacerse, pero todavía NO los ejecutes.

Al final indica claramente:

**"ANÁLISIS FASE 5 COMPLETADO — LISTO PARA IMPLEMENTAR"**

Solo después de que yo revise tu análisis te daré autorización para modificar código.

---
---

# FASE 6 — Completar y corregir Movimientos ✅ COMPLETADA

> **Fecha:** 05 oct 2026
> **Estado:** ✅ **IMPLEMENTADA** — 3 archivos de código modificados.
> **Verificación:** `npm run build` → `✓ built in 1.71s` · **21/21 pruebas lógicas OK** · sin dependencias nuevas.

## 6.1 Problema analizado (análisis previo, sin tocar código)

Un **ajuste de inventario no podía dejar el stock en `0`** por dos validaciones consecutivas:

| # | Barrera | Archivo / línea | Condición |
|---|---|---|---|
| 1 | Formulario | `MovimientoForm.vue` **L209** | `form.cantidad <= 0` → rechazaba el `0` para **todos** los tipos |
| 2 | Store | `stores/movimientos.js` **L50** | `datos.cantidad <= 0 → return null`, evaluado **antes** del bloque `ajuste` |

Además `q-input ... min="1"` sugería que el mínimo era 1.

**Verificaciones:** la **salida** que agota el stock **sí** llegaba a `0` (L72 valida `stock < cantidad`, estricto); el estado `cantidad === 0` ya estaba soportado en toda la app (`productosAgotados`, `InventarioView` → `'out'`, `ProductTable`, `ReportesView` → `'agotado'`, `MovimientoTable` → `= 0`).

## 6.2 Cambios realizados

### 1. `src/stores/movimientos.js` (L50-64) — cambio principal
```js
const cantidadInvalida = datos.tipo === 'ajuste'
    ? datos.cantidad < 0      // ajuste: 0 sí, negativo nunca
    : datos.cantidad <= 0     // entrada/salida: debe ser > 0

if (cantidadInvalida) { return null }
```

### 2. `src/components/movements/MovimientoForm.vue`
- `q-input` → `min="0"` (antes `min="1"`).
- `validate()` con **rama por tipo**: ajuste rechaza `< 0` (*"El stock resultante no puede ser negativo."*); entrada/salida rechazan `<= 0`.
- `saveForm()` **detecta el campo vacío ANTES de `Number()`** (porque `Number('') === 0` convertiría un ajuste sin dato en *"stock final 0"* por accidente) y solo después convierte.
- Nuevo mensaje: *"La cantidad debe ser un número."* para `NaN`.
- Comentarios en español actualizados (cabecera, campo de cantidad, validación).

### 3. `src/views/MovimientosView.vue`
- `describirError()`: rama específica `tipo === 'ajuste' && cantidad < 0`.
- Comentario de `guardarMovimiento()` ajustado (*"cantidad válida según el tipo"*).

## 6.3 Comportamiento resultante

| Caso | Antes | Ahora |
|---|---|---|
| Ajuste → `0` | ❌ bloqueado en 2 capas | ✅ `stock = 0`, movimiento registrado |
| Ajuste → `5` | ✅ | ✅ (sin cambios) |
| Ajuste → `-1` | ❌ | ❌ `null`, stock intacto |
| Salida total (deja `0`) | ✅ | ✅ (sin cambios) |
| Salida > stock | ❌ `null` | ❌ `null` (sin cambios) |
| Entrada/Salida → `0` | ❌ | ❌ `null` (siguen sin sentido) |
| Stock negativo | imposible | **imposible** |

## 6.4 Validaciones ejecutadas

- ✅ `npm run build` → `✓ built in 1.71s`
- ✅ **21 pass · 0 fail** (test temporal `temp_fase6_test.mjs`, **eliminado** al terminar): ajuste 0 · ajuste 7 · ajuste negativo (stock e historial intactos) · salida total → 0 · salida > stock · entrada/salida en 0 · entradas/salidas normales · producto inexistente · getters `agotados`/`stockBajo` clasificando el `0`
- ✅ Archivos modificados en esta fase (verificado por mtime): `stores/movimientos.js` · `movements/MovimientoForm.vue` · `views/MovimientosView.vue` (+ este MD)
- ✅ `package.json` intacto · sin archivos temporales · sin huérfanos tocados · `main.js`, `routes`, `layouts`, `ui/`, `inventory/`, `ReportesView`, `DashboardView` sin cambios

## 6.5 Riesgos evaluados

🟢 **Nulo** para productos, Dashboard, Reportes, Inventario, histórico de movimientos y demás stores: todos ya manejaban `cantidad === 0` como *"agotado"*, y el store solo **añade** filas (nunca reescribe el histórico; `persist: true` intacto).

## 6.6 Pendientes detectados (NO implementados a propósito)

1. **Filtros por tipo en Movimientos:** no existen en la vista. Existe `MovementFilters.vue` **huérfano** (búsqueda + tipo + fecha) reservado para la fase de limpieza. Propuesta futura: `ref` + `computed` en la vista (~4 líneas), sin tocar el store.
2. **Notificaciones `$q.notify`:** no existen (`main.js` → `plugins: {}`, lanzaría error). Requeriría registrar `Notify` en `main.js` + usarlas en el éxito de `guardarMovimiento()`.
3. **Agujero `NaN` en el store:** `NaN <= 0` es `false`, así que un `cantidad` no numérico **no** es rechazado por el store (el formulario ya lo bloquea con *"La cantidad debe ser un número."*). Posible endurecimiento futuro: `Number.isNaN(Number(datos.cantidad))`.
4. **Limpieza de archivos huérfanos** (`Movement*`, `Products/*`, carpeta `suppliers/` vacía).
5. **Exportación CSV/PDF** de Reportes (Fase 4).

---

---

# FASE 7 — Revisión y finalización de Inventario/Productos ✅ COMPLETADA

> **Fecha:** 05 oct 2026
> **Estado:** ✅ **IMPLEMENTADA** — 4 archivos de código modificados.
> **Verificación:** `npm run build` → `✓ built in 1.39s` · **54/54 pruebas propias** + **62/62 pruebas `fase7.test.mjs`** · sin dependencias nuevas.

## 7.1 ⚠️ Ediciones concurrentes detectadas (importante)

Durante esta fase **otra sesión de OpenCode (o el editor del usuario) modificó en paralelo los mismos archivos**, en la franja 13:08–13:16:

| Archivo | Quién lo tocó |
|---|---|
| `src/stores/productos.js` | ambos (yo añadí y luego **quité** un helper duplicado) |
| `src/components/inventory/ProductForm.vue` | sesión concurrente |
| `src/views/InventarioView.vue` | sesión concurrente |
| `src/components/Products/ProductInfoCard.vue` | sesión concurrente |
| `fase7.test.mjs` · `fase7.ssr.test.mjs` (raíz) | sesión concurrente |

Lo hizo esta sesión: **revisó línea por línea** cada archivo resultante (no sobrescribió), **eliminó `validarProducto()`**, un helper que yo mismo había añadido y que *duplicaba* `esProductoValido` + `normalizarProducto` (reglas idénticas, ya implementadas), y **validó el conjunto con pruebas**. Alcance final verificado por `mtime` sobre `src/`.

## 7.2 Problemas encontrados y corregidos

| # | Problema | Dónde estaba | Corrección |
|---|---|---|---|
| 1 | **El formulario no validaba nada** (nombre vacío, sin categoría/proveedor, negativos pasaban) | `ProductForm.vue` `saveProduct()` | `validate()` con 12 reglas + `q-banner` de error (patrón del proyecto, sin `$q.notify`) |
| 2 | **Los errores del store se ignoraban**: `saveProduct` no miraba el retorno, el diálogo se cerraba aunque nada se hubiera guardado | `InventarioView.vue` | `formError` → prop `:error` al formulario → banner; el diálogo **queda abierto** con el mensaje |
| 3 | **`codigo` duplicable**: `generarCodigo()` = `productos.length + 1` → al borrar un producto intermedio chocaba con un `PRD-###` existente | `stores/productos.js` | sufijo = **máximo existente + 1** |
| 4 | **`id` no garantizado único**: `Date.now()` solo | `stores/productos.js` | `generarId()` con bucle de colisión |
| 5 | **Sin normalización de tipos**: cantidades/precios llegaban como texto → `"10" + 5 = "105"`, ids como string rompían búsquedas y filtros | `stores/productos.js` | `normalizarProducto()`: números a `number`, ids a `number`/`null`, nombre recortado |
| 6 | **El store aceptaba estado inválido**: stock negativo, precios negativos, nombre vacío | `crearProducto` / `editarProductos` | `esProductoValido()` → devuelve `null` y **no escribe** el estado (segunda capa, como en Fase 6) |
| 7 | **Referencias inválidas en el selector**: si la categoría/proveedor se borraba, el `q-select` mostraba un id suelto | `ProductForm.loadProduct()` | si el id no existe en las opciones se carga como `null` → el usuario debe elegir una referencia válida |
| 8 | **Búsqueda frágil**: `product.nombre.toLowerCase()` crasheaba con `null`; `categoriaId === Number(...)` fallaba con tipos mezclados | `InventarioView.filteredProducts` | `String(x ?? '')` defensivo en nombre/código + `Number()` en **ambos** lados de la comparación de categoría |
| 9 | **El formulario retenía datos viejos** al reabrirse (cancelar → reabrir) | `ProductForm.vue` | watchers en `modelValue` y `product` → `sincronizarFormulario()` al abrir |
| 10 | El detalle **no mostraba el precio de compra** | `Products/ProductInfoCard.vue` | nuevo `info-item` "Precio de compra" |

## 7.3 Regla de stock aplicada en 3 capas

```text
stock > 0  → válido
stock = 0  → válido
stock < 0  → inválido
```

| Capa | Mecanismo |
|---|---|
| Formulario | `min="0"` + `validate()` → *"El stock no puede ser negativo."* |
| Store `productos` | `esProductoValido()` → `cantidad < 0` o `NaN` → `null` |
| Store `movimientos` | (Fase 6) entrada/salida `> 0`, ajuste `>= 0`, salida `> stock` rechazada |

No se duplicó la lógica de movimiento: **entrada/salida/ajuste siguen siendo exclusivos de `stores/movimientos.js`**; el CRUD de productos solo valida sus propios campos.

## 7.4 Pruebas ejecutadas

| Suite | Resultado |
|---|---|
| `temp_fase7_test.mjs` (propia, **eliminada** al terminar) | **54/54 ✅** — crear/editar/eliminar/buscar · validaciones (stock 0 ✓, negativos ✗, nombre vacío ✗, precios ✗, stock mínimo ✗) · normalización de tipos · código sin duplicar tras ciclos de borrado · relaciones (`Sin categoría`/`Sin proveedor`, reparación en edición) · integración entrada/salida/ajuste → stock correcto e historial consistente · getters agotado/stock bajo/disponible |
| `fase7.test.mjs` (sesión concurrente) | **62/62 ✅** — mismos bloques + reactividad Pinia |
| `fase7.ssr.test.mjs` (sesión concurrente) | ❌ **falla**: `window is not defined` (`quasar.client.js` se resuelve en build cliente dentro de Node) → **limitación del test**, no de la app |
| `npm run build` | ✅ `✓ built in 1.39s` |
| E2E en navegador | ⚠️ **no ejecutado**: navegador de escritorio desconectado de la sesión |

## 7.5 Archivos modificados en la fase

```
src/stores/productos.js
src/components/inventory/ProductForm.vue
src/views/InventarioView.vue
src/components/Products/ProductInfoCard.vue
ANALISIS_ESTRUCTURA.md   (este documento)
```

**Fuera de alcance (verificado por `mtime`, sin cambios):** `ReportesView`, `DashboardView`, `main.js`, `router`, `layouts/`, `components/ui/`, `inventory/ProductTable.vue`, `inventory/ProductFilters.vue`, `stores/movimientos.js`, `stores/categorias.js`, `stores/proveedores.js`, `package.json`, huérfanos.

## 7.6 Pendientes detectados (NO implementados a propósito)

1. **`fase7.ssr.test.mjs` roto** (pertenece a la sesión concurrente): requiere un entorno con `window` o resolver `quasar` a su build server. La app de navegador no se ve afectada.
2. **E2E en navegador**: pendiente de que el navegador de escritorio se conecte (flujo `/#/inventario` completo).
3. **Limpieza de archivos huérfanos** (fase aparte) — ahora sumaría `fase7*.mjs` en la raíz.
4. **Pendientes anteriores sin tocar:** `$q.notify`, CSV/PDF en Reportes, filtros por tipo en Movimientos, guard `NaN` en `stores/movimientos.js`.
5. **Revisar si la otra sesión sigue activa** antes de commitear: dos agentes escribiendo a la vez pueden pisarse el MD.

---

---

# FASE 8 — Categorías y Proveedores ✅ COMPLETADA

> **Fecha:** 05 oct 2026
> **Estado:** ✅ **IMPLEMENTADA** — 8 archivos de código modificados (todos en alcance).
> **Verificación:** `npm run build` → `✓ built in 1.63s` · **88/88 pruebas** · sin dependencias nuevas.

## 8.1 Problemas encontrados (8)

| # | Módulo | Problema | Evidencia |
|---|---|---|---|
| 1 | Proveedores | **La vista se caía al limpiar la búsqueda**: el `clearable` de Quasar emite `null`, y `filteredProviders` hacía `search.value.toLowerCase()` → `TypeError: Cannot read properties of null` | `quasar.client.js` → `clearValue()` hace `emit("update:modelValue", null)` |
| 2 | Categorías | **No existía búsqueda** (el módulo ni siquiera tenía campo) | `CategoriasView` sin `search` |
| 3 | Categorías | **`crearCategoria` no validaba**: aceptaba vacío y duplicados, aunque `editarCategoria` sí los rechazaba (asimetría: un duplicado entraba por crear y luego ni se podía editar) | `stores/categorias.js` L58 |
| 4 | Proveedores | **`crearProveedor`/`editarProveedor` no validaban nada** (nombre vacío, duplicados, campos faltantes) y `{ id: nuevoId, ...datos }` dejaba que un `id` enviado por error pisara el autogenerado | `stores/proveedores.js` L35-58 |
| 5 | Proveedores | **Teléfono/correo/dirección marcados `required` en la UI pero nunca validados**: se creaban proveedores incompletos | `ProviderForm.validate()` solo revisaba el nombre |
| 6 | Ambos | **Los stores devuelven `null` pero las vistas lo ignoraban**: el diálogo se cerraba aunque no se hubiera guardado nada | `saveCategory()` / `saveProvider()` |
| 7 | Ambos | **Referencias inválidas al eliminar registros en uso**: los productos conservaban `categoriaId`/`proveedorId` apuntando a algo inexistente | ver 8.2 |
| 8 | Categorías | **`editarCategoria` devolvía `undefined`** en los rechazos mientras `crearCategoria` (nueva) devolvía `null` → condición inconsistente para quien llama | `stores/categorias.js` |

## 8.2 Solución a las referencias inválidas (decisión de diseño)

Se evaluó y **no** se bloqueó la eliminación de categorías/proveedores en uso (eso revertiría la decisión aprobada en Fase 2: *"se permite con advertencia"*). En su lugar:

```
Confirmar eliminación
   → eliminarCategoria(id) / eliminarProveedor(id)
   → productosStore.desasociarCategoria(id) / desasociarProveedor(id)   ← NUEVO
        (solo los productos afectados: categoriaId/proveedorId → null)
```

- **No se borra ni se modifica ningún otro dato del producto** (nombre, stock, precios, código intactos).
- La interfaz ya soportaba `null`: getters → `"Sin categoría"`/`"Sin proveedor"`, tabla de inventario, detalle, Reportes y el filtro de InventarioView (guarda `!== null`). `ProductForm` (Fase 7) exige volver a elegir una referencia al editar.
- La acción vive en `stores/productos.js` (dueño del estado), **no** en los stores de categorías/proveedores → se evita el ciclo `categorias ↔ productos`.

## 8.3 Cambios por archivo

| Archivo | Cambio |
|---|---|
| `stores/categorias.js` | `crearCategoria` valida (obligatorio + duplicado case/espacios-insensibles) y devuelve el objeto o `null`; `editarCategoria` pasa a devolver `null` en vez de `undefined` |
| `stores/proveedores.js` | Helper `prepararProveedor()` (trim + 4 campos obligatorios + duplicado con exclusión del propio id); `crearProveedor` construye **solo** los 4 campos (un `id` recibido ya no pisa el autogenerado); `editarProveedor` valida los datos finales |
| `stores/productos.js` | Nuevas acciones `desasociarCategoria()` y `desasociarProveedor()` (id → `null` solo en productos afectados) |
| `views/CategoriasView.vue` | Buscador (`clearable`, por nombre, parcial) + `filteredCategories` + `emptyLabel` dinámico · `formError` → `:error` y el diálogo **queda abierto** si el store rechaza · `confirmDelete` desvincula productos |
| `components/categories/CategoriaForm.vue` | Nueva prop `error`; `mensajeError = localError \|\| error` en el banner |
| `views/ProveedoresView.vue` | **Fix del crash** con `String(search.value ?? '')` · `emptyLabel` dinámico · `formError` → `:error` · `deleteProvider` desvincula productos |
| `components/providers/ProviderForm.vue` | Validación de teléfono/correo/dirección obligatorios (antes solo el nombre) · nueva prop `error` con `mensajeError` |
| `components/providers/ProviderTable.vue` | Prop `noDataLabel` (default = texto anterior) para distinguir *"no hay proveedores"* de *"sin resultados de búsqueda"* |

## 8.4 Validaciones implementadas

| Regla | Formulario | Store |
|---|---|---|
| Categoría: nombre obligatorio, sin espacios, sin duplicados | ✅ `validate()` | ✅ `crearCategoria` + `editarCategoria` |
| Proveedor: nombre obligatorio + sin duplicados | ✅ | ✅ `prepararProveedor()` |
| Proveedor: teléfono, correo y dirección obligatorios | ✅ (ya estaban marcados `required`, ahora se validan) | ✅ |
| Nombres duplicados al editar | ✅ excluye el propio registro | ✅ excluye el propio id |
| Errores visibles | ✅ `q-banner` (sin `$q.notify`: no está registrado) | ✅ vía prop `error` |

**No** se inventaron restricciones: no hay validación de formato de correo ni de número de teléfono (no existía regla establecida).

## 8.5 Pruebas ejecutadas

`temp_fase8_test.mjs` (**eliminado** al terminar) contra los stores **reales** + aserciones sobre el fuente de las vistas: **88 pass · 0 fail**

- **Categorías (27):** crear válido/vacío/espacios/duplicados · editar/renombre/propios-nombre/vacío/duplicado/id-inexistente · id como texto · eliminar · búsqueda (exacta, parcial, mayúsculas, sin resultados, limpiar con `null`/vacío).
- **Proveedores (30):** crear con los 4 campos · sin teléfono/correo/dirección/nombre · duplicado · recortado · id externo no pisa el autogenerado · editar (todo, propio nombre, campo vacío, duplicado, id inexistente) · estado intacto tras rechazos · eliminar · búsqueda por nombre/correo/teléfono/limpiar.
- **Relaciones (14):** producto con categoría y proveedor válidos · cambio de ambos conservando stock/precios · **borrar categoría/proveedor en uso → `null` + "Sin categoría"/"Sin proveedor"** · producto NO se borra ni pierde datos · productos ajenos intactos · referencias heredadas inexistentes resueltas.
- **Integración (6):** entrada/salida/ajuste sobre el producto desasociado (10 → 15 → 12 → 0, agotado) · getters vivos.
- **Fuente (11):** búsqueda `null-safe`, `desasociar*`, `:error="formError"`, `emptyLabel`, validaciones de `ProviderForm`, `mensajeError`.
- `npm run build` → ✅ **`✓ built in 1.63s`** (y `1.44s` en corrida intermedia).
- ⚠️ **No se ejecutó montaje de componentes ni E2E**: el navegador de escritorio sigue desconectado y la prueba SSR en Node falla por `window/document` de Quasar (ver 8.6).

## 8.6 Pendientes detectados (NO implementados a propósito)

1. **Prueba de montaje/E2E**: `temp_fase8_ssr.mjs` se intentó y se descartó — el build cliente de Quasar evalúa `window`/`document` al importarse en Node. Solución real: resolver `quasar` → `quasar/dist/quasar.server.prod.js` (en Vite 8 habría que probar `environments.ssr.resolve.alias`, el `resolve.alias` heredado no aplicó) o usar jsdom/navegador. **`fase7.ssr.test.mjs` sigue roto por lo mismo.**
2. **Filtro de categoría en Reportes** puede quedar apuntando a una categoría ya eliminada (muestra 0 filas y el id crudo en el `q-select`): preexistente, fuera de alcance (no se tocó Reportes).
3. **Sin validación de formato de correo/teléfono** (no hay regla establecida en el proyecto).
4. **Pendientes anteriores sin tocar:** huérfanos (`fase7*.mjs` en raíz incluidos), `$q.notify`, CSV/PDF, filtros por tipo en Movimientos, guard `NaN` en `stores/movimientos.js`.

---

---

# FASE 9 — Reportes y exportaciones ✅ COMPLETADA

> **Fecha:** 05 oct 2026
> **Estado:** ✅ **IMPLEMENTADA** — 1 archivo nuevo + 1 vista modificada (ambos en alcance) + `package.json`.
> **Verificación:** `npm run build` → `✓ built in 5.02s` · **123/123 pruebas** · 1 dependencia nueva (`jspdf`).

## 9.1 Estado anterior de Reportes (análisis previo)

| Aspecto | Hallazgo |
|---|---|
| Vista | `src/views/ReportesView.vue` (737 líneas, todo en un archivo — decisión de la Fase 4) |
| Componentes | `PageHeader`, `SummaryCard`, `EmptyState`, `MovimientoTable` (todos reutilizados, sin modificar) |
| Stores | `productos`, `movimientos`, `categorias`, `proveedores` — **solo lectura** |
| Datos | 10 secciones: resumen (5 tarjetas), valorización (3), inventario por categoría, por proveedor, estado del stock (barra CSS), resumen de movimientos (5), últimos 10 movimientos, gráfico por tipo (CSS) |
| Cálculos | todos con `computed` sobre los getters de Pinia → **ya eran reactivos** (no había datos congelados) |
| Filtros | fechas (movimientos) · categoría y estado (productos) · botón "Limpiar filtros" — **ya funcionaban** |
| Acciones | solo "Limpiar filtros" → **no existía ninguna exportación** (0 botones, 0 utilidades) |
| Dependencias | `package.json` **sin ninguna librería de CSV o PDF** (ni siquiera transitiva) |

**Decisión:** no se reemplazó nada de lo que ya funcionaba; la vista conserva intactos sus `computed`, sus filtros y sus tablas. Lo nuevo se añadió alrededor.

## 9.2 Problemas encontrados y corregidos

| # | Problema | Dónde | Corrección |
|---|---|---|---|
| 1 | **No existía exportación alguna** (ni CSV ni PDF) | `ReportesView.vue` | 7 secciones exportables + botones "Exportar CSV" y "Exportar PDF" |
| 2 | **Bug real de maquetación**: los anchos de columna se medían con letra *normal* pero la cabecera se dibujaba en *negrita* → encabezado cortado (`Valor al c…`) en el PDF | `utils/exportaciones.js` → `calcularAnchosColumnas()` | se mide la cabecera **en negrita** y las celdas en normal (detectado con una sonda que extrae el texto real del PDF) |
| 3 | **Estado vacío faltante**: sin productos para los filtros, la sección "Estado del stock" mostraba `0/0/0%` con la barra vacía | `ReportesView.vue` | `v-if="estadoStock.total === 0"` → `EmptyState` "Sin datos" |
| 4 | **Sin confirmación de la exportación** (¿se descargó? ¿falló?) | `ReportesView.vue` | `q-banner` con *"Reporte exportado correctamente."* / *"Error al generar el reporte."* — **sin `$q.notify`** (no está registrado, igual que el resto del proyecto) |
| 5 | Riesgo de **duplicar `formatearMoneda`** entre pantalla y exportación (formatos distintos = reporte incoherente) | vista + utilidad | una sola función, en `utils/exportaciones.js`; la vista la importa |

## 9.3 Decisiones de diseño de la exportación

### Un solo modelo de datos para los dos formatos

```text
seccionesExportables (computed en la vista)
   = mismos computeds que pinta la pantalla, con columnas tipadas
        ↓
   ┌────────────┴────────────┐
generarCSV()              generarPDF()      ← utils/exportaciones.js
```

Así el archivo **nunca** muestra información distinta a la que consulta el usuario y **respeta los filtros vigentes**. Cada columna declara su tipo (`texto` · `entero` · `moneda` · `fecha`):

| Tipo | CSV | PDF |
|---|---|---|
| `moneda` | valor crudo (`740000`) → se puede sumar en Excel | `$740.000` → igual que en pantalla |
| `entero` | `178` | `178` |
| `fecha` | `2026-10-04` (ISO, consistente) | `2026-10-04` |

### CSV (sin dependencias)

- Generado a mano: **BOM UTF-8** (Excel reconoce los acentos) + finales **CRLF** (RFC 4180).
- Separador **`;`**, el separador de listas de es-CO que espera Excel en español.
- Escapado completo: valores con `;`, `"` o saltos de línea se entrecomillan y las comillas dobles se duplican.
- Estructura: título + `Generado:` + `Filtros:` y luego una sección por bloque (título, encabezados, filas, línea en blanco).
- Sección sin filas → fila *"Sin datos para los filtros actuales"*.
- Descarga con `Blob` + `URL.createObjectURL` + enlace temporal.

### PDF (jsPDF, única dependencia nueva)

- A4 en milímetros con márgenes de 14 mm; ancho útil de tabla **182 mm**.
- Portada: título (16 pt) + metadatos + línea separadora; cada sección con su título, cabecera en gris y filas con línea de separación.
- **Anchos proporcionales**: se mide el contenido y, si no cabe, se escala todo al ancho disponible; el texto que aún excede se corta con `…` → **la información nunca se sale de la página**.
- **Saltos de página** automáticos con la cabecera de la tabla **repetida** y un encabezado de continuación.
- Pie con `Página N de M` en todas las páginas.
- Tablas dibujadas a mano (no se instaló `jspdf-autotable`).

### ¿Por qué `jspdf`?

Primero se revisó `package.json`: **no había** librería de CSV ni de PDF (ni transitivas). CSV no la necesita (se genera a mano). Para PDF la alternativa sin dependencias era `window.print()`, que **no produce un archivo descargable verificable** ni controla saltos/columnas. Se instaló **`jspdf@4.2.1`** (estable, MIT, funcional también en Node para pruebas) y **`html2canvas`/`dompurify`** que trae dentro quedan en *chunks* diferidos que **no se cargan** (solo los usa `doc.html()`, que no se usa). **No se agregó ninguna otra dependencia.**

## 9.4 Cambios por archivo

| Archivo | Cambio |
|---|---|
| `src/utils/exportaciones.js` | **Nuevo.** `formatearMoneda`, `generarCSV`, `generarPDF`, `calcularAnchosColumnas`, `descargarTexto`, `nombreArchivoReporte` |
| `src/views/ReportesView.vue` | Botones en el `PageHeader` · `q-banner` de resultado · `seccionesExportables` (7 secciones) · `descripcionFiltros()`/`opcionesExportacion()` · `exportarCSV()`/`exportarPDF()` · `EmptyState` en "Estado del stock" · `formatearMoneda` ahora se importa |
| `package.json` / `package-lock.json` | `+ jspdf` (única dependencia nueva) |

Secciones exportadas (coinciden 1:1 con los títulos en pantalla): Resumen general · Valorización del inventario · Inventario por categoría · Inventario por proveedor · Estado del stock · Movimientos · Últimos 10 movimientos.

**No se exportó** "Movimientos por tipo": es un gráfico que duplica los números de la sección "Movimientos".

## 9.5 Pruebas ejecutadas

`temp_fase9_test.mjs` + `temp_loader.mjs` (**eliminados** al terminar): **123 pass · 0 fail**

- **CSV (20):** BOM, CRLF, título/metadatos, encabezados, valores enteros, moneda cruda (sin mezclar formato), parser CSV propio con comillas (columnas alineadas tras `;`, `"` duplicado, salto de línea interno), sección vacía, nombre de archivo.
- **PDF (22):** cabecera `%PDF`, título, metadatos, acentos (`Categoría`, `Lácteos y frutas`), moneda formateada, sección vacía, pie numerado · **500 filas → 12 páginas** con cabecera repetida y última fila completa · `calcularAnchosColumnas` ≤ 182 mm con celdas gigantes · truncado con `…` · **regresión del bug de negrita**.
- **Formato (4):** `formatearMoneda` con valores válidos/`undefined`/`null`.
- **Reportes con stores reales (34):** carga de datos, valorización/unidades contra los getters, filtros de categoría/estado (aplicar, limpiar, **sin resultados**), fechas (aplicar, limpiar, sin resultados) · reactividad con `computed` de Vue reales: **crear producto**, **entrada/salida/ajuste** → unidades, valorización y resumen de movimientos se recalculan · tipos de movimiento correctos.
- **Secciones exportadas (12):** CSV y PDF construidos con datos reales · el producto nuevo queda contabilizado en su categoría y en las unidades · **con filtro de categoría el archivo solo trae esa categoría**.
- **Fuente/alcance (31):** botones, handlers, mensajes, `q-banner` sin `$q.notify`, import de la utilidad, `formatearMoneda` sin duplicar, **las 7 secciones exportadas existen como títulos en pantalla**, estados vacíos, `DashboardView` intacto, **`jspdf` única dependencia nueva**.
- **Muestras visuales:** se generaron un CSV y un PDF reales con los datos de los stores; el PDF se renderizó con Quick Look y se verificó **ambas páginas** (portada con todas las secciones y página 2 con la cabecera repetida + *"Página 2 de 2"*). Los archivos temporales se borraron.
- `npm run build` → ✅ **`✓ built in 5.02s`**.
- ⚠️ **No se ejecutó E2E en navegador**: sigue desconectado el navegador de escritorio (la descarga real del archivo no se pudo probar en vivo; la generación sí está probada).

## 9.6 Alcance verificado

```text
find . -newer package.json   →   package.json, package-lock.json,
                                 src/utils/exportaciones.js,
                                 src/views/ReportesView.vue   (+ temporales ya borrados)
```

**Sin cambios:** `DashboardView`, `InventarioView`, `MovimientosView`, `CategoriasView`, `ProveedoresView`, `ProductoDetalleView`, todos los stores, `main.js`, `router`, `layouts/`, `components/ui/`, huérfanos.

## 9.7 Pendientes detectados (NO implementados a propósito)

1. **E2E / descarga en vivo**: pendiente de que se conecte el navegador de escritorio (probar `/#/reportes` → botones → archivo descargado).
2. **Revisar el CSV en Excel** a mano (la estructura está probada con un parser propio, pero no se abrió en una hoja de cálculo real).
3. **Limpieza de archivos huérfanos** (Fase 10): `Movement*`, `Products/`, `suppliers/` vacía, `fase7*.mjs` de la sesión concurrente. → **Hecho en la Fase 10** (excepto `fase7*.mjs`, conservados por decisión del usuario).
4. **Pendientes anteriores sin tocar:** `$q.notify` (requiere `main.js`), filtros por tipo en Movimientos, guard `NaN` en `stores/movimientos.js`, filtro de categoría en Reportes apuntando a una categoría borrada (preexistente; ahora el export lo refleja igual que la pantalla).
5. **Sin git**: el repo sigue sin commits.

---

# FASE 10 — Limpieza, validaciones y SweetAlert2 ✅ COMPLETADA

> **Encargo:** (a) limpieza técnica — eliminar solo lo comprobadamente no usado,
> sin romper nada; (b) revisión integral de validaciones; (c) unificación de las
> interacciones importantes con **SweetAlert2**, respetando la arquitectura
> existente. Sin funcionalidades nuevas, sin rediseños, sin cambios de rutas ni
> de lógica de negocio (salvo el bloqueo de borrado en uso, exigido por el
> propio encargo).

## 10.1 Decisiones tomadas con el usuario (2 preguntas)

1. **Solución de alertas.** No había `sweetalert2` instalado, pero sí existía un
   mecanismo equivalente en uso (`q-dialog` vía `ui/ConfirmDialog.vue`). Se
   preguntó y el usuario eligió **instalar SweetAlert2** y unificar todo con él
   → única librería de alertas del sistema, sin mezclar.
2. **`fase7*.mjs` (4 archivos de pruebas de otra sesión).** Se eligió
   **conservarlos** (regla "es preferible conservar un archivo dudoso") y
   reportarlos como pendientes de revisión manual.

## 10.2 Auditoría previa (cómo se comprobó cada referencia)

Antes de borrar **nada** se ejecutaron 5 comprobaciones sobre todo el proyecto
(`src/`, `index.html`, `vite.config.js`, `package.json`, documentación):

1. **Referencia por nombre**: script que, para cada archivo de `src/`, busca su
   nombre en todos los demás archivos `.vue`/`.js`.
2. **Imports dinámicos**: búsqueda de `defineAsyncComponent`, `resolveComponent`,
   `import(` y `:is=` → solo existen en `routes.js` y todos apuntan a archivos
   que siguen existiendo.
3. **Referencias en configuración**: `vite.config.js` referencia
   `src/quasar-variables.sass` → **conservado**; `index.html` referencia
   `/favicon.svg` → **conservado**.
4. **Referencias en estilos/HTML**: `url(`, `.png`, `.svg`, `<img>` en `src/`
   → **cero** (ninguna imagen se usa en toda la aplicación).
5. **Imports sin uso en cada archivo** (script propio) → **ninguno** tras la
   limpieza.

## 10.3 ELIMINADOS (16 archivos + 3 carpetas)

| # | Archivo | Líneas | Motivo (verificado) |
|---|---------|--------|---------------------|
| 1 | `src/components/HelloWorld.vue` | 7 | Scaffold de Vite, 0 referencias |
| 2 | `src/components/Common/ConfirmDialog.vue` | 0 | **Vacío** y duplicado de `ui/ConfirmDialog.vue` |
| 3 | `src/components/Products/ProductoCard.vue` | 0 | **Vacío**, 0 referencias |
| 4 | `src/components/Products/ProductoForm.vue` | 226 | Formulario antiguo reemplazado por `inventory/ProductForm.vue` |
| 5 | `src/components/Products/ProductoTable.vue` | 0 | **Vacío**, 0 referencias |
| 6 | `src/components/movements/MovementFilters.vue` | 100 | Versión en inglés, reemplazada por `inventory/ProductFilters.vue` |
| 7 | `src/components/movements/MovementForm.vue` | 174 | Duplicado antiguo de `MovimientoForm.vue` |
| 8 | `src/components/movements/MovementSummary.vue` | 70 | Duplicado antiguo, 0 referencias |
| 9 | `src/components/movements/MovementTable.vue` | 145 | Duplicado antiguo de `MovimientoTable.vue` |
| 10 | `src/components/ui/LoadingState.vue` | 38 | 0 referencias en todo el proyecto |
| 11 | `src/components/ui/ConfirmDialog.vue` | — | **Migrado a SweetAlert2**: las 3 vistas que lo usaban ahora confirman con `confirmarOperacion()` |
| 12 | `src/stores/stores.js` | 3 | Solo 2 imports sin uso, no define nada |
| 13 | `src/style.css` | 0 | **Vacío** y no importado por nadie |
| 14 | `src/assets/hero.png` | — | 0 referencias (ninguna imagen se usa en `src/`) |
| 15 | `src/assets/vite.svg` | — | Asset de scaffold de Vite, 0 referencias |
| 16 | `src/assets/vue.svg` | — | Asset de scaffold de Vue, 0 referencias |

**Carpetas eliminadas (3):** `src/components/Common/` (quedó vacía),
`src/components/suppliers/` (ya estaba vacía), `src/assets/` (quedó vacía).

> **Importante:** tras eliminar `ui/ConfirmDialog.vue` **no quedó ninguna
> referencia rota**: se volvió a comprobar con el mismo script de auditoría y
> `npm run build`.

## 10.4 CONSERVADOS (revisados, no eliminados)

| Archivo / carpeta | Por qué se conservó |
|---|---|
| `src/quasar-variables.sass` | Lo referencia `vite.config.js` (`sassVariables`) |
| `public/favicon.svg` | Lo referencia `index.html` |
| `public/icons.svg` | Sprite de iconos (Bluesky) **sin referencias**; asset en `public/` con posible uso intencional → **pendiente de revisión manual** |
| `fase7.test.mjs`, `fase7.form.test.mjs`, `fase7.ssr.test.mjs`, `fase7.dom-stubs.mjs` | Decisión del usuario: conservar. Suites de otra sesión; ninguna las ejecuta; `fase7.ssr.test.mjs` **sigue roto** (Quasar necesita `window`/`document` en Node) |
| `~$QUERIMIENTOS TIENDA.docx` | Candado temporal de Word (no es código); decisión del usuario → **pendiente** |
| `src/components/Products/` | Conserva `ProductInfoCard.vue` y `ProductStockCard.vue`, usados por `ProductoDetalleView.vue` |
| `src/components/movements/` | Conserva `MovimientoForm.vue` y `MovimientoTable.vue` (los activos) |
| `src/components/ui/` | `PageHeader`, `SummaryCard`, `EmptyState`, `StatusBadge` siguen en uso |
| El resto de vistas, stores, componentes, `main.js`, `routes/`, `App.vue`, `layouts/` | En uso o estructurales; **no se modificó ninguno** (Dashboard, tablas, formularios y stores funcionales quedan intactos) |

## 10.5 Imports y código muerto eliminados

- **Imports de `ConfirmDialog`** en `InventarioView`, `CategoriasView` y
  `ProveedoresView` → sustituidos por `../utils/alertas`.
- **Import de `watch` sin uso** en `MovimientosView.vue` (el `watch` que limpiaba
  `formError` dejó de existir).
- **Estado local muerto eliminado en 4 vistas:** `formError`, `showDeleteConfirm`,
  `showDeleteDialog`, `productToDelete`, `providerToDelete`, `categoryToDelete`,
  `deleteMessage`, `mensajeExportacion`, `tipoMensajeExportacion`,
  `mostrarMensaje` y el bloque `<q-banner>` de exportación.
- **Verificación:** script de imports sin uso → *ninguno*; no hay
  `console.log/error/warn` en `src/`.

## 10.6 Stores: auditoría (NO se eliminó nada)

Se revisaron todos los miembros. **No se borró ninguno**: el encargo prohíbe
cambiar stores funcionales y, ante la duda, manda conservar y reportar.

| Store | Miembro | Estado | Decisión |
|---|---|---|---|
| `productos` | `desasociarCategoria` / `desasociarProveedor` | **Sin uso desde la Fase 10**: el nuevo bloqueo impide borrar categorías/proveedores con productos | Se conserva (mismo criterio que en Fases 2/8) |
| `productos` | getter `productosConProveedor` | Sin uso fuera del store | Se conserva y se reporta |
| `productos` | `generarCodigo`, `generarId`, `normalizarProducto`, `esProductoValido` | Uso **interno** (3 refs.) | Activos |
| `movimientos` | `obtenerMovimientoPorId` | Sin uso fuera del store | Se conserva y se reporta |
| `movimientos` | getters `entradas`, `salidas`, `ajustes` | Sin uso (los informes calculan sus propios totales) | Se conservan y se reportan |
| `movimientos` | resto (`registrarMovimiento`, `totalMovimientos`) | En uso (Dashboard, vistas) | Activos |
| `categorias` / `proveedores` | todos | En uso | Activos |

**Único cambio en store:** `stores/productos.js → crearProducto()` valida ahora
que un **código explícito no esté duplicado** (requisito 16 del encargo). El
código autogenerado nunca se repite (sale del máximo existente + 1) y el
formulario no tiene campo de código, así que **la UI no cambió de
comportamiento**; solo se endureció la regla. `editarProductos()` ya ignoraba el
código (lo toma del producto original) → no podía duplicarlo.

*Nota sobre "categoría/proveedor obligatorios":* el **formulario** sí los exige
(validación local ya existente). El store **no** los exige a propósito: el
sistema permite productos "Sin categoría"/"Sin proveedor" (estado soportado por
los getters y por la UI), así que exigirlo en store rompería ese comportamiento.

## 10.7 Dependencias

- **Instalada: `sweetalert2@11.26.25`** (única dependencia nueva, permitida
  expresamente por el encargo). El bundle `.all` inyecta su propio CSS: no
  requiere import extra ni configuración.
- **No se desinstaló ni actualizó nada.** Revisión de `package.json`:
  `@quasar/extras` (CSS de iconos en `main.js`), `gsap` (`inicio.vue`),
  `jspdf` (Fase 9), `pinia` + `pinia-plugin-persistedstate` (`main.js`,
  stores), `quasar`, `vue`, `vue-router` → **todas en uso**.
- `devDependencies` sin cambios.
- **No se modificó ningún archivo de configuración** (Vite, Quasar, Vue,
  ESLint no existente, scripts de `package.json`).

## 10.8 SweetAlert2: módulo central `src/utils/alertas.js` (NUEVO)

Todos los mensajes salen de un único punto para que todo el sistema responda
igual: **validar → confirmar → ejecutar → actualizar → informar**.

| Función | Tipo | Uso |
|---|---|---|
| `confirmarOperacion({titulo, texto, confirmar, cancelar})` | Modal de confirmación → `Promise<boolean>` | Acciones destructivas/críticas |
| `mostrarExito(texto)` | Toast `success` (3,5 s, no bloquea) | Resultado correcto |
| `mostrarAviso(texto)` | Toast `warning` (no bloquea) | "No hay datos para exportar" |
| `mostrarAdvertencia({titulo, texto})` | Modal `warning` | Operación que **no se permite** |
| `mostrarError({titulo, texto})` | Modal `error` | Operación fallida |

Detalle técnico: `zIndex: 11000` (los `q-dialog` de Quasar llegan a 6000 y
SweetAlert2 usa 1060 → sin este ajuste la alerta quedaría **detrás** del
diálogo) y `reverseButtons: true` (Confirmar a la derecha).

## 10.9 Validaciones y alertas por sección

### Productos (`InventarioView.vue` + `inventory/ProductForm.vue` + store)

| Operación | Validación | Alerta |
|---|---|---|
| Crear/Editar | nombre, categoría, proveedor, precios ≥ 0, cantidad, stock mínimo ≥ 0 | Error de campo → **banner del formulario** (mecanismo establecido, sin duplicar) |
| Crear/Editar (store rechaza) | store devuelve `null` → **no se guarda ni se modifica nada** | Modal `error`: *"No se pudo guardar el producto — Revisa los datos e inténtalo de nuevo."* |
| Código | autogenerado y **no duplicado** (nueva regla en store) | — |
| Eliminar | **siempre** confirma antes | *"¿Eliminar «X»?"* + *"Esta acción no se puede deshacer."* → `Eliminar` / `Cancelar` |
| Eliminar (cancelar) | ninguna modificación | — |
| Eliminar (confirmar) | store elimina | Toast *"Producto eliminado correctamente."* |

### Categorías (`CategoriasView.vue`)

- **NO se puede eliminar si tiene productos asociados** → modal:
  *"No se puede eliminar esta categoría — No se puede eliminar esta categoría
  porque existen N productos asociados."* (**cambio de comportamiento**, ver 10.10)
- Sin productos → confirmación *"¿Eliminar la categoría «X»?"* →
  Toast *"Categoría eliminada correctamente."*
- Guardado inválido (nombre vacío / duplicado, ya validado por el formulario):
  modal *"No se pudo guardar la categoría"*.

### Proveedores (`ProveedoresView.vue`)

- Mismo patrón: bloqueo si tiene productos asociados → modal explicativo;
  si no → confirmación → Toast *"Proveedor eliminado correctamente."*
- Guardado inválido: modal *"No se pudo guardar el proveedor"*.

### Movimientos (`MovimientosView.vue` + `movements/MovimientoForm.vue`)

| Caso | Comportamiento |
|---|---|
| Producto no seleccionado | error en el formulario (banner) |
| Cantidad vacía / no numérica | error en el formulario (banner) |
| Entrada/Salida con cantidad **0 o negativa** | error en el formulario (banner) |
| Salida mayor al stock | error en el formulario (banner) + el store también rechaza |
| Ajuste con **0, 1 o 10** | ✅ permitido |
| Ajuste con **-1 o -10** | ❌ rechazado (2 capas: formulario y store) |
| **Ajuste (crítico)** | **confirmación previa**: *"¿Confirmar ajuste de inventario? — Stock actual: 15. Nuevo stock: 0. Esta operación modificará el inventario."* → `Confirmar`/`Cancelar` |
| Éxito | Toast: *"Entrada registrada correctamente."* / *"Salida registrada correctamente."* / *"Ajuste realizado correctamente."* |
| Error del store | Modal: *"No fue posible realizar el ajuste"* / *"No se pudo registrar el movimiento"* + el motivo concreto (p. ej. stock insuficiente) |

### Reportes (`ReportesView.vue`)

- CSV sin datos → aviso *"No hay datos para exportar."*
- CSV con datos → *"Reporte CSV generado correctamente."*
- PDF sin datos → *"No hay datos para generar el PDF."*
- PDF con datos → *"PDF generado correctamente."*
- Fallo del generador → modal *"No se pudo generar el reporte"*.
- Se eliminó el `<q-banner>` local de exportación (ya no hay dos sistemas).

### Reglas de UX aplicadas

En español · breves · sin tecnicismos · los éxitos no bloquean (toast) · los
errores y confirmaciones sí (modal) · nunca dos alertas para el mismo fallo ·
sin `$q.notify` en ninguna parte (comprobado por script).

## 10.10 ⚠️ Cambios de comportamiento (los 3 que afectan al usuario)

1. **Categorías y proveedores en uso ya NO se pueden eliminar** (antes se
   borraban y se desvinculaban los productos). Así lo exige el encargo 18/19:
   se muestra la alerta explicativa y no se toca el store → **nunca quedan
   referencias inválidas**. Por eso `desasociarCategoria`/`desasociarProveedor`
   quedaron sin uso (se conservan en el store).
2. **Errores de store en formularios**: antes se pintaban en el `q-banner` del
   diálogo; ahora se explican con SweetAlert2. **Los errores de campo siguen en
   el banner** del propio formulario (no se duplican mensajes).
3. **Mensajes de exportación**: el banner de Reportes se sustituyó por
   SweetAlert2 (toast de éxito/aviso y modal de error).

## 10.11 Pruebas y build

| Suite | Resultado |
|---|---|
| `temp_fase10.test.mjs` (limpieza + fuente + stores, 150 casos) | **150 OK / 0 FAIL** |
| `fase7.test.mjs` (regresión Fase 7) | **62/62 OK** |
| `fase7.form.test.mjs` (regresión formularios) | **28/28 OK** |
| `npm run build` | ✅ **sin errores** (Vite, 1,5 s) |

Casos inválidos probados en los stores reales: nombre vacío, código duplicado,
precio/stock/stock mínimo negativos, precio no numérico, categoría vacía y
duplicada (ignorando mayúsculas), proveedor vacío y duplicado, entrada/salida a
0 y negativas, salida mayor al stock (verificando que **no** modifica el stock),
ajuste -1/-10 (verificando que **no** modifica el stock).
Casos válidos: crear/editar producto con código autogenerado único, stock 0,
categoría/proveedor editados, entrada/salida/ajuste a 10 y a 0.
Integración: producto → entrada → salida → stock correcto → getters del
Dashboard → relaciones producto↔categoría↔proveedor↔movimiento intactas.

**Servidor de desarrollo:** `/` y los 7 módulos clave compilan con **HTTP 200**
(alertas, 5 vistas y exportaciones).

**E2E en navegador:** *no se pudo ejecutar* — sigue sin conectarse el navegador
de escritorio de esta sesión (mismo límite que en la Fase 9).

## 10.12 Alcance verificado

Ningún archivo fuera de la lista fue tocado: `DashboardView`, `ProductoDetalleView`,
`inicio.vue`, `MainLayout`, `App.vue`, `routes.js`, `main.js`, `vite.config.js`,
los formularios, las tablas y los stores (`categorias`, `proveedores`,
`movimientos`) **quedan sin cambios**; `stores/productos.js` solo recibió la
validación de código duplicado.

## 10.13 Pendientes detectados (NO implementados / decisiones del usuario)

1. **`fase7*.mjs` (4)** conservados por decisión del usuario; `fase7.ssr.test.mjs`
   sigue roto en Node. Ningún `package.json` los ejecuta.
2. **`public/icons.svg`** sin referencias → pendiente de revisión manual.
3. **`~$QUERIMIENTOS TIENDA.docx`** (candado de Word) → pendiente.
4. **Stores**: `productosConProveedor`, `obtenerMovimientoPorId`, getters
   `entradas`/`salidas`/`ajustes` y `desasociar*` **sin uso** → reportados, no
   eliminados (encargo: no tocar stores funcionales).
5. **`$q.notify`**: sigue sin registrar en `main.js`; ahora se resuelve con
   SweetAlert2 → el pendiente queda **sustituido**, no ejecutado.
6. Filtros por tipo en Movimientos, guard `NaN` en `stores/movimientos.js` y
   filtro de categoría borrada en Reportes → **sin tocar** (alcance de otra fase).
7. **E2E en navegador** (navegador de escritorio desconectado) y **CSV en Excel**.
8. **Sin git**: el repo sigue sin commits.
9. **Información obsoleta detectada y NO borrada** (por regla del encargo):
   - Fase 2 §2.3.4 y Fase 8 §8.2 describen *"borrar categoría/proveedor en uso
     permitido + desasociar"* → **hoy está bloqueado** (ver 10.10).
   - Fase 9 §9.7.3 hablaba de la limpieza pendiente → ya ejecutada.
   - Fase 9 §9.5 menciona el `<q-banner>` de exportación → sustituido por SweetAlert2.

---

# AJUSTE FINAL — SENA MARKET (BIENVENIDA, NAVEGACIÓN, ANIMACIÓN Y VALIDACIONES) ✅ COMPLETADO

> **Fecha:** 5 oct 2026
> **Tipo:** encargo directo del usuario (sin fase intermedia; NO se avanzó de fase).
> **Verificación:** `npm run build` → `✓ built in 5.52s` · suites Node → **163/163 OK**.

## A.1 Archivos revisados (lectura previa)

| Archivo | Por qué se revisó |
|---|---|
| `src/App.vue` | comprobar que solo renderiza `<router-view/>` |
| `src/routes/routes.js` | rutas reales y layouts que las envuelven |
| `src/layouts/MainLayout.vue` | header + drawer + `q-page-container` |
| `src/layouts/WelcomeLayout.vue` (nuevo) | layout propio de la bienvenida |
| `src/views/inicio.vue` | portada, cuadro animado, textos y GSAP |
| `src/components/layout/AppHeader.vue` | menú hamburguesa y nombre visible |
| `src/components/layout/AppSidebar.vue` | nombre visible e ítem "Inicio" (`to="/"`), navegación |
| `index.html` | `<title>` del documento |
| `src/utils/alertas.js` + las 5 vistas | utilidad central de SweetAlert2 (Fase 10) |
| `src/stores/{productos,categorias,proveedores,movimientos}.js` | validaciones de §15–§19 |
| `node_modules/quasar/.../QPage.js` | verificar que `q-page` exige `QLayout + QPageContainer` |

## A.2 Causa raíz: ¿por qué el menú aparecía en la portada?

`routes.js` anidaba `views/inicio.vue` **dentro de `MainLayout.vue`** en la ruta `/`
(`MainLayout` monta `AppHeader` → botón hamburguesa y `AppSidebar` → drawer).
**Solución estructural** (no CSS): la ruta `/` ahora usa un layout propio
`WelcomeLayout.vue`, que solo contiene `<q-layout><q-page-container><router-view/>`.

> Se conservó `q-layout/q-page-container` porque `QPage` **no renderiza nada** si no
> es hijo profundo de `QLayout + QPageContainer` (error: *"QPage needs to be a deep
> child of QLayout"*). Así la portada sigue patrón Quasar pero **sin menú**.

## A.3 Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/layouts/WelcomeLayout.vue` | **NUEVO** — `q-layout` + `q-page-container` + `router-view`, sin header/sidebar |
| `src/routes/routes.js` | ruta `/` → `WelcomeLayout` (comentario explicativo); el resto sigue en `MainLayout` |
| `src/views/inicio.vue` | 1) textos: `Sena Market`→`SENA Market`, `SANE MARKET`→`SENA Market`, aria-label; 2) animación de una letra por giro |
| `src/components/layout/AppHeader.vue` | `Sena Market` → `SENA Market` (título del toolbar) |
| `src/components/layout/AppSidebar.vue` | `Sena Market` → `SENA Market` (marca lateral) |
| `index.html` | `<title>tienda</title>` → `<title>SENA Market</title>` |
| `src/views/InventarioView.vue` | confirmación: `¿Eliminar producto?` + `Se eliminará "X". Esta acción no se puede deshacer.` (§16) |
| `src/views/CategoriasView.vue` | confirmación: `¿Eliminar categoría?` + mismo texto (§17) |
| `src/views/ProveedoresView.vue` | confirmación: `¿Eliminar proveedor?` + mismo texto (§18) |
| `ANALISIS_ESTRUCTURA.md` | este documento |

**No se tocaron:** `main.js`, `App.vue`, `MainLayout.vue`, stores, componentes de
formulario/tabla, `utils/exportaciones.js`, `utils/alertas.js`, `package.json`.

## A.4 Bienvenida y navegación (§2–§7, §24)

- **Bienvenida SIN menú:** `WelcomeLayout` no monta `AppHeader` ni `AppSidebar`
  → no hay hamburguesa, ni drawer, ni navegación del inventario en la portada.
- **Sistema CON menú:** `/dashboard`, `/inventario`, `/movimientos`, `/categorias`,
  `/proveedores`, `/reportes` y `/producto-detalles/:id` siguen en `MainLayout`
  (rutas **sin cambios**).
- **Botón:** se reutilizó el existente `Ingresar al inventario`
  (`q-btn ... to="/dashboard"`, navegación de Vue Router; **sin `window.location`**).
- **Volver a la bienvenida:** ya existía el ítem *Inicio* del sidebar (`to="/"`).
- Flujo: `Bienvenida → Ingresar → Dashboard → menú hamburguesa visible`.

## A.5 Animación del cuadro (§8–§13)

- El cubo conserva **tamaño, posición, bordes, sombras, colores, perspectiva,
  easing `power2.inOut`, 1 s de giro + 0,5 s de pausa, `repeatDelay` 10 s y
  `rotationX: -8`** del diseño original.
- **Cambio de lógica:** las 4 caras laterales pintan **siempre la misma letra**
  (`letra`), de modo que el recuadro **nunca se lee "SENA"** sino **una sola
  letra por giro**.
- Ciclo fijo y determinista: **S → E → N → A → S…** (`LETRAS = ['S','E','N','A']`),
  arranca en **S**, sin aleatoriedad.
- El contador `ciclo.giros` avanza **en paralelo** al giro (posición `'<'` de
  GSAP): la letra cambia al cruzar la mitad del giro.
- **Un solo `gsap.timeline({ repeat: -1 })`**; **cero** `setInterval`/`setTimeout`.
- `onUnmounted` → `timeline.kill()` (nada sigue corriendo bajo el Dashboard).
- `prefers-reduced-motion` → se queda la **S** visible y **quieta**, sin timeline.

## A.6 Nombre del software (§1)

Textos corregidos: `Sena Market` (header, sidebar, portada), `SANE MARKET`
(aria-label y pie de la portada) y el `<title>` del documento.
Ahora aparece **"SENA Market"** y **"Bienvenido a SENA Market"**.
> El logotipo `.brand` ("SENA" sobre "MARKET") se conserva: es el escudo de marca
> en mayúsculas, no un nombre mal escrito. No existía ningún "Cena Market".

## A.7 Validaciones y SweetAlert2 (§14–§22)

- **SweetAlert2 YA estaba instalado** (Fase 10, `sweetalert2@11.26.25`) →
  **se reutilizó**; no se agregó ninguna otra librería ni dependencia nueva.
- Se reutiliza la utilidad central `src/utils/alertas.js`
  (`confirmarOperacion`, `mostrarExito`, `mostrarAviso`, `mostrarAdvertencia`, `mostrarError`).
- **Éxito** → toast (3,5 s): reportes CSV/PDF y guardados.
- **Error** → modal: fallos de store en crear/editar.
- **Advertencia** → modal: `No se puede eliminar esta categoría/proveedor porque
  existen N productos asociados.`, `No hay datos para exportar.`, `No hay datos para generar el PDF.`
- **Confirmación** → modal: eliminar producto/categoría/proveedor (con
  "Esta acción no se puede deshacer." y botones **Cancelar / Eliminar**) y el
  ajuste de inventario (`Stock actual: X. Nuevo stock: Y. Esta operación modificará el inventario.`).
- **Validaciones §15–§19**: verificadas en stores y formularios (nombre/código
  obligatorios, código duplicado, precios y cantidades no negativos, stock mínimo,
  categoría/proveedor, nombre vacío/duplicado en categorías y proveedores,
  entrada/salida > 0, stock suficiente, ajuste ≥ 0 **con 0 válido**, stock nunca < 0).
  **No hubo que añadir reglas nuevas**: las de la Fase 10 ya cubren el listado.
- Único ajuste de comportamiento: los **textos de las confirmaciones de borrado**
  se alinearon literalmente con §16–§18 (mismo patrón en las 3 secciones §22).

## A.8 Pruebas ejecutadas (§28)

Suite temporal de validación (creada, ejecutada y **eliminada** al terminar, como
en fases anteriores) + las suites existentes:

| Suite | Resultado | Cobertura |
|---|---|---|
| `validacion-final.test.mjs` (temporal) | **73/73 OK** | nombre del software, rutas/layouts, portada montada, animación (S→E→N→A→S, una sola letra en todo instante, kill al desmontar), SweetAlert2, validaciones de los 4 stores |
| `fase7.test.mjs` | **62/62 OK** | stores de productos/movimientos/categorías/proveedores |
| `fase7.form.test.mjs` | **28/28 OK** | formulario de productos (interacción) |
| **Total** | **163/163 OK** | |

Casos de §25 cubiertos por la suite: producto vacío/válido/código
duplicado/valores inválidos, categoría vacía/duplicada, proveedor vacío/
duplicado/campos obligatorios, cantidad 0 y negativa, salida > stock, entrada y
salida válidas, ajuste válido y **ajuste a 0**, stock nunca negativo.
(Confirmar/cancelar eliminaciones y exportar CSV/PDF se cubren por fuente; la
**prueba en vivo queda pendiente por navegador** → ver A.10.)

## A.9 Build (§28)

```
npm run build  →  ✓ built in 5.52s   (sin errores, sin warnings nuevos)
```

## A.10 Pendientes / problemas abiertos

1. **E2E y consola en navegador (§24, §26, §27)**: el navegador de escritorio
   sigue **desconectado** → las 6 pruebas manuales de bienvenida, responsive y
   revisión de consola **no se pudieron ejecutar en vivo**.
   Se verificó por servidor Vite (puerto 5173): `/`, `routes.js`, `WelcomeLayout`,
   `MainLayout`, `inicio`, `AppHeader`, `AppSidebar` y `alertas.js` → **HTTP 200**
   y `WelcomeLayout` compilado renderiza `QLayout → QPageContainer → router-view`.
2. **`fase7*.mjs` (4)**: conservados (decisión previa); `fase7.ssr.test.mjs` sigue roto.
3. **Sin git**: el repo sigue sin commits.
4. Pendientes heredados de la Fase 10 (filtros por tipo, guard `NaN`, `public/icons.svg`,
   `~$QUERIMIENTOS TIENDA.docx`, miembros de store sin uso) → **sin tocar**.

## A.11 Alcance verificado

Archivos con fecha posterior al inicio del encargo (10) + 1 borrado (ninguno):
`WelcomeLayout.vue` (nuevo), `routes.js`, `inicio.vue`, `AppHeader.vue`,
`AppSidebar.vue`, `index.html`, `InventarioView.vue`, `CategoriasView.vue`,
`ProveedoresView.vue`, `ANALISIS_ESTRUCTURA.md`.
Stores, `main.js`, `App.vue`, `MainLayout.vue`, componentes y dependencias
**intactos**; sin instalaciones nuevas, sin refactorizaciones, sin cambios de ruta.

---

# AJUSTE FINAL INTEGRAL — MONEDA COP Y ALERTAS SWEETALERT2 ✅ COMPLETADO

> **Fecha:** 5 oct 2026 · **Tipo:** encargo directo (sin avanzar de fase).
> **Verificación:** `npm run build` → `✓ built in 2.55s` · suites Node → **145/145 OK**.
> La bienvenida/navegación/animación de la sección anterior **no se tocaron**.

## B.1 Moneda: fuente única de verdad (§8–§11)

**Antes:** no existía un formateador central. `utils/exportaciones.js` tenía
`formatearMoneda()` (solo pantalla/PDF, sin "COP") y `ProductStockCard` /
`ProductInfoCard` imprimían el número crudo (`${{ product.precioVenta }}`).

**Ahora:**
- **NUEVO `src/utils/moneda.js`** → `formatearMoneda(valor)` con
  `Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', minimumFractionDigits:0, maximumFractionDigits:0 })`
  **normalizado** a `$1.000 COP` (Intl puede devolver "$ 1.000" o "COP 1.000"
  según el entorno; se deja solo el número y se añade `$` y `COP`).
- `utils/exportaciones.js` **importa y re-exporta** esa función → ReportesView
  (y todo el que la importe) sigue funcionando igual, sin duplicar `toLocaleString`.
- Presentación **solo en la capa de interfaz**: el store y el formulario siguen
  guardando **números** (`precioCompra: Number(...)`, sin `$` ni `COP`).

### Dónde aplica
| Archivo | Cambio |
|---|---|
| `src/utils/moneda.js` | **NUEVO** — formateador central `$1.000 COP` |
| `src/utils/exportaciones.js` | reutiliza `moneda.js` (PDF usa `formatearMoneda`) |
| `src/components/Products/ProductInfoCard.vue` | `Precio de compra` → `formatearMoneda(...)` |
| `src/components/Products/ProductStockCard.vue` | `Precio de venta` → `formatearMoneda(...)` |
| `src/views/ReportesView.vue` | encabezados de exportación con `(COP)` + metadato `Moneda: Pesos colombianos (COP)` |

### Dónde NO aplica (§19)
Cantidades, stock, stock mínimo, nº de movimientos, IDs y códigos siguen siendo
números simples (`ProductTable` columnas `cantidad`/`codigo` sin `formatearMoneda`).
**Dashboard** no tiene valores monetarios (solo conteos) → no hubo que cambiarlo.
**Formulario de productos**: los inputs mantienen `prefix="$"` + dígitos agrupados
(el usuario escribe `10000` y se guarda `10000`); el COP se muestra al salir del input.

### Decisión sobre CSV y PDF (§18)
- **PDF**: celdas `tipo: 'moneda'` → `$1.250.000 COP` (igual que pantalla).
- **CSV**: se mantiene el **valor numérico crudo** (diseño de la Fase 9: `;`,
  BOM y número sumable en Excel = "respetar la lógica existente") y se indica
  la moneda en **encabezados** (`Valor al costo (COP)`, `Valor de venta (COP)`,
  `Valor (COP)`) y en los **metadatos** (`Moneda: Pesos colombianos (COP)`),
  que también se imprimen en el PDF.

## B.2 Alertas: todo por SweetAlert2 (§20–§33)

- **Búsqueda global** de `alert(`, `confirm(`, `prompt(`, `window.alert`,
  `window.confirm`, `window.prompt` en `src/**` + `index.html` → **NINGUNA
  ocurrencia** (no había nada que reemplazar; se verificó con test automático).
- **SweetAlert2 ya instalado** (`sweetalert2@11.26.25`, Fase 10) → **reutilizado**;
  sin librerías nuevas ni mezclas.
- **NUEVO en esta ronda:** los 4 formularios ahora **también** avisan con
  `mostrarAdvertencia({ titulo:'Revisa la información', texto })` cuando la
  validación local falla (además del banner propio del formulario), para que
  "error de formulario" pase por SweetAlert2 (§25, §36):
  `ProductForm`, `CategoriaForm`, `ProviderForm`, `MovimientoForm`.
- Comentarios de `utils/alertas.js` actualizados a este nuevo criterio.
- Reparto existente (sin cambios): **confirmaciones** (`confirmarOperacion`) en
  borrados y ajuste de inventario · **éxito** (toast) al crear/editar/eliminar y
  exportar · **error** (modal) cuando el store rechaza · **advertencia** (modal)
  por bloqueos ("…productos asociados"), validaciones y "No hay datos para exportar."
  (la revisión §16–§18/§30–§31 de la entrega anterior ya los cubría).

## B.3 Correcciones de pruebas provocadas por este cambio (§41)

1. `fase7.form.test.mjs` escribía el SFC compilado en la **raíz**, por lo que el
   nuevo `import '../../utils/alertas.js'` no resolvía → ahora se escribe **junto
   al SFC** (`src/components/inventory/.fase7-productform.tmp.mjs`).
2. `fase7.dom-stubs.mjs`: se añadió `document.getElementsByTagName` (SweetAlert2
   inyecta estilos al cargar).
3. El dist de SweetAlert2 exige un DOM real para pintar el modal, así que la
   prueba registra un **doble mínimo en el caché de módulos CJS** y así puede
   comprobar que la validación **sí dispara** `Swal.fire({icon:'warning'})`.

## B.4 Pruebas ejecutadas (§41)

| Suite | Resultado |
|---|---|
| `validacion-cop.test.mjs` (temporal, eliminada al terminar) | **54/54 OK** — 10 valores de §35, prohibidos (`1000`,`$1000`,`USD`…), uso en interfaz, sin alertas nativas, SweetAlert2 en formularios/vistas, CSV/PDF, regresión de bienvenida y animación |
| `fase7.test.mjs` | **62/62 OK** |
| `fase7.form.test.mjs` | **29/29 OK** (28 + 1 nueva: validación ⇒ SweetAlert2) |
| **Total** | **145/145 OK** |

Valores comprobados de §35: `1000→$1.000 COP`, `1500→$1.500 COP`,
`10000→$10.000 COP`, `15000→$15.000 COP`, `100000→$100.000 COP`,
`250000→$250.000 COP`, `1250000→$1.250.000 COP`, `10000000→$10.000.000 COP`,
`0→$0 COP` (+ `8000→$8.000 COP` y negativo `-$1.000 COP`).

## B.5 Build

```
npm run build  →  ✓ built in 2.55s   (sin errores)
```
Servidor Vite: los 12 módulos tocados responden **HTTP 200**.

## B.6 Pendientes

1. **E2E/consola/responsive en navegador** (§36–§40): navegador de escritorio
   **desconectado** → no ejecutable en vivo; verificación programática y por Vite.
2. `fase7.ssr.test.mjs` sigue roto; **repo sin git**; pendientes heredados
   (filtros por tipo, guard `NaN`, `public/icons.svg`, `~$QUERIMIENTOS TIENDA.docx`)
   → sin tocar.

## B.7 Alcance verificado (esta ronda, 15:27–15:36)

`src/utils/moneda.js` (nuevo), `src/utils/exportaciones.js`, `src/utils/alertas.js`
(comentario), `ProductInfoCard.vue`, `ProductStockCard.vue`, `ProductForm.vue`,
`CategoriaForm.vue`, `ProviderForm.vue`, `MovimientoForm.vue`, `ReportesView.vue`,
más las 2 correcciones de pruebas (`fase7.form.test.mjs`, `fase7.dom-stubs.mjs`).
**Sin** tocar stores, rutas, layouts, `main.js` ni `package.json`.

## B.8 Alertas de guardado (alta y edición) con SweetAlert2 ✅

**Falta detectada:** los éxitos de **borrado** ya estaban, pero al **crear o
editar** el diálogo simplemente se cerraba, sin avisar al usuario.

| Vista | Texto añadido (toast `mostrarExito`) |
|---|---|
| `InventarioView.saveProduct` | `Producto creado correctamente.` / `Producto actualizado correctamente.` |
| `CategoriasView.saveCategory` | `Categoría creada correctamente.` / `Categoría actualizada correctamente.` |
| `ProveedoresView.saveProvider` | `Proveedor creado correctamente.` / `Proveedor actualizado correctamente.` |

Patrón común: se captura `esEdicion = Boolean(selected.value)` **antes** de
limpiar la selección, se cierra el diálogo y se informa con el toast.

`MovimientosView` **ya tenía** el éxito (sin cambios): `Entrada registrada
correctamente.` · `Salida registrada correctamente.` · `Ajuste realizado
correctamente.`, más la confirmación previa del ajuste.

**Matriz resultante de alertas por operación**
```
ALTA/EDICIÓN      -> mostrarExito (toast)
VALIDACIÓN DE CAMPO-> banner del formulario + mostrarAdvertencia (modal warning)
STORE RECHAZA     -> mostrarError (modal error)
BAJA              -> confirmarOperacion (modal) -> mostrarExito
AJUSTE INVENTARIO -> confirmarOperacion (modal) -> mostrarExito
MOVIMIENTO INVÁLID-> mostrarError
EXPORTAR          -> sin datos: mostrarAviso · OK: mostrarExito
```
Todo pasa por `utils/alertas.js`; **cero** `alert()/confirm()/prompt()` nativos
ni `Swal` importado directamente por las vistas.

**Verificación:** `validacion-guardados.test.mjs` (temporal, borrada) **33/33 OK**
· `fase7.test.mjs` **62/62** · `fase7.form.test.mjs` **29/29** · `npm run build`
**`✓ built in 1.20s`** · Vite responde **200** en las 4 vistas.
**Alcance:** solo `InventarioView.vue`, `CategoriasView.vue`, `ProveedoresView.vue`.


---

# C. PUBLICACIÓN EN GITHUB ✅ (6 oct 2026)

**Repo:** <https://github.com/Jhonpi33/TIENDA.git> ·rama `main` ·commit `e8a6583`.

- Se inicializó git **dentro de `TIENDA/`** para que el proyecto quede en la
  raíz del repo (así Render lo construye sin configurar carpeta raíz). El repo
  que existía en la carpeta superior (`BIEW`, sin commits) no se tocó.
- **54 archivos / 13.086 líneas**; `.gitignore` ampliado con `~$*`,
  `*.tmp.mjs` y `.fase7-*.tmp.mjs` (ni `node_modules`, ni `dist`, ni lock de Word).
- `README.md` reescrito con pantallas, stack, comandos, decisiones de moneda y
  alertas, pruebas y pasos de despliegue.
- Verificado por API de GitHub: repo **público**, `default_branch: main`,
  archivos en la raíz.

**Despliegue en Render (siguiente paso):** sitio estático →
Build `npm install && npm run build` · Publish `dist`.

**Pendiente declarado por el usuario:** backend con API REST usando **axios**
(hoy la persistencia es `localStorage` vía `pinia-plugin-persistedstate`).
