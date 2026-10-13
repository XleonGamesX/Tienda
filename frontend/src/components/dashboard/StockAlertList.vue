<template>
  <q-card class="stock-alert-list">
    <q-card-section>
      <div class="section-header">
        <div>
          <h2 class="section-title">
            Alertas de stock
            <q-badge
              v-if="totalAlertas"
              :label="totalAlertas"
              color="negative"
              class="alertas-badge"
            />
          </h2>

          <p class="section-description">
            Productos que requieren atención
          </p>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!--
      Prioridad: primero los AGOTADOS (rojo), luego los de stock bajo.
      La lista se pinta sola cuando cambian los datos del store.
    -->
    <q-list v-if="totalAlertas">
      <q-item
        v-for="producto in agotados"
        :key="'agotado-' + producto.id"
        class="stock-alert-item"
      >
        <q-item-section avatar>
          <q-icon
            name="remove_shopping_cart"
            color="negative"
            size="22px"
          />
        </q-item-section>

        <q-item-section>
          <q-item-label class="product-name">
            {{ producto.nombre }}
          </q-item-label>

          <q-item-label caption>
            Stock actual: 0
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-badge
            color="negative"
            label="Agotado"
          />
        </q-item-section>
      </q-item>

      <q-item
        v-for="producto in products"
        :key="'bajo-' + producto.id"
        class="stock-alert-item"
      >
        <q-item-section avatar>
          <q-icon
            name="warning"
            size="22px"
            :style="{ color: '#FFB300' }"
          />
        </q-item-section>

        <q-item-section>
          <q-item-label class="product-name">
            {{ producto.nombre }}
          </q-item-label>

          <q-item-label caption>
            Stock actual: {{ producto.cantidad }} · mínimo: {{ producto.stockMinimo }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-badge
            label="Stock bajo"
            text-color="dark"
            :style="{ backgroundColor: '#FFB300', borderColor: '#FFB300' }"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <EmptyState
      v-else
      title="Sin alertas"
      description="No hay productos con stock bajo ni agotados."
    />
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import EmptyState from '../ui/EmptyState.vue'

const props = defineProps({
  // Productos con stock bajo (cantidad > 0 y <= stockMinimo)
  products: {
    type: Array,
    default: () => []
  },

  // Productos agotados (cantidad === 0)
  agotados: {
    type: Array,
    default: () => []
  }
})

const totalAlertas = computed(
  () => props.agotados.length + props.products.length
)
</script>

<style scoped>
.stock-alert-list {
  width: 100%;
  border-radius: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
}

.alertas-badge {
  margin-left: 8px;
  vertical-align: middle;
}

.section-description {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.4;
}

.stock-alert-item {
  min-height: 64px;
  border-bottom: 1px solid #F1F5F9;
}

.stock-alert-item:last-child {
  border-bottom: none;
}

.product-name {
  font-weight: 600;
}
</style>
