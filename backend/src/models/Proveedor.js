import mongoose from 'mongoose'
import { randomUUID } from 'node:crypto'

// ---------------------------------------------------------------------------
// PROVEEDOR
// REQUISITO: identificador único. El _id NO es ObjectId de Mongo sino un
// UUID (texto) generado con crypto.randomUUID() justo antes de validar el
// documento. Un UUID no colisiona nunca, ni siquiera si corren dos copias
// de la API escribiendo en la misma base.
//
// El nombre vuelve a ser único de forma insensible a mayúsculas/minúsculas
// mediante collation, igual que en la Categoría.
// ---------------------------------------------------------------------------
const proveedorSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
            default: () => randomUUID()
        },
        nombre: {
            type: String,
            required: [true, 'El nombre del proveedor es obligatorio.'],
            trim: true
        },
        telefono: {
            type: String,
            required: [true, 'El teléfono del proveedor es obligatorio.'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'El correo electrónico del proveedor es obligatorio.'],
            trim: true
        },
        direccion: {
            type: String,
            required: [true, 'La dirección del proveedor es obligatoria.'],
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

proveedorSchema.index(
    { nombre: 1 },
    { unique: true, collation: { locale: 'es', strength: 2 } }
)

export const Proveedor = mongoose.model('Proveedor', proveedorSchema)
