import api, { conId } from './api.js'

const RUTA = '/proveedores'

// El `_id` de un proveedor es un UUID generado por el backend; aquí sólo se
// normaliza a `id` string para que la app lo use sin distinguir formatos.
export const proveedoresService = {
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

    // PATCH /proveedores/:id/estado -> alterna activo <-> inactivo
    alternarEstado: async (id) => {
        const respuesta = await api.patch(`${RUTA}/${id}/estado`)
        return conId(respuesta.data.datos)
    },

    eliminar: async (id) => {
        const respuesta = await api.delete(`${RUTA}/${id}`)
        return respuesta.data.datos
    }
}
