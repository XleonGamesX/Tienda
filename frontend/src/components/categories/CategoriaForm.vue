<!--
  ============================================================================
  CategoriaForm.vue
  ============================================================================
  RESPONSABILIDAD (misma arquitectura que MovimientoForm.vue):
  1. Mostrar el formulario (diálogo).
  2. Validar el nombre (obligatorio, sin espacios, sin duplicados).
  3. Emitir "save" con { nombre } ya limpio.

  ESTE COMPONENTE **NO** IMPORTA NINGÚN STORE.
  Quien llama a crearCategoria()/editarCategoria() es CategoriasView.vue.
  ============================================================================
-->
<template>
  <!-- q-dialog controlado por la prop "modelValue" (patrón v-model del padre) -->
   
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="categoria-form">
      <q-card-section>
        <!-- Título dinámico: "Nueva categoría" al crear, "Editar categoría" al editar -->
        <h2 class="form-title">
          {{ category ? 'Editar categoría' : 'Nueva categoría' }}
        </h2>

        <p class="form-description">
          Escribe el nombre de la categoría.
        </p>
      </q-card-section>

      <q-card-section>
        <!--
          BANNER DE ERROR
          Se muestra dentro del diálogo (sin $q.notify) cuando falla la
          validación local (nombre vacío o duplicado) o cuando el STORE
          rechaza el guardado y la vista lo devuelve por la prop "error".
        -->
        <q-banner v-if="mensajeError" class="form-error bg-red-1 text-negative" rounded>
          <template #avatar>
            <q-icon name="error" color="negative" size="24px" />
          </template>

          {{ mensajeError }}
        </q-banner>

        <!-- Único campo del formulario: el nombre de la categoría -->
        <q-input v-model="nombre" outlined label="Nombre" maxlength="50" counter
          @keyup.enter="saveForm" />
      </q-card-section>

      <q-card-actions align="right" class="form-actions">
        <!-- Cancelar solo avisa al padre que cierre el diálogo -->
        <q-btn flat label="Cancelar" @click="closeForm" />

        <!-- "Guardar" valida y, si está todo bien, emite "save" -->
        <q-btn color="primary" label="Guardar" @click="saveForm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

// ---------------------------------------------------------------------------
// PROPS
// modelValue: controla si el diálogo está abierto
// category:   null = creando · objeto = editando
// categories: lista completa, se usa para validar duplicados
// error:      mensaje que devuelve la VISTA cuando el store rechaza el guardado
// ---------------------------------------------------------------------------
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },

  category: {
    type: Object,
    default: null
  },

  categories: {
    type: Array,
    default: () => []
  },

  error: {
    type: String,
    default: ''
  }
})

// save:             le dice a la vista "aquí está el nombre, guárdalo"
// update:modelValue: le dice a la vista "cierra el diálogo"
const emit = defineEmits(['update:modelValue', 'save'])

// Nombre que escribe el usuario
const nombre = ref('')

// Error de la validación local (se muestra en el banner)
const localError = ref('')

// Primero el error local de este formulario; si no hay, el que envía la
// vista desde el store (mismo patrón que ProductForm y ProviderForm)
const mensajeError = computed(() => localError.value || props.error || '')

function resetForm() {
  nombre.value = ''
  localError.value = ''
}

// Al editar se carga el nombre actual para que el usuario lo modifique
function loadCategory() {
  nombre.value = props.category?.nombre || ''
  localError.value = ''
}

function closeForm() {
  emit('update:modelValue', false)
}

// ---------------------------------------------------------------------------
// VALIDACIÓN LOCAL
// Devuelve un mensaje vacío si todo está bien.
// ---------------------------------------------------------------------------
function validate() {
  // 1 y 2: obligatorio + trim() (también cubre el caso de solo espacios)
  const nombreLimpio = nombre.value.trim()

  if (!nombreLimpio) {
    return 'El nombre de la categoría es obligatorio.'
  }

  // 3 y 4: sin duplicados.
  // Se ignoran mayúsculas/minúsculas (toLowerCase) y espacios exteriores (trim).
  const yaExiste = props.categories.some((categoria) => {
    // 5: al editar, la categoría que se modifica se EXCLUYE de la comparación,
    // así puede conservar su propio nombre sin chocar consigo misma
    if (props.category && String(categoria.id) === String(props.category.id)) {
      return false
    }

    return String(categoria.nombre).trim().toLowerCase() === nombreLimpio.toLowerCase()
  })

  if (yaExiste) {
    return `Ya existe una categoría con el nombre "${nombreLimpio}".`
  }

  return ''
}

function saveForm() {
  const mensaje = validate()

  if (mensaje) {
    // Hay error: NO se emite "save" y el diálogo queda abierto.
    // El motivo se explica UNA sola vez con el banner del propio formulario
    // (sin modal SweetAlert2, para no duplicar la alerta).
    localError.value = mensaje
    return
  }

  localError.value = ''

  // Se emite SOLO el nombre ya limpio (sin espacios exteriores)
  emit('save', { nombre: nombre.value.trim() })
}

// ---------------------------------------------------------------------------
// REACCIÓN A LOS CAMBIOS
// - Al abrir: si hay "category" se carga su nombre; si no, queda vacío.
// - Al cerrar (por guardar o cancelar): se limpia todo.
// Si el usuario cancela mientras escribía, no queda nada guardado ni errores.
// ---------------------------------------------------------------------------
watch(
  [() => props.modelValue, () => props.category],
  ([abierto]) => {
    if (abierto) {
      loadCategory()
    } else {
      resetForm()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.categoria-form {
  width: 100%;
  max-width: 460px;
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

/* El banner queda pegado arriba del campo */
.form-error {
  margin-bottom: 16px;
}

.form-actions {
  padding: 16px 24px 24px;
}

@media (max-width: 600px) {
  .categoria-form {
    max-width: calc(100vw - 32px);
  }
}
</style>
