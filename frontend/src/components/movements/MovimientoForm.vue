<!--
  ============================================================================
  MovimientoForm.vue
  ============================================================================
  RESPONSABILIDAD (Opción 2 elegida en el plan):
  1. Mostrar el formulario (diálogo).
  2. Validar los datos básicos (producto, cantidad según el tipo y stock para
     salidas). Un AJUSTE sí puede fijar el stock en 0, nunca en negativo.
  3. Emitir el evento "save" con la lista limpia de datos.

  ESTE COMPONENTE **NO** LLAMA AL STORE.
  Quien llama a movimientosStore.registrarMovimiento() es MovimientosView.vue.

  Si el store rechaza el movimiento (devuelve null), la vista envía el mensaje
  de error de vuelta a este formulario mediante la prop "error", y aquí lo
  mostramos dentro del diálogo (sin usar $q.notify).
  ============================================================================
-->
<template>
  <!--
    q-dialog controlado por la prop "modelValue".
    El patrón es el mismo que usa ProductForm.vue:
    - el padre pasa :modelValue (true = abierto)
    - el hijo avisa al padre con emit('update:modelValue', $event)
  -->
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="movimiento-form">
      <q-card-section>
        <h2 class="form-title">Registrar movimiento</h2>

        <p class="form-description">
          Selecciona el producto, el tipo de movimiento y la cantidad.
        </p>
      </q-card-section>

      <q-card-section>
        <!--
          BANNER DE ERROR
          Une dos fuentes de error en un solo mensaje:
          - localError: errores detectados por la validación de ESTE formulario
                       (por ejemplo: no seleccionó producto o la cantidad es 0).
          - props.error: error devuelto por el STORE y enviado por la vista
                         (por ejemplo: "stock insuficiente" al hacer una salida).
          El "||" hace que solo se muestre uno a la vez.
        -->
        <q-banner v-if="mensajeError" class="form-error bg-red-1 text-negative" rounded>
          <template #avatar>
            <q-icon name="error" color="negative" size="24px" />
          </template>

          {{ mensajeError }}
        </q-banner>

        <div class="form-grid">
          <!--
            CAMPO 1: PRODUCTO EXISTENTE (requisito 4)
            - emit-value  -> emite el VALOR de "option-value" (el id), no el objeto
            - map-options -> muestra el texto de "option-label" (el nombre)
            Así form.productoId queda como el id (texto) y coincide con el
            campo "productoId" que espera registrarMovimiento().
          -->
          <q-select v-model="form.productoId" :options="products" option-label="nombre" option-value="id" emit-value
            map-options outlined label="Producto" required />

          <!--
            CAMPO 2: CANTIDAD (requisito 5)
            El label cambia según el tipo para que no se confunda:
            - entrada  -> cuánto entra
            - salida   -> cuánto sale
            - ajuste   -> cuál es el stock FINAL (no es una suma)
            min="0" porque un AJUSTE sí puede dejar el stock en 0 (agotado);
            la validación real la hace validate() más abajo.
          -->
          <q-input v-model="form.cantidad" outlined type="number" :label="labelCantidad" min="0" required />

          <!--
            AYUDA VISUAL: stock actual del producto elegido.
            Se calcula desde la prop "products" para no tocar el store.
          -->
          <p v-if="productoSeleccionado" class="field-hint stock-hint">
            Stock actual de <strong>{{ productoSeleccionado.nombre }}</strong>:
            {{ productoSeleccionado.cantidad }} unidades
          </p>

          <!--
            CAMPO 3: TIPO DE MOVIMIENTO (requisito 6)
            q-option-group con radio deja una sola opción activa a la vez.
            Los valores ("entrada", "salida", "ajuste") son EXACTAMENTE los
            mismos que compara el store en registrarMovimiento().
          -->
          <q-option-group v-model="form.tipo" :options="tiposMovimiento" type="radio" color="primary" inline
            class="tipo-group" />

          <!--
            Leyenda que explica qué hace cada tipo (refuerza el requisito 2:
            diferenciar visualmente entrada, salida y ajuste también en el form).
          -->
          <p class="field-hint tipo-hint">
            <span class="text-positive">entrada</span> suma el stock ·
            <span class="text-negative">salida</span> lo resta ·
            <span class="text-info">corregir stock</span> reemplaza la cantidad actual por la nueva
          </p>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="form-actions">
        <!-- Cancelar simplemente avisa al padre que cierre el diálogo -->
        <q-btn flat label="Cancelar" @click="closeForm" />

        <!-- "Registrar" ejecuta la validación local y, si todo está bien, emite "save" -->
        <q-btn color="primary" label="Registrar movimiento" @click="saveForm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

// ---------------------------------------------------------------------------
// PROPS
// modelValue: controla si el diálogo está abierto (patrón v-model del padre)
// products:   lista de productos para el selector (la pasa la vista)
// error:      mensaje de error devuelto por el store vía MovimientosView
// ---------------------------------------------------------------------------
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },

  products: {
    type: Array,
    default: () => []
  },

  error: {
    type: String,
    default: ''
  }
})

// save:           le dice a la vista "aquí están los datos, regístralos"
// update:modelValue: le dice a la vista "cierra (o abre) el diálogo"
const emit = defineEmits(['update:modelValue', 'save'])

// Estado local del formulario (reactive porque es un objeto con varios campos)
const form = reactive({
  productoId: null,
  cantidad: 1,
  tipo: 'entrada'
})

// Error detectado por la validación de ESTE componente
const localError = ref('')

// Opciones del selector de tipo (los value son los que espera el store)
const tiposMovimiento = [
  { label: 'Entrada', value: 'entrada' },
  { label: 'Salida', value: 'salida' },
  { label: 'Corregir stock', value: 'ajuste' }
]

// Devuelve el producto elegido o null si aún no se elige / ya no existe
const productoSeleccionado = computed(() => {
  if (form.productoId === null || form.productoId === undefined) {
    return null
  }

  return props.products.find(
    // El id del producto es un id de Mongo (texto): se compara con String()
    (producto) => String(producto.id) === String(form.productoId)
  ) || null
})

// Etiqueta dinámica del campo de cantidad según el tipo elegido
const labelCantidad = computed(() => {
  if (form.tipo === 'entrada') {
    return 'Cantidad a ingresar'
  }

  if (form.tipo === 'salida') {
    return 'Cantidad a retirar'
  }

  return 'Stock final tras la corrección'
})

// Mensaje visible: primero el error local, si no hay, el que manda la vista
const mensajeError = computed(() => localError.value || props.error || '')

function resetForm() {
  form.productoId = null
  form.cantidad = 1
  form.tipo = 'entrada'
  localError.value = ''
}

function closeForm() {
  emit('update:modelValue', false)
}

// ---------------------------------------------------------------------------
// VALIDACIÓN BÁSICA (responsabilidad del formulario)
// Devuelve un mensaje vacío si todo está bien.
//
// La cantidad se valida SEGÚN EL TIPO porque un AJUSTE fija el stock final:
//   ajuste  -> 0 es válido (producto agotado), negativo no.
//   entrada/salida -> la cantidad debe ser mayor a 0 (debe cambiar algo).
//
// OJO: saveForm() convierte con Number() ANTES de llamar a esta función, así
// que la comprobación de campo vacío vive en saveForm(): Number("") = 0 y, sin
// ese control, un ajuste sin dato interpretaría "dejar el stock en 0" por
// accidente. Aquí solo queda cubrir el caso NaN.
// ---------------------------------------------------------------------------
function validate() {
  if (form.productoId === null || form.productoId === undefined) {
    return 'Selecciona un producto.'
  }

  // defensivo: el vacío ya lo intercepta saveForm() antes de convertir
  if (form.cantidad === '' || form.cantidad === null || form.cantidad === undefined) {
    return 'Indica la cantidad.'
  }

  // texto no numérico (Number('abc') => NaN)
  if (Number.isNaN(form.cantidad)) {
    return 'La cantidad debe ser un número.'
  }

  if (form.tipo === 'ajuste') {
    // El único límite del ajuste: nunca puede dejar el stock en negativo
    if (form.cantidad < 0) {
      return 'El stock resultante no puede ser negativo.'
    }
  } else if (form.cantidad <= 0) {
    // cubre: 0 y valores negativos en entradas y salidas
    return 'La cantidad debe ser un número mayor a 0.'
  }

  // Regla extra de UX: evita emitir una salida que el store rechazaría
  if (
    form.tipo === 'salida' &&
    productoSeleccionado.value &&
    form.cantidad > productoSeleccionado.value.cantidad
  ) {
    return `Stock insuficiente: ${productoSeleccionado.value.nombre} solo tiene ${productoSeleccionado.value.cantidad} unidades.`
  }

  return ''
}

function saveForm() {
  // Guardamos el valor crudo ANTES de convertirlo: con Number("") = 0, un
  // ajuste con el campo vacío quedaría como "stock final 0" por accidente.
  const cantidadCruda = form.cantidad

  if (cantidadCruda === '' || cantidadCruda === null || cantidadCruda === undefined) {
    // El motivo se explica UNA sola vez con el banner del propio formulario
    // (sin modal SweetAlert2, para no duplicar la alerta).
    localError.value = 'Indica la cantidad.'
    return
  }

  // Precaución: los inputs type="number" pueden entregar string.
  // Convertimos a number para que el store NO concatene texto en el stock
  // (ejemplo del bug que evitamos: 20 + "5" = "205" en vez de 25).
  form.cantidad = Number(form.cantidad)

  const mensaje = validate()

  if (mensaje) {
    // Hay error: no se emite "save", el diálogo queda abierto y se muestra
    // el mensaje en el banner rojo (una sola vez).
    localError.value = mensaje
    return
  }

  localError.value = ''

  // Mandamos una copia {...form} por si el padre necesita modificar los datos
  emit('save', { ...form })
}

// ---------------------------------------------------------------------------
// LIMPIEZA AUTOMÁTICA
// Se limpia el formulario al ABRIR y al CERRAR el diálogo.
// Importante: si el registro FALLA, la vista NO cierra el diálogo, así que
// aquí NO se limpia y el usuario conserva lo que escribió para corregirlo.
// Al salir (por éxito o por cancelar) sí queda todo en cero.
// ---------------------------------------------------------------------------
watch(
  () => props.modelValue,
  () => {
    resetForm()
  }
)
</script>

<style scoped>
.movimiento-form {
  width: 100%;
  max-width: 600px;
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

/* El banner queda pegado arriba del formulario */
.form-error {
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

/* La ayuda del stock y el grupo de tipos ocupan las 2 columnas */
.stock-hint,
.tipo-group,
.tipo-hint {
  grid-column: 1 / -1;
}

.field-hint {
  margin: -8px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.6);
}

.tipo-hint {
  margin: -4px 0 0;
  font-weight: 500;
}

.form-actions {
  padding: 16px 24px 24px;
}

@media (max-width: 600px) {
  .movimiento-form {
    max-width: calc(100vw - 32px);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
