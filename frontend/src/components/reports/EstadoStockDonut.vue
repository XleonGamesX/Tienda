<!--
  ============================================================================
  EstadoStockDonut.vue
  ============================================================================
  RESPONSABILIDAD:
  - Mostrar con un donut CSS (conic-gradient, sin librerías) la distribución
    del estado del stock: disponibles / stock bajo / agotados.
  - Es "presentación pura": recibe los tres conteos por props.

  El total queda al centro y la leyenda muestra el desglose con porcentajes
  que suman SIEMPRE 100% (reparto por resto mayor), para que el anillo
  cierre completo sin dejar huecos de relleno gris.
  ============================================================================
-->
<template>
  <q-card class="estado-stock-donut">
    <q-card-section>
      <h2 class="section-title">
        Estado del stock
      </h2>

      <p class="section-description">
        Productos según sus existencias
      </p>
    </q-card-section>

    <q-separator />

    <q-card-section class="donut-body">
      <!-- Total al centro del donut -->
      <div
        class="donut"
        :style="{ background: fondoDonut }"
        role="img"
        :aria-label="`Total de productos: ${total}`"
      >
        <div class="donut-centro">
          <span class="donut-total">{{ total }}</span>

          <span class="donut-label">Productos</span>
        </div>
      </div>

      <!-- Leyenda con cantidad y porcentaje de cada estado -->
      <ul class="leyenda">
        <li
          v-for="item in itemsConPorcentaje"
          :key="item.clave"
          class="leyenda-fila"
        >
          <span
            class="leyenda-punto"
            :style="{ background: item.color }"
          ></span>

          <span class="leyenda-nombre">{{ item.nombre }}</span>

          <span class="leyenda-valor">
            {{ item.valor }}
            <span class="leyenda-porcentaje">({{ item.porcentaje }}%)</span>
          </span>
        </li>
      </ul>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

// Reparto de porcentajes que suma SIEMPRE 100 (redondeo por resto mayor)
import { repartirPorcentajes } from '../../utils/porcentajes'

const props = defineProps({
  disponibles: {
    type: Number,
    default: 0
  },

  bajo: {
    type: Number,
    default: 0
  },

  agotados: {
    type: Number,
    default: 0
  }
})

// Colores de la paleta actual de la app (Quasar)
const items = computed(() => [
  {
    clave: 'disponibles',
    nombre: 'Disponibles',
    valor: props.disponibles,
    color: '#21ba45'
  },
  {
    clave: 'bajo',
    nombre: 'Stock bajo',
    valor: props.bajo,
    // Stock bajo es ADVERTENCIA: amarillo fuerte y visible.
    color: '#FFB300'
  },
  {
    clave: 'agotados',
    nombre: 'Agotados',
    valor: props.agotados,
    // Agotado es CRÍTICO: rojo.
    color: '#C10015'
  }
])

const total = computed(() =>
  items.value.reduce((suma, item) => suma + item.valor, 0)
)

// Porcentajes enteros que suman exactamente 100: el reparto por resto mayor
// evita que Math.round por ítem deje 33+33+33 = 99 (hueco) o 102 (el último
// segmento, Agotados, se pasaría del 100% y no se dibujaría completo).
// Con 0 productos el reparto devuelve todo en 0 y el anillo queda gris.
const itemsConPorcentaje = computed(() => {
  const porcentajes = repartirPorcentajes(items.value.map((item) => item.valor))

  return items.value.map((item, indice) => ({
    ...item,
    porcentaje: porcentajes[indice]
  }))
})

const fondoDonut = computed(() => {
  // Sin productos que mostrar: anillo gris (estado vacío)
  if (total.value === 0) {
    return '#e2e8f0'
  }

  let acumulado = 0

  const porciones = itemsConPorcentaje.value.map((item) => {
    const inicio = acumulado
    acumulado += item.porcentaje

    return `${item.color} ${inicio}% ${acumulado}%`
  })

  // No hace falta rellenar nada de gris: los porcentajes suman 100 y el
  // último segmento (Agotados) cierra el círculo contra las 12 en punto.
  return `conic-gradient(${porciones.join(', ')})`
})
</script>

<style scoped>
.estado-stock-donut {
  width: 100%;
  border-radius: 12px;
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

.donut-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding-top: 20px;
}

/* Anillo hecho con conic-gradient + centro blanco superpuesto */
.donut {
  position: relative;
  width: 172px;
  height: 172px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(15, 41, 77, 0.05);
}

.donut-centro {
  position: absolute;
  inset: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 41, 77, 0.08);
}

.donut-total {
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
}

.donut-label {
  font-size: 12px;
  color: #64748b;
}

.leyenda {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.leyenda-fila {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border: 1px solid #eef2f7;
  border-radius: 9px;
  background: #f8fafc;
  font-size: 13px;
}

.leyenda-punto {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
}

.leyenda-nombre {
  flex: 1;
  font-weight: 600;
  color: #334155;
}

.leyenda-valor {
  font-weight: 700;
  color: #1e293b;
}

.leyenda-porcentaje {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
}
</style>
