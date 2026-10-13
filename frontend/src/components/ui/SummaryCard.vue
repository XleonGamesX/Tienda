<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'info'
  },

  // Tono suave de la tarjeta (opcional): 'azul' | 'verde' | 'ambar' |
  // 'rojo' | 'gris'. Sin color conserva la tarjeta blanca original.
  color: {
    type: String,
    default: ''
  }
})

// Paleta actual de la app: base = color legible, suave = fondo al ~10%
const TONOS = {
  azul: {
    base: '#205297',
    suave: 'rgba(32, 82, 151, 0.09)',
    borde: 'rgba(32, 82, 151, 0.18)'
  },
  verde: {
    base: '#1E9E46',
    suave: 'rgba(33, 186, 69, 0.10)',
    borde: 'rgba(33, 186, 69, 0.22)'
  },
  // Dorado más pronunciado ( Movimientos del dashboard): base más saturada y
  // fondo/borde con más presencia para que la tarjeta se distinga de un vistazo.
  ambar: {
    base: '#E39200',
    suave: 'rgba(232, 160, 0, 0.24)',
    borde: 'rgba(232, 160, 0, 0.52)'
  },
  // Rojo más pronunciado ( agotado / crítico ): alerta máxima.
  rojo: {
    base: '#E30016',
    suave: 'rgba(227, 0, 22, 0.16)',
    borde: 'rgba(227, 0, 22, 0.42)'
  },
  // Amarillo de ADVERTENCIA ( tarjeta "Stock bajo" del Dashboard ): fondo
  // amarillo SÓLIDO y borde ámbar para que la alerta se distinga de un
  // vistazo (con un fondo translúcido la tarjeta parecía blanca).
  // base va en ámbar OSCURO para que el icono conserve contraste legible.
  // Es el único tono con fondo sólido, por eso resalta sobre las demás.
  amarillo: {
    base: '#8A5A00',
    suave: '#FFF0BF',
    borde: '#FFC107'
  },
  gris: {
    base: '#64748B',
    suave: 'rgba(100, 116, 139, 0.10)',
    borde: 'rgba(100, 116, 139, 0.20)'
  },
  // Dorado para totales que NO son alertas (el rojo se reserva para alertas
  // críticas: stock bajo y agotado). Mismo dorado que la tarjeta "Movimientos"
  // del dashboard, para unificar el color de los totales.
  dorado: {
    base: '#E39200',
    suave: 'rgba(232, 160, 0, 0.24)',
    borde: 'rgba(232, 160, 0, 0.52)'
  }
}

const tono = computed(() => TONOS[props.color] || null)

// Fondo y borde suaves de la tarjeta (null = tarjeta blanca normal)
const estiloTarjeta = computed(() => {
  if (!tono.value) {
    return null
  }

  return {
    background: tono.value.suave,
    borderColor: tono.value.borde
  }
})

// Chip del icono: círculo blanco con el icono teñido con el color base
const estiloIcono = computed(() => {
  if (!tono.value) {
    return null
  }

  return {
    background: '#FFFFFF',
    color: tono.value.base,
    boxShadow: `0 3px 9px ${tono.value.suave}`
  }
})
</script>

<template>
  <q-card
    class="summary-card"
    :class="{ 'summary-card--tono': tono }"
    :style="estiloTarjeta"
  >
    <q-card-section>
      <div class="summary-top">
        <div class="summary-title">
          {{ title }}
        </div>

        <div
          class="summary-icon"
          :style="estiloIcono"
        >
          <q-icon
            :name="icon"
            size="26px"
          />
        </div>
      </div>

      <div class="summary-value">
        {{ value }}
      </div>

      <div
        v-if="description"
        class="summary-description"
      >
        {{ description }}
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.summary-card {
  width: 100%;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card--tono:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 41, 77, 0.10);
}

.summary-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.summary-title {
  font-size: 14px;
  font-weight: 600;
}

.summary-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.summary-value {
  margin-top: 12px;
  font-size: 32px;
  line-height: 1.1;
  font-weight: 700;
}

.summary-description {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.4;
}
</style>
