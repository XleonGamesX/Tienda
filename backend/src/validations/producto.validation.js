import { Types } from 'mongoose'
import { errorValidacion } from '../utils/ApiError.js'

// ---------------------------------------------------------------------------
// VALIDACIONES DE PRODUCTO
// Reglas de negocio del frontend, ahora en el servidor:
// - nombre obligatorio
// - precios, stock y stock mínimo deben ser números >= 0
// - REGLA DE STOCK: stock > 0 válido · stock = 0 válido · stock < 0 inválido
// - categoriaId/proveedorId vacíos quedan en null (sin referencia); si vienen
//   deben tener formato válido para poder buscarlos en la base.
// ---------------------------------------------------------------------------
function normalizarReferencia(valor, esObjectId) {
    if (valor === null || valor === undefined || valor === '') {
        return null
    }

    if (esObjectId && !Types.ObjectId.isValid(String(valor))) {
        throw errorValidacion('El identificador de la categoría no tiene un formato válido.')
    }

    return String(valor)
}

function numeroNoNegativo(valor, mensaje) {
    const numero = Number(valor)

    if (!Number.isFinite(numero) || numero < 0) {
        throw errorValidacion(mensaje)
    }

    return numero
}

// La cantidad es OPCIONAL en la validación: al CREAR define el stock inicial
// (si no viene, se asume 0); al EDITAR no se envía, porque el stock solo
// cambia mediante movimientos (entradas/salidas/ajustes). Si viene, debe ser
// un número >= 0.
function normalizarCantidad(valor) {
    if (valor === undefined || valor === null || valor === '') {
        return undefined
    }

    return numeroNoNegativo(valor, 'El stock debe ser un número mayor o igual a 0.')
}

export function validarProducto(datos) {
    if (!datos || typeof datos !== 'object') {
        throw errorValidacion('No se recibieron datos del producto.')
    }

    const nombre = String(datos.nombre ?? '').trim()

    if (!nombre) {
        throw errorValidacion('El nombre del producto es obligatorio.')
    }

    return {
        nombre,
        codigo: String(datos.codigo ?? '').trim().toUpperCase() || null,
        categoriaId: normalizarReferencia(datos.categoriaId, true),
        proveedorId: normalizarReferencia(datos.proveedorId, false),
        precioCompra: numeroNoNegativo(datos.precioCompra, 'El precio de compra debe ser un número mayor o igual a 0.'),
        precioVenta: numeroNoNegativo(datos.precioVenta, 'El precio de venta debe ser un número mayor o igual a 0.'),
        cantidad: normalizarCantidad(datos.cantidad),
        stockMinimo: numeroNoNegativo(datos.stockMinimo, 'El stock mínimo debe ser un número mayor o igual a 0.')
    }
}
