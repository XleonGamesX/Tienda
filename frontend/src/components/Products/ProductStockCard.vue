<template>
  <q-card
    v-if="product"
    class="product-stock-card"
  >
    <q-card-section>
      <h2 class="section-title">
        Información de inventario
      </h2>
    </q-card-section>

    <q-separator />

    <q-card-section class="stock-content">
      <div class="stock-item">
        <span class="stock-label">Stock actual</span>

        <span class="stock-value">
          {{ product.cantidad }}
        </span>
      </div>

      <div class="stock-item">
        <span class="stock-label">Stock mínimo</span>

        <span class="stock-value">
          {{ product.stockMinimo }}
        </span>
      </div>

      <div class="stock-item">
        <span class="stock-label">Precio de venta</span>

        <!-- Formato COP centralizado: $10.000 COP (nunca el número crudo) -->
        <span class="stock-value">
          {{ formatearMoneda(product.precioVenta) }}
        </span>
      </div>

      <div class="stock-item">
        <span class="stock-label">Estado</span>

        <StatusBadge
          :label="getStatus(product).label"
          :color="getStatus(product).color"
          :text-color="getStatus(product).textColor"
          :hex-color="getStatus(product).hexColor"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import StatusBadge from '../ui/StatusBadge.vue'
// Formato monetario central (una sola fuente de verdad para precios)
import { formatearMoneda } from '../../utils/moneda.js'

// Amarillo de ADVERTENCIA (stock bajo): fuerte y visible, con texto oscuro
// para que la etiqueta se lea con contraste sobre el fondo claro.
const AMARILLO_ADVERTENCIA = '#FFB300'

defineProps({
  product: {
    type: Object,
    default: null
  }
})

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
.product-stock-card {
  width: 100%;
  border-radius: 12px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
}

.stock-content {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.stock-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stock-label {
  font-size: 13px;
  font-weight: 600;
}

.stock-value {
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
}

@media (max-width: 800px) {
  .stock-content {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stock-content {
    grid-template-columns: 1fr;
  }
}
</style>