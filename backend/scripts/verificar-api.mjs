// ---------------------------------------------------------------------------
// VERIFICACIÓN DE PUNTA A PUNTA DE LA API
// Se ejecuta con el backend corriendo (npm run dev en otra terminal):
//
//   npm run verificar
//
// Recorre el ciclo de vida completo de los 4 recursos usando axios:
// crear -> leer -> validar errores (400/409) -> editar -> eliminar.
//
// La limpieza de los registros de prueba vive en un `finally`, así que se
// ejecuta SIEMPRE: aunque un paso falle o lance una excepción, no quedan
// datos huérfanos en la base (antes, un corte a mitad dejaba categorías
// "Verificación <timestamp>" que aparecían en el selector de Reportes).
// ---------------------------------------------------------------------------
import axios from 'axios'

const BASE = process.env.API_URL
    ?? `http://localhost:${process.env.PORT ?? 3000}/api`

// validateStatus: () => true => axios no lanza por status 4xx/5xx,
// nosotros revisamos el código a mano en cada paso.
const api = axios.create({ baseURL: BASE, validateStatus: () => true })

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

const marca = Date.now() // para que los nombres no choquen con datos reales

// Registros creados durante ESTA corrida. Se ponen en `null` en cuanto se
// borran, de modo que la limpieza del `finally` sólo reintenta lo que
// todavía exista (y no repite borrar lo que ya no está).
let categoria = null
let proveedor = null
let producto = null

// Patrón EXACTO que genera este script: "<prefijo> <timestamp de 13 dígitos>".
// Se usa para reconocer huérfanas de corridas anteriores sin arriesgar
// categorías o proveedores reales del usuario (que nunca llevan timestamp).
const PATRON_CATEGORIA = /^verificación\s+\d{13}$/i
const PATRON_PROVEEDOR = /^proveedor verificación\s+\d{13}$/i

// Borra registros huérfanos de corridas ANTERIORES (si el script se cortó
// antes de este fix). Se usan los patrones estrictos de arriba: sólo así se
// limpia basura sin arriesgar categorías o proveedores reales del usuario.
async function borrarHuerfanos() {
    try {
        const { data: categorias } = await api.get('/categorias')

        const huerfanas = (categorias?.datos ?? []).filter((c) =>
            PATRON_CATEGORIA.test(String(c?.nombre ?? '').trim())
        )

        for (const huerfana of huerfanas) {
            // Si tiene productos asociados el backend responde 409 y se
            // deja estar: no se toca nada que esté en uso.
            await api.delete(`/categorias/${huerfana._id}`).catch(() => {})
        }

        const { data: proveedores } = await api.get('/proveedores')

        const huerfanos = (proveedores?.datos ?? []).filter((p) =>
            PATRON_PROVEEDOR.test(String(p?.nombre ?? '').trim())
        )

        for (const huerfano of huerfanos) {
            await api.delete(`/proveedores/${huerfano._id}`).catch(() => {})
        }
    } catch {
        // Sin respuesta del backend: ya falló todo lo demás arriba.
    }
}

// Comprobación final: NO debe quedar NINGÚN registro de prueba en la base,
// ni el de esta corrida ni huérfanos de corridas anteriores.
async function comprobarLimpio() {
    try {
        const { data: categorias } = await api.get('/categorias')

        const huerfanas = (categorias?.datos ?? []).filter((c) =>
            PATRON_CATEGORIA.test(String(c?.nombre ?? '').trim())
        )

        check('no quedan categorías de prueba huérfanas',
            huerfanas.length === 0,
            huerfanas.map((c) => c.nombre).join(', '))

        const { data: proveedores } = await api.get('/proveedores')

        const huerfanos = (proveedores?.datos ?? []).filter((p) =>
            PATRON_PROVEEDOR.test(String(p?.nombre ?? '').trim())
        )

        check('no quedan proveedores de prueba huérfanos',
            huerfanos.length === 0,
            huerfanos.map((p) => p.nombre).join(', '))
    } catch {
        // Sin respuesta del backend: ya falló todo lo demás arriba.
    }
}

// ---------------------------------------------------------------------------
// LIMPIEZA GARANTIZADA (se llama desde `finally`)
// Orden inverso al de creación, porque hay referencias que lo exigen:
// producto -> proveedor -> categoría. Cualquier fallo aquí (404 si ya se
// borró, backend caído, ...) se tolera para no enmascarar el resultado
// real de los checks.
async function limpiar() {
    if (producto?._id) {
        await api.delete(`/productos/${producto._id}`).catch(() => {})
        producto = null
    }

    if (proveedor?._id) {
        await api.delete(`/proveedores/${proveedor._id}`).catch(() => {})
        proveedor = null
    }

    if (categoria?._id) {
        await api.delete(`/categorias/${categoria._id}`).catch(() => {})
        categoria = null
    }

    await borrarHuerfanos()
    await comprobarLimpio()
}

try {
    // -------------------------------------------------------------------------
    console.log('\n1) SALUD DEL SERVIDOR')
    {
        const { status, data } = await api.get('/salud')

        check('GET /api/salud responde 200', status === 200, `status ${status}`)
        check('mensaje correcto', data?.ok === true)
    }

    // -------------------------------------------------------------------------
    console.log('\n2) CATEGORÍAS')

    {
        const { status, data } = await api.post('/categorias', { nombre: `Verificación ${marca}` })

        check('crear categoría responde 201', status === 201, `status ${status} - ${data?.mensaje}`)
        categoria = data?.datos

        const duplicada = await api.post('/categorias', { nombre: `VERIFICACIÓN ${marca} ` })
        check('nombre duplicado responde 409', duplicada.status === 409, `status ${duplicada.status}`)

        const vacia = await api.post('/categorias', { nombre: '   ' })
        check('nombre vacío responde 400', vacia.status === 400, `status ${vacia.status}`)

        const { data: lista } = await api.get('/categorias')
        check('la lista incluye la creada',
            Array.isArray(lista?.datos) && lista.datos.some(c => c._id === categoria?._id))
    }

    // -------------------------------------------------------------------------
    console.log('\n3) PROVEEDORES (id = UUID)')

    {
        const { status, data } = await api.post('/proveedores', {
            nombre: `Proveedor Verificación ${marca}`,
            telefono: '3001234567',
            email: `verificacion${marca}@tienda.test`,
            direccion: 'Calle de prueba 1-2-3'
        })

        check('crear proveedor responde 201', status === 201, `status ${status} - ${data?.mensaje}`)
        proveedor = data?.datos

        const esUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        check('el id es un UUID', esUuid.test(String(proveedor?._id)), proveedor?._id)

        const incompleto = await api.post('/proveedores', { nombre: 'Sólo nombre' })
        check('proveedor incompleto responde 400', incompleto.status === 400, `status ${incompleto.status}`)

        if (proveedor?._id) {
            const { data: uno } = await api.get(`/proveedores/${proveedor._id}`)
            check('GET por UUID lo encuentra', uno?.datos?.nombre === proveedor.nombre)
        }
    }

    // -------------------------------------------------------------------------
    console.log('\n4) PRODUCTOS (código autogenerado)')

    {
        const { status, data } = await api.post('/productos', {
            nombre: `Producto Verificación ${marca}`,
            categoriaId: categoria?._id,
            proveedorId: proveedor?._id,
            precioCompra: 3500,
            precioVenta: 5000,
            cantidad: 0,
            stockMinimo: 5
        })

        check('crear producto responde 201', status === 201, `status ${status} - ${data?.mensaje}`)
        producto = data?.datos
        check('código autogenerado PRD-###', /^PRD-\d{3}$/.test(String(producto?.codigo)), producto?.codigo)

        const negativo = await api.post('/productos', {
            nombre: 'Stock negativo',
            precioCompra: 100,
            precioVenta: 200,
            cantidad: -5,
            stockMinimo: 1
        })
        check('stock negativo responde 400', negativo.status === 400, `status ${negativo.status}`)

        const referenciaRota = await api.post('/productos', {
            nombre: 'Referencia rota',
            categoriaId: '64b000000000000000000000',
            precioCompra: 100,
            precioVenta: 200,
            cantidad: 1,
            stockMinimo: 1
        })
        check('categoría inexistente responde 400', referenciaRota.status === 400, `status ${referenciaRota.status}`)
    }

    // -------------------------------------------------------------------------
    console.log('\n5) MOVIMIENTOS (efecto en el stock)')

    {
        const entrada = await api.post('/movimientos', { productoId: producto?._id, tipo: 'entrada', cantidad: 10 })
        check('entrada responde 201', entrada.status === 201, `status ${entrada.status} - ${entrada.data?.mensaje}`)
        check('stock sumado a 10', entrada.data?.producto?.cantidad === 10, entrada.data?.producto?.cantidad)

        const salida = await api.post('/movimientos', { productoId: producto?._id, tipo: 'salida', cantidad: 4 })
        check('salida responde 201', salida.status === 201, `status ${salida.status}`)
        check('stock restado a 6', salida.data?.producto?.cantidad === 6, salida.data?.producto?.cantidad)

        const sinStock = await api.post('/movimientos', { productoId: producto?._id, tipo: 'salida', cantidad: 999 })
        check('salida sin stock responde 400', sinStock.status === 400, `status ${sinStock.status}`)

        const { data: despuesDeFallar } = await api.get(`/productos/${producto?._id}`)
        check('el stock NO cambió tras la salida rechazada',
            despuesDeFallar?.datos?.cantidad === 6, despuesDeFallar?.datos?.cantidad)

        const ajuste = await api.post('/movimientos', { productoId: producto?._id, tipo: 'ajuste', cantidad: 3 })
        check('ajuste fija el stock en 3', ajuste.data?.producto?.cantidad === 3, ajuste.data?.producto?.cantidad)

        const negativo = await api.post('/movimientos', { productoId: producto?._id, tipo: 'entrada', cantidad: -2 })
        check('cantidad negativa responde 400', negativo.status === 400, `status ${negativo.status}`)

        const { data: movimientos } = await api.get(`/movimientos?productoId=${producto?._id}`)
        check('la lista registra los 3 movimientos',
            Array.isArray(movimientos?.datos) && movimientos.datos.length === 3, movimientos?.datos?.length)
    }

    // -------------------------------------------------------------------------
    console.log('\n6) PROTECCIÓN DE REFERENCIAS Y LIMPIEZA')

    {
        if (proveedor?._id) {
            const enUso = await api.delete(`/proveedores/${proveedor._id}`)
            check('borrar proveedor en uso responde 409', enUso.status === 409, `status ${enUso.status}`)
        }

        if (producto?._id) {
            const borradoProducto = await api.delete(`/productos/${producto._id}`)
            check('borrar producto responde ok', borradoProducto.status === 200, `status ${borradoProducto.status}`)

            if (borradoProducto.status === 200) {
                producto = null
            }
        }

        if (proveedor?._id) {
            const borradoProveedor = await api.delete(`/proveedores/${proveedor._id}`)
            check('borrar proveedor ya libre responde ok', borradoProveedor.status === 200, `status ${borradoProveedor.status}`)

            if (borradoProveedor.status === 200) {
                proveedor = null
            }
        }

        if (categoria?._id) {
            const borradoCategoria = await api.delete(`/categorias/${categoria._id}`)
            check('borrar categoría responde ok', borradoCategoria.status === 200, `status ${borradoCategoria.status}`)

            if (borradoCategoria.status === 200) {
                categoria = null
            }
        }
    }
} finally {
    // Se ejecuta aunque algo de arriba lance: nunca quedan datos de prueba.
    await limpiar()
}

// ---------------------------------------------------------------------------
console.log(`\nResultado: ${pasados} pasados, ${fallidos} fallidos.\n`)
process.exit(fallidos > 0 ? 1 : 0)
