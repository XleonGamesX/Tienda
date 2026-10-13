// ---------------------------------------------------------------------------
// MENSAJES DE ERROR PARA LA INTERFAZ
// Los errores que vienen de la API ya llegan con un `message` legible gracias
// al interceptor de services/api.js; esta función sólo cubre el caso raro de
// un error sin mensaje, para que las vistas siempre tengan algo que mostrar.
// ---------------------------------------------------------------------------
export function mensajeDeError(error, mensajePorDefecto = 'Ocurrió un error inesperado. Inténtalo de nuevo.') {
    return error?.message || mensajePorDefecto
}
