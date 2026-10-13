import { Router } from 'express'
import {
    listarMovimientos,
    obtenerMovimiento,
    registrarMovimiento
} from '../controllers/movimiento.controller.js'

const router = Router()

// GET  /api/movimientos            (filtro opcional ?productoId=...)
router.get('/', listarMovimientos)

// GET  /api/movimientos/:id
router.get('/:id', obtenerMovimiento)

// POST /api/movimientos            (entrada | salida | ajuste)
router.post('/', registrarMovimiento)

export default router
