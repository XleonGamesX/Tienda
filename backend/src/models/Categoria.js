import mongoose from 'mongoose'

// ---------------------------------------------------------------------------
// CATEGORÍA
// Sólo tiene nombre y el estado activo/inactivo. La unicidad del nombre se
// resuelve con un índice único usando collation: así "Aseo" y "ASEO " chocan
// igual que en la app (la comparación ignora mayúsculas/minúsculas y espacios
// exteriores). El _id sigue siendo ObjectId (natural de Mongo).
// "activo" permite ocultar una categoría sin borrarla, para no verse obligado
// a eliminar productos que la usan.
// ---------------------------------------------------------------------------
const categoriaSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre de la categoría es obligatorio.'],
            trim: true
        },
        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

categoriaSchema.index(
    { nombre: 1 },
    { unique: true, collation: { locale: 'es', strength: 2 } }
)

export const Categoria = mongoose.model('Categoria', categoriaSchema)
