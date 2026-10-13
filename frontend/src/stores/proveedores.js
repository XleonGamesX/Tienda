import { defineStore } from 'pinia'
import { proveedoresService } from '../services/proveedores.service.js'

// ---------------------------------------------------------------------------
// PROVEEDORES
// Los datos viven en el BACKEND (MongoDB Atlas): el state sólo refleja lo que
// devolvió la API. Sin `persist` (nada de localStorage).
//
// REQUISITO: cada proveedor tiene un IDENTIFICADOR ÚNICO (UUID) generado por
// el backend en su `_id`. Aquí se normaliza a `id` string (lo hace la capa
// de servicios) y todas las comparaciones se hacen con String(), nunca con
// Number(), porque un UUID no es un número.
//
// Si la API responde con error (400 datos inválidos, 409 duplicado o en uso),
// las action LANZAN la excepción y la vista la muestra con SweetAlert2.
// ---------------------------------------------------------------------------
export const useProveedoresStore = defineStore('proveedores', {
    state: () => ({
        proveedores: [],
        cargando: false
    }),
    getters: {
        totalProveedores: (state) => {
            return state.proveedores.length
        },

        // Solo los proveedores activos: son los que ofrece el selector de
        // productos para una nueva elección.
        proveedoresActivos: (state) => {
            return state.proveedores.filter((proveedor) => proveedor.activo !== false)
        },

        totalProveedoresActivos() {
            return this.proveedoresActivos.length
        }
    },
    actions: {
        // Carga la lista completa desde la API
        async cargarProveedores() {
            this.cargando = true

            try {
                this.proveedores = await proveedoresService.listar()
            } finally {
                this.cargando = false
            }
        },

        // El id puede llegar como string o number; siempre se compara como texto
        obtenerProveedorPorId(id) {
            return this.proveedores.find(
                proveedor => String(proveedor.id) === String(id)
            ) || null
        },

        // El backend valida los 4 campos y el nombre duplicado; se devuelve el
        // proveedor creado (con su UUID) y se agrega al final de la lista.
        async crearProveedor(datos) {
            const creado = await proveedoresService.crear(datos)

            this.proveedores.push(creado)

            return creado
        },

        // Se reemplaza el registro actualizado conservando su UUID
        async editarProveedor(id, datos) {
            const actualizado = await proveedoresService.actualizar(id, datos)

            const indice = this.proveedores.findIndex(
                proveedor => String(proveedor.id) === String(actualizado.id)
            )

            if (indice !== -1) {
                this.proveedores[indice] = actualizado
            }

            return actualizado
        },

        // Alterna el estado activo/inactivo sin eliminar el proveedor: se
        // oculta del selector de productos pero se conserva (y sus productos
        // asociados no se tocan).
        async alternarEstadoProveedor(id) {
            const actualizado = await proveedoresService.alternarEstado(id)

            const indice = this.proveedores.findIndex(
                proveedor => String(proveedor.id) === String(actualizado.id)
            )

            if (indice !== -1) {
                this.proveedores[indice] = actualizado
            }

            return actualizado
        },

        // Si el proveedor tiene productos asociados, el backend responde 409
        async eliminarProveedor(id) {
            await proveedoresService.eliminar(id)

            this.proveedores = this.proveedores.filter(
                proveedor => String(proveedor.id) !== String(id)
            )
        }
    }
})
