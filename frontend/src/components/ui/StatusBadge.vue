<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'grey'
  },

  // Color del texto del badge. Por defecto Quasar usa blanco; se cambia a
  // 'dark' cuando el fondo es claro (p. ej. el amarillo del stock bajo) para
  // que la etiqueta siga leyéndose con contraste.
  textColor: {
    type: String,
    default: undefined
  },

  // Color en HEXA (#RRGGBB) aplicado con ESTILO INLINE. A diferencia del prop
  // "color" (que Quasar resuelve por nombre), el estilo inline SÍ se pinta
  // siempre, pase lo que pase con la caché o con la paleta. Se usa para el
  // amarillo del "stock bajo".
  hexColor: {
    type: String,
    default: null
  }
})
</script>

<template>
  <q-badge
    :color="color"
    :text-color="textColor"
    :label="label"
    :style="hexColor ? { backgroundColor: hexColor, borderColor: hexColor } : null"
    class="status-badge"
  />
</template>

<style scoped>
.status-badge {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
</style>