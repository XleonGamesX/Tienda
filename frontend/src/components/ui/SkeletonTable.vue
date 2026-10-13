<!--
  ============================================================================
  SkeletonTable.vue
  ============================================================================
  RESPONSABILIDAD: dibujar el "previo" de una tabla (q-table) mientras la
  vista espera los datos: una fila de encabezado y N filas de líneas grises
  con anchos variados, dentro de una tarjeta con la misma silueta.

  Estilo YouTube (bloques con brillo); no muestra texto real para no
  sugerir datos que todavía no existen.
  ============================================================================
-->
<template>
  <q-card class="skeleton-table">
    <!-- Encabezado de columnas -->
    <div class="skeleton-row skeleton-row--head">
      <q-skeleton v-for="i in columnas" :key="`h-${i}`" type="text" :width="anchos[i - 1]" />
    </div>

    <q-separator />

    <!-- Filas de datos -->
    <div v-for="fila in rows" :key="fila" class="skeleton-row">
      <q-skeleton
        v-for="col in columnas"
        :key="`${fila}-${col}`"
        type="text"
        :width="anchos[(fila + col) % anchos.length]"
      />
    </div>
  </q-card>
</template>

<script setup>
defineProps({
  // Filas de datos a simular
  rows: {
    type: Number,
    default: 6
  },

  // Columnas simuladas (5 = código, producto, categoría, stock, estado)
  columnas: {
    type: Number,
    default: 5
  }
})

// Anchos distintos por columna para que las líneas no queden todas iguales
const anchos = ['78%', '92%', '70%', '55%', '84%']
</script>

<style scoped>
.skeleton-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  gap: 16px;
  padding: 15px 16px;
}

/* La fila de encabezado va apenas más marcada, como en una q-table real */
.skeleton-row--head {
  padding-top: 17px;
  padding-bottom: 17px;
}

@media (max-width: 700px) {
  .skeleton-table {
    border-radius: 8px;
  }

  .skeleton-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
</style>
