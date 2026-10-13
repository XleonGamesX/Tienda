import { errorValidacion } from '../utils/ApiError.js'

// ---------------------------------------------------------------------------
// VALIDACIONES DE CATEGORÍA
// Sólo existe el nombre, y es obligatorio. Se limpia aquí (trim) y se
// rechazan vacíos ANTES de tocar Mongoose, para devolver mensajes claros.
// El duplicado lo resuelve el índice único con collation del modelo (409).
// ---------------------------------------------------------------------------
export function validarCategoria(datos) {
    const nombre = String(datos?.nombre ?? '').trim()

    if (!nombre) {
        throw errorValidacion('El nombre de la categoría es obligatorio.')
    }

    return { nombre }
}
