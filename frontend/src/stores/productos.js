import { defineStore } from 'pinia'
import { useCategoriasStore } from './categorias'
import { useProveedoresStore } from './proveedores'
import { productosService } from '../services/productos.service.js'

// ---------------------------------------------------------------------------
// PRODUCTOS
// Los datos viven en el BACKEND (MongoDB Atlas). El código PRD-###, la
// validación de precios/stock y la existencia de la categoría/proveedor las
// resuelve el servidor; aquí sólo se guarda lo que la API devuelve.
// Sin `persist` (nada de localStorage).
//
// Si la API responde con error, las actions LANZAN la excepción (con el
// mensaje ya traducido) y la vista la muestra con SweetAlert2.
// ---------------------------------------------------------------------------
export const useProductosStore = defineStore('productos', {
    state: () => ({
        productos: [],
        cargando: false
    }),

    getters: {
        totalProductos: (state) => {
            return state.productos.length
        },

        productosStockBajo: (state) => {
            return state.productos.filter(
                (producto) =>
                    producto.cantidad > 0 &&
                    producto.cantidad <= producto.stockMinimo
            )
        },

        productosAgotados: (state) => {
            return state.productos.filter(
                (producto) => producto.cantidad === 0
            )
        },

        unidadesDisponibles: (state) => {
            return state.productos.reduce(
                (total, producto) => total + producto.cantidad,
                0
            )
        },

        productosConCategoria: (state) => {
            const categoriasStore = useCategoriasStore()

            return state.productos.map((producto) => {
                const categoria = categoriasStore.obtenerCategoriaPorId(
                    producto.categoriaId
                )

                return {
                    ...producto,
                    categoriaNombre: categoria
                        ? categoria.nombre
                        : 'Sin categoría'
                }
            })
        },

        productosConProveedor: (state) => {
            const proveedoresStore = useProveedoresStore()

            return state.productos.map((producto) => {
                const proveedor = proveedoresStore.obtenerProveedorPorId(
                    producto.proveedorId
                )

                return {
                    ...producto,
                    proveedorNombre: proveedor
                        ? proveedor.nombre
                        : 'Sin proveedor'
                }
            })
        },

        productosCompletos: (state) => {
            const categoriasStore = useCategoriasStore()
            const proveedoresStore = useProveedoresStore()

            return state.productos.map((producto) => {
                const categoria = categoriasStore.obtenerCategoriaPorId(
                    producto.categoriaId
                )

                const proveedor = proveedoresStore.obtenerProveedorPorId(
                    producto.proveedorId
                )

                return {
                    ...producto,
                    categoriaNombre: categoria
                        ? categoria.nombre
                        : 'Sin categoría',
                    proveedorNombre: proveedor
                        ? proveedor.nombre
                        : 'Sin proveedor'
                }
            })
        }
    },

    actions: {
        // Carga la lista completa desde la API
        async cargarProductos() {
            this.cargando = true

            try {
                this.productos = await productosService.listar()
            } finally {
                this.cargando = false
            }
        },

        // Los ids de Mongo son strings: se compara como texto
        obtenerProductos(id) {
            return this.productos.find(
                (producto) => String(producto.id) === String(id)
            ) || null
        },

        // El backend autogenera el código si no viene y valida todo el resto
        async crearProducto(datos) {
            const creado = await productosService.crear(datos)

            this.productos.push(creado)

            return creado
        },

        // El código nunca cambia en una edición: lo conserva el backend
        async editarProductos(id, datos) {
            const actualizado = await productosService.actualizar(id, datos)

            const indice = this.productos.findIndex(
                (producto) => String(producto.id) === String(actualizado.id)
            )

            if (indice !== -1) {
                this.productos[indice] = actualizado
            }

            return actualizado
        },

        async eliminarProducto(id) {
            await productosService.eliminar(id)

            this.productos = this.productos.filter(
                (producto) => String(producto.id) !== String(id)
            )
        }
    }
})
