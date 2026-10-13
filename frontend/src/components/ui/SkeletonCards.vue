<!--
  ============================================================================
  SkeletonCards.vue
  ============================================================================
  RESPONSABILIDAD: dibujar el "previo" de una fila de tarjetas (SummaryCard)
  mientras la vista esperan los datos. Estilo YouTube: bloques grises con
  brillo (shimmer) que ocupan el mismo espacio que el contenido real, para
  que la página no "salte" cuando llegue la información.

  Es presentación pura: no recibe datos, sólo la cantidad y el alto.
  ============================================================================
-->
<template>
  <div class="skeleton-cards" :style="{ gridTemplateColumns: columnas }">
    <q-skeleton
      v-for="n in count"
      :key="n"
      type="rect"
      :height="height"
      class="skeleton-card"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Cantidad de tarjetas a simular
  count: {
    type: Number,
    default: 4
  },

  // Alto de cada tarjeta (se alinea con la tarjeta real para evitar saltos)
  height: {
    type: String,
    default: '140px'
  },

  // Columnas de la grilla. Vacío => se adapta igual que .tarjetas-grid
  columns: {
    type: String,
    default: ''
  }
})

const columnas = computed(() =>
  props.columns || 'repeat(auto-fit, minmax(200px, 1fr))'
)
</script>

<style scoped>
.skeleton-cards {
  display: grid;
  gap: 16px;
  width: 100%;
}

.skeleton-card {
  border-radius: 12px;
}
</style>
