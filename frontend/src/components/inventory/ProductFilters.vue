
<template>
  <q-card class="product-filters">
    <q-card-section class="filters-grid">
      <q-input
        :model-value="search"
        outlined
        dense
        clearable
        label="Buscar producto"
        placeholder="Nombre o código"
        @update:model-value="emit('update:search', $event || '')"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        :model-value="category"
        :options="categories"
        option-label="nombre"
        option-value="id"
        emit-value
        map-options
        outlined
        dense
        clearable
        label="Categoría"
        @update:model-value="emit('update:category', $event)"
      />

      <q-select
        :model-value="status"
        :options="statuses"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        outlined
        dense
        label="Estado"
        @update:model-value="emit('update:status', $event)"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  search: { type: [String, null], default: '' },
  category: { type: [String, Number, null], default: '' },
  status: { type: [String, null], default: '' },
  categories: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:search',
  'update:category',
  'update:status'
])

const statuses = [
  {
    label: 'Todos',
    value: ''
  },
  {
    label: 'Disponibles',
    value: 'available'
  },
  {
    label: 'Stock bajo',
    value: 'low'
  },
  {
    label: 'Agotado',
    value: 'out'
  }
]
</script>

<style scoped>
.product-filters {
  width: 100%;
  margin-bottom: 20px;
  border-radius: 12px;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
}

@media (max-width: 800px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}
</style>

