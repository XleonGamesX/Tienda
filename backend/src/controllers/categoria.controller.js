import { Categoria } from '../models/Categoria.js'
import { Producto } from '../models/Producto.js'
import { validarCategoria } from '../validations/categoria.validation.js'
import { errorConflicto, errorNoEncontrado } from '../utils/ApiError.js'

// ---------------------------------------------------------------------------
// CATEGORÍAS
// CRUD completo. El nombre duplicado y el formato los resuelven el modelo y
// las validaciones; el controlador sólo orquesta la base de datos.
// ---------------------------------------------------------------------------

// GET /api/categorias
export async function listarCategorias(req, res) {
    // collation strength 2 => ordena "Aseo" y "aseo" como lo mismo
    const categorias = await Categoria.find()
        .collation({ locale: 'es', strength: 2 })
        .sort({ nombre: 1 })

    res.json({ ok: true, datos: categorias })
}

// GET /api/categorias/:id
export async function obtenerCategoria(req, res) {
    const categoria = await Categoria.findById(req.params.id)

    if (!categoria) {
        throw errorNoEncontrado('Categoría')
    }

    res.json({ ok: true, datos: categoria })
}

// POST /api/categorias
export async function crearCategoria(req, res) {
    const datos = validarCategoria(req.body)

    const categoria = await Categoria.create(datos)

    res.status(201).json({ ok: true, datos: categoria })
}

// PUT /api/categorias/:id
export async function editarCategoria(req, res) {
    const datos = validarCategoria(req.body)

    const categoria = await Categoria.findByIdAndUpdate(
        req.params.id,
        datos,
        { new: true, runValidators: true }
    )

    if (!categoria) {
        throw errorNoEncontrado('Categoría')
    }

    res.json({ ok: true, datos: categoria })
}

// PATCH /api/categorias/:id/estado
// Alterna activo <-> inactivo sin eliminar la categoría. Así se oculta del
// selector de productos sin verse obligado a borrar los productos que la usan.
export async function alternarEstadoCategoria(req, res) {
    const categoria = await Categoria.findById(req.params.id)

    if (!categoria) {
        throw errorNoEncontrado('Categoría')
    }

    categoria.activo = !categoria.activo
    await categoria.save()

    res.json({ ok: true, datos: categoria })
}

// DELETE /api/categorias/:id
// MISMA REGLA QUE EN EL FRONTEND: si la categoría está en uso por productos
// NO se elimina; se responde 409 con el conteo para que la vista lo explique.
export async function eliminarCategoria(req, res) {
    const categoria = await Categoria.findById(req.params.id)

    if (!categoria) {
        throw errorNoEncontrado('Categoría')
    }

    const enUso = await Producto.countDocuments({ categoriaId: categoria._id })

    if (enUso > 0) {
        throw errorConflicto(
            enUso === 1
                ? 'No se puede eliminar esta categoría porque existe 1 producto asociado.'
                : `No se puede eliminar esta categoría porque existen ${enUso} productos asociados.`
        )
    }

    await categoria.deleteOne()

    res.json({ ok: true, datos: { eliminado: true } })
}
