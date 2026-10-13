<script setup>
defineEmits(['toggle-drawer'])
</script>

<template>
  <q-header>
    <q-toolbar>
      <q-btn flat round dense icon="menu" aria-label="Abrir menú" @click="$emit('toggle-drawer')"/>
      <q-toolbar-title>
        SENA Market
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>