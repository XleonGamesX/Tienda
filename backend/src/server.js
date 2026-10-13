import 'dotenv/config'
import { app } from './app.js'
import { conectarDB } from './config/db.js'

// ---------------------------------------------------------------------------
// PUNTO DE ENTRADA
// 1. Lee backend/.env
// 2. Conecta con MongoDB Atlas
// 3. Levanta el servidor en el puerto configurado
// ---------------------------------------------------------------------------
const PUERTO = Number(process.env.PORT) || 3000
const URI = process.env.MONGODB_URI

if (!URI) {
    console.error(
        '[CONFIG] Falta MONGODB_URI en backend/.env.\n' +
        '         Copia .env.example como .env y pega tu cadena de Atlas.'
    )
    process.exit(1)
}

try {
    await conectarDB(URI)
    console.log('[DB] Conectado a MongoDB Atlas.')

    app.listen(PUERTO, () => {
        console.log(`[API] Servidor escuchando en http://localhost:${PUERTO}`)
    })
} catch (error) {
    console.error('[DB] No fue posible conectar con MongoDB Atlas:', error.message)
    process.exit(1)
}
