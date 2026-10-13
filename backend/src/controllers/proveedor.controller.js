import { Proveedor } from '../models/Proveedor.js'
import { Producto } from '../models/Producto.js'
import { validarProveedor } from '../validations/proveedor.validation.js'
import { errorConflicto, errorNoEncontrado } from '../utils/ApiError.js'

// ---------------------------------------------------------------------------
// PROVEEDORES
// El identificador único (UUID) lo genera el MODELO en el _id antes de
// guardar; el controlador nunca lo recibe del cliente ni lo fabrica.
// ---------------------------------------------------------------------------

// GET /api/proveedores
export async function listarProveedores(req, res) {
    const proveedores = await Proveedor.find()
        .collation({ locale: 'es', strength: 2 })
        .sort({ nombre: 1 })

    res.json({ ok: true, datos: proveedores })
}

// GET /api/proveedores/:id   (el id es un UUID, por eso String)
export async function obtenerProveedor(req, res) {
    const proveedor = await Proveedor.findById(req.params.id)

    if (!proveedor) {
        throw errorNoEncontrado('Proveedor')
    }

    res.json({ ok: true, datos: proveedor })
}

// POST /api/proveedores
export async function crearProveedor(req, res) {
    const datos = validarProveedor(req.body)

    const proveedor = await Proveedor.create(datos)

    res.status(201).json({ ok: true, datos: proveedor })
}

// PUT /api/proveedores/:id
export async function editarProveedor(req, res) {
    const datos = validarProveedor(req.body)

    // findByIdAndUpdate no dispara los hooks "pre validate" del esquema, así
    // que si por alguna razón el documento llegara sin _id, se asigna aquí.
    const proveedor = await Proveedor.findByIdAndUpdate(
        req.params.id,
        datos,
        { new: true, runValidators: true }
    )

    if (!proveedor) {
        throw errorNoEncontrado('Proveedor')
    }

    res.json({ ok: true, datos: proveedor })
}

// PATCH /api/proveedores/:id/estado
// Alterna activo <-> inactivo sin eliminar el proveedor. Así se oculta del
// selector de productos sin verse obligado a borrar los productos que lo usan.
export async function alternarEstadoProveedor(req, res) {
    const proveedor = await Proveedor.findById(req.params.id)

    if (!proveedor) {
        throw errorNoEncontrado('Proveedor')
    }

    proveedor.activo = !proveedor.activo
    await proveedor.save()

    res.json({ ok: true, datos: proveedor })
}

// DELETE /api/proveedores/:id
// MISMA REGLA QUE EN EL FRONTEND: proveedor en uso => 409 con el conteo.
export async function eliminarProveedor(req, res) {
    const proveedor = await Proveedor.findById(req.params.id)

    if (!proveedor) {
        throw errorNoEncontrado('Proveedor')
    }

    const enUso = await Producto.countDocuments({ proveedorId: proveedor._id })

    if (enUso > 0) {
        throw errorConflicto(
            enUso === 1
                ? 'No se puede eliminar este proveedor porque existe 1 producto asociado.'
                : `No se puede eliminar este proveedor porque existen ${enUso} productos asociados.`
        )
    }

    await proveedor.deleteOne()

    res.json({ ok: true, datos: { eliminado: true } })
}
