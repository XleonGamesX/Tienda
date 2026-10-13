import api, { conId } from './api.js'

const RUTA = '/productos'

// El backend autogenera el código PRD-### si no viene en el cuerpo, valida
// precios/stock >= 0 y que la categoría y el proveedor existan.
export const productosService = {
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

    eliminar: async (id) => {
        const respuesta = await api.delete(`${RUTA}/${id}`)
        return respuesta.data.datos
    }
}
