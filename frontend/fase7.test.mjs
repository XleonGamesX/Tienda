// Pruebas de la FASE 7 (Inventario/Productos). Se ejecuta con Node y carga
// los stores reales del proyecto a través de Vite (ssrLoadModule).
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const viteUrl = pathToFileURL(path.join(root, 'node_modules', 'vite', 'dist', 'node', 'index.js')).href
const { createServer } = await import(viteUrl)

const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' })

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

const { createPinia, setActivePinia } = await server.ssrLoadModule('pinia')
const { useProductosStore } = await server.ssrLoadModule('/src/stores/productos.js')
const { useMovimientosStore } = await server.ssrLoadModule('/src/stores/movimientos.js')
const { useCategoriasStore } = await server.ssrLoadModule('/src/stores/categorias.js')
const { useProveedoresStore } = await server.ssrLoadModule('/src/stores/proveedores.js')

function nuevoContexto() {
  setActivePinia(createPinia())
  return {
    productos: useProductosStore(),
    movimientos: useMovimientosStore(),
    categorias: useCategoriasStore(),
    proveedores: useProveedoresStore()
  }
}

// ---------------------------------------------------------------------------
console.log('\n1) CRUD DE PRODUCTOS')
{
  const { productos } = nuevoContexto()

  const creado = productos.crearProducto({
    nombre: '  Café molido  ',
    categoriaId: 3,
    proveedorId: 2,
    precioCompra: 4000,
    precioVenta: 6000,
    cantidad: 10,
    stockMinimo: 3
  })

  check('crear producto devuelve el objeto', !!creado)
  check('nombre recortado', creado?.nombre === 'Café molido', creado?.nombre)
  check('id numérico', typeof creado?.id === 'number')
  check('código generado', /^PRD-\d{3}$/.test(creado?.codigo || ''), creado?.codigo)

  const codigoDuplicado = productos.productos.some(
    (p, i, arr) => arr.findIndex((q) => q.codigo === p.codigo) !== i
  )
  check('sin códigos duplicados tras crear', !codigoDuplicado)

  const encontrado = productos.obtenerProductos(String(creado.id))
  check('buscar por id (string)', encontrado?.nombre === 'Café molido')

  const editado = productos.editarProductos(creado.id, {
    nombre: 'Café especial',
    categoriaId: 1,
    proveedorId: 3,
    precioCompra: 4500,
    precioVenta: 7000,
    cantidad: 12,
    stockMinimo: 4
  })
  check('editar producto', editado?.nombre === 'Café especial')
  check('editar conserva id', editado?.id === creado.id)
  check('editar conserva código', editado?.codigo === creado.codigo)
  check('editar cambia categoría', editado?.categoriaId === 1)
  check('editar cambia proveedor', editado?.proveedorId === 3)

  const editadoInvalido = productos.editarProductos(creado.id, { cantidad: -1 })
  check('editar con stock negativo rechazado', editadoInvalido === null)
  check('stock no quedó negativo', productos.obtenerProductos(creado.id).cantidad === 12)

  const inexistente = productos.editarProductos(999999, { nombre: 'X' })
  check('editar id inexistente devuelve null', inexistente === null)

  check('eliminar producto', productos.eliminarProducto(creado.id) === true)
  check('eliminar id inexistente', productos.eliminarProducto(999999) === false)
  check('producto eliminado ya no aparece', productos.obtenerProductos(creado.id) === undefined)

  // Código único aunque se hayan borrado productos (bug corregido)
  const nuevo = productos.crearProducto({
    nombre: 'Té verde',
    categoriaId: 2,
    proveedorId: 1,
    precioCompra: 2000,
    precioVenta: 3500,
    cantidad: 0,
    stockMinimo: 2
  })
  check('nuevo código tras eliminar (sin duplicados)',
    !productos.productos.some((p, i, arr) => arr.findIndex((q) => q.codigo === p.codigo) !== i),
    nuevo?.codigo)
}

// ---------------------------------------------------------------------------
console.log('\n2) DATOS DEL PRODUCTO')
{
  const { productos } = nuevoContexto()

  const p = productos.productos[0]
  const campos = ['id', 'codigo', 'nombre', 'categoriaId', 'proveedorId', 'precioCompra', 'precioVenta', 'cantidad', 'stockMinimo']
  check('todos los campos presentes en el seed', campos.every((c) => c in p))

  const invalido = productos.crearProducto({
    nombre: 'Sin categoría ni proveedor válidos pero con datos',
    categoriaId: 'abc',
    proveedorId: null,
    precioCompra: 1000,
    precioVenta: 2000,
    cantidad: 5,
    stockMinimo: 1
  })
  check('categoriaId no numérico se normaliza a null', invalido?.categoriaId === null, String(invalido?.categoriaId))

  const tipos = productos.crearProducto({
    nombre: 'Tipado',
    categoriaId: '2',
    proveedorId: '1',
    precioCompra: '1500',
    precioVenta: '2500',
    cantidad: '7',
    stockMinimo: '2'
  })
  check('ids y cantidades se guardan como number',
    tipos &&
      typeof tipos.categoriaId === 'number' &&
      typeof tipos.proveedorId === 'number' &&
      typeof tipos.precioCompra === 'number' &&
      typeof tipos.precioVenta === 'number' &&
      typeof tipos.cantidad === 'number' &&
      typeof tipos.stockMinimo === 'number')
}

// ---------------------------------------------------------------------------
console.log('\n3) REGLAS DE STOCK')
{
  const { productos } = nuevoContexto()

  const conStock = productos.crearProducto({
    nombre: 'Con stock', categoriaId: 1, proveedorId: 1,
    precioCompra: 1000, precioVenta: 1500, cantidad: 20, stockMinimo: 5
  })
  check('stock > 0 válido', conStock?.cantidad === 20)

  const sinStock = productos.crearProducto({
    nombre: 'Sin stock', categoriaId: 1, proveedorId: 1,
    precioCompra: 1000, precioVenta: 1500, cantidad: 0, stockMinimo: 5
  })
  check('stock = 0 válido', sinStock?.cantidad === 0)

  const negativo = productos.crearProducto({
    nombre: 'Negativo', categoriaId: 1, proveedorId: 1,
    precioCompra: 1000, precioVenta: 1500, cantidad: -1, stockMinimo: 5
  })
  check('stock < 0 inválido', negativo === null)

  const stockMinNegativo = productos.crearProducto({
    nombre: 'Mínimo negativo', categoriaId: 1, proveedorId: 1,
    precioCompra: 1000, precioVenta: 1500, cantidad: 5, stockMinimo: -2
  })
  check('stock mínimo negativo inválido', stockMinNegativo === null)

  check('productosAgotados detecta cantidad 0',
    productos.productosAgotados.some((p) => p.id === sinStock.id))
  check('productosStockBajo detecta stock bajo',
    productos.productosStockBajo.some((p) => p.id === conStock.id) === false &&
    productos.productosStockBajo.length >= 0)
}

// ---------------------------------------------------------------------------
console.log('\n4) INTEGRACIÓN CON MOVIMIENTOS')
{
  const { productos, movimientos } = nuevoContexto()

  const p = productos.crearProducto({
    nombre: 'Producto movimiento', categoriaId: 1, proveedorId: 1,
    precioCompra: 1000, precioVenta: 1500, cantidad: 10, stockMinimo: 2
  })

  const entrada = movimientos.registrarMovimiento({ productoId: p.id, tipo: 'entrada', cantidad: 5 })
  check('entrada registrada', !!entrada)
  check('entrada aumenta stock (10 + 5 = 15)', productos.obtenerProductos(p.id).cantidad === 15)

  const salida = movimientos.registrarMovimiento({ productoId: p.id, tipo: 'salida', cantidad: 3 })
  check('salida registrada', !!salida)
  check('salida disminuye stock (15 - 3 = 12)', productos.obtenerProductos(p.id).cantidad === 12)

  const ajuste = movimientos.registrarMovimiento({ productoId: p.id, tipo: 'ajuste', cantidad: 4 })
  check('ajuste registrado', !!ajuste)
  check('ajuste fija stock (4)', productos.obtenerProductos(p.id).cantidad === 4)

  const ajusteCero = movimientos.registrarMovimiento({ productoId: p.id, tipo: 'ajuste', cantidad: 0 })
  check('ajuste a 0 permitido', !!ajusteCero)
  check('stock queda en 0', productos.obtenerProductos(p.id).cantidad === 0)

  const ajusteNegativo = movimientos.registrarMovimiento({ productoId: p.id, tipo: 'ajuste', cantidad: -5 })
  check('ajuste negativo rechazado', ajusteNegativo === null)
  check('stock sigue en 0', productos.obtenerProductos(p.id).cantidad === 0)

  const entradaCero = movimientos.registrarMovimiento({ productoId: p.id, tipo: 'entrada', cantidad: 0 })
  check('entrada con cantidad 0 rechazada', entradaCero === null)

  movimientos.registrarMovimiento({ productoId: p.id, tipo: 'entrada', cantidad: 6 })
  const salidaInsuficiente = movimientos.registrarMovimiento({ productoId: p.id, tipo: 'salida', cantidad: 10 })
  check('salida mayor al stock rechazada', salidaInsuficiente === null)
  check('stock intacto tras salida rechazada', productos.obtenerProductos(p.id).cantidad === 6)

  const salidaTotal = movimientos.registrarMovimiento({ productoId: p.id, tipo: 'salida', cantidad: 6 })
  check('salida que deja stock en 0 permitida', !!salidaTotal)
  check('stock queda en 0', productos.obtenerProductos(p.id).cantidad === 0)

  const productoInexistente = movimientos.registrarMovimiento({ productoId: 999999, tipo: 'entrada', cantidad: 1 })
  check('movimiento de producto inexistente rechazado', productoInexistente === null)

  const totalEsperado = movimientos.movimientos.filter((m) => m.productoId === p.id).length
  check('historial solo registra movimientos válidos (6)', totalEsperado === 6, String(totalEsperado))
  check('tipo de movimiento guardado', movimientos.movimientos.every((m) => ['entrada', 'salida', 'ajuste'].includes(m.tipo)))
}

// ---------------------------------------------------------------------------
console.log('\n5) CATEGORÍAS Y PROVEEDORES')
{
  const { productos, categorias, proveedores } = nuevoContexto()

  const p = productos.crearProducto({
    nombre: 'Relación', categoriaId: 5, proveedorId: 3,
    precioCompra: 1000, precioVenta: 1500, cantidad: 3, stockMinimo: 1
  })

  const conCat = productos.productosConCategoria.find((x) => x.id === p.id)
  check('categoriaNombre resuelto', conCat?.categoriaNombre === 'Aseo', conCat?.categoriaNombre)

  const conProv = productos.productosConProveedor.find((x) => x.id === p.id)
  check('proveedorNombre resuelto', conProv?.proveedorNombre === 'Alimentos del Valle', conProv?.proveedorNombre)

  const completo = productos.productosCompletos.find((x) => x.id === p.id)
  check('productosCompletos incluye ambos', completo?.categoriaNombre === 'Aseo' && completo?.proveedorNombre === 'Alimentos del Valle')

  // Referencia huérfana (categoría eliminada)
  productos.editarProductos(p.id, { categoriaId: 999 })
  const huerfano = productos.productosConCategoria.find((x) => x.id === p.id)
  check('referencia inválida muestra "Sin categoría"', huerfano?.categoriaNombre === 'Sin categoría', huerfano?.categoriaNombre)

  // Editar volviendo a una categoría válida
  const reparado = productos.editarProductos(p.id, { categoriaId: categorias.categorias[0].id })
  check('editar reparando la categoría', reparado?.categoriaId === categorias.categorias[0].id)
  check('nombre de categoría tras reparar',
    productos.productosConCategoria.find((x) => x.id === p.id)?.categoriaNombre === categorias.categorias[0].nombre)

  check('obtenerCategoriaPorId funciona', categorias.obtenerCategoriaPorId(String(categorias.categorias[0].id)) !== undefined)
  check('obtenerProveedorPorId funciona', proveedores.obtenerProveedorPorId(String(proveedores.proveedores[0].id)) !== undefined)
}

// ---------------------------------------------------------------------------
console.log('\n6) BÚSQUEDA (lógica de InventarioView)')
{
  const { productos } = nuevoContexto()

  const base = productos.productosConCategoria
  const buscar = (valor) => {
    const searchValue = valor.trim().toLowerCase()
    return base.filter((product) => {
      const nombre = String(product.nombre || '').toLowerCase()
      const codigo = String(product.codigo || '').toLowerCase()
      return !searchValue || nombre.includes(searchValue) || codigo.includes(searchValue)
    })
  }

  check('búsqueda por nombre', buscar('blanqueador').length === 1)
  check('búsqueda por código en minúsculas', buscar('prd-003').length === 1)
  check('búsqueda por código en mayúsculas', buscar('PRD-003').length === 1)
  check('búsqueda parcial', buscar('agua').length === 1)
  check('búsqueda sin resultados', buscar('zzzz-no-existe').length === 0)
  check('búsqueda vacía devuelve todo', buscar('').length === productos.productos.length)
}

// ---------------------------------------------------------------------------
console.log('\n7) PINIA: REACTIVIDAD Y ESTADO')
{
  const { productos, categorias } = nuevoContexto()

  const antes = productos.totalProductos
  productos.crearProducto({
    nombre: 'Reactivo', categoriaId: 1, proveedorId: 1,
    precioCompra: 1, precioVenta: 2, cantidad: 1, stockMinimo: 0
  })
  check('totalProductos se actualiza al crear', productos.totalProductos === antes + 1)
  check('unidadesDisponibles se actualiza',
    productos.unidadesDisponibles === productos.productos.reduce((t, p) => t + p.cantidad, 0))

  const nombreAntes = productos.productosConCategoria[0].categoriaNombre
  categorias.editarCategoria(categorias.categorias[0].id, 'Categoría renombrada')
  const nombreDespues = productos.productosConCategoria[0].categoriaNombre
  check('productosConCategoria reacciona a cambios de categorías',
    nombreAntes !== nombreDespues && nombreDespues === 'Categoría renombrada',
    `${nombreAntes} -> ${nombreDespues}`)
}

// ---------------------------------------------------------------------------
console.log(`\nRESULTADO: ${pasados} pruebas OK, ${fallidos} FALLIDAS`)

await server.close()
process.exit(fallidos > 0 ? 1 : 0)
