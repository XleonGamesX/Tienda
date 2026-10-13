<!--
  ============================================================================
  CategoriasView.vue
  ============================================================================
  RESPONSABILIDAD: orquestar la sección de Categorías.
  - Mostrar el total, buscar y listar categorías.
  - Crear / editar / eliminar SIEMPRE pasando por el store.
  - Validación: si la categoría tiene productos asociados NO se permite
    eliminarla y se explica el motivo con una alerta; si no tiene productos,
    SweetAlert2 pide confirmación antes de borrar.

  Toda la interfaz se actualiza sola: lee el estado reactivo de Pinia.
  ============================================================================
-->
<template>
  <q-page class="categorias-page">
    <!-- PageHeader con el botón que abre el formulario en modo creación -->
    <PageHeader title="Categorías" description="Gestiona las categorías de los productos">
      <template #actions>
        <q-btn color="primary" icon="add" label="Nueva categoría" no-caps @click="openCreateForm" />
      </template>
    </PageHeader>

    <!--
      TOTAL DE CATEGORÍAS
      Se lee directo del getter del store (totalCategorias).
      Como es reactivo, el número cambia solo al crear o eliminar.
      Lleva color (ámbar) para que el distintivo no sea una tarjeta blanca.
      Mientras carga, el previo ocupa exactamente el mismo espacio.
    -->
    <SkeletonCards v-if="mostrarSkeleton" :count="1" height="150px" class="summary" />

    <SummaryCard v-else class="summary" title="Total de categorías" :value="categoriasStore.totalCategorias"
      icon="category" color="dorado" description="Categorías registradas en el sistema" />

    <!--
      BUSCADOR
      Filtra por nombre (coincidencia parcial, sin distinguir mayúsculas).
      El "clearable" de Quasar emite null al pulsar la X, por eso se
      normaliza con ?? '' antes de usarlo.
    -->
    <q-card class="categorias-filters">
      <q-card-section>
        <q-input v-model="search" outlined dense clearable label="Buscar categoría"
          placeholder="Nombre de la categoría">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!--
      TABLA DE CATEGORÍAS
      :rows lee el resultado filtrado (que sigue conteniendo los objetos
      reactivos del store), por eso crear / editar / eliminar repintan la
      tabla automáticamente y el mismo estado alimenta los selects de
      InventarioView: todos comparten el mismo store de Pinia.
    -->
    <!-- Previo de carga (estilo YouTube): misma silueta que la tabla real -->
    <SkeletonTable v-if="mostrarSkeleton" :rows="6" />

    <q-card v-else class="categorias-table">
      <q-table flat :rows="filteredCategories" row-key="id" :columns="columns" :no-data-label="emptyLabel"
        rows-per-page-label="Registros por página:"
        :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`">
        <!-- Índice de la fila (1, 2, 3...) -->
        <template #body-cell-indice="props">
          <q-td :props="props">
            {{ props.rowIndex + 1 }}
          </q-td>
        </template>

        <!--
          ESTADO (activo / inactivo)
          Permite ocultar la categoría del selector de productos sin
          eliminarla, para no verse obligado a borrar productos asociados.
        -->
        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="props.row.activo !== false ? 'positive' : 'grey-6'"
              :label="props.row.activo !== false ? 'Activo' : 'Inactivo'" />
          </q-td>
        </template>

        <!--
          ACCIONES
          Iconos planos densos, igual que en ProductTable.vue.
          NO se edita ni se borra aquí: solo se prepara el estado local
          y se abren los diálogos correspondientes.
        -->
        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" aria-label="Editar categoría" @click="openEditForm(props.row)" />

            <!-- Activar / desactivar: alterna el estado sin eliminar -->
            <q-btn flat round dense
              :icon="props.row.activo !== false ? 'toggle_on' : 'toggle_off'"
              :color="props.row.activo !== false ? 'positive' : 'grey-6'"
              :aria-label="props.row.activo !== false ? 'Desactivar categoría' : 'Activar categoría'"
              @click="toggleEstado(props.row)" />

            <q-btn flat round dense icon="delete" aria-label="Eliminar categoría" @click="requestDelete(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!--
      FORMULARIO DE CREAR / EDITAR
      - v-model      -> abre y cierra el diálogo
      - :category    -> null al crear, objeto al editar
      - :categories  -> la lista completa, para validar duplicados
      - @save        -> aquí es donde la vista llama al store
    -->
    <CategoriaForm v-model="showForm" :category="selectedCategory" :categories="categoriasStore.categorias"
      @save="saveCategory" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

// Stores: categorías (donde se guarda todo) y productos (para contar uso)
import { useCategoriasStore } from '../stores/categorias'
import { useProductosStore } from '../stores/productos'

// Componentes reutilizados (no se modifican)
import PageHeader from '../components/ui/PageHeader.vue'
import SummaryCard from '../components/ui/SummaryCard.vue'
// Previo de carga (estilo YouTube): bloques con la forma de cada sección
import SkeletonCards from '../components/ui/SkeletonCards.vue'
import SkeletonTable from '../components/ui/SkeletonTable.vue'

// Alertas unificadas del sistema (SweetAlert2)
import { confirmarOperacion, mostrarAdvertencia, mostrarError, mostrarExito } from '../utils/alertas'
// Traduce cualquier error capturado a un mensaje para el usuario
import { mensajeDeError } from '../utils/errores'

// Componente propio de esta sección
import CategoriaForm from '../components/categories/CategoriaForm.vue'

const categoriasStore = useCategoriasStore()
const productosStore = useProductosStore()

// ---------------------------------------------------------------------------
// PREVIO DE CARGA (skeleton): encendido mientras el backend responde y sólo
// se pinta si AÚN no hay categorías (al regresar cacheadas no parpadea)
// ---------------------------------------------------------------------------
const cargando = ref(true)

const mostrarSkeleton = computed(() => {
  return cargando.value && categoriasStore.categorias.length === 0
})

// Los datos viven en el backend: se cargan al entrar a la vista
onMounted(async () => {
  try {
    await Promise.all([
      categoriasStore.cargarCategorias(),
      productosStore.cargarProductos()
    ])
  } catch (error) {
    mostrarError({
      titulo: 'No se pudo cargar la información',
      texto: mensajeDeError(error)
    })
  } finally {
    cargando.value = false
  }
})

// Estado local de la vista
const search = ref('')                   // texto del buscador de categorías
const showForm = ref(false)              // ¿está abierto el formulario?
const selectedCategory = ref(null)       // null = crear · objeto = editar

// ---------------------------------------------------------------------------
// BÚSQUEDA
// Solo existe el campo "nombre", así que se filtra por él: coincidencia
// parcial, ignorando mayúsculas/minúsculas. El clearable de Quasar entrega
// null al limpiar, por eso se convierte a texto antes de usarlo.
// ---------------------------------------------------------------------------
const filteredCategories = computed(() => {
  const valor = String(search.value ?? '').trim().toLowerCase()

  if (!valor) {
    return categoriasStore.categorias
  }

  return categoriasStore.categorias.filter((categoria) =>
    String(categoria.nombre ?? '').toLowerCase().includes(valor)
  )
})

// Estado vacío distinto según el caso: no hay categorías, o no hay
// coincidencias con lo que se está buscando.
const emptyLabel = computed(() => {
  if (String(search.value ?? '').trim()) {
    return 'No se encontraron categorías con ese nombre'
  }

  return 'No hay categorías registradas'
})

// Definición de columnas (mismo formato que ProductTable.vue)
const columns = [
  {
    name: 'indice',
    label: '#',
    field: 'id',
    align: 'center'
  },
  {
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'activo',
    align: 'center'
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'right'
  }
]

// ---------------------------------------------------------------------------
// CREAR Y EDITAR
// ---------------------------------------------------------------------------
function openCreateForm() {
  selectedCategory.value = null
  showForm.value = true
}

function openEditForm(category) {
  selectedCategory.value = category
  showForm.value = true
}

// La vista NO modifica categoria.nombre directamente: siempre pasa por el store
// El backend valida (nombre obligatorio y sin duplicados) y responde con el
// motivo del fallo; si falla, se informa y el diálogo queda abierto.
async function saveCategory(datos) {
  const esEdicion = Boolean(selectedCategory.value)

  try {
    if (esEdicion) {
      await categoriasStore.editarCategoria(selectedCategory.value.id, datos.nombre)
    } else {
      await categoriasStore.crearCategoria(datos.nombre)
    }
  } catch (error) {
    mostrarError({
      titulo: 'No se pudo guardar la categoría',
      texto: mensajeDeError(error)
    })
    return
  }

  // ÉXITO: se cierra el diálogo y SweetAlert2 informa con un toast si fue
  // alta o modificación (la tabla se actualiza por la reactividad).
  showForm.value = false
  selectedCategory.value = null

  mostrarExito(
    esEdicion
      ? 'Categoría actualizada correctamente.'
      : 'Categoría creada correctamente.'
  )
}

// Si el formulario se cierra cancelando, también se limpia la selección
watch(showForm, (abierto) => {
  if (!abierto) {
    selectedCategory.value = null
  }
})

// ---------------------------------------------------------------------------
// ACTIVAR / DESACTIVAR
// Alterna el estado sin eliminar la categoría: se oculta del selector de
// productos pero se conserva (y sus productos asociados no se tocan).
// ---------------------------------------------------------------------------
async function toggleEstado(category) {
  const activar = category.activo === false

  try {
    await categoriasStore.alternarEstadoCategoria(category.id)
  } catch (error) {
    mostrarError({
      titulo: 'No se pudo cambiar el estado',
      texto: mensajeDeError(error)
    })
    return
  }

  mostrarExito(
    activar
      ? `La categoría "${category.nombre}" se activó correctamente.`
      : `La categoría "${category.nombre}" se desactivó correctamente.`
  )
}

// ---------------------------------------------------------------------------
// ELIMINACIÓN
// ---------------------------------------------------------------------------
// Cuenta cuántos productos usan esta categoría (comparando categoriaId)
function contarProductosAsociados(category) {
  return productosStore.productos.filter(
    (producto) => String(producto.categoriaId) === String(category.id)
  ).length
}

// Flujo completo: confirmar -> eliminar -> informar el resultado.
// El backend se encarga de no borrar una categoría en uso (responde 409 con
// el motivo); esa respuesta se muestra aquí tal cual, con SweetAlert2.
async function requestDelete(category) {
  const total = contarProductosAsociados(category)

  if (total > 0) {
    await mostrarAdvertencia({
      titulo: 'No se puede eliminar la categoría',
      texto:
        total === 1
          ? 'No se puede eliminar esta categoría porque existe 1 producto asociado.'
          : `No se puede eliminar esta categoría porque existen ${total} productos asociados.`
    })

    return
  }

  const confirmado = await confirmarOperacion({
    titulo: '¿Eliminar categoría?',
    texto: `Se eliminará "${category.nombre}". Esta acción no se puede deshacer.`,
    confirmar: 'Eliminar'
  })

  if (!confirmado) {
    // Canceló: no se modifica nada
    return
  }

  try {
    await categoriasStore.eliminarCategoria(category.id)
  } catch (error) {
    mostrarError({
      titulo: 'No se pudo eliminar la categoría',
      texto: mensajeDeError(error)
    })
    return
  }

  mostrarExito('Categoría eliminada correctamente.')
}
</script>

<style scoped>
.categorias-page {
  padding: 24px;
}

.summary {
  margin-bottom: 24px;
}

.categorias-filters {
  width: 100%;
  margin-bottom: 24px;
  border-radius: 12px;
}

.categorias-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  /* Contorno AZUL NEÓN para diferenciar la tabla del fondo */
  border: 1.5px solid #1E9EFF;
  box-shadow:
    0 0 10px rgba(30, 158, 255, 0.45),
    0 4px 16px rgba(15, 41, 77, 0.08);
}

@media (max-width: 600px) {
  .categorias-page {
    padding: 16px;
  }

  .categorias-table {
    border-radius: 8px;
  }
}
</style>
