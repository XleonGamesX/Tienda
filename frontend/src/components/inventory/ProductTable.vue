<template>
  <q-card class="product-table">
    <q-table flat :rows="products" row-key="id" :columns="columns" no-data-label="No hay productos para mostrar"
      rows-per-page-label="Registros por página:"
      :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`">
      <template #body-cell-status="props">
        <q-td :props="props">
          <StatusBadge :label="getStatus(props.row).label" :color="getStatus(props.row).color"
            :text-color="getStatus(props.row).textColor" :hex-color="getStatus(props.row).hexColor" />
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="visibility" aria-label="Ver producto" @click="emit('view', props.row)" />

          <q-btn flat round dense icon="edit" aria-label="Editar producto" @click="emit('edit', props.row)" />

          <q-btn flat round dense icon="delete" aria-label="Eliminar producto" @click="emit('delete', props.row)" />
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
import StatusBadge from '../ui/StatusBadge.vue'

// Amarillo de ADVERTENCIA (stock bajo): fuerte y visible, con texto oscuro
// para que la etiqueta se lea con contraste sobre el fondo claro.
const AMARILLO_ADVERTENCIA = '#FFB300'

defineProps({
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['view', 'edit', 'delete'])

const columns = [
  {
    name: 'codigo',
    label: 'Código',
    field: 'codigo',
    align: 'left'
  },
  {
    name: 'nombre',
    label: 'Producto',
    field: 'nombre',
    align: 'left'
  },
  {
    name: 'categoria',
    label: 'Categoría',
    field: 'categoriaNombre',
    align: 'left'
  },
  {
    name: 'cantidad',
    label: 'Stock',
    field: 'cantidad',
    align: 'center'
  },
  {
    name: 'status',
    label: 'Estado',
    field: 'cantidad',
    align: 'center'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'right'
  }
]

function getStatus(product) {
  if (product.cantidad === 0) {
    // Agotado es CRÍTICO: se muestra en ROJO.
    return {
      label: 'Agotado',
      color: 'negative',
      textColor: 'white'
    }
  }

  if (product.cantidad <= product.stockMinimo) {
    // Stock bajo es ADVERTENCIA: se muestra en AMARILLO fuerte y visible.
    // El amarillo va por "hexColor" (estilo inline) para garantizar que se pinte.
    return {
      label: 'Stock bajo',
      color: 'warning',
      textColor: 'dark',
      hexColor: AMARILLO_ADVERTENCIA
    }
  }

  return {
    label: 'Disponible',
    color: 'positive',
    textColor: 'white'
  }
}
</script>

<style scoped>
.product-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  /* Contorno AZUL NEÓN para diferenciar la tabla del fondo */
  border: 1.5px solid #1E9EFF;
  box-shadow:
    0 0 10px rgba(30, 158, 255, 0.45),
    0 4px 16px rgba(15, 41, 77, 0.08);
}

@media (max-width: 700px) {
  .product-table {
    border-radius: 8px;
  }
}
</style>