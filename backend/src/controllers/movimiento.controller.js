import { Movimiento } from '../models/Movimiento.js'
import { Producto } from '../models/Producto.js'
import { validarMovimiento } from '../validations/movimiento.validation.js'
import { errorNoEncontrado, errorValidacion } from '../utils/ApiError.js'

// ---------------------------------------------------------------------------
// MOVIMIENTOS DE INVENTARIO
// El endpoint POST es el ÚNICO punto que modifica el stock de un producto.
// La actualización es ATÓMICA (findOneAndUpdate con condición) para que dos
// salidas simultáneas nunca dejen el stock en negativo, y si la creación del
// movimiento falla se revierte el stock aplicado.
// ---------------------------------------------------------------------------

// GET /api/movimientos
export async function listarMovimientos(req, res) {
    const filtro = {}

    if (req.query.productoId) {
        filtro.productoId = req.query.productoId
    }

    const movimientos = await Movimiento.find(filtro)
        .sort({ fecha: -1 })
        .populate('productoId', 'nombre codigo')

    res.json({ ok: true, datos: movimientos })
}

// GET /api/movimientos/:id
export async function obtenerMovimiento(req, res) {
    const movimiento = await Movimiento.findById(req.params.id)
        .populate('productoId', 'nombre codigo')

    if (!movimiento) {
        throw errorNoEncontrado('Movimiento')
    }

    res.json({ ok: true, datos: movimiento })
}

// POST /api/movimientos
export async function registrarMovimiento(req, res) {
    const datos = validarMovimiento(req.body)

    const producto = await Producto.findById(datos.productoId)

    if (!producto) {
        throw errorValidacion('El producto seleccionado ya no existe en el inventario.')
    }

    let productoActualizado = null
    let stockRevertir = null

    if (datos.tipo === 'entrada') {
        // Suma el stock de forma atómica, sin importar el valor actual
        productoActualizado = await Producto.findByIdAndUpdate(
            producto._id,
            { $inc: { cantidad: datos.cantidad } },
            { new: true }
        )
        stockRevertir = { $inc: { cantidad: -datos.cantidad } }
    }

    if (datos.tipo === 'salida') {
        // La condición "cantidad >= n" hace que el motor rechace la salida
        // si no hay stock suficiente: nunca puede quedar negativo.
        productoActualizado = await Producto.findOneAndUpdate(
            { _id: producto._id, cantidad: { $gte: datos.cantidad } },
            { $inc: { cantidad: -datos.cantidad } },
            { new: true }
        )

        if (!productoActualizado) {
            throw errorValidacion(
                `Stock insuficiente: el producto tiene ${producto.cantidad} unidad(es) disponibles.`
            )
        }

        stockRevertir = { $inc: { cantidad: datos.cantidad } }
    }

    if (datos.tipo === 'ajuste') {
        // El ajuste FIJA el stock final: se guarda el valor anterior para
        // poder devolverlo si la creación del movimiento falla.
        productoActualizado = await Producto.findByIdAndUpdate(
            producto._id,
            { cantidad: datos.cantidad },
            { new: true }
        )
        stockRevertir = { cantidad: producto.cantidad }
    }

    try {
        const movimiento = await Movimiento.create({
            productoId: producto._id,
            tipo: datos.tipo,
            cantidad: datos.cantidad,
            fecha: new Date()
        })

        res.status(201).json({
            ok: true,
            datos: movimiento,
            producto: productoActualizado
        })
    } catch (error) {
        // Revierte el stock aplicado para no dejar el inventario modificado
        // sin quedar registrado el movimiento.
        await Producto.findByIdAndUpdate(producto._id, stockRevertir)
        throw error
    }
}
