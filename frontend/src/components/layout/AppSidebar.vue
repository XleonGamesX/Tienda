<script setup>
defineProps({
  drawerOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:drawerOpen'])
</script>

<template>
  <q-drawer
    :model-value="drawerOpen"
    @update:model-value="emit('update:drawerOpen', $event)"
    bordered
    :width="260"
  >
    <div class="sidebar-content">
      <div class="sidebar-brand">
        <div class="brand-title">SENA Market</div>
        <div class="brand-subtitle">Control de inventario</div>
      </div>

      <div class="sidebar-title">MENÚ</div>

      <q-list class="menu-list">

        <q-item clickable to="/" class="menu-item">
            <q-item-section avatar>
            <q-icon name="home" />
            </q-item-section>

            <q-item-section>
            Inicio
            </q-item-section>
        </q-item>

        <q-item clickable to="/dashboard" class="menu-item">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable to="/inventario" class="menu-item">
          <q-item-section avatar>
            <q-icon name="inventory_2" />
          </q-item-section>
          <q-item-section>Inventario</q-item-section>
        </q-item>

        <q-item clickable to="/movimientos" class="menu-item">
          <q-item-section avatar>
            <q-icon name="swap_horiz" />
          </q-item-section>
          <q-item-section>Movimientos</q-item-section>
        </q-item>

        <q-item clickable to="/categorias" class="menu-item">
          <q-item-section avatar>
            <q-icon name="category" />
          </q-item-section>
          <q-item-section>Categorías</q-item-section>
        </q-item>

        <q-item clickable to="/proveedores" class="menu-item">
          <q-item-section avatar>
            <q-icon name="local_shipping" />
          </q-item-section>
          <q-item-section>Proveedores</q-item-section>
        </q-item>

        <q-item clickable to="/reportes" class="menu-item">
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>Reportes</q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-drawer>
</template>

<style scoped>
.sidebar-content {
  width: 100%;
  padding: 24px 16px;
  box-sizing: border-box;
}

.sidebar-brand {
  margin-bottom: 28px;
}

.brand-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 700;
}

.brand-subtitle {
  margin-top: 6px;
  font-size: 14px;
  line-height: 1.4;
}

.sidebar-title {
  margin-bottom: 10px;
  font-size: 12px;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 1px;
}

.menu-list {
  width: 100%;
}

.menu-item {
  min-height: 48px;
  margin-bottom: 4px;
  border-radius: 8px;
}

.menu-item :deep(.q-item__section--main) {
  font-size: 15px;
  line-height: 1.2;
  white-space: nowrap;
}

.menu-item :deep(.q-item__section--avatar) {
  min-width: 40px;
}
</style>