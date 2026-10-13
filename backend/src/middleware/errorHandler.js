import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'

// ---------------------------------------------------------------------------
// MANEJADOR DE ERRORES (siempre el ÚLTIMO middleware de app.js)
// Cualquier error lanzado (o rechazo de una promesa, Express 5 lo hace solo)
// termina aquí y se responde SIEMPRE con el mismo formato:
//   { ok: false, mensaje: 'texto entendible' }
// El frontend sólo muestra `mensaje` con SweetAlert2.
// ---------------------------------------------------------------------------
export function manejadorDeErrores(error, req, res, next) {
    // Error controlado: se responde con su código y su mensaje
    if (error instanceof ApiError) {
        return res.status(error.status).json({
            ok: false,
            mensaje: error.message
        })
    }

    // Id mal formado (p. ej. un ObjectId inválido en /api/productos/xyz)
    if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El identificador recibido no tiene un formato válido.'
        })
    }

    // Mongoose no pudo validar los datos del esquema
    if (error instanceof mongoose.Error.ValidationError) {
        const primerMensaje = Object.values(error.errors)[0]?.message
        return res.status(400).json({
            ok: false,
            mensaje: primerMensaje || 'Los datos enviados no son válidos.'
        })
    }

    // Índice único duplicado (nombre de categoría/proveedor, código, etc.)
    if (error?.code === 11000) {
        const campo = Object.keys(error.keyValue || {})[0] || 'nombre'
        return res.status(409).json({
            ok: false,
            mensaje: `Ya existe un registro con "${campo}" duplicado.`
        })
    }

    // Error inesperado: se registra en el servidor y se responde 500 genérico
    // (nunca se filtra el detalle interno al cliente)
    console.error('[ERROR NO CONTROLADO]', error)

    return res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor. Intenta de nuevo más tarde.'
    })
}
