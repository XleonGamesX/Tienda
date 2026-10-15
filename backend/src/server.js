import 'dotenv/config'
import os from 'node:os'
import { app } from './app.js'
import { conectarDB } from './config/db.js'

// ---------------------------------------------------------------------------
// PUNTO DE ENTRADA
// 1. Lee backend/.env
// 2. Conecta con MongoDB Atlas
// 3. Levanta el servidor en el puerto configurado
//
// Escucha en TODAS las interfaces (0.0.0.0), así que además de local es
// accesible desde otros dispositivos de la misma red y desde Render
// (que inyecta su propio puerto en la variable PORT).
// ---------------------------------------------------------------------------

// Primera IP IPv4 no-local de esta máquina: sirve para abrir la app desde
// otro dispositivo de la red (ej. http://192.168.1.20:3000).
function ipDeRed() {
    for (const lista of Object.values(os.networkInterfaces())) {
        for (const interfaz of lista ?? []) {
            const esV4 = interfaz.family === 'IPv4' || interfaz.family === 4
            if (esV4 && !interfaz.internal) return interfaz.address
        }
    }
    return null
}

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

    app.listen(PUERTO, '0.0.0.0', () => {
        console.log(`[API] Servidor escuchando en el puerto ${PUERTO}`)
        console.log(`      local:  http://localhost:${PUERTO}`)

        const ip = ipDeRed()
        if (ip) console.log(`      red:    http://${ip}:${PUERTO}`)
    })
} catch (error) {
    console.error('[DB] No fue posible conectar con MongoDB Atlas:', error.message)
    process.exit(1)
}
