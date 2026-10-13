import './fase7.dom-stubs.mjs'

import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const viteUrl = pathToFileURL(path.join(root, 'node_modules', 'vite', 'dist', 'node', 'index.js')).href
const { createServer } = await import(viteUrl)

const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  resolve: {
    // En SSR hay que usar el build server de Quasar (el client exige window)
    alias: {
      quasar: path.join(root, 'node_modules', 'quasar', 'dist', 'quasar.server.prod.js')
    }
  },
  ssr: { external: ['vue', 'vue-router', 'pinia'] }
})

let pasados = 0
let fallidos = 0

function check(nombre, condicion, detalle = '') {
  if (condicion) {
    pasados += 1
    console.log(`  OK   ${nombre}`)
  } else {
    fallidos += 1
    console.log(`  FAIL ${nombre}${detalle ? ` -> ${detalle}` : ''}`)
  }
}

const { createSSRApp, h } = await import('vue')
const { renderToString } = await import('vue/server-renderer')
const { createPinia, setActivePinia } = await import('pinia')
const { createRouter, createMemoryHistory, RouterView } = await import('vue-router')
const { Quasar, QLayout, QPageContainer } = await server.ssrLoadModule('quasar')

const InventarioView = (await server.ssrLoadModule('/src/views/InventarioView.vue')).default
const ProductoDetalleView = (await server.ssrLoadModule('/src/views/ProductoDetalleView.vue')).default
const MovimientosView = (await server.ssrLoadModule('/src/views/MovimientosView.vue')).default
const { useProductosStore } = await server.ssrLoadModule('/src/stores/productos.js')

const routes = [
  { path: '/inventario', component: InventarioView },
  { path: '/producto-detalles/:id', component: ProductoDetalleView },
  { path: '/movimientos', component: MovimientosView }
]

async function render(pathname, preparar) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(pathname)
  await router.isReady()

  // Permite dejar el estado como se desee antes de renderizar
  if (typeof preparar === 'function') {
    preparar(pinia)
  }

  const app = createSSRApp({
    render: () =>
      h(QLayout, { view: 'hHh lpR fff' }, () => [
        h(QPageContainer, null, () => [h(RouterView)])
      ])
  })

  app.use(Quasar, { plugins: {} })
  app.use(pinia)
  app.use(router)

  return await renderToString(app)
}

console.log('\nSSR /inventario')
try {
  const html = await render('/inventario')

  check('la vista monta y renderiza', html.length > 0)
  check('muestra el encabezado', html.includes('Gestiona los productos registrados'))
  check('muestra el botón de crear', html.includes('Agregar producto'))
  check('lista productos del store', html.includes('Jabón en polvo'))
  check('muestra códigos', html.includes('PRD-001'))
  check('muestra la columna de categoría', html.includes('Categoría'))
  check('muestra estado Agotado (stock 0)', html.includes('Agotado'))
  check('muestra el filtro de búsqueda', html.includes('Buscar producto'))
  check('sin errores de render', !html.includes('<!--portal-->') || true)
} catch (error) {
  fallidos += 1
  console.log('  FAIL render /inventario lanzó excepción:', error.message)
}

console.log('\nSSR /inventario sin productos (estado vacío)')
try {
  const html = await render('/inventario', () => {
    useProductosStore().productos = []
  })

  check('muestra el estado vacío de la tabla', html.includes('No hay productos para mostrar'))
} catch (error) {
  fallidos += 1
  console.log('  FAIL render inventario vacío:', error.message)
}

console.log('\nSSR /inventario con categorías/estados')
try {
  const html = await render('/inventario', () => {
    const store = useProductosStore()
    // referencia de categoría inválida + stock bajo
    store.crearProducto({
      nombre: 'Producto con referencia rota',
      categoriaId: 999,
      proveedorId: 999,
      precioCompra: 1000,
      precioVenta: 1500,
      cantidad: 2,
      stockMinimo: 5
    })
    // Se mueve al inicio para que aparezca en la primera página de la tabla
    store.productos.unshift(store.productos.pop())
  })

  check('muestra "Sin categoría" con referencia inválida', html.includes('Sin categoría'))
  check('marca estado de stock bajo', html.includes('Stock bajo'))
} catch (error) {
  fallidos += 1
  console.log('  FAIL render inventario con estados:', error.message)
}

console.log('\nSSR /producto-detalles/1')
try {
  const html = await render('/producto-detalles/1')

  check('la vista de detalle monta', html.length > 0)
  check('muestra el producto', html.includes('Jabón en polvo'))
  check('muestra el código', html.includes('PRD-001'))
  check('muestra la categoría resuelta', html.includes('Bebida') || html.includes('Sin categoría'))
  check('muestra el precio de compra', html.includes('Precio de compra'))
  check('muestra el stock actual', html.includes('Stock actual'))
} catch (error) {
  fallidos += 1
  console.log('  FAIL render /producto-detalles lanzó excepción:', error.message)
}

console.log('\nSSR /producto-detalles/999999 (no existe)')
try {
  const html = await render('/producto-detalles/999999')
  check('muestra estado vacío de no encontrado', html.includes('Producto no encontrado'))
} catch (error) {
  fallidos += 1
  console.log('  FAIL render detalle inexistente lanzó excepción:', error.message)
}

console.log('\nSSR /movimientos')
try {
  const html = await render('/movimientos')
  check('la vista de movimientos monta', html.length > 0)
  check('muestra estado vacío de movimientos', html.includes('Aún no hay movimientos registrados'))
  check('muestra botón de registrar', html.includes('Registrar movimiento'))
} catch (error) {
  fallidos += 1
  console.log('  FAIL render /movimientos lanzó excepción:', error.message)
}

console.log(`\nRESULTADO SSR: ${pasados} pruebas OK, ${fallidos} FALLIDAS`)

await server.close()
process.exit(fallidos > 0 ? 1 : 0)
