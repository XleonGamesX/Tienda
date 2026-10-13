import mongoose from 'mongoose'

// ---------------------------------------------------------------------------
// PRODUCTO
// - codigo: PRD-### autogenerado por el controlador (máximo existente + 1)
//   y con índice único: nunca puede repetirse aunque se borren productos.
// - categoriaId: ObjectId (las categorías usan _id de Mongo).
// - proveedorId: STRING porque los proveedores se identifican con UUID.
// - precios y stock: números >= 0; el stock NUNCA puede quedar negativo
//   (las salidas se validan de forma atómica en el controlador de movimientos).
// ---------------------------------------------------------------------------
const productoSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: [true, 'El código del producto es obligatorio.'],
            uppercase: true,
            trim: true
        },
        nombre: {
            type: String,
            required: [true, 'El nombre del producto es obligatorio.'],
            trim: true
        },
        categoriaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categoria',
            default: null
        },
        proveedorId: {
            type: String,
            ref: 'Proveedor',
            default: null
        },
        precioCompra: {
            type: Number,
            required: [true, 'El precio de compra es obligatorio.'],
            min: [0, 'El precio de compra no puede ser negativo.']
        },
        precioVenta: {
            type: Number,
            required: [true, 'El precio de venta es obligatorio.'],
            min: [0, 'El precio de venta no puede ser negativo.']
        },
        cantidad: {
            type: Number,
            default: 0,
            min: [0, 'El stock no puede ser negativo.']
        },
        stockMinimo: {
            type: Number,
            required: [true, 'El stock mínimo es obligatorio.'],
            min: [0, 'El stock mínimo no puede ser negativo.']
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

productoSchema.index({ codigo: 1 }, { unique: true })

export const Producto = mongoose.model('Producto', productoSchema)
