/*
  ============================================================================
  opciones.js — OPCIONES DE UN SELECTOR: SOLO LAS ACTIVAS
  ============================================================================
  RESPONSABILIDAD: dar la lista que debe alimentar un selector (q-select) de
  categorías o de proveedores: sólo los registros ACTIVOS, que son los que se
  ofrecen para una elección nueva. Al desactivar un registro este desaparece
  de todos los selectores sin que cada vista lo recuerde por su cuenta.

  EXCEPCIÓN: si el valor ya elegido —el filtro activo de una pantalla, o el
  registro que usa el producto que se está editando— resulta inactivo, ese
  registro se agrega AL FINAL de la lista. Sin eso el q-select quedaría con
  el id en blanco, ilegible; con eso se conserva la referencia sin volver a
  ofrecerlo como opción nueva (al limpiar el filtro, desaparece).

  REGLA: es solo PRESENTACIÓN sobre el state del store. Desactivar nunca borra
  nada: los productos de una categoría inactiva siguen apareciendo en las
  tablas y en los reportes (se agrupan por el nombre guardado en el producto);
  sólo dejan de ofrecerse sus IDs en los selectores.

  Sirve para categorías y proveedores: ambos son registros { id, activo, ... }
  ============================================================================
*/

/**
 * Lista de opciones activas para un selector.
 *
 * @param {Array<{id: string|number, activo?: boolean}>} registros todos los
 *        registros del store (activos e inactivos, en su orden original)
 * @param {string|number|null} idSeleccionado valor actual del selector;
 *        puede venir vacío o ser un id que ya no existe
 * @returns {Array} los activos; si el valor actual está inactivo, va al final.
 *
 * Ejemplos:
 *   opcionesActivas([A, I, B], '')      -> [A, B]    (I inactiva: no se ofrece)
 *   opcionesActivas([A, I, B], I.id)    -> [A, B, I] (se conserva la referencia)
 *   opcionesActivas([A, I, B], 'no-existe') -> [A, B] (id desconocido: se ignora)
 *   opcionesActivas(null, '')           -> []
 */
export function opcionesActivas(registros, idSeleccionado) {
  const todos = registros || []
  const activos = todos.filter((registro) => registro.activo !== false)

  // Sin valor elegido no hay referencia que conservar
  if (!idSeleccionado) {
    return activos
  }

  const id = String(idSeleccionado)

  // Ya está en la lista: no se toca nada
  if (activos.some((registro) => String(registro.id) === id)) {
    return activos
  }

  // Está inactivo (o no existe): se agrega al final sólo si existe
  const seleccionado = todos.find((registro) => String(registro.id) === id)

  return seleccionado ? [...activos, seleccionado] : activos
}
