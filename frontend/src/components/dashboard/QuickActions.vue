<template>
  <q-card class="quick-actions">
    <q-card-section>
      <h2 class="section-title">Acciones rápidas</h2>
      <p class="section-description">
        Accede rápidamente a las funciones principales
      </p>
    </q-card-section>

    <q-separator />

    <q-card-section class="actions-grid">
      <!--
        Cada botón lleva un CHIP de icono con fondo de color (según la
        prop "color" de la acción) para distinguir su figura de un vistazo,
        igual que los iconos de las tarjetas del dashboard.
      -->
      <q-btn
        v-for="action in actions"
        :key="action.id"
        :to="action.to"
        :label="action.label"
        outline
        no-caps
        class="action-button"
      >
        <span
          class="action-icon"
          :style="iconStyle(action.color)"
          aria-hidden="true"
        >
          <q-icon :name="action.icon" size="20px" />
        </span>
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup>
    defineProps({
        actions:{type: Array, default: () => []}
    })

    // Tintas suaves por color de Quasar, para el fondo del chip del icono
    const TINTAS = {
        primary:   'rgba(32, 82, 151, 0.12)',
        positive:  'rgba(33, 186, 69, 0.14)',
        warning:   'rgba(242, 192, 55, 0.20)',
        secondary: 'rgba(156, 39, 176, 0.12)',
        negative:  'rgba(193, 0, 21, 0.12)',
        info:      'rgba(49, 204, 236, 0.16)'
    }

    // Fondo suave del chip + color del icono = misma familia de color
    function iconStyle(color) {
        const clave = color || 'primary'

        return {
            background: TINTAS[clave] || TINTAS.primary,
            color: `var(--q-${clave})`
        }
    }
</script>

<style scoped>
.quick-actions {
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
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.action-button {
  min-height: 48px;
  justify-content: flex-start;
  padding-left: 8px;
}

/* Chip circular con el color de cada acción */
.action-icon {
  width: 32px;
  height: 32px;
  margin-right: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
