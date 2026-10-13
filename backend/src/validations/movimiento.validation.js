import { Types } from 'mongoose'
import { errorValidacion } from '../utils/ApiError.js'

// ---------------------------------------------------------------------------
// VALIDACIONES DE MOVIMIENTO
// Se valida la FORMA del movimiento; el efecto sobre el stock (stock
// suficiente en salidas) se valida y aplica de forma atómica en el
// controlador para que dos salidas simultáneas no vacíen el stock de más.
//
// - productoId: obligatorio y con formato ObjectId
// - tipo: entrada | salida | ajuste
// - cantidad:
//     ajuste  -> fija el stock FINAL, así que 0 sí es válido, pero JAMÁS negativo
//     entrada -> debe sumar algo real, así que > 0
//     salida  -> debe restar algo real, así que > 0
// ---------------------------------------------------------------------------
export function validarMovimiento(datos) {
    if (!datos || typeof datos !== 'object') {
        throw errorValidacion('No se recibieron datos del movimiento.')
    }

    const productoId = String(datos.productoId ?? '').trim()

    if (!productoId) {
        throw errorValidacion('El producto del movimiento es obligatorio.')
    }

    if (!Types.ObjectId.isValid(productoId)) {
        throw errorValidacion('El identificador del producto no tiene un formato válido.')
    }

    const tipo = String(datos.tipo ?? '').trim()

    if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
        throw errorValidacion('El tipo debe ser "entrada", "salida" o "ajuste".')
    }

    const cantidad = Number(datos.cantidad)

    if (!Number.isFinite(cantidad)) {
        throw errorValidacion('La cantidad debe ser un número.')
    }

    const cantidadInvalida = tipo === 'ajuste'
        ? cantidad < 0
        : cantidad <= 0

    if (cantidadInvalida) {
        throw errorValidacion(
            tipo === 'ajuste'
                ? 'La cantidad del ajuste no puede ser negativa.'
                : 'La cantidad debe ser un número mayor a 0.'
        )
    }

    return { productoId, tipo, cantidad }
}
