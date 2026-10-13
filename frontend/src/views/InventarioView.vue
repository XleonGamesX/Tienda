<template>
  <q-page class="inventory-page">
    <PageHeader title="Inventario" description="Gestiona los productos registrados en el inventario">
      <template #actions>
        <q-btn color="primary" icon="add" label="Agregar producto" no-caps @click="openCreateForm" />
      </template>
    </PageHeader>

    <ProductFilters v-model:search="search" v-model:category="category" v-model:status="status"
      :categories="categoriasParaFiltro" />

    <!-- Previo de carga: misma silueta y alto aproximado que la tabla real -->
    <SkeletonTable v-if="mostrarSkeleton" :rows="8" />

    <ProductTable v-else :products="filteredProducts" @view="viewProduct" @edit="openEditForm"
      @delete="deleteProduct" />

    <ProductForm v-model="showForm" :product="selectedProduct" :categories="categoriasParaSelector"
      :suppliers="proveedoresParaSelector" @save="saveProduct" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '../components/ui/PageHeader.vue'
import ProductFilters from '../components/inventory/ProductFilters.vue'
import ProductTable from '../components/inventory/ProductTable.vue'
import ProductForm from '../components/inventory/ProductForm.vue'
// Previo de carga (estilo YouTube): bloque con la forma de la tabla
import SkeletonTable from '../components/ui/SkeletonTable.vue'

// Alertas unificadas del sistema (SweetAlert2)
import { confirmarOperacion, mostrarError, mostrarExito } from '../utils/alertas'
// Traduce cualquier error capturado a un mensaje para el usuario
import { mensajeDeError } from '../utils/errores'
// Selectores con sólo las categorías/proveedores activos
import { opcionesActivas } from '../utils/opciones'

import { useProductosStore } from '../stores/productos'
import { useCategoriasStore } from '../stores/categorias'
import { useProveedoresStore } from '../stores/proveedores'

const route = useRoute()
const router = useRouter()

const productosStore = useProductosStore()
const categoriasStore = useCategoriasStore()
const proveedoresStore = useProveedoresStore()

// ---------------------------------------------------------------------------
// PREVIO DE CARGA (skeleton): encendido mientras el backend responde y sólo
// se pinta si AÚN no hay productos (al regresar ya cacheados no parpadea)
// ---------------------------------------------------------------------------
const cargando = ref(true)

const mostrarSkeleton = computed(() => {
  return cargando.value && productosStore.productos.length === 0
})

// Los datos viven en el backend: se cargan al entrar a la vista
onMounted(async () => {
  try {
    await Promise.all([
      productosStore.cargarProductos(),
      categoriasStore.cargarCategorias(),
      proveedoresStore.cargarProveedores()
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

const search = ref('')
const category = ref('')
const status = ref('')

const showForm = ref(false)
const selectedProduct = ref(null)

// ---------------------------------------------------------------------------
// SELECTORES DE CATEGORÍA Y PROVEEDOR (solo ACTIVOS)
// Al crear o editar un producto solo se ofrecen categorías/proveedores
// activos. Si el producto que se edita usa uno inactivo, ese se agrega al
// final para no perder la referencia ni romper la edición. La misma regla
// alimenta el filtro de categorías de arriba: una categoría desactivada deja
// de ofrecerse, salvo que ya sea el filtro elegido.
// ---------------------------------------------------------------------------
const categoriasParaFiltro = computed(() => {
  return opcionesActivas(categoriasStore.categorias, category.value)
})

const categoriasParaSelector = computed(() => {
  return opcionesActivas(
    categoriasStore.categorias,
    selectedProduct.value?.categoriaId
  )
})

const proveedoresParaSelector = computed(() => {
  return opcionesActivas(
    proveedoresStore.proveedores,
    selectedProduct.value?.proveedorId
  )
})

const filteredProducts = computed(() => {
  return productosStore.productosConCategoria.filter((product) => {
    const searchValue = search.value.trim().toLowerCase()

    const nombre = String(product.nombre || '').toLowerCase()
    const codigo = String(product.codigo || '').toLowerCase()

    const matchesSearch =
      !searchValue ||
      nombre.includes(searchValue) ||
      codigo.includes(searchValue)

    const matchesCategory =
      !category.value ||
      (product.categoriaId !== null &&
        product.categoriaId !== undefined &&
        String(product.categoriaId) === String(category.value))

    const matchesStatus =
      !status.value ||
      getProductStatus(product) === status.value

    return matchesSearch && matchesCategory && matchesStatus
  })
})

function getProductStatus(product) {
  if (product.cantidad === 0) {
    return 'out'
  }

  if (product.cantidad <= product.stockMinimo) {
    return 'low'
  }

  return 'available'
}

function openCreateForm() {
  selectedProduct.value = null
  showForm.value = true
}

function openEditForm(product) {
  selectedProduct.value = product
  showForm.value = true
}

function viewProduct(product) {
  router.push(`/producto-detalles/${product.id}`)
}

// ---------------------------------------------------------------------------
// ELIMINAR PRODUCTO
// 1. SweetAlert2 pregunta antes (nunca se borra directo desde la tabla).
// 2. Si el usuario cancela, no se modifica nada.
// 3. Si confirma, el store elimina y se informa el resultado.
// ---------------------------------------------------------------------------
async function deleteProduct(product) {
  const confirmado = await confirmarOperacion({
    titulo: '¿Eliminar producto?',
    texto: `Se eliminará "${product.nombre}". Esta acción no se puede deshacer.`,
    confirmar: 'Eliminar'
  })

  if (!confirmado) {
    return
  }

  try {
    await productosStore.eliminarProducto(product.id)
  } catch (error) {
    mostrarError({
      titulo: 'No se pudo eliminar el producto',
      texto: mensajeDeError(error)
    })
    return
  }

  mostrarExito('Producto eliminado correctamente.')
}

// Guarda el producto: si hay uno seleccionado lo edita, si no lo crea.
// El backend valida todo (nombre, precios/stock >= 0, categoría y proveedor
// existentes, código no duplicado) y responde con el motivo del fallo.
async function saveProduct(productData) {
  const esEdicion = Boolean(selectedProduct.value)

  try {
    if (esEdicion) {
      await productosStore.editarProductos(selectedProduct.value.id, productData)
    } else {
      await productosStore.crearProducto(productData)
    }
  } catch (error) {
    // NO se guarda nada y el diálogo queda abierto para corregir.
    // (Los errores de campo del formulario siguen mostrando su propio banner.)
    mostrarError({
      titulo: 'No se pudo guardar el producto',
      texto: mensajeDeError(error)
    })
    return
  }

  // ÉXITO: se cierra el diálogo y SweetAlert2 informa con un toast si fue
  // alta o modificación (la tabla se actualiza por la reactividad).
  showForm.value = false
  selectedProduct.value = null

  mostrarExito(
    esEdicion
      ? 'Producto actualizado correctamente.'
      : 'Producto creado correctamente.'
  )
}

// Al cerrar el diálogo (por guardado, cancelación o X) se limpia la selección
watch(showForm, (abierto) => {
  if (!abierto) {
    selectedProduct.value = null
  }
})

watch(
  () => route.query.editar,
  (productId) => {
    if (!productId) {
      return
    }

    const product = productosStore.obtenerProductos(productId)

    if (!product) {
      router.replace('/inventario')
      return
    }

    selectedProduct.value = product
    showForm.value = true

    router.replace('/inventario')
  },
  { immediate: true }
)
</script>

<style scoped>
.inventory-page {
  padding: 24px;
}

@media (max-width: 600px) {
  .inventory-page {
    padding: 16px;
  }
}
</style>