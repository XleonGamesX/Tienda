import api, { conId } from './api.js'

const RUTA = '/movimientos'

// La API puede devolver "productoId" populado (objeto con nombre y código).
// A la app sólo le interesa el identificador, así que se normaliza SIEMPRE a
// string: la tabla de movimientos sigue resolviendo el nombre del producto
// desde su store, igual que antes.
function normalizarMovimiento(movimiento) {
    const productoId = movimiento?.productoId

    return {
        ...conId(movimiento),
        productoId: productoId && typeof productoId === 'object'
            ? String(productoId._id)
            : String(productoId ?? '')
    }
}

export const movimientosService = {
    // productoId es opcional: sin él se listan todos
    listar: async (productoId) => {
        const params = productoId ? { productoId } : undefined
        const respuesta = await api.get(RUTA, { params })
        return respuesta.data.datos.map(normalizarMovimiento)
    },

    obtener: async (id) => {
        const respuesta = await api.get(`${RUTA}/${id}`)
        return normalizarMovimiento(respuesta.data.datos)
    },

    // El backend valida el movimiento, ACTUALIZA el stock del producto de
    // forma atómica y devuelve ambos: el movimiento creado y el producto con
    // su stock ya nuevo (para reflejarlo en el store de productos).
    registrar: async (datos) => {
        const respuesta = await api.post(RUTA, datos)

        return {
            movimiento: normalizarMovimiento(respuesta.data.datos),
            producto: respuesta.data.producto
                ? conId(respuesta.data.producto)
                : null
        }
    }
}
