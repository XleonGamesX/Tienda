<!--
  ============================================================================
  StatBarChart.vue
  ============================================================================
  RESPONSABILIDAD:
  - Gráfica estadística de barras CSS (sin librerías externas) con las
    unidades de ENTRADA y las unidades de SALIDA del inventario.
  - Es "presentación pura": recibe los arrays por props y no toca stores.

  La altura de cada barra es proporcional al máximo entre ambos totales,
  de modo que siempre se lee la relación entradas vs salidas.
  ============================================================================
-->
<template>
  <q-card class="stat-bar-chart">
    <q-card-section>
      <div class="section-header">
        <div>
          <h2 class="section-title">
            Entradas vs salidas
          </h2>

          <p class="section-description">
            Unidades que entraron y salieron del inventario
          </p>
        </div>

        <q-badge
          v-if="totalMovimientos"
          :label="`${totalMovimientos} movimientos`"
          color="primary"
          class="chart-badge"
        />
      </div>
    </q-card-section>

    <q-separator />

    <!-- Sin movimientos: se muestra el estado vacío en vez de barras en cero -->
    <q-card-section v-if="totalMovimientos === 0">
      <EmptyState
        title="Sin movimientos"
        description="Registra tu primera entrada o salida para ver la gráfica."
      />
    </q-card-section>

    <q-card-section
      v-else
      class="chart-body"
    >
      <div class="barras-area">

        <div class="barra-columna">
          <span class="barra-valor">{{ unidadesEntradas }}</span>

          <div
            class="barra barra-entrada"
            :style="{ height: alturaEntradas + '%' }"
          ></div>

          <span class="barra-etiqueta">
            <q-icon
              name="arrow_downward"
              size="14px"
            />
            Entradas
          </span>
        </div>

        <div class="barra-columna">
          <span class="barra-valor">{{ unidadesSalidas }}</span>

          <div
            class="barra barra-salida"
            :style="{ height: alturaSalidas + '%' }"
          ></div>

          <span class="barra-etiqueta">
            <q-icon
              name="arrow_upward"
              size="14px"
            />
            Salidas
          </span>
        </div>

      </div>

      <!-- Leyenda con el detalle numérico de cada barra -->
      <div class="chart-leyenda">
        <span class="leyenda-item">
          <span class="leyenda-punto punto-entrada"></span>
          Entradas: {{ unidadesEntradas }} unidades · {{ entradas.length }} registros
        </span>

        <span class="leyenda-item">
          <span class="leyenda-punto punto-salida"></span>
          Salidas: {{ unidadesSalidas }} unidades · {{ salidas.length }} registros
        </span>

        <span
          v-if="ajustes.length"
          class="leyenda-item"
        >
          <span class="leyenda-punto punto-ajuste"></span>
          Ajustes: {{ ajustes.length }} registros
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import EmptyState from '../ui/EmptyState.vue'

const props = defineProps({
  entradas: {
    type: Array,
    default: () => []
  },

  salidas: {
    type: Array,
    default: () => []
  },

  ajustes: {
    type: Array,
    default: () => []
  }
})

// Suma de unidades de cada tipo de movimiento
const unidadesEntradas = computed(() =>
  props.entradas.reduce((total, movimiento) => total + movimiento.cantidad, 0)
)

const unidadesSalidas = computed(() =>
  props.salidas.reduce((total, movimiento) => total + movimiento.cantidad, 0)
)

const totalMovimientos = computed(
  () => props.entradas.length + props.salidas.length + props.ajustes.length
)

// Altura relativa de cada barra (mínimo 6% para que se vea aunque sea 0)
const maximo = computed(() =>
  Math.max(unidadesEntradas.value, unidadesSalidas.value, 1)
)

const alturaEntradas = computed(() =>
  Math.max((unidadesEntradas.value / maximo.value) * 100, 6)
)

const alturaSalidas = computed(() =>
  Math.max((unidadesSalidas.value / maximo.value) * 100, 6)
)
</script>

<style scoped>
.stat-bar-chart {
  width: 100%;
  border-radius: 12px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
}

.section-description {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.4;
  color: #64748b;
}

.chart-badge {
  font-size: 12px;
}

.chart-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Zona de las barras con líneas de referencia horizontales */
.barras-area {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 56px;
  height: 220px;
  padding: 12px 16px 0;
  background-image: repeating-linear-gradient(
    to top,
    transparent 0 52px,
    #eef2f7 52px 53px
  );
  border-bottom: 2px solid #e2e8f0;
}

.barra-columna {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  gap: 8px;
}

.barra-valor {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.barra {
  width: 68px;
  border-radius: 10px 10px 4px 4px;
  transition: height 0.4s ease;
}

.barra-entrada {
  background: linear-gradient(180deg, #2fca5e 0%, #1e9e46 100%);
  box-shadow: 0 6px 14px rgba(33, 186, 69, 0.25);
}

.barra-salida {
  background: linear-gradient(180deg, #d43d52 0%, #c10015 100%);
  box-shadow: 0 6px 14px rgba(193, 0, 21, 0.22);
}

.barra-etiqueta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.chart-leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}

.leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #475569;
}

.leyenda-punto {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
}

.punto-entrada {
  background: #21ba45;
}

.punto-salida {
  background: #c10015;
}

.punto-ajuste {
  background: #31ccec;
}

@media (max-width: 600px) {
  .barras-area {
    gap: 34px;
    height: 200px;
    padding: 12px 8px 0;
  }

  .barra {
    width: 56px;
  }
}
</style>
