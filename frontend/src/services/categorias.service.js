import api, { conId } from './api.js'

const RUTA = '/categorias'

// Cada función devuelve el registro con `id` (string) normalizado.
// Si algo falla, axios rechaza la promesa con un Error ya traducido.
export const categoriasService = {
    listar: async () => {
        const respuesta = await api.get(RUTA)
        return respuesta.data.datos.map(conId)
    },

    obtener: async (id) => {
        const respuesta = await api.get(`${RUTA}/${id}`)
        return conId(respuesta.data.datos)
    },

    crear: async (datos) => {
        const respuesta = await api.post(RUTA, datos)
        return conId(respuesta.data.datos)
    },

    actualizar: async (id, datos) => {
        const respuesta = await api.put(`${RUTA}/${id}`, datos)
        return conId(respuesta.data.datos)
    },

    // PATCH /categorias/:id/estado -> alterna activo <-> inactivo
    alternarEstado: async (id) => {
        const respuesta = await api.patch(`${RUTA}/${id}/estado`)
        return conId(respuesta.data.datos)
    },

    eliminar: async (id) => {
        const respuesta = await api.delete(`${RUTA}/${id}`)
        return respuesta.data.datos
    }
}
