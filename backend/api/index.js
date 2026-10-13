import 'dotenv/config'
import { app } from '../src/app.js'
import { conectarDB } from '../src/config/db.js'

// ---------------------------------------------------------------------------
// PUNTO DE ENTRADA PARA VERCEL (función serverless)
// Vercel ejecuta este archivo en lugar de src/server.js (que hace listen):
// aquí sólo se conecta a MongoDB Atlas y se exporta la app de Express.
//
// - globalThis conserva la promesa entre invocaciones "cálidas" de la
//   función, así no se abre una conexión nueva en cada petición.
// - Si la conexión falla se limpia para reintentar en la siguiente.
// ---------------------------------------------------------------------------
const URI = process.env.MONGODB_URI

if (!URI) {
    console.error(
        '[CONFIG] Falta MONGODB_URI. Configúrala en Vercel → Settings → Environment Variables.'
    )
} else {
    globalThis.__tiendaDb =
        globalThis.__tiendaDb ??
        conectarDB(URI).catch((error) => {
            console.error(
                '[DB] No fue posible conectar con MongoDB Atlas:',
                error.message
            )
            globalThis.__tiendaDb = null // se reintentará en la próxima petición
        })
}

// La app de Express se encarga del resto: recibe cada petición con su ruta
// original (/api/salud, /api/productos, ...) gracias al rewrite de vercel.json
export default app
