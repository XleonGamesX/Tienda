<template>
  <q-page class="product-detail-page">
    <PageHeader
      title="Detalle del producto"
      description="Consulta la información y el estado actual del producto"
    >
      <template #actions>
        <q-btn
          flat
          icon="arrow_back"
          label="Volver al inventario"
          no-caps
          to="/inventario"
        />

        <q-btn
          color="primary"
          icon="edit"
          label="Editar producto"
          no-caps
          @click="goToEdit"
        />
      </template>
    </PageHeader>

    <div v-if="mostrarSkeleton" class="product-detail-content">
      <SkeletonPanel height="280px" />

      <SkeletonPanel height="280px" />
    </div>

    <div v-else-if="product" class="product-detail-content">
      <ProductInfoCard :product="product" />
      <ProductStockCard :product="product" />
    </div>

    <div v-else class="product-not-found">
      <q-icon name="inventory_2" size="64px" />
      <h2>Producto no encontrado</h2>
      <p>El producto solicitado no existe o fue eliminado del inventario.</p>
      <q-btn
        color="primary"
        label="Volver al inventario"
        no-caps
        to="/inventario"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/ui/PageHeader.vue'
import ProductInfoCard from '../components/Products/ProductInfoCard.vue'
import ProductStockCard from '../components/Products/ProductStockCard.vue'
// Previo de carga (estilo YouTube): bloques con la forma de las tarjetas
import SkeletonPanel from '../components/ui/SkeletonPanel.vue'
import { useProductosStore } from '../stores/productos'
import { useProveedoresStore } from '../stores/proveedores'
import { useCategoriasStore } from '../stores/categorias'
import { mostrarError } from '../utils/alertas'
import { mensajeDeError } from '../utils/errores'

const route = useRoute()
const router = useRouter()
const productosStore = useProductosStore()
const proveedoresStore = useProveedoresStore()
const categoriasStore = useCategoriasStore()

// ---------------------------------------------------------------------------
// PREVIO DE CARGA (skeleton): encendido mientras el backend responde.
// Mientras no llegue la lista de productos no se puede saber si el id
// existe, así que se muestra el previo en vez de "Producto no encontrado".
// ---------------------------------------------------------------------------
const cargando = ref(true)

const mostrarSkeleton = computed(() => {
  return cargando.value && productosStore.productos.length === 0
})

// Los datos viven en el backend: se cargan al entrar a la vista.
// categoriasStore también, porque "productosConCategoria" resuelve los
// nombres de categoría desde su lista.
onMounted(async () => {
  try {
    await Promise.all([
      productosStore.cargarProductos(),
      proveedoresStore.cargarProveedores(),
      categoriasStore.cargarCategorias()
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

const product = computed(() => {
  const producto = productosStore.obtenerProductos(route.params.id)

  if (!producto) return null

  const proveedor = proveedoresStore.obtenerProveedorPorId(producto.proveedorId)

  const productoConCategoria = productosStore.productosConCategoria.find(
    (item) => String(item.id) === String(producto.id)
  )

  return {
    ...producto,
    categoriaNombre: productoConCategoria?.categoriaNombre || 'Sin categoría',
    proveedorNombre: proveedor?.nombre || 'Sin proveedor'
  }
})

function goToEdit() {
  router.push({
    path: '/inventario',
    query: {
      editar: product.value.id
    }
  })
}
</script>

<style scoped>
.product-detail-page {
  padding: 24px;
}

.product-detail-content {
  display: grid;
  gap: 24px;
}

.product-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.product-not-found h2 {
  margin: 16px 0 8px;
}

.product-not-found p {
  margin: 0 0 20px;
}

@media (max-width: 600px) {
  .product-detail-page {
    padding: 16px;
  }
}
</style>