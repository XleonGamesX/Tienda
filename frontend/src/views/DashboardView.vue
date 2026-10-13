<template>
    <q-page class="dashboard-page">
        <PageHeader
        title="Dashboard"
        description="Resumen general del inventario"
        />

        <!--
          PREVIO DE CARGA (estilo YouTube): mientras el backend responde se
          muestran bloques con la forma de las KPIs, los paneles y la tabla,
          para que el dashboard no aparezca vacío.
        -->
        <template v-if="mostrarSkeleton">
            <SkeletonCards :count="4" class="skeleton-bloque" />

            <section class="dashboard-grid">
                <SkeletonPanel height="320px" />

                <SkeletonPanel height="320px" />
            </section>

            <section class="dashboard-grid">
                <SkeletonTable :rows="6" />

                <SkeletonPanel height="320px" />
            </section>
        </template>

        <template v-else>
        <!-- FILA DE KPIs: datos clave, con el stock bajo destacado -->
        <section class="summary-grid">
        <SummaryCard
            v-for="card in summaryCards"
            :key="card.id"
            :title="card.title"
            :value="card.value"
            :description="card.description"
            :icon="card.icon"
            :color="card.color"
        />
        </section>

        <!-- GRÁFICA + ALERTAS: las alertas tienen prioridad visual -->
        <section class="dashboard-grid">
        <StatBarChart
            :entradas="movimientosStore.entradas"
            :salidas="movimientosStore.salidas"
            :ajustes="movimientosStore.ajustes"
        />

        <StockAlertList
            class="panel-alertas"
            :products="stockAlerts"
            :agotados="agotados"
        />
        </section>

        <!-- TODOS LOS MOVIMIENTOS + ACCIONES RÁPIDAS -->
        <section class="dashboard-grid">
        <MovimientoTable :movements="movimientosStore.movimientos" />

        <QuickActions :actions="quickActions" />
        </section>
        </template>
    </q-page>
</template>

<script setup>
    import { computed, onMounted, ref } from 'vue'
    import PageHeader from '../components/ui/PageHeader.vue'
    import SummaryCard from '../components/ui/SummaryCard.vue'
    import StatBarChart from '../components/dashboard/StatBarChart.vue'
    import StockAlertList from '../components/dashboard/StockAlertList.vue'
    import QuickActions from '../components/dashboard/QuickActions.vue'
    import MovimientoTable from '../components/movements/MovimientoTable.vue'
    // Previo de carga (estilo YouTube): bloques con la forma de cada sección
    import SkeletonCards from '../components/ui/SkeletonCards.vue'
    import SkeletonTable from '../components/ui/SkeletonTable.vue'
    import SkeletonPanel from '../components/ui/SkeletonPanel.vue'
    import { useProductosStore } from '../stores/productos'
    import { useMovimientosStore } from '../stores/movimientos'
    import { mostrarError } from '../utils/alertas'
    import { mensajeDeError } from '../utils/errores'
    const productosStore = useProductosStore()
    const movimientosStore = useMovimientosStore()

    // ---------------------------------------------------------------------------
    // PREVIO DE CARGA (skeleton): encendido mientras el backend responde y
    // sólo se pinta si AÚN no hay datos (al regresar ya cacheados no parpadea)
    // ---------------------------------------------------------------------------
    const cargando = ref(true)

    const mostrarSkeleton = computed(() => {
        if (!cargando.value) {
            return false
        }

        return productosStore.productos.length === 0 &&
            movimientosStore.movimientos.length === 0
    })

    // Los datos viven en el backend: se cargan al entrar al panel
    onMounted(async () => {
        try {
            await Promise.all([
                productosStore.cargarProductos(),
                movimientosStore.cargarMovimientos()
            ])
        } catch (error) {
            mostrarError({
                titulo: 'No se pudo cargar la información',
                texto: mensajeDeError(error)
            })
        } finally {
            cargando.value = false
        }
    })

    // "computed" mantiene el array reactivo: cada tarjeta se recalcula sola
    // cuando cambian los datos de los stores (crear/editar/eliminar productos,
    // registrar movimientos, etc.)
    const summaryCards = computed(() => [
        {
            id:1,
            title: 'Productos',
            value: productosStore.totalProductos,
            description: 'Productos registrados',
            icon: 'inventory_2',
            color: 'azul'
        },

        {
            id:2,
            title: 'Unidades disponibles',
            value: productosStore.unidadesDisponibles,
            description: 'Existencias totales',
            icon: 'layers',
            color: 'verde'
        },

        {
            id:3,
            title:'Movimientos',
            value: movimientosStore.totalMovimientos,
            description: 'Movimientos registrados',
            icon: 'swap_horiz',
            color: 'ambar'
        },

        {
            id:4,
            title: 'Stock bajo',
            value: productosStore.productosStockBajo.length + productosStore.productosAgotados.length,
            description: `${productosStore.productosAgotados.length} agotados · ${productosStore.productosStockBajo.length} por debajo del mínimo`,
            icon: 'warning',
            color: 'amarillo'
        }
    ])

    // Mismo criterio: la lista de alertas se repinta al cambiar el stock
    const  stockAlerts = computed(() => productosStore.productosStockBajo)

    const agotados = computed(() => productosStore.productosAgotados)


    // Cada acción lleva su propio color para distinguir su "figura" (icono)
    // de un vistazo, en vez de todos con el mismo azul.
    const quickActions = [
          {
    id: 1,
    label: 'Ver inventario',
    icon: 'inventory_2',
    color: 'primary',
    to: '/inventario'
  },

  {
    id: 2,
    label: 'Ver movimientos',
    icon: 'swap_horiz',
    color: 'positive',
    to: '/movimientos'
  },

  {
    id: 3,
    label: 'Ver categorías',
    icon: 'category',
    color: 'warning',
    to: '/categorias'
  },

  {
    id: 4,
    label: 'Ver reportes',
    icon: 'assessment',
    color: 'secondary',
    to: '/reportes'
  }
    ]
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.dashboard-grid:last-child {
  margin-bottom: 0;
}

/* Separación del bloque de skeletons con respecto a lo que viene después */
.skeleton-bloque {
  margin-bottom: 24px;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  /* En pantallas chicas las alertas de stock pasan a lo primero */
  .panel-alertas {
    order: -1;
  }
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 16px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
