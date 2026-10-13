/*
  ============================================================================
  moneda.js — FORMATO MONETARIO CENTRAL (pesos colombianos)
  ============================================================================
  RESPONSABILIDAD: única fuente de verdad para mostrar dinero en la interfaz.

  Todas las pantallas (Reportes, detalle de producto, tarjetas...) deben
  mostrar el mismo formato:

      $1.000 COP   $10.000 COP   $1.250.000 COP   $0 COP

  Se usa Intl.NumberFormat('es-CO') con style 'currency' / 'COP', pero su
  salida varía según el entorno ("$ 1.000", "COP 1.000", "$1.000"): aquí se
  normaliza para que SIEMPRE sea "$numero COP" (punto de miles, sin decimales).

  REGLA: esta función es solo PRESENTACIÓN. El store guarda números crudos
  (10000), nunca texto con "$" ni "COP".
  ============================================================================
*/

// Septiembre/millares en es-CO: 1.000.000
const formato = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})

/**
 * Formatea un valor como pesos colombianos.
 * @param {number|string} valor cantidad (acepta string numérico)
 * @returns {string} por ejemplo "$1.250.000 COP"
 */
export function formatearMoneda(valor) {
  // Number(null) = 0, Number('') = 0 y Number('abc') = NaN -> 0
  const cantidad = Number(valor) || 0
  const negativo = cantidad < 0

  // Se formatea en valor absoluto y el signo se coloca delante del "$"
  // para que un margen negativo se lea "-$1.000 COP".
  const texto = formato.format(Math.abs(cantidad))

  // Se quedan SOLO los dígitos y el separador de miles ("1.250.000"),
  // descartando "$", "COP" y espacios duros que ponga el entorno.
  const soloNumero = texto.replace(/[^\d.,]/g, '')

  return `${negativo ? '-' : ''}$${soloNumero} COP`
}
