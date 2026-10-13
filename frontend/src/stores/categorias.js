import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoriasService } from '../services/categorias.service.js'

// ---------------------------------------------------------------------------
// CATEGORÍAS
// Los datos viven en el BACKEND (MongoDB Atlas): este store sólo guarda en el
// state lo último que devolvió la API. Sin `persist` (nada de localStorage).
//
// Convención de las actions:
// - devuelven el registro creado/actualizado (o nada al eliminar)
// - si la API responde con error, LANZAN la excepción (error.message ya viene
//   traducido por services/api.js); quien llama (la vista) la captura y la
//   muestra con SweetAlert2. En ningún caso se modifica el state con datos
//   que la API rechazó.
// ---------------------------------------------------------------------------
export const useCategoriasStore = defineStore(
    'categorias',
    () => {

        //estado (empieza vacío: la fuente de verdad es el backend)
        const categorias = ref([])
        const cargando = ref(false)

        //getters
        const totalCategorias = computed(() => {
            return categorias.value.length
        })

        // Solo las categorías activas: son las que ofrece el selector de
        // productos para una nueva elección.
        const categoriasActivas = computed(() => {
            return categorias.value.filter((categoria) => categoria.activo !== false)
        })

        const totalCategoriasActivas = computed(() => {
            return categoriasActivas.value.length
        })

        // Carga la lista completa desde la API (una sola petición)
        async function cargarCategorias() {
            cargando.value = true

            try {
                categorias.value = await categoriasService.listar()
            } finally {
                cargando.value = false
            }
        }

        //buscar id categoria (los ids son strings de Mongo: se comparan como texto)
        function obtenerCategoriaPorId(id) {
            return categorias.value.find(
                categoria => String(categoria.id) === String(id)
            ) || null
        }

        //crear categoria
        // El backend valida (nombre obligatorio y sin duplicados) y responde
        // 400/409; aquí sólo se agrega la categoría devuelta al state.
        async function crearCategoria(nombre) {
            const creada = await categoriasService.crear({ nombre })

            categorias.value.push(creada)

            return creada
        }

        //editar categoria
        async function editarCategoria(id, nombre) {
            const actualizada = await categoriasService.actualizar(id, { nombre })

            const indice = categorias.value.findIndex(
                categoria => String(categoria.id) === String(actualizada.id)
            )

            if (indice !== -1) {
                categorias.value[indice] = actualizada
            }

            return actualizada
        }

        //activar / desactivar categoria
        // Alterna el estado sin eliminar la categoría: se oculta del selector
        // de productos pero se conserva (y sus productos asociados no se tocan).
        async function alternarEstadoCategoria(id) {
            const actualizada = await categoriasService.alternarEstado(id)

            const indice = categorias.value.findIndex(
                categoria => String(categoria.id) === String(actualizada.id)
            )

            if (indice !== -1) {
                categorias.value[indice] = actualizada
            }

            return actualizada
        }

        //eliminar categoria
        // Si tiene productos asociados, el backend responde 409 y la vista
        // muestra ese mensaje: el state no se toca.
        async function eliminarCategoria(id) {
            await categoriasService.eliminar(id)

            categorias.value = categorias.value.filter(
                categoria => String(categoria.id) !== String(id)
            )
        }

        //retornar store
        return {
            categorias,
            cargando,
            totalCategorias,
            categoriasActivas,
            totalCategoriasActivas,
            cargarCategorias,
            obtenerCategoriaPorId,
            crearCategoria,
            editarCategoria,
            alternarEstadoCategoria,
            eliminarCategoria
        }
    }
)
