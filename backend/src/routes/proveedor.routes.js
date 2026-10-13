import { Router } from 'express'
import {
    listarProveedores,
    obtenerProveedor,
    crearProveedor,
    editarProveedor,
    alternarEstadoProveedor,
    eliminarProveedor
} from '../controllers/proveedor.controller.js'

const router = Router()

// GET    /api/proveedores
router.get('/', listarProveedores)

// GET    /api/proveedores/:id   (id = UUID)
router.get('/:id', obtenerProveedor)

// POST   /api/proveedores
router.post('/', crearProveedor)

// PUT    /api/proveedores/:id
router.put('/:id', editarProveedor)

// PATCH  /api/proveedores/:id/estado  (activar / desactivar)
router.patch('/:id/estado', alternarEstadoProveedor)

// DELETE /api/proveedores/:id
router.delete('/:id', eliminarProveedor)

export default router
