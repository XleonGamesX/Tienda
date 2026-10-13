import mongoose from 'mongoose'

// ---------------------------------------------------------------------------
// CONEXIÓN A MONGODB ATLAS
// La URI llega desde backend/.env (MONGODB_URI). Una sola conexión para toda
// la aplicación: mongoose la reutiliza en cada modelo.
// ---------------------------------------------------------------------------
export async function conectarDB(uri) {
    // strictQuery evita que se filtren campos que no existen en el esquema
    mongoose.set('strictQuery', true)

    await mongoose.connect(uri)

    return mongoose.connection
}
