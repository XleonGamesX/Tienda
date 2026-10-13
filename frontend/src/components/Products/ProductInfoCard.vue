<template>
  <q-card
    v-if="product"
    class="product-info-card"
  >
    <q-card-section>
      <h2 class="section-title">
        Información del producto
      </h2>
    </q-card-section>

    <q-separator />

    <q-card-section class="info-grid">
      <div class="info-item">
        <span class="info-label">Nombre</span>
        <span class="info-value">{{ product.nombre }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">Código</span>
        <span class="info-value">{{ product.codigo }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">Categoría</span>
        <span class="info-value">
          {{ product.categoriaNombre || 'Sin categoría' }}
        </span>
      </div>

      <div class="info-item">
        <span class="info-label">Proveedor</span>
        <span class="info-value">
          {{ product.proveedorNombre || 'Sin proveedor' }}
        </span>
      </div>

      <div class="info-item">
        <span class="info-label">Precio de compra</span>
        <!-- Formato COP centralizado: $8.000 COP (nunca el número crudo) -->
        <span class="info-value">
          {{ formatearMoneda(product.precioCompra) }}
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
// Formato monetario central (una sola fuente de verdad para precios)
import { formatearMoneda } from '../../utils/moneda.js'

defineProps({
  product: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.product-info-card {
  width: 100%;
  border-radius: 12px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
}

.info-value {
  font-size: 15px;
  line-height: 1.4;
}

@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>