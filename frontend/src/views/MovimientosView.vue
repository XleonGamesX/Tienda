<!--
  ============================================================================
  MovimientosView.vue
  ============================================================================
  RESPONSABILIDAD (Opción 2):
  - Conectar el formulario con la tabla.
  - LLAMAR a movimientosStore.registrarMovimiento(datos).
  - Confirmar con SweetAlert2 los AJUSTES (operación crítica que sobrescribe
    el stock) antes de ejecutarlos y mostrar el resultado de cada operación.
  - Si el store devuelve null, se explica el motivo con SweetAlert2 y el
    formulario queda abierto para corregir (sin usar $q.notify).
  - En éxito: cerrar el diálogo, limpiar y dejar la tabla actualizada.

  Esta vista NO modifica el stock a mano: el store lo hace internamente.
  ============================================================================
-->
<template>
  <q-page class="movements-page">
    <!--
      PageHeader reutiliza el componente ui/PageHeader.vue.
      El botón "Registrar movimiento" abre el diálogo (requisito 3).
    -->
    <PageHeader title="Movimientos" description="Registro de entradas, salidas y ajustes de inventario">
      <template #actions>
        <q-btn color="primary" icon="add" label="Registrar movimiento" no-caps @click="openForm" />
      </template>
    </PageHeader>

    <!--
      TABLA DE MOVIMIENTOS (requisito 1 y 9)
      Recibe la lista ordenada. Como movimientosStore.movimientos es estado
      reactivo de Pinia, la tabla se ACTUALIZA SOLA cada vez que el store
      registra un movimiento nuevo (requisito: "actualizar automáticamente").
    -->
    <!--
      Previo de carga (estilo YouTube): misma silueta que la tabla real.
      Sólo se pinta si AÚN no hay movimientos (al regresar con los datos ya
      cacheados no hay parpadeo).
    -->
    <SkeletonTable v-if="mostrarSkeleton" :rows="8" />

    <MovimientoTable v-else :movements="movimientosOrdenados" />

    <!--
      FORMULARIO
      - v-model="showForm"     -> controla abrir/cerrar el diálogo
      - :products              -> lista de productos para el selector
      - :error                 -> mensaje de error que vuelve desde el store
      - @save                  -> la vista ejecuta registrarMovimiento()
    -->
    <MovimientoForm v-model="showForm" :products="productosStore.productos"
      @save="guardarMovimiento" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

// Componentes reutilizados (no se modifican)
import PageHeader from '../components/ui/PageHeader.vue'
// Previo de carga (estilo YouTube): bloque con la forma de la tabla
import SkeletonTable from '../components/ui/SkeletonTable.vue'

// Componentes de esta sección
import MovimientoForm from '../components/movements/MovimientoForm.vue'
import MovimientoTable from '../components/movements/MovimientoTable.vue'

// Alertas unificadas del sistema (SweetAlert2)
import { confirmarOperacion, mostrarError, mostrarExito } from '../utils/alertas'
// Traduce cualquier error capturado a un mensaje para el usuario
import { mensajeDeError } from '../utils/errores'

// Stores involucrados
import { useMovimientosStore } from '../stores/movimientos'
import { useProductosStore } from '../stores/productos'

// Instancias de los stores de Pinia
const movimientosStore = useMovimientosStore()
const productosStore = useProductosStore()

// Estado de la vista
const showForm = ref(false)   // ¿está abierto el diálogo?

// ---------------------------------------------------------------------------
// PREVIO DE CARGA (skeleton): encendido mientras el backend responde
// ---------------------------------------------------------------------------
const cargando = ref(true)

const mostrarSkeleton = computed(() => {
  return cargando.value && movimientosStore.movimientos.length === 0
})

// Los datos viven en el backend: se cargan al entrar a la vista
onMounted(async () => {
  try {
    await Promise.all([
      movimientosStore.cargarMovimientos(),
      productosStore.cargarProductos()
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

// ---------------------------------------------------------------------------
// LISTA ORDENADA
// El store acumula los movimientos del más antiguo al más nuevo.
// Aquí los mostramos del más NUEVO al más viejo.
// OJO: .reverse() modifica el arreglo en el lugar, por eso primero hacemos
// una copia con [...array]. Si no, estaríamos revirtiendo el estado del store.
// ---------------------------------------------------------------------------
const movimientosOrdenados = computed(() => {
  return [...movimientosStore.movimientos].reverse()
})

function openForm() {
  showForm.value = true
}

// ---------------------------------------------------------------------------
// GUARDAR (aquí es donde se usa registrarMovimiento - requisito 7)
// ---------------------------------------------------------------------------
async function guardarMovimiento(datos) {
  // El AJUSTE sobrescribe el stock completo del producto, por eso antes de
  // ejecutarlo se confirma con SweetAlert2 mostrando el stock actual y el
  // nuevo valor que quedará. Si el usuario cancela, no se modifica nada.
  if (datos.tipo === 'ajuste') {
    const producto = productosStore.obtenerProductos(datos.productoId)

    const confirmado = await confirmarOperacion({
      titulo: '¿Confirmar corrección de stock?',
      texto: `Stock actual: ${producto ? producto.cantidad : 0}. Nuevo stock: ${Number(datos.cantidad)}. Esta operación sobrescribirá el inventario.`,
      confirmar: 'Confirmar'
    })

    if (!confirmado) {
      // El diálogo queda ABIERTO con los datos que ya había escrito.
      return
    }
  }

  // El store envía el movimiento al BACKEND, que hace 3 cosas a la vez:
  // 1. valida (producto existe, cantidad válida según el tipo, stock suficiente en salidas)
  // 2. ACTUALIZA EL STOCK del producto de forma atómica (requisito 8)
  // 3. guarda el movimiento y devuelve ambos datos
  // Si algo falla, lanza el error con el motivo y aquí se muestra.
  try {
    await movimientosStore.registrarMovimiento(datos)
  } catch (error) {
    // FALLO: se explica el motivo y el formulario sigue abierto para corregir.
    // La tabla no cambió porque el backend no aplicó nada.
    mostrarError({
      titulo:
        datos.tipo === 'ajuste'
          ? 'No fue posible corregir el stock'
          : 'No se pudo registrar el movimiento',
      texto: mensajeDeError(error)
    })

    return
  }

  // ÉXITO:
  // - cerrar el diálogo
  // - limpiar el formulario (lo hace MovimientoForm al detectar que cerró)
  // - la tabla y el stock se actualizaron por la reactividad de Pinia
  showForm.value = false

  mostrarExito(mensajeDeExito(datos.tipo))
}

// Texto de éxito según el tipo de movimiento (toast, no bloquea la pantalla)
function mensajeDeExito(tipo) {
  if (tipo === 'entrada') {
    return 'Entrada registrada correctamente.'
  }

  if (tipo === 'salida') {
    return 'Salida registrada correctamente.'
  }

  return 'Corrección de stock realizada correctamente.'
}
</script>

<style scoped>
.movements-page {
  padding: 24px;
}

@media (max-width: 600px) {
  .movements-page {
    padding: 16px;
  }
}
</style>
