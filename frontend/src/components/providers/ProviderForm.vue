<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="provider-form">
      <q-card-section>
        <h2 class="form-title">
          {{ provider ? 'Editar proveedor' : 'Nuevo proveedor' }}
        </h2>
        <p class="form-description">
          Completa la información del proveedor.
        </p>
      </q-card-section>

      <q-card-section>
        <!--
          BANNER DE ERROR
          Aquí se muestran los problemas de validación (campos obligatorios
          vacíos o nombre duplicado) y también el error que devuelve la VISTA
          cuando el store rechaza el guardado (prop "error"). Se usa la
          interfaz del propio diálogo y no $q.notify, porque ese plugin no
          está registrado en main.js.
        -->
        <q-banner v-if="mensajeError" class="form-error bg-red-1 text-negative" rounded>
          <template #avatar>
            <q-icon name="error" color="negative" size="24px" />
          </template>

          {{ mensajeError }}
        </q-banner>

        <div class="form-grid">
          <q-input
            v-model="form.nombre"
            outlined
            label="Nombre del proveedor"
            required
          />

          <q-input
            v-model="form.telefono"
            outlined
            label="Teléfono"
            required
          />

          <q-input
            v-model="form.email"
            outlined
            type="email"
            label="Correo electrónico"
            required
          />

          <q-input
            v-model="form.direccion"
            outlined
            label="Dirección"
            required
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="form-actions">
        <q-btn
          flat
          label="Cancelar"
          @click="closeForm"
        />

        <q-btn
          color="primary"
          :label="provider ? 'Guardar proveedor' : 'Crear proveedor'"
          @click="saveProvider"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  provider: {
    type: Object,
    default: null
  },
  // Lista completa de proveedores; se usa únicamente para detectar
  // nombres duplicados. Este componente nunca la modifica.
  providers: {
    type: Array,
    default: () => []
  },
  // Mensaje devuelto por la VISTA cuando el store rechaza el guardado
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'update:modelValue',
  'save'
])

const form = reactive({
  nombre: '',
  telefono: '',
  email: '',
  direccion: ''
})

// Mensaje de la validación local que se muestra en el q-banner
const localError = ref('')

// Primero el error local de este formulario; si no hay, el que envía la
// vista desde el store (mismo patrón que CategoriaForm y ProductForm)
const mensajeError = computed(() => localError.value || props.error || '')

function resetForm() {
  form.nombre = ''
  form.telefono = ''
  form.email = ''
  form.direccion = ''
}

function loadProvider(provider) {
  form.nombre = provider?.nombre || ''
  form.telefono = provider?.telefono || ''
  form.email = provider?.email || ''
  form.direccion = provider?.direccion || ''
}

function closeForm() {
  emit('update:modelValue', false)
}

// ---------------------------------------------------------------------------
// VALIDACIÓN LOCAL
// Devuelve un mensaje vacío si el formulario es válido.
// Este componente solo valida y emite: no escribe en ningún store.
// ---------------------------------------------------------------------------
function validate() {
  // El nombre es obligatorio y debe ser un string sin espacios exteriores
  if (typeof form.nombre !== 'string' || !form.nombre.trim()) {
    return 'El nombre del proveedor es obligatorio.'
  }

  // Los otros tres campos están marcados como obligatorios en el
  // formulario (required), así que la validación debe cubrirlos:
  // antes un proveedor podía guardarse sin teléfono, correo o dirección.
  if (!String(form.telefono ?? '').trim()) {
    return 'El teléfono del proveedor es obligatorio.'
  }

  if (!String(form.email ?? '').trim()) {
    return 'El correo electrónico es obligatorio.'
  }

  if (!String(form.direccion ?? '').trim()) {
    return 'La dirección del proveedor es obligatoria.'
  }

  const nombreLimpio = form.nombre.trim()

  // Se comparan nombres normalizados: se ignoran mayúsculas/minúsculas
  // (toLowerCase) y espacios exteriores (trim)
  const yaExiste = props.providers.some((proveedor) => {
    // Al editar, el proveedor actual se excluye de la comparación para
    // poder conservar su propio nombre. Los ids son texto (UUID), por eso
    // se comparan con String() y no con Number().
    if (props.provider && String(proveedor.id) === String(props.provider.id)) {
      return false
    }

    return String(proveedor.nombre).trim().toLowerCase() === nombreLimpio.toLowerCase()
  })

  if (yaExiste) {
    return `Ya existe un proveedor con el nombre "${nombreLimpio}".`
  }

  return ''
}

function saveProvider() {
  const mensaje = validate()

  if (mensaje) {
    // Nombre inválido o duplicado: no se emite "save" y el diálogo
    // permanece abierto. El motivo se explica UNA sola vez con el banner
    // del propio formulario (sin modal SweetAlert2, para no duplicar).
    localError.value = mensaje
    return
  }

  localError.value = ''

  emit('save', {
    nombre: form.nombre.trim(),
    telefono: form.telefono.trim(),
    email: form.email.trim(),
    direccion: form.direccion.trim()
  })
}

// ---------------------------------------------------------------------------
// REACCIÓN AL DIÁLOGO Y AL PROVEEDOR RECIBIDO
// - Al abrir con proveedor: se cargan sus cuatro campos.
// - Al abrir sin proveedor: el formulario queda vacío.
// - Al cerrar: se limpia todo, para que una nueva apertura no muestre
//   datos ni errores de la sesión anterior.
// ---------------------------------------------------------------------------
watch(
  [() => props.modelValue, () => props.provider],
  ([abierto]) => {
    if (abierto && props.provider) {
      loadProvider(props.provider)
    } else {
      resetForm()
    }

    localError.value = ''
  },
  { immediate: true }
)
</script>

<style scoped>
.provider-form {
  width: 100%;
  max-width: 560px;
  border-radius: 12px;
}

.form-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.3;
  font-weight: 600;
}

.form-description {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.5;
}

/* El banner queda pegado arriba de la cuadrícula de campos */
.form-error {
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-actions {
  padding: 16px 24px 24px;
}

@media (max-width: 600px) {
  .provider-form {
    max-width: calc(100vw - 32px);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>