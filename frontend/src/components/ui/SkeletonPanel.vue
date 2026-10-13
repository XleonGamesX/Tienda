<!--
  ============================================================================
  SkeletonPanel.vue
  ============================================================================
  RESPONSABILIDAD: dibujar el "previo" de un panel (q-card con título y
  cuerpo) mientras la vista espera los datos.

  Dos variantes:
  - 'panel'  -> título + bloque rectangular (gráficas, listas, resúmenes)
  - 'donut'  -> título + círculo + 3 líneas de leyenda (EstadoStockDonut)

  Estilo YouTube: bloques grises con brillo (shimmer), sin texto real.
  ============================================================================
-->
<template>
  <q-card class="skeleton-panel">
    <q-card-section>
      <!-- Título de la sección -->
      <q-skeleton type="text" width="45%" height="18px" />

      <!-- Bajada del título (como las descripciones de los paneles) -->
      <q-skeleton type="text" width="62%" height="12px" class="skeleton-bajada" />
    </q-card-section>

    <q-separator />

    <q-card-section class="skeleton-panel-body">
      <template v-if="variant === 'donut'">
        <q-skeleton type="circle" :size="donutSize" />

        <div class="skeleton-leyenda">
          <q-skeleton v-for="n in 3" :key="n" type="rect" height="30px" class="skeleton-leyenda-fila" />
        </div>
      </template>

      <q-skeleton v-else type="rect" :height="height" class="skeleton-bloque" />
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  // 'panel' = bloque rectangular · 'donut' = círculo + leyenda
  variant: {
    type: String,
    default: 'panel'
  },

  // Alto del bloque rectangular (sólo variante 'panel')
  height: {
    type: String,
    default: '240px'
  },

  // Diámetro del donut simulado (sólo variante 'donut')
  donutSize: {
    type: String,
    default: '172px'
  }
})
</script>

<style scoped>
.skeleton-panel {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-bajada {
  margin-top: 8px;
}

.skeleton-panel-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.skeleton-bloque {
  width: 100%;
  border-radius: 10px;
}

.skeleton-leyenda {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-leyenda-fila {
  border-radius: 9px;
}

@media (max-width: 700px) {
  .skeleton-panel {
    border-radius: 8px;
  }
}
</style>
