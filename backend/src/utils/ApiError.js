// ---------------------------------------------------------------------------
// ERROR DE API
// Se lanza desde validaciones, controllers o modelos y lo traduce el
// middleware errorHandler a una respuesta JSON con el código HTTP que
// corresponda (400, 404, 409...).
// ---------------------------------------------------------------------------
export class ApiError extends Error {
    constructor(status, message) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

// Atajos frecuentes para que los controllers lean de forma más clara
export const errorNoEncontrado = (recurso) =>
    new ApiError(404, `${recurso} no encontrado(a).`)

export const errorValidacion = (mensaje) =>
    new ApiError(400, mensaje)

export const errorConflicto = (mensaje) =>
    new ApiError(409, mensaje)
