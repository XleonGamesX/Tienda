<template>
  <q-card class="provider-table">
    <q-table
  flat
  :rows="providers"
  row-key="id"
  :columns="columns"
  :no-data-label="noDataLabel"
  rows-per-page-label="Registros por página:"
  :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`"
>
      <!--
        ESTADO (activo / inactivo)
        Permite ocultar el proveedor del selector de productos sin
        eliminarlo, para no verse obligado a borrar productos asociados.
      -->
      <template #body-cell-estado="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.activo !== false ? 'positive' : 'grey-6'"
            :label="props.row.activo !== false ? 'Activo' : 'Inactivo'"
          />
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            icon="edit"
            aria-label="Editar proveedor"
            @click="emit('edit', props.row)"
          />
          <!-- Activar / desactivar: alterna el estado sin eliminar -->
          <q-btn
            flat
            round
            dense
            :icon="props.row.activo !== false ? 'toggle_on' : 'toggle_off'"
            :color="props.row.activo !== false ? 'positive' : 'grey-6'"
            :aria-label="props.row.activo !== false ? 'Desactivar proveedor' : 'Activar proveedor'"
            @click="emit('toggle', props.row)"
          />
          <q-btn
            flat
            round
            dense
            icon="delete"
            aria-label="Eliminar proveedor"
            @click="emit('delete', props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
defineProps({
  providers: {
    type: Array,
    default: () => []
  },
  // Texto del estado vacío: la vista lo cambia para distinguir
  // "no hay proveedores" de "la búsqueda no tuvo resultados"
  noDataLabel: {
    type: String,
    default: 'No hay proveedores para mostrar'
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle'])

const columns = [
  {
    name: 'nombre',
    label: 'Proveedor',
    field: 'nombre',
    align: 'left'
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    field: 'telefono',
    align: 'left'
  },
  {
    name: 'email',
    label: 'Correo',
    field: 'email',
    align: 'left'
  },
  {
    name: 'direccion',
    label: 'Dirección',
    field: 'direccion',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'activo',
    align: 'center'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'right'
  }
]
</script>

<style scoped>
.provider-table {
  width: 100%;
  border-radius: 12px;
  /* Contorno AZUL NEÓN para diferenciar la tabla del fondo */
  border: 1.5px solid #1E9EFF;
  box-shadow:
    0 0 10px rgba(30, 158, 255, 0.45),
    0 4px 16px rgba(15, 41, 77, 0.08);
}

@media (max-width: 700px) {
  .provider-table :deep(.q-table__middle) {
    overflow-x: auto;
  }
}
</style>