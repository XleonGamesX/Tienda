// Prueba de interacción (FASE 7): monta ProductForm.vue con un renderizador
// propio (sin navegador) y simula escribir/clic para validar el formulario.
import './fase7.dom-stubs.mjs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))

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

const { h, nextTick, defineComponent, reactive } = await import('vue')
const { createRenderer } = await import('@vue/runtime-core')

// ---------------------------------------------------------------------------
// DOBLE DE SWEETALERT2 PARA NODE
// El dist de sweetalert2 necesita un DOM real para inyectar estilos y pintar
// el modal, cosa que los stubs no pueden ofrecer. Se registra un doble mínimo
// en el caché de módulos CJS ANTES de importar el formulario, de modo que el
// componente real sí llama a la utilidad de alertas y aquí se puede comprobar
// qué alerta se disparó (sin romper la prueba por falta de DOM).
// ---------------------------------------------------------------------------
const { createRequire } = await import('node:module')
const requireNodo = createRequire(import.meta.url)
const rutaSwal = requireNodo.resolve('sweetalert2')

export const alertasDisparadas = []
const SwalDoble = {
  fire(opciones) {
    alertasDisparadas.push(opciones)
    // Se confirma solas las alertas para que la promesa quede resuelta
    return Promise.resolve({ isConfirmed: true, isDenied: false, dismiss: null })
  }
}

requireNodo.cache[rutaSwal] = {
  id: rutaSwal,
  filename: rutaSwal,
  path: path.dirname(rutaSwal),
  loaded: true,
  exports: { __esModule: true, default: SwalDoble, ...SwalDoble }
}


// El SFC se compila aquí en modo CLIENTE con @vue/compiler-sfc (igual que
// haría Vite en el navegador) para poder montarlo con un renderizador propio.
const { parse, compileScript } = await import('@vue/compiler-sfc')
const fsMod = await import('node:fs')

const rutaForm = path.join(root, 'src', 'components', 'inventory', 'ProductForm.vue')
const fuenteForm = fsMod.readFileSync(rutaForm, 'utf8')
const { descriptor, errors: erroresParseo } = parse(fuenteForm, { filename: rutaForm })

if (erroresParseo.length > 0) {
  console.error(erroresParseo)
  process.exit(1)
}

const scriptForm = compileScript(descriptor, { id: 'fase7', inlineTemplate: true })
// El módulo temporal se escribe JUNTO AL SFC (y no en la raíz) para que los
// imports relativos del componente (../../utils/alertas.js, etc.) resuelvan
// igual que en la aplicación real.
const rutaTemporal = path.join(root, 'src', 'components', 'inventory', '.fase7-productform.tmp.mjs')
fsMod.writeFileSync(rutaTemporal, scriptForm.content)
const moduloForm = await import(`${pathToFileURL(rutaTemporal).href}?v=${Date.now()}`)
const ProductForm = moduloForm.default
fsMod.unlinkSync(rutaTemporal)

// ---------------------------------------------------------------------------
// Renderizador mínimo: los nodos son objetos simples con props y children
// ---------------------------------------------------------------------------
function createElement(tag) {
  return { tag, props: {}, children: [], text: null }
}
function createText(text) {
  return { tag: '#text', children: [], text: String(text) }
}
function createComment(text) {
  return { tag: '#comment', children: [], text: String(text) }
}
function setElementText(el, texto) {
  el.text = texto
  el.children = []
}
function setText(el, texto) {
  el.text = texto
}
function insert(hijo, padre, ancla) {
  if (!hijo) return
  if (hijo.__padre) {
    const i = hijo.__padre.children.indexOf(hijo)
    if (i > -1) hijo.__padre.children.splice(i, 1)
  }
  hijo.__padre = padre
  if (ancla) {
    const i = padre.children.indexOf(ancla)
    if (i > -1) {
      padre.children.splice(i, 0, hijo)
      return
    }
  }
  padre.children.push(hijo)
}
function remove(hijo) {
  if (!hijo || !hijo.__padre) return
  const i = hijo.__padre.children.indexOf(hijo)
  if (i > -1) hijo.__padre.children.splice(i, 1)
  hijo.__padre = null
}
function parentNode(nodo) {
  return nodo.__padre || null
}
function nextSibling(nodo) {
  const padre = nodo.__padre
  if (!padre) return null
  const i = padre.children.indexOf(nodo)
  return padre.children[i + 1] || null
}
function patchProp(el, clave, previo, siguiente) {
  if (siguiente === undefined || siguiente === null) {
    delete el.props[clave]
  } else {
    el.props[clave] = siguiente
  }
}

const { createApp } = createRenderer({
  patchProp,
  createElement,
  createText,
  createComment,
  setText,
  setElementText,
  insert,
  remove,
  parentNode,
  nextSibling,
  querySelector: () => null,
  setScopeId: () => {},
  cloneNode: (n) => ({ ...n, children: [...n.children] }),
  insertStaticContent: () => [createText(''), createText('')]
})

// Stubs de los componentes Quasar: no declaran props/emits, así que TODO lo
// que reciban (label, modelValue, onClick, onUpdate:modelValue...) cae en
// attrs y se hereda al nodo real, donde queda disponible en props.
function stub(tag) {
  return defineComponent({
    name: `Stub_${tag}`,
    setup(_, { slots }) {
      return () => h(tag, undefined, slots.default ? slots.default() : undefined)
    }
  })
}

async function montar(productFormProps) {
  const props = reactive({ modelValue: false, ...productFormProps })
  const raiz = createElement('#root')
  const app = createApp({ render: () => h(ProductForm, props) })

  for (const etiqueta of [
    'q-dialog', 'q-card', 'q-card-section', 'q-card-actions', 'q-banner',
    'q-icon', 'q-input', 'q-select', 'q-btn', 'q-option-group', 'q-separator'
  ]) {
    app.component(etiqueta, stub(etiqueta))
  }

  app.mount(raiz)
  await nextTick()

  // Se "abre" el diálogo igual que en la aplicación real (false -> true)
  props.modelValue = true
  await nextTick()

  return { raiz, props }
}

function recorrer(nodo, predicado, encontrados = []) {
  if (!nodo) return encontrados
  if (predicado(nodo)) encontrados.push(nodo)
  for (const hijo of nodo.children || []) recorrer(hijo, predicado, encontrados)
  return encontrados
}

const buscarBoton = (raiz, texto) =>
  recorrer(raiz, (n) => n.tag === 'q-btn' && n.props.label === texto)[0]

const buscarInput = (raiz, etiqueta) =>
  recorrer(raiz, (n) => n.tag === 'q-input' && n.props.label === etiqueta)[0]

const buscarSelect = (raiz, etiqueta) =>
  recorrer(raiz, (n) => n.tag === 'q-select' && n.props.label === etiqueta)[0]

const textoDe = (raiz) => {
  const salida = []
  const walk = (n) => {
    if (n.text) salida.push(String(n.text))
    for (const hijo of n.children || []) walk(hijo)
  }
  walk(raiz)
  return salida.join(' ')
}

const CATEGORIAS = [
  { id: 1, nombre: 'Aseo' },
  { id: 2, nombre: 'Bebidas' }
]
const PROVEEDORES = [{ id: 1, nombre: 'Distribuciones La Economía' }]

async function llenarFormularioValido(raiz) {
  buscarInput(raiz, 'Nombre del producto').props['onUpdate:modelValue']('  Jabón nuevo  ')
  buscarSelect(raiz, 'Categoría').props['onUpdate:modelValue'](1)
  buscarSelect(raiz, 'Proveedor').props['onUpdate:modelValue'](1)
  buscarInput(raiz, 'Precio de compra').props['onUpdate:modelValue']('8.000')
  buscarInput(raiz, 'Precio de venta').props['onUpdate:modelValue']('10.000')
  buscarInput(raiz, 'Cantidad').props['onUpdate:modelValue'](7)
  buscarInput(raiz, 'Stock mínimo').props['onUpdate:modelValue'](2)
  await nextTick()
}

// ---------------------------------------------------------------------------
console.log('\nA) Crear producto: validaciones')
{
  const guardados = []
  const { raiz } = await montar({
    product: null,
    categories: CATEGORIAS,
    suppliers: PROVEEDORES,
    error: '',
    onSave: (datos) => guardados.push(datos),
    'onUpdate:modelValue': () => {}
  })

  // Guardar vacío -> error de nombre
  buscarBoton(raiz, 'Guardar producto').props.onClick()
  await nextTick()
  check('guardar vacío muestra error de nombre',
    textoDe(raiz).includes('Indica el nombre del producto.'), textoDe(raiz).slice(-300))
  check('guardar vacío NO emite save', guardados.length === 0)
  // §36: el error de formulario debe comunicarse con SweetAlert2 (warning)
  check('validación de formulario dispara SweetAlert2',
    alertasDisparadas.some((a) => a.icon === 'warning' && a.title === 'Revisa la información'),
    JSON.stringify(alertasDisparadas))

  // Solo nombre -> error de categoría
  buscarInput(raiz, 'Nombre del producto').props['onUpdate:modelValue']('Café')
  await nextTick()
  buscarBoton(raiz, 'Guardar producto').props.onClick()
  await nextTick()
  check('falta categoría -> error',
    textoDe(raiz).includes('Selecciona una categoría.'))

  // Sin proveedor -> error
  buscarSelect(raiz, 'Categoría').props['onUpdate:modelValue'](1)
  await nextTick()
  buscarBoton(raiz, 'Guardar producto').props.onClick()
  await nextTick()
  check('falta proveedor -> error',
    textoDe(raiz).includes('Selecciona un proveedor.'))

  // Stock negativo -> error específico
  buscarSelect(raiz, 'Proveedor').props['onUpdate:modelValue'](1)
  buscarInput(raiz, 'Cantidad').props['onUpdate:modelValue'](-5)
  await nextTick()
  buscarBoton(raiz, 'Guardar producto').props.onClick()
  await nextTick()
  check('stock negativo -> "El stock no puede ser negativo."',
    textoDe(raiz).includes('El stock no puede ser negativo.'))
  check('stock negativo NO emite save', guardados.length === 0)

  // Stock mínimo negativo -> error
  buscarInput(raiz, 'Cantidad').props['onUpdate:modelValue'](5)
  buscarInput(raiz, 'Stock mínimo').props['onUpdate:modelValue'](-1)
  await nextTick()
  buscarBoton(raiz, 'Guardar producto').props.onClick()
  await nextTick()
  check('stock mínimo negativo -> error',
    textoDe(raiz).includes('El stock mínimo debe ser un número mayor o igual a 0.'))

  // Datos válidos con stock 0 -> emite save
  await llenarFormularioValido(raiz)
  buscarInput(raiz, 'Cantidad').props['onUpdate:modelValue'](0)
  await nextTick()
  buscarBoton(raiz, 'Guardar producto').props.onClick()
  await nextTick()

  check('datos válidos emite save', guardados.length === 1)
  const datos = guardados[0]
  check('nombre recortado', datos?.nombre === 'Jabón nuevo', JSON.stringify(datos?.nombre))
  check('ids como número', datos?.categoriaId === 1 && datos?.proveedorId === 1)
  check('precios como número (8000/10000)',
    datos?.precioCompra === 8000 && datos?.precioVenta === 10000,
    `${datos?.precioCompra}/${datos?.precioVenta}`)
  check('stock 0 permitido', datos?.cantidad === 0)
  check('stock mínimo numérico', datos?.stockMinimo === 2)
}

// ---------------------------------------------------------------------------
console.log('\nB) Editar producto: carga y relaciones')
{
  const guardados = []
  const { raiz } = await montar({
    product: {
      id: 101,
      codigo: 'PRD-050',
      nombre: 'Producto existente',
      categoriaId: 2,
      proveedorId: 1,
      precioCompra: 4000,
      precioVenta: 6000,
      cantidad: 12,
      stockMinimo: 4
    },
    categories: CATEGORIAS,
    suppliers: PROVEEDORES,
    error: '',
    onSave: (datos) => guardados.push(datos),
    'onUpdate:modelValue': () => {}
  })

  check('carga el nombre existente',
    buscarInput(raiz, 'Nombre del producto').props.modelValue === 'Producto existente')
  check('carga la categoría existente',
    buscarSelect(raiz, 'Categoría').props.modelValue === 2)
  check('carga el proveedor existente',
    buscarSelect(raiz, 'Proveedor').props.modelValue === 1)
  check('carga el stock existente',
    buscarInput(raiz, 'Cantidad').props.modelValue === 12)

  // Cambiar categoría, proveedor, nombre y poner stock negativo
  buscarSelect(raiz, 'Categoría').props['onUpdate:modelValue'](1)
  buscarSelect(raiz, 'Proveedor').props['onUpdate:modelValue'](1)
  buscarInput(raiz, 'Nombre del producto').props['onUpdate:modelValue']('Producto editado')
  buscarInput(raiz, 'Cantidad').props['onUpdate:modelValue'](-1)
  await nextTick()

  buscarBoton(raiz, 'Guardar producto').props.onClick()
  await nextTick()
  check('editar con stock negativo bloqueado', guardados.length === 0)
  check('mensaje de stock negativo visible',
    textoDe(raiz).includes('El stock no puede ser negativo.'))

  buscarInput(raiz, 'Cantidad').props['onUpdate:modelValue'](9)
  await nextTick()
  buscarBoton(raiz, 'Guardar producto').props.onClick()
  await nextTick()

  check('editar válida emite save', guardados.length === 1)
  check('nombre editado', guardados[0]?.nombre === 'Producto editado')
  check('categoría editada', guardados[0]?.categoriaId === 1)
  check('proveedor editado', guardados[0]?.proveedorId === 1)
  check('stock editado', guardados[0]?.cantidad === 9)
}

// ---------------------------------------------------------------------------
console.log('\nC) Referencia rota (categoría/proveedor eliminados)')
{
  const { raiz } = await montar({
    product: {
      id: 102,
      codigo: 'PRD-051',
      nombre: 'Huérfano',
      categoriaId: 999,
      proveedorId: 999,
      precioCompra: 1000,
      precioVenta: 2000,
      cantidad: 3,
      stockMinimo: 1
    },
    categories: CATEGORIAS,
    suppliers: PROVEEDORES,
    error: '',
    onSave: () => {},
    'onUpdate:modelValue': () => {}
  })

  const valorCategoria = buscarSelect(raiz, 'Categoría').props.modelValue
  const valorProveedor = buscarSelect(raiz, 'Proveedor').props.modelValue

  check('categoría inválida deja el selector vacío',
    valorCategoria === null || valorCategoria === undefined, String(valorCategoria))
  check('proveedor inválido deja el selector vacío',
    valorProveedor === null || valorProveedor === undefined, String(valorProveedor))

  buscarBoton(raiz, 'Guardar producto').props.onClick()
  await nextTick()
  check('no guarda con referencia de categoría rota',
    textoDe(raiz).includes('Selecciona una categoría.'))
}

// ---------------------------------------------------------------------------
console.log('\nD) Banner de error devuelto por la vista (prop error)')
{
  const { raiz } = await montar({
    product: null,
    categories: CATEGORIAS,
    suppliers: PROVEEDORES,
    error: 'No se pudo guardar el producto. Revisa los datos e inténtalo de nuevo.',
    onSave: () => {},
    'onUpdate:modelValue': () => {}
  })

  check('muestra el error proveniente de la vista',
    textoDe(raiz).includes('No se pudo guardar el producto.'))
}

console.log(`\nRESULTADO FORMULARIO: ${pasados} pruebas OK, ${fallidos} FALLIDAS`)

process.exit(fallidos > 0 ? 1 : 0)
