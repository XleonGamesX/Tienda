<!--
  ============================================================================
  MovimientoTable.vue
  ============================================================================
  RESPONSABILIDAD:
  - Mostrar la lista de movimientos en una tabla (requisito 1 y 9).
  - Diferenciar visualmente entrada / salida / ajuste (requisito 2).

  Es "presentación pura": NO recibe stores por props pero SÍ importa
  productosStore, solo para resolver el nombre del producto a partir del
  "productoId" que guarda cada movimiento (el store de movimientos no guarda
  el nombre, solo el id).

  El store de movimientos tampoco se modifica aquí: solo se leen datos.
  ============================================================================
-->
<template>
  <q-card class="movimiento-table">
    <!--
      q-table igual que en ProductTable.vue:
      - rows      -> la lista que le pasa la vista
      - row-key   -> identificador único de cada fila (el id del movimiento)
      - no-data-label -> texto cuando todavía no hay movimientos
    -->
    <q-table flat :rows="movements" row-key="id" :columns="columns" no-data-label="Aún no hay movimientos registrados">

      <!--
        COLUMNA FECHA
        El store guarda fecha en ISO (2026-09-29T15:04:05.000Z).
        Se convierte a formato local legible para el usuario.
      -->
      <template #body-cell-fecha="props">
        <q-td :props="props">
          {{ formatFecha(props.row.fecha) }}
        </q-td>
      </template>

      <!--
        COLUMNA TIPO (requisito 2)
        Se reutiliza el componente StatusBadge que ya existe en components/ui.
        Cada tipo tiene su propio color:
        - entrada -> positive (verde)
        - salida  -> negative (rojo)
        - ajuste  -> info     (azul)
      -->
      <template #body-cell-tipo="props">
        <q-td :props="props">
          <StatusBadge :label="getTipo(props.row.tipo).label" :color="getTipo(props.row.tipo).color" />
        </q-td>
      </template>

      <!--
        COLUMNA PRODUCTO
        El movimiento solo guarda productoId, así que aquí se busca el producto
        real en productosStore para mostrar nombre y código.
        Si el producto fue eliminado, se muestra un texto de aviso en vez de
        romper la tabla (caso borde importante).
      -->
      <template #body-cell-producto="props">
        <q-td :props="props">
          <div class="producto-nombre">
            {{ getProducto(props.row).nombre }}
          </div>

          <div v-if="getProducto(props.row).codigo" class="producto-codigo">
            {{ getProducto(props.row).codigo }}
          </div>
        </q-td>
      </template>

      <!--
        COLUMNA CANTIDAD (refuerza el requisito 2)
        El color indica la naturaleza del movimiento:
        - entrada -> verde
        - salida  -> rojo
        - corregir stock (ajuste) -> azul, stock final tras la corrección
        El color ya indica si suma o resta, por eso NO lleva signos + / -.
      -->
      <template #body-cell-cantidad="props">
        <q-td :props="props">
          <span class="cantidad" :class="getDetalleCantidad(props.row).clase">
            {{ getDetalleCantidad(props.row).texto }}
          </span>
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
// Se importa el store de productos SOLO para leer/consultar
import { useProductosStore } from '../../stores/productos'

import StatusBadge from '../ui/StatusBadge.vue'

// defineProps: la vista es la única dueña de los datos, la tabla solo los pinta
defineProps({
  movements: {
    type: Array,
    default: () => []
  }
})

// Instancia del store de productos (Pinia) para resolver nombres
const productosStore = useProductosStore()

// Definición de columnas: mismo formato que usa ProductTable.vue
const columns = [
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left'
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipo',
    align: 'center'
  },
  {
    name: 'producto',
    label: 'Producto',
    field: 'productoId',
    align: 'left'
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: 'cantidad',
    align: 'center'
  }
]

// Configuración visual de cada tipo de movimiento
const TIPOS = {
  entrada: { label: 'Entrada', color: 'positive' },
  salida: { label: 'Salida', color: 'negative' },
  ajuste: { label: 'Corregir stock', color: 'info' }
}

// Devuelve label + color; si llega un tipo desconocido usa gris (defensivo)
function getTipo(tipo) {
  return TIPOS[tipo] || { label: tipo, color: 'grey' }
}

// Color de la cantidad según el tipo de movimiento (el color ya indica si
// suma o resta, por eso NO lleva signos + / -). El ajuste tampoco lleva "=":
// se muestra el número en azul, que es el stock final tras la corrección.
function getDetalleCantidad(movimiento) {
  if (movimiento.tipo === 'entrada') {
    return { texto: `${movimiento.cantidad}`, clase: 'text-positive' }
  }

  if (movimiento.tipo === 'salida') {
    return { texto: `${movimiento.cantidad}`, clase: 'text-negative' }
  }

  // ajuste (corregir stock): el valor NO suma ni resta, es el stock final
  return { texto: `${movimiento.cantidad}`, clase: 'text-info' }
}

// Busca el producto en el store de productos a partir del id del movimiento
function getProducto(movimiento) {
  const producto = productosStore.obtenerProductos(movimiento.productoId)

  if (!producto) {
    // El producto fue eliminado después de registrar el movimiento
    return { nombre: 'Producto eliminado', codigo: '' }
  }

  return { nombre: producto.nombre, codigo: producto.codigo }
}

// Convierte la fecha ISO del store a fecha y hora legibles en español
function formatFecha(fecha) {
  if (!fecha) {
    return ''
  }

  return new Date(fecha).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}
</script>

<style scoped>
.movimiento-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  /* Contorno AZUL NEÓN para diferenciar la tabla del fondo */
  border: 1.5px solid #1E9EFF;
  box-shadow:
    0 0 10px rgba(30, 158, 255, 0.45),
    0 4px 16px rgba(15, 41, 77, 0.08);
}

/* Nombre del producto en negrita y su código en gris debajo */
.producto-nombre {
  font-weight: 600;
}

.producto-codigo {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

/* Cantidad con signo, en negrita para que salte a la vista */
.cantidad {
  font-size: 15px;
  font-weight: 700;
}

@media (max-width: 700px) {
  .movimiento-table {
    border-radius: 8px;
  }
}
</style>
