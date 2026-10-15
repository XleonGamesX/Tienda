import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import categoriaRoutes from './routes/categoria.routes.js'
import proveedorRoutes from './routes/proveedor.routes.js'
import productoRoutes from './routes/producto.routes.js'
import movimientoRoutes from './routes/movimiento.routes.js'
import { manejadorDeErrores } from './middleware/errorHandler.js'

// ---------------------------------------------------------------------------
// APP EXPRESS
// Sólo monta middlewares y rutas: la conexión a la base y el listen viven en
// server.js. Al estar separada, esta app puede reutilizarse en pruebas.
// ---------------------------------------------------------------------------
export const app = express()

// CORS: sólo los orígenes listados en CLIENT_ORIGIN (por defecto el de Vite
// en desarrollo). En producción el frontend y la API comparten origen (los
// estáticos los sirve este mismo servidor), así que CORS ni siquiera aplica.
const origenes = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origen) => origen.trim())

app.use(cors({ origin: origenes }))

// Habilita el body JSON (req.body)
app.use(express.json())

// Salud del servidor: sirve para comprobar que la API está viva
app.get('/api/salud', (req, res) => {
    res.json({ ok: true, mensaje: 'API de la tienda funcionando.' })
})

// Recursos
app.use('/api/categorias', categoriaRoutes)
app.use('/api/proveedores', proveedorRoutes)
app.use('/api/productos', productoRoutes)
app.use('/api/movimientos', movimientoRoutes)

// ---------------------------------------------------------------------------
// FRONTEND COMPILADO (producción)
// Este servidor entrega también los archivos del build del frontend
// (frontend/dist), de modo que la interfaz y la API viven en LA MISMA URL:
// un solo servicio que desplegar (Render), sin CORS ni variables de entorno
// del frontend. En desarrollo el frontend se sirve con Vite y llega aquí
// sólo a través del proxy de /api.
// ---------------------------------------------------------------------------
const carpetaDist = fileURLToPath(new URL('../../frontend/dist', import.meta.url))
const indexHtml = path.join(carpetaDist, 'index.html')

// Archivos estáticos: /assets/..., favicon, etc.
app.use(express.static(carpetaDist))

// Cualquier otra ruta que NO sea /api devuelve index.html. (El enrutador usa
// hash — /#/inventario — así que esto sólo se activa al abrir la raíz o al
// recargar la página.)
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next()

    if (!fs.existsSync(indexHtml)) {
        return res.status(503).type('text/plain').send(
            'El frontend todavía no está compilado.\n' +
            'Ejecuta "npm run build" en la raíz del proyecto y vuelve a arrancar el backend.'
        )
    }

    res.sendFile(indexHtml)
})

// 404 para rutas de la API que no existen
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    })
})

// Manejador central de errores: SIEMPRE el último
app.use(manejadorDeErrores)
