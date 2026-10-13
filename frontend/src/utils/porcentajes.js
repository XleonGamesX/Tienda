/*
  ============================================================================
  porcentajes.js — REPARTO DE PORCENTAJES QUE SUMAN SIEMPRE 100%
  ============================================================================
  RESPONSABILIDAD: convertir una lista de valores en porcentajes enteros que
  suman EXACTAMENTE 100, para que un gráfico de reparto (donut + su leyenda,
  y la tabla exportada en PDF/CSV) cierre completo y muestre los mismos
  números que la pantalla.

  ¿Por qué no Math.round por ítem? Porque redondear por separado no conserva
  la suma:

      3 productos:  33.3 -> 33 · 33.3 -> 33 · 33.3 -> 33   = 99   (falta 1)
      6 estados:    16.7 -> 17 · 16.7 -> 17 · ...           = 102  (sobra 2)

  Con 99 el anillo queda con un hueco justo donde termina el último segmento,
  y con 102 ese último segmento (en el donut de estado del stock es
  "Agotados") se pasa del 100% y NO se dibuja completo.

  Se usa el método de "resto mayor" (largest remainder):

    1) se toma la parte entera (floor) de cada porcentaje exacto;
    2) lo que sobre (100 - suma de enteros) se reparte de mayor a menor
       residuo decimal, con desempate por posición (gana el primero).

  Como cada residuo es < 1, lo que sobra siempre es menor que la cantidad
  de ítems: nadie recibe +2 y la suma es 100 por construcción.

  REGLA: es solo PRESENTACIÓN. Los conteos crudos (disponibles, bajo,
  agotados) nunca se calculan con esto.
  ============================================================================
*/

/**
 * Reparte 100% entre los valores dados sin que sobre ni falte nada.
 *
 * @param {number[]} valores cantidades (contadores, unidades, etc.)
 * @returns {number[]} porcentajes enteros; suma 100, o todos 0 si no hay
 *                     datos que repartir.
 *
 * Ejemplos:
 *   repartirPorcentajes([1, 1, 1])  -> [34, 33, 33]
 *   repartirPorcentajes([0, 0, 0])  -> [0, 0, 0]
 *   repartirPorcentajes([5, 5])     -> [50, 50]
 */
export function repartirPorcentajes(valores) {
  // Nulos, strings vacíos o NaN cuentan como 0; lo negativo no puede
  // "robarle" porcentaje a los demás.
  const lista = (valores || []).map((valor) => Math.max(0, Number(valor) || 0))
  const total = lista.reduce((suma, valor) => suma + valor, 0)

  // Sin datos: todo en 0 (el gráfico queda vacío/gris, sin cortes raros)
  if (total === 0) {
    return lista.map(() => 0)
  }

  // 1) parte entera de cada porcentaje exacto
  const enteros = lista.map((valor) => Math.floor((valor / total) * 100))
  const resto = 100 - enteros.reduce((suma, valor) => suma + valor, 0)

  // 2) el resto va a los mayores residuos decimales (empate: el primero)
  const porResiduo = lista
    .map((valor, indice) => ({
      indice,
      residuo: (valor / total) * 100 - enteros[indice]
    }))
    .sort((a, b) => b.residuo - a.residuo || a.indice - b.indice)

  for (let i = 0; i < resto; i++) {
    enteros[porResiduo[i % porResiduo.length].indice] += 1
  }

  return enteros
}
