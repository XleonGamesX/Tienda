import { Producto } from '../models/Producto.js'
import { Categoria } from '../models/Categoria.js'
import { Proveedor } from '../models/Proveedor.js'
import { Movimiento } from '../models/Movimiento.js'
import { validarProducto } from '../validations/producto.validation.js'
import { errorConflicto, errorNoEncontrado, errorValidacion } from '../utils/ApiError.js'

// ---------------------------------------------------------------------------
// PRODUCTOS
// El código PRD-### se genera aquí (máximo número existente + 1) y el índice
// único del modelo garantiza que nunca se repita, incluso con altas
// simultáneas.
// ---------------------------------------------------------------------------

// Toma el mayor número de los códigos PRD-### existentes y devuelve el
// siguiente con 3 dígitos (PRD-001, PRD-002, ...).
async function generarCodigo() {
    const prefijo = 'PRD-'

    const ultimo = await Producto.findOne({
        codigo: { $regex: `^${prefijo}\\d+$` }
    })
        .sort({ codigo: -1 })
        .select({ codigo: 1 })
        .lean()

    const ultimoNumero = ultimo
        ? Number(String(ultimo.codigo).slice(prefijo.length))
        : 0

    const siguiente = (Number.isFinite(ultimoNumero) ? ultimoNumero : 0) + 1

    return `${prefijo}${String(siguiente).padStart(3, '0')}`
}

// Rechaza referencias a categorías/proveedores que no existen, para no
// guardar productos con ids colgantes (en la app se mostraba "Sin categoría").
async function verificarReferencias(datos) {
    if (datos.categoriaId) {
        const categoria = await Categoria.findById(datos.categoriaId).lean()

        if (!categoria) {
            throw errorValidacion('La categoría seleccionada no existe.')
        }
    }

    if (datos.proveedorId) {
        const proveedor = await Proveedor.findById(datos.proveedorId).lean()

        if (!proveedor) {
            throw errorValidacion('El proveedor seleccionado no existe.')
        }
    }
}

// GET /api/productos
export async function listarProductos(req, res) {
    const productos = await Producto.find().sort({ codigo: 1 })

    res.json({ ok: true, datos: productos })
}

// GET /api/productos/:id
export async function obtenerProducto(req, res) {
    const producto = await Producto.findById(req.params.id)

    if (!producto) {
        throw errorNoEncontrado('Producto')
    }

    res.json({ ok: true, datos: producto })
}

// POST /api/productos
export async function crearProducto(req, res) {
    const datos = validarProducto(req.body)

    await verificarReferencias(datos)

    // El código puede venir del formulario o autogenerarse; si viene, no debe
    // repetirse con el de otro producto (el índice único también lo cubre).
    const codigoFinal = datos.codigo || (await generarCodigo())

    // Si no vino cantidad (stock inicial), se asume 0; el stock real se
    // gestiona luego con movimientos.
    const { cantidad, ...resto } = datos

    const producto = await Producto.create({
        ...resto,
        cantidad: cantidad ?? 0,
        codigo: codigoFinal
    })

    res.status(201).json({ ok: true, datos: producto })
}

// PUT /api/productos/:id
export async function editarProducto(req, res) {
    const datos = validarProducto(req.body)

    await verificarReferencias(datos)

    // El código NUNCA se cambia desde el formulario y la CANTIDAD tampoco:
    // el stock solo se modifica registrando movimientos (entrada/salida/
    // ajuste), así las "unidades disponibles" siempre cuadran con los
    // movimientos reales.
    const { cantidad, ...resto } = datos

    const producto = await Producto.findByIdAndUpdate(
        req.params.id,
        { ...resto, codigo: undefined },
        { new: true, runValidators: true }
    )

    if (!producto) {
        throw errorNoEncontrado('Producto')
    }

    res.json({ ok: true, datos: producto })
}

// DELETE /api/productos/:id
// Los MOVIMIENTOS del producto se borran junto con él: describen el stock de
// un producto que ya no existe y sólo ensuciarían los reportes (aparecerían
// como "Producto eliminado" y contarían entradas/salidas de la nada).
// Orden: primero los movimientos, después el producto.
export async function eliminarProducto(req, res) {
    const producto = await Producto.findById(req.params.id)

    if (!producto) {
        throw errorNoEncontrado('Producto')
    }

    await Movimiento.deleteMany({ productoId: producto._id })
    await producto.deleteOne()

    res.json({ ok: true, datos: { eliminado: true } })
}
