import { jsPDF } from 'jspdf'

// ============================================================================
// exportaciones.js — utilidades de exportación de reportes (CSV y PDF)
// ============================================================================
// AMBOS formatos se alimentan del MISMO arreglo de "secciones", que la vista
// ReportesView.vue construye a partir de sus computed (los mismos datos que
// se ven en pantalla). Así el archivo exportado nunca muestra información
// distinta a la que está consultando el usuario.
//
// Modelo de sección:
//   {
//     titulo:   'Inventario por categoría',
//     columnas: [{ etiqueta: 'Categoría', tipo: 'texto' }, ...],
//     filas:    [['Bebida', 3, 30, 240000, 310000], ...]
//   }
//
// Tipos de columna:
//   - 'texto'   -> se copia tal cual
//   - 'entero'  -> número entero (cantidadidades, conteos)
//   - 'moneda'  -> CSV: valor crudo (8000, para poder sumarlo en Excel)
//                  PDF: formateado como en pantalla ($8.000)
//   - 'fecha'   -> texto AAAA-MM-DD
//
// CSV  -> se genera a mano, sin dependencias.
// PDF  -> jsPDF (única dependencia añadida para esto; no había ninguna
//         librería de PDF/CSV en el package.json original).
// ============================================================================

// Configuración del CSV: ";" es el separador de listas de es-CO (el que
// espera Excel en español) y el BOM UTF-8 hace que los acentos se reconozcan.
const SEPARADOR_CSV = ';'
const BOM_UTF8 = '\uFEFF'

// Configuración del PDF: A4 en milímetros (210 × 297) con márgenes de 14 mm.
const ANCHO_PAGINA = 210
const ALTO_PAGINA = 297
const MARGEN = 14
const ANCHO_UTIL = ANCHO_PAGINA - MARGEN * 2 // ancho disponible para tablas
const Y_MINIMA = ALTO_PAGINA - MARGEN // altura máxima antes de saltar de página
const ALTO_FILA = 5.6
const ALTO_CABECERA = 6.4
const ALTO_BANDA_SECCION = 15 // alto de la banda horizontal (resumen en 1 línea)
const TAMANO_LETRA = 8.5
const RELLENO_CELDA = 1.6 // mm de aire a cada lado del texto de la celda

const MENSAJE_SIN_DATOS = 'Sin datos para los filtros actuales'

// ---------------------------------------------------------------------------
// FORMATO
// ---------------------------------------------------------------------------
// Pesos colombianos con punto de miles, la misma fórmula que usaba la vista.
// La implementación vive en utils/moneda.js para que pantalla, CSV, PDF y
// cualquier componente nuevo formateen exactamente igual (una sola fuente).
import { formatearMoneda } from './moneda.js'

export { formatearMoneda }

// Valor crudo para CSV: nunca se pierde información ni se rompen los números.
function celdaCSV(valor) {
    if (valor === null || valor === undefined) {
        return ''
    }

    return String(valor)
}

// Valor para PDF: la moneda se pinta formateada, igual que en pantalla.
function celdaPDF(valor, tipo) {
    if (valor === null || valor === undefined) {
        return ''
    }

    if (tipo === 'moneda') {
        return formatearMoneda(valor)
    }

    return String(valor)
}

// Fila de relleno cuando la sección no tiene filas: mantiene la tabla
// formada y comunica claramente que no hay coincidencias.
function filaSinDatos(seccion) {
    return seccion.columnas.map((columna, indice) =>
        indice === 0 ? MENSAJE_SIN_DATOS : ''
    )
}

function obtenerFilas(seccion) {
    return Array.isArray(seccion.filas) && seccion.filas.length > 0
        ? seccion.filas
        : [filaSinDatos(seccion)]
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------
// Escapado según RFC 4180: se envuelve en comillas cualquier valor que
// contenga el separador, comillas o saltos de línea, y las comillas dobles
// internas se duplican. Así nombres como 'Arroz, 1 kg' o 'Coca-Cola; 400 ml'
// no desalinean las columnas.
function escaparCampoCSV(valor) {
    const texto = celdaCSV(valor)

    if (/[;"\n\r,]/.test(texto)) {
        return `"${texto.replace(/"/g, '""')}"`
    }

    return texto
}

/**
 * Genera el contenido de un archivo CSV a partir de las secciones del reporte.
 * @param {Array} secciones secciones del reporte (ver modelo arriba)
 * @param {Object} opciones { titulo, metadatos: [{ etiqueta, valor }] }
 * @returns {string} texto CSV listo para descargar (con BOM UTF-8 y finales CRLF)
 */
export function generarCSV(secciones, opciones = {}) {
    const lineas = []
    const metadatos = opciones.metadatos || []

    // Cabecera del archivo: título del reporte + datos de contexto
    if (opciones.titulo) {
        lineas.push(escaparCampoCSV(opciones.titulo))
    }

    metadatos.forEach((metadato) => {
        lineas.push(escaparCampoCSV(`${metadato.etiqueta}: ${metadato.valor}`))
    })

    if (opciones.titulo || metadatos.length) {
        lineas.push('')
    }

    secciones.forEach((seccion) => {
        // Título de la sección y encabezados de columna
        lineas.push(escaparCampoCSV(seccion.titulo))
        lineas.push(
            seccion.columnas
                .map((columna) => escaparCampoCSV(columna.etiqueta))
                .join(SEPARADOR_CSV)
        )

        // Una línea por fila; se recorre por columnas para no perder el orden
        obtenerFilas(seccion).forEach((fila) => {
            lineas.push(
                seccion.columnas
                    .map((columna, indice) => escaparCampoCSV(celdaCSV(fila[indice])))
                    .join(SEPARADOR_CSV)
            )
        })

        // Línea en blanco entre secciones para que se lea bien al abrirlo
        lineas.push('')
    })

    return BOM_UTF8 + lineas.join('\r\n') + '\r\n'
}

/**
 * Descarga un archivo de texto generado en memoria (Blob + enlace temporal).
 * Solo funciona en el navegador; las pruebas usan generarCSV/generarPDF.
 */
export function descargarTexto(contenido, nombreArchivo, tipoMime = 'text/csv;charset=utf-8') {
    const blob = new Blob([contenido], { type: tipoMime })
    const url = URL.createObjectURL(blob)

    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = nombreArchivo

    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()

    // Se libera la URL en cuanto terminó la descarga
    URL.revokeObjectURL(url)
}

/**
 * Nombre de archivo con la fecha local: reporte-inventario-2026-10-05.csv
 */
export function nombreArchivoReporte(extension) {
    const hoy = new Date()

    const anio = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')

    return `reporte-inventario-${anio}-${mes}-${dia}.${extension}`
}

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------

// Corta el texto para que quepa en el ancho dado, con puntos suspensivos.
function truncarTexto(doc, texto, ancho) {
    if (ancho <= 0) {
        return ''
    }

    if (doc.getTextWidth(texto) <= ancho) {
        return texto
    }

    let resultado = texto

    while (resultado.length > 0 && doc.getTextWidth(`${resultado}…`) > ancho) {
        resultado = resultado.slice(0, -1)
    }

    return `${resultado}…`
}

/**
 * Calcula el ancho de cada columna de una tabla del PDF.
 * Parte del ancho natural del contenido y, si todo no cabe en el ancho
 * disponible, escala las columnas proporcionalmente (el texto luego se
 * trunca al pintarlo), de modo que NUNCA se sale de la página.
 *
 * Se exporta para poder probarla directamente.
 */
export function calcularAnchosColumnas(doc, seccion, filas, anchoDisponible) {
    const anchos = seccion.columnas.map((columna, indice) => {
        // El encabezado se pinta en negrita, así que se mide en negrita
        // (si se midiera con letra normal quedaría más angosto y se cortaría)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(TAMANO_LETRA)
        let ancho = doc.getTextWidth(columna.etiqueta)

        // Las celdas se pintan con letra normal
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(TAMANO_LETRA)

        filas.forEach((fila) => {
            ancho = Math.max(
                ancho,
                doc.getTextWidth(celdaPDF(fila[indice], columna.tipo))
            )
        })

        return ancho + RELLENO_CELDA * 2
    })

    const total = anchos.reduce((suma, ancho) => suma + ancho, 0)

    if (total <= anchoDisponible || total === 0) {
        return anchos
    }

    const factor = anchoDisponible / total
    return anchos.map((ancho) => ancho * factor)
}

/**
 * Genera el documento PDF del reporte con FORMATO DE INFORME FORMAL:
 *  - MEMBRETE: nombre de la empresa arriba (azul de la app).
 *  - Título del reporte debajo del membrete.
 *  - Metadatos (Generado / Moneda / Filtros) y línea separadora.
 *  - Secciones con títulos en NEGRITA.
 *  - Bloque de FIRMAS al final: "Elaborado por:" / "Recibido por:".
 * La sección marcada con disposicion:'horizontal' (Resumen general) se dibuja
 * como una BANDA en una sola línea en lugar de una tabla vertical (pto 9).
 *
 * @param {Array} secciones secciones del reporte (mismas que el CSV)
 * @param {Object} opciones { titulo, empresa, metadatos, firmas }
 * @returns {jsPDF} documento listo para descargar con doc.save(nombre)
 */
export function generarPDF(secciones, opciones = {}) {
    const titulo = opciones.titulo || 'Reporte'
    const empresa = opciones.empresa || 'SENA Market'
    const metadatos = opciones.metadatos || []
    const firmas = opciones.firmas && opciones.firmas.length
        ? opciones.firmas
        : [
            { titulo: 'Elaborado por:', detalle: '' },
            { titulo: 'Recibido por:', detalle: '' }
        ]

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    doc.setProperties({
        title: titulo,
        subject: 'Reporte de inventario',
        creator: empresa
    })

    let y = MARGEN

    // ¿Cabe este bloque en la página actual?
    const cabe = (alto) => y + alto <= Y_MINIMA

    // Salto de página con un encabezado breve para no perder el contexto
    const nuevaPagina = () => {
        doc.addPage()
        y = MARGEN

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(130)
        doc.text(`${empresa} · ${titulo}`, MARGEN, y + 4)
        doc.text('continuación', MARGEN + ANCHO_UTIL, y + 4, { align: 'right' })
        doc.setTextColor(20)

        y += 9
    }

    // --- MEMBRETE: nombre de la empresa (azul de la app #205297) -----------
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(32, 82, 151)
    doc.text(empresa, MARGEN, y + 8)

    y += 13

    // --- Título del informe -------------------------------------------------
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(20)
    doc.text(titulo, MARGEN, y + 6)

    y += 13

    // --- Metadatos (Generado, Moneda, Filtros) ------------------------------
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(90)

    metadatos.forEach((metadato) => {
        // El texto largo se parte en varias líneas para no desbordar el margen
        const lineas = doc
            .splitTextToSize(`${metadato.etiqueta}: ${metadato.valor}`, ANCHO_UTIL)
            .slice(0, 3)

        lineas.forEach((linea) => {
            doc.text(linea, MARGEN, y)
            y += 4.4
        })
    })

    doc.setTextColor(20)
    doc.setDrawColor(200)
    doc.line(MARGEN, y + 1, MARGEN + ANCHO_UTIL, y + 1)

    y += 7

    // --- Tablas por sección -------------------------------------------------
    const dibujarCabecera = (seccion, anchos) => {
        // Fondo gris claro para distinguir el encabezado de los datos
        doc.setFillColor(238)
        doc.rect(MARGEN, y, ANCHO_UTIL, ALTO_CABECERA, 'F')

        let x = MARGEN
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(TAMANO_LETRA)
        doc.setTextColor(20)

        seccion.columnas.forEach((columna, indice) => {
            const texto = truncarTexto(
                doc,
                columna.etiqueta,
                anchos[indice] - RELLENO_CELDA * 2
            )
            doc.text(texto, x + RELLENO_CELDA, y + ALTO_CABECERA - 2.2)
            x += anchos[indice]
        })

        y += ALTO_CABECERA
        doc.setDrawColor(180)
        doc.line(MARGEN, y, MARGEN + ANCHO_UTIL, y)
    }

    const dibujarFila = (seccion, fila, anchos) => {
        let x = MARGEN
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(TAMANO_LETRA)
        doc.setTextColor(40)

        seccion.columnas.forEach((columna, indice) => {
            const texto = truncarTexto(
                doc,
                celdaPDF(fila[indice], columna.tipo),
                anchos[indice] - RELLENO_CELDA * 2
            )
            doc.text(texto, x + RELLENO_CELDA, y + ALTO_FILA - 1.8)
            x += anchos[indice]
        })

        doc.setTextColor(20)
        y += ALTO_FILA

        doc.setDrawColor(230)
        doc.line(MARGEN, y, MARGEN + ANCHO_UTIL, y)
    }

    // --- Banda horizontal (Resumen general en UNA SOLA LÍNEA) --------------
    // En vez de una tabla de dos columnas con una fila por indicador, todos
    // los indicadores caben en una sola banda horizontal: valor en negrita
    // arriba y etiqueta debajo, repartidos por el ancho de la página.
    const dibujarBandaHorizontal = (seccion, filas) => {
        const ALTO_BANDA = 15
        const anchoCelda = ANCHO_UTIL / Math.max(filas.length, 1)

        if (!cabe(ALTO_BANDA)) {
            nuevaPagina()
        }

        doc.setFillColor(240, 244, 248)
        doc.rect(MARGEN, y, ANCHO_UTIL, ALTO_BANDA, 'F')

        filas.forEach((fila, indice) => {
            const xCelda = MARGEN + anchoCelda * indice

            // Separador vertical suave entre indicadores
            if (indice > 0) {
                doc.setDrawColor(215)
                doc.line(xCelda, y + 2, xCelda, y + ALTO_BANDA - 2)
            }

            const valor = celdaPDF(fila[1], seccion.columnas[1]?.tipo)
            const etiqueta = String(fila[0] ?? '')

            // Valor en negrita (azul), centrado
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.setTextColor(32, 82, 151)
            doc.text(
                truncarTexto(doc, valor, anchoCelda - 4),
                xCelda + anchoCelda / 2,
                y + 7,
                { align: 'center' }
            )

            // Etiqueta pequeña debajo, centrada
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7.5)
            doc.setTextColor(90)
            doc.text(
                truncarTexto(doc, etiqueta, anchoCelda - 4),
                xCelda + anchoCelda / 2,
                y + 12.5,
                { align: 'center' }
            )
        })

        doc.setTextColor(20)
        doc.setDrawColor(215)
        doc.rect(MARGEN, y, ANCHO_UTIL, ALTO_BANDA)

        y += ALTO_BANDA
    }

    const dibujarSeccion = (seccion) => {
        const filas = obtenerFilas(seccion)
        const esHorizontal = seccion.disposicion === 'horizontal'
        const altoNecesario = esHorizontal ? ALTO_BANDA_SECCION : ALTO_CABECERA + ALTO_FILA

        // Si no caben ni el título ni una fila, se pasa de página
        if (!cabe(altoNecesario + 12)) {
            nuevaPagina()
        }

        // Título de la sección en NEGRITA (cabecera formal del informe)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(20)
        doc.text(seccion.titulo, MARGEN, y + 5)

        y += 9

        if (esHorizontal) {
            dibujarBandaHorizontal(seccion, filas)
        } else {
            const anchos = calcularAnchosColumnas(doc, seccion, filas, ANCHO_UTIL)
            dibujarCabecera(seccion, anchos)

            filas.forEach((fila) => {
                // Salto de página con la cabecera repetida: así ninguna fila
                // se corta ni se sale del lienzo aunque el reporte sea largo
                if (!cabe(ALTO_FILA)) {
                    nuevaPagina()
                    dibujarCabecera(seccion, anchos)
                }

                dibujarFila(seccion, fila, anchos)
            })
        }

        y += 6 // aire entre secciones
    }

    secciones.forEach(dibujarSeccion)

    // --- BLOQUE DE FIRMAS (informe formal) ---------------------------------
    const dibujarFirmas = () => {
        const ALTO_FIRMA = 26
        const anchoColumna = ANCHO_UTIL / firmas.length

        if (!cabe(ALTO_FIRMA + 4)) {
            nuevaPagina()
        }

        // Línea separadora antes de las firmas
        doc.setDrawColor(200)
        doc.line(MARGEN, y + 2, MARGEN + ANCHO_UTIL, y + 2)

        y += 8

        firmas.forEach((firma, indice) => {
            const xColumna = MARGEN + anchoColumna * indice

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(20)
            doc.text(firma.titulo, xColumna, y + 4)

            // Línea para la firma manuscrita / nombre
            doc.setDrawColor(90)
            doc.line(xColumna, y + 16, xColumna + anchoColumna - 8, y + 16)

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7.5)
            doc.setTextColor(120)
            doc.text(firma.detalle || '', xColumna, y + 20)
        })
    }

    dibujarFirmas()

    // --- Pie de página con numeración en todas las páginas ------------------
    const totalPaginas = doc.internal.getNumberOfPages()

    for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
        doc.setPage(pagina)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(130)
        doc.text(`${empresa} · ${titulo}`, MARGEN, ALTO_PAGINA - 7)
        doc.text(`Página ${pagina} de ${totalPaginas}`, MARGEN + ANCHO_UTIL, ALTO_PAGINA - 7, {
            align: 'right'
        })
    }

    doc.setTextColor(20)

    return doc
}
