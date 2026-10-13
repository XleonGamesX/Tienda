import { defineStore } from 'pinia'
import { useProductosStore } from './productos'
import { movimientosService } from '../services/movimientos.service.js'

// ---------------------------------------------------------------------------
// MOVIMIENTOS DE INVENTARIO
// Los datos viven en el BACKEND (MongoDB Atlas). Sin `persist`.
//
// registrarMovimiento() es el ÚNICO camino para cambiar el stock: el backend
// valida (cantidad según el tipo, stock suficiente en salidas), actualiza el
// producto de forma ATÓMICA y devuelve el movimiento creado junto con el
// producto ya actualizado. Aquí se refleja ese stock nuevo en el store de
// productos, así que la tabla, el dashboard y los reportes se repintan solos.
//
// Si la API responde con error (p. ej. 400 por stock insuficiente), la action
// LANZA la excepción y la vista la muestra con SweetAlert2.
// ---------------------------------------------------------------------------
export const useMovimientosStore = defineStore('movimientos', {

    state: () => ({
        movimientos: [],
        cargando: false
    }),

    getters: {

        totalMovimientos: (state) => {
            return state.movimientos.length
        },

        entradas: (state) => {
            return state.movimientos.filter(
                movimiento => movimiento.tipo === 'entrada'
            )
        },

        salidas: (state) => {
            return state.movimientos.filter(
                movimiento => movimiento.tipo === 'salida'
            )
        },

        ajustes: (state) => {
            return state.movimientos.filter(
                movimiento => movimiento.tipo === 'ajuste'
            )
        }

    },

    actions: {

        // Carga la lista completa (el backend los ordena del más nuevo al más viejo)
        async cargarMovimientos() {
            this.cargando = true

            try {
                this.movimientos = await movimientosService.listar()
            } finally {
                this.cargando = false
            }
        },

        obtenerMovimientoPorId(id) {
            return this.movimientos.find(
                movimiento => String(movimiento.id) === String(id)
            ) || null
        },

        // Registra el movimiento en el backend y refleja el stock nuevo aquí
        async registrarMovimiento(datos) {
            const { movimiento, producto } = await movimientosService.registrar(datos)

            this.movimientos.push(movimiento)

            // El backend devuelve el producto con su stock ya actualizado:
            // se copia al store de productos para que toda la app lo vea.
            if (producto) {
                const productosStore = useProductosStore()

                const indice = productosStore.productos.findIndex(
                    actual => String(actual.id) === String(producto.id)
                )

                if (indice !== -1) {
                    productosStore.productos[indice] = producto
                }
            }

            return movimiento
        }

    }
})
