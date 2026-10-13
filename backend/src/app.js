import express from 'express'
import cors from 'cors'
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

// CORS: sólo el origen del frontend (Vite en desarrollo) puede llamar la API
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

// 404 para rutas que no existen
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    })
})

// Manejador central de errores: SIEMPRE el último
app.use(manejadorDeErrores)
