import { Router } from 'express'
import {
    listarCategorias,
    obtenerCategoria,
    crearCategoria,
    editarCategoria,
    alternarEstadoCategoria,
    eliminarCategoria
} from '../controllers/categoria.controller.js'

const router = Router()

// GET    /api/categorias
router.get('/', listarCategorias)

// GET    /api/categorias/:id
router.get('/:id', obtenerCategoria)

// POST   /api/categorias
router.post('/', crearCategoria)

// PUT    /api/categorias/:id
router.put('/:id', editarCategoria)

// PATCH  /api/categorias/:id/estado  (activar / desactivar)
router.patch('/:id/estado', alternarEstadoCategoria)

// DELETE /api/categorias/:id
router.delete('/:id', eliminarCategoria)

export default router
