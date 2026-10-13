import axios from 'axios'

// ---------------------------------------------------------------------------
// INSTANCIA AXIOS (capa única de comunicación con el backend)
// - baseURL: VITE_API_URL si está definida, o http://localhost:3000/api
//   (la URL del backend en desarrollo, igual que en backend/.env).
// - interceptor de respuesta: cualquier error (400, 404, 409, backend caído...)
//   se convierte en un Error con `message` listo para mostrar con SweetAlert2.
//   Así los stores y las vistas no necesitan saber nada de axios.
// ---------------------------------------------------------------------------
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' }
})

// Mensajes de respaldo por si la API responde sin cuerpo (p. ej. un proxy)
const MENSAJES_POR_ESTADO = {
    400: 'Los datos enviados no son válidos.',
    401: 'No autorizado para realizar esta operación.',
    403: 'No tienes permisos para realizar esta operación.',
    404: 'No se encontró el recurso solicitado.',
    409: 'La operación entra en conflicto con los datos actuales.',
    500: 'Error interno del servidor. Intenta de nuevo más tarde.'
}

api.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
        // Sin respuesta HTTP: el backend está apagado o no hay red
        if (!error.response) {
            return Promise.reject(
                new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.')
            )
        }

        const { status, data } = error.response

        // El backend responde siempre { ok: false, mensaje: '...' }
        const mensaje = data?.mensaje
            || MENSAJES_POR_ESTADO[status]
            || 'Ocurrió un error inesperado.'

        const errorApi = new Error(mensaje)
        errorApi.status = status
        errorApi.datos = data

        return Promise.reject(errorApi)
    }
)

// ---------------------------------------------------------------------------
// NORMALIZACIÓN DE IDS
// La API devuelve `_id` (ObjectId de Mongo, o UUID en los proveedores). Toda
// la aplicación trabaja con `id` como STRING, así que cada registro que
// entra por aquí se deja con su `id` ya normalizado. Esto permite que las
// vistas y componentes sigan leyendo `fila.id` como hasta ahora.
// ---------------------------------------------------------------------------
export function conId(dato) {
    return { ...dato, id: String(dato._id) }
}

export default api
