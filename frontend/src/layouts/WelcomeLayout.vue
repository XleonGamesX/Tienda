<!--
  ============================================================================
  WelcomeLayout.vue
  ============================================================================
  RESPONSABILIDAD: envolver SOLO la pantalla de bienvenida (portada).

  La app tiene dos experiencias:
  - Bienvenida  -> este layout (sin AppHeader ni AppSidebar, por lo tanto
                   SIN menú hamburguesa y SIN drawer).
  - Sistema     -> MainLayout (con header, menú y sidebar).

  Es la causa real de que antes apareciera el menú en la portada: la ruta "/"
  estaba anidada dentro de MainLayout. La solución es estructural (ruta ->
  layout propio), no un ocultamiento con CSS.

  Se conserva <q-layout>/<q-page-container> porque QPage exige ser hijo
  profundo de QLayout + QPageContainer (si no, Quasar no renderiza nada).
  ============================================================================
-->
<template>
  <q-layout>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
