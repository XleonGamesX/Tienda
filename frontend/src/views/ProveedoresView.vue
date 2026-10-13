<template>
    <q-page class="providers-page">
        <PageHeader title="Proveedores" description="Administra los proveedores relacionados con tu inventario">
            <template #actions>
                <q-btn color="primary" icon="add" label="Nuevo proveedor" no-caps @click="openCreateForm" />
            </template>
        </PageHeader>

        <!--
          TOTAL DE PROVEEDORES
          Se lee del getter del store: al crear o eliminar un proveedor
          la tarjeta se actualiza sola por la reactividad de Pinia.
          Mientras carga, el previo ocupa exactamente el mismo espacio.
        -->
        <SkeletonCards v-if="mostrarSkeleton" :count="1" height="150px" class="summary" />

        <SummaryCard v-else class="summary" title="Total de proveedores" :value="proveedoresStore.totalProveedores"
            icon="local_shipping" color="dorado" description="Proveedores registrados en el sistema" />

        <!-- Búsqueda existente: filtra por nombre, teléfono, correo y dirección -->
        <q-card class="provider-filters">
            <q-card-section>
                <q-input v-model="search" outlined dense clearable label="Buscar proveedor"
                    placeholder="Nombre, contacto, teléfono o correo">
                    <template #prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </q-card-section>
        </q-card>

        <!-- Previo de carga (estilo YouTube): misma silueta que la tabla -->
        <SkeletonTable v-if="mostrarSkeleton" :rows="6" />

        <ProviderTable v-else :providers="filteredProviders" :no-data-label="emptyLabel" @edit="openEditForm"
            @delete="confirmDelete" @toggle="toggleEstado" />

        <!--
          :providers alimenta la validación de nombres duplicados.
          Se pasa el array reactivo del store: la vista nunca lo modifica.
        -->
        <ProviderForm v-model="showForm" :provider="selectedProvider" :providers="proveedoresStore.proveedores"
            @save="saveProvider" />
    </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import PageHeader from '../components/ui/PageHeader.vue'
import SummaryCard from '../components/ui/SummaryCard.vue'
import ProviderTable from '../components/providers/ProviderTable.vue'
import ProviderForm from '../components/providers/ProviderForm.vue'
// Previo de carga (estilo YouTube): bloques con la forma de cada sección
import SkeletonCards from '../components/ui/SkeletonCards.vue'
import SkeletonTable from '../components/ui/SkeletonTable.vue'
// Alertas unificadas del sistema (SweetAlert2)
import { confirmarOperacion, mostrarAdvertencia, mostrarError, mostrarExito } from '../utils/alertas'
// Traduce cualquier error capturado a un mensaje para el usuario
import { mensajeDeError } from '../utils/errores'
import { useProveedoresStore } from '../stores/proveedores'
import { useProductosStore } from '../stores/productos'

const proveedoresStore = useProveedoresStore()
// Solo se consulta: permite saber si un proveedor está siendo usado
const productosStore = useProductosStore()

// ---------------------------------------------------------------------------
// PREVIO DE CARGA (skeleton): encendido mientras el backend responde y sólo
// se pinta si AÚN no hay proveedores (al regresar cacheados no parpadea)
// ---------------------------------------------------------------------------
const cargando = ref(true)

const mostrarSkeleton = computed(() => {
  return cargando.value && proveedoresStore.proveedores.length === 0
})

// Los datos viven en el backend: se cargan al entrar a la vista
onMounted(async () => {
  try {
    await Promise.all([
      proveedoresStore.cargarProveedores(),
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

const search = ref('')
const showForm = ref(false)
const selectedProvider = ref(null)

const filteredProviders = computed(() => {
    // El clearable de Quasar entrega null al pulsar la X del campo, por eso
    // se convierte a texto ANTES de llamar a toLowerCase() (con null la vista
    // se caía con "Cannot read properties of null").
    const value = String(search.value ?? '').trim().toLowerCase()

    if (!value) {
        return proveedoresStore.proveedores
    }

    return proveedoresStore.proveedores.filter(provider => {
        return [
            provider.nombre,
            provider.telefono,
            provider.email,
            provider.direccion
        ].some(field =>
            String(field ?? '').toLowerCase().includes(value)
        )
    })
})

// Estado vacío distinto: sin proveedores registrados, o sin coincidencias
const emptyLabel = computed(() => {
    if (String(search.value ?? '').trim()) {
        return 'No se encontraron proveedores con ese criterio'
    }

    return 'No hay proveedores registrados'
})

// Cuenta los productos que usan este proveedor comparando su proveedorId.
// Ambos son texto: el id del proveedor es un UUID y el del producto un id de
// Mongo, así que se comparan con String() (Number() los volvería NaN).
function contarProductosAsociados(proveedor) {
    return productosStore.productos.filter(
        producto => String(producto.proveedorId) === String(proveedor.id)
    ).length
}

function openCreateForm() {
    selectedProvider.value = null
    showForm.value = true
}

function openEditForm(provider) {
    selectedProvider.value = provider
    showForm.value = true
}

// Guarda el proveedor: si hay uno seleccionado lo edita, si no lo crea.
// El backend valida (campos obligatorios y nombre duplicado) y responde con
// un mensaje; si falla, la vista lo informa y el diálogo queda abierto.
async function saveProvider(data) {
    const esEdicion = Boolean(selectedProvider.value)

    try {
        if (esEdicion) {
            await proveedoresStore.editarProveedor(selectedProvider.value.id, data)
        } else {
            await proveedoresStore.crearProveedor(data)
        }
    } catch (error) {
        mostrarError({
            titulo: 'No se pudo guardar el proveedor',
            texto: mensajeDeError(error)
        })
        return
    }

    // ÉXITO: se cierra el diálogo y SweetAlert2 informa con un toast si fue
    // alta o modificación (la tabla se actualiza por la reactividad).
    showForm.value = false
    selectedProvider.value = null

    mostrarExito(
        esEdicion
            ? 'Proveedor actualizado correctamente.'
            : 'Proveedor creado correctamente.'
    )
}

// ---------------------------------------------------------------------------
// ELIMINACIÓN
// Flujo completo: validar -> confirmar -> eliminar -> informar el resultado.
// El backend se encarga de no borrar un proveedor en uso (responde 409 con el
// motivo); esa respuesta se muestra aquí tal cual, con SweetAlert2.
// ---------------------------------------------------------------------------
async function confirmDelete(provider) {
    const total = contarProductosAsociados(provider)

    if (total > 0) {
        await mostrarAdvertencia({
            titulo: 'No se puede eliminar el proveedor',
            texto:
                total === 1
                    ? 'No se puede eliminar este proveedor porque existe 1 producto asociado.'
                    : `No se puede eliminar este proveedor porque existen ${total} productos asociados.`
        })

        return
    }

    const confirmado = await confirmarOperacion({
        titulo: '¿Eliminar proveedor?',
        texto: `Se eliminará "${provider.nombre}". Esta acción no se puede deshacer.`,
        confirmar: 'Eliminar'
    })

    if (!confirmado) {
        // Canceló: no se modifica nada
        return
    }

    try {
        await proveedoresStore.eliminarProveedor(provider.id)
    } catch (error) {
        mostrarError({
            titulo: 'No se pudo eliminar el proveedor',
            texto: mensajeDeError(error)
        })
        return
    }

    mostrarExito('Proveedor eliminado correctamente.')
}

// ---------------------------------------------------------------------------
// ACTIVAR / DESACTIVAR
// Alterna el estado sin eliminar el proveedor: se oculta del selector de
// productos pero se conserva (y sus productos asociados no se tocan).
// ---------------------------------------------------------------------------
async function toggleEstado(provider) {
    const activar = provider.activo === false

    try {
        await proveedoresStore.alternarEstadoProveedor(provider.id)
    } catch (error) {
        mostrarError({
            titulo: 'No se pudo cambiar el estado',
            texto: mensajeDeError(error)
        })
        return
    }

    mostrarExito(
        activar
            ? `El proveedor "${provider.nombre}" se activó correctamente.`
            : `El proveedor "${provider.nombre}" se desactivó correctamente.`
    )
}

// Al cerrar el diálogo se limpia cualquier estado pendiente
watch(showForm, (abierto) => {
    if (!abierto) {
        selectedProvider.value = null
    }
})
</script>

<style scoped>
.providers-page {
    padding: 24px;
}

.summary {
    width: 100%;
    margin-bottom: 20px;
}

.provider-filters {
    width: 100%;
    margin-bottom: 20px;
    border-radius: 12px;
}

@media (max-width: 600px) {
    .providers-page {
        padding: 16px;
    }
}
</style>