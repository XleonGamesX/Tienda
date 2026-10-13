/*
 ============================================================================
 alertas.js
 ============================================================================
 RESPONSABILIDAD: un único punto de mensajes para todo el sistema.

 Antes de la Fase 10 no existía un sistema de alertas unificado: las vistas
 usaban banners de Quasar para errores y un componente q-dialog para las
 confirmaciones de borrado. Aquí se centraliza todo con SweetAlert2 para que
 Productos, Categorías, Proveedores, Movimientos y Reportes respondan con el
 mismo patrón: validar -> confirmar -> ejecutar -> informar resultado.

 Funciones disponibles:
   confirmarOperacion(...) -> MODAL de confirmación (acciones destructivas o
                              críticas). Devuelve true solo si el usuario
                              confirma; false si cancela o cierra.
   mostrarExito(texto)     -> toast de éxito (no bloquea la pantalla).
   mostrarAviso(texto)     -> toast de advertencia suave (p. ej. "sin datos").
   mostrarAdvertencia(...) -> MODAL de advertencia informativa (una sola
                              acción: "Aceptar"), para operaciones que no se
                              pueden realizar.
   mostrarError(...)       -> MODAL de error cuando una operación falló.

 Reglas de UX aplicadas: textos en español, cortos, sin tecnicismos y sin
 duplicar mensajes (si el formulario ya explica un error de campo con su
 propio banner, aquí la validación se RECONFIRMA con modal de advertencia,
 de modo que toda validación pase por SweetAlert2 y nunca por alert() nativo).
 ============================================================================
 */

import Swal from 'sweetalert2'

// Los q-dialog de Quasar alcanzan z-index 6000 y SweetAlert2 usa 1060 por
// defecto: sin subirlo, la alerta aparecería DETRÁS del diálogo del
// formulario y el usuario no la vería.
const Z_INDEX = 11000

// ---------------------------------------------------------------------------
// ESTILOS DEL TOAST COMPACTO (una sola línea)
// Se inyectan UNA sola vez en <head> para que la notificación sea angosta,
// discreta y SIN saltos de línea innecesarios (ocupa lo justo).
// ---------------------------------------------------------------------------
let estilosToastInyectados = false

function inyectarEstilosToast() {
  if (estilosToastInyectados) {
    return
  }

  estilosToastInyectados = true

  const estilos = document.createElement('style')
  estilos.id = 'swal2-toast-compacto'
  estilos.textContent = `
    .swal2-popup.swal2-toast {
      width: auto !important;
      max-width: calc(100vw - 24px);
      padding: 6px 12px !important;
      margin: 0 12px 12px 0 !important;
      align-items: center;
      box-shadow: 0 6px 18px rgba(15, 41, 77, 0.16) !important;
    }

    .swal2-popup.swal2-toast .swal2-title {
      font-size: 14px !important;
      font-weight: 600 !important;
      margin: 0 !important;
      justify-self: start;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .swal2-popup.swal2-toast .swal2-html-container {
      font-size: 14px !important;
      margin: 0 !important;
      padding: 0 !important;
      justify-self: start;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .swal2-popup.swal2-toast .swal2-icon {
      width: 22px !important;
      height: 22px !important;
      margin: 0 8px 0 0 !important;
    }

    .swal2-popup.swal2-toast .swal2-timer-progress-bar {
      height: 3px !important;
    }
  `

  document.head.appendChild(estilos)
}

// Configuración compartida por todas las alertas.
function opcionesBase() {
  return {
    zIndex: Z_INDEX,
    buttonsStyling: true,
    // "Confirmar" queda a la derecha y "Cancelar" a la izquierda
    reverseButtons: true
  }
}

// Toast desechable: informa el resultado sin interrumpir el flujo.
// Va ABAJO a la derecha, angosto y en UNA SOLA LÍNEA para NO ocupar demasiado
// espacio ni tapar los botones de acción (p. ej. "Agregar producto").
function mostrarToast(icono, texto) {
  inyectarEstilosToast()

  return Swal.fire({
    ...opcionesBase(),
    icon: icono,
    title: texto,
    toast: true,
    position: 'bottom-end',
    width: 'auto',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true
  })
}

/**
 * Confirmación modal para operaciones destructivas o críticas.
 * @returns {Promise<boolean>} true si el usuario confirmó.
 */
export function confirmarOperacion({
  titulo,
  texto = '',
  icono = 'warning',
  confirmar = 'Confirmar',
  cancelar = 'Cancelar'
}) {
  return Swal.fire({
    ...opcionesBase(),
    icon: icono,
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: confirmar,
    cancelButtonText: cancelar
  }).then((resultado) => Boolean(resultado.isConfirmed))
}

/** Resultado correcto de una operación (toast, no bloquea). */
export function mostrarExito(texto) {
  return mostrarToast('success', texto)
}

/** Aviso suave que no exige acción (toast, no bloquea). */
export function mostrarAviso(texto) {
  return mostrarToast('warning', texto)
}

/** Advertencia informativa que sí bloquea hasta que se lea (modal). */
export function mostrarAdvertencia({ titulo, texto = '' }) {
  return Swal.fire({
    ...opcionesBase(),
    icon: 'warning',
    title: titulo,
    text: texto,
    confirmButtonText: 'Aceptar'
  })
}

/** Error de operación que el usuario debe conocer antes de continuar (modal). */
export function mostrarError({ titulo, texto = '' }) {
  return Swal.fire({
    ...opcionesBase(),
    icon: 'error',
    title: titulo,
    text: texto,
    confirmButtonText: 'Aceptar'
  })
}
