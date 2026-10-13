<script setup>
import { ref } from 'vue'
import AppHeader from '../components/layout/AppHeader.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'

const drawerOpen = ref(false)

function toggleDrawer () {
  drawerOpen.value = !drawerOpen.value
}
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <AppHeader @toggle-drawer="toggleDrawer" />

    <AppSidebar v-model:drawer-open="drawerOpen" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>